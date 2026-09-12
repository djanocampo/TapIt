import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem('tapit_pwa_dismissed');
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (dismissedAt && now - parseInt(dismissedAt, 10) < SEVEN_DAYS) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIOS(true);
      // Small delay before showing on iOS
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Chrome, Edge, Android & supported browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[TapIt PWA] Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('tapit_pwa_dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] bg-[#081023]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-4 text-white ring-1 ring-white/10"
        >
          {/* Header & Close */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/icons/icon-192x192.png"
                alt="TapIt App Icon"
                className="w-11 h-11 rounded-xl shadow-md border border-cyan-500/20 object-cover bg-[#040c1a]"
              />
              <div>
                <h4 className="font-semibold text-sm tracking-wide text-white flex items-center gap-1.5 font-['Outfit']">
                  Install TapIt App
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    PWA
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fast 1-tap access right from your home screen
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* iOS Safari Guidance Modal / Dropdown */}
          {showIOSInstructions && isIOS ? (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2">
              <p className="font-medium text-cyan-300">To install TapIt on your iPhone or iPad:</p>
              <ol className="space-y-1.5 list-decimal list-inside text-slate-300 text-[11px] leading-relaxed">
                <li className="flex items-center gap-1.5">
                  Tap the <Share2 className="w-3.5 h-3.5 text-cyan-400 inline" /> <strong>Share</strong> button in Safari's toolbar.
                </li>
                <li className="flex items-center gap-1.5">
                  Scroll down and select <PlusSquare className="w-3.5 h-3.5 text-cyan-400 inline" /> <strong>Add to Home Screen</strong>.
                </li>
                <li>Tap <strong>Add</strong> in the top right corner.</li>
              </ol>
              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleDismiss}
                  className="text-xs text-cyan-400 font-medium hover:underline"
                >
                  Got it
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
