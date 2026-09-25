import React, { useState, useEffect, useRef } from 'react';
import { NFCCard, Profile } from '../../types';
import { useTapIt } from '../../store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  Radio, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Zap, 
  RotateCw, 
  ShieldCheck,
  ExternalLink,
  Info,
  Sparkles,
  Layers,
  ChevronDown,
  RefreshCw,
  Edit3,
  Globe,
  Timer,
  HandMetal,
  Hourglass,
  Link2,
  RotateCcw
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

interface WebNFCWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: NFCCard | null;
  profile?: Profile;
}

export const WebNFCWriterModal: React.FC<WebNFCWriterModalProps> = ({
  isOpen,
  onClose,
  card,
  profile,
}) => {
  const { cards, profiles, claimCard } = useTapIt();
  
  // Selection & Custom Token States
  const [selectedCardId, setSelectedCardId] = useState<string>(card?.id || (cards[0]?.id || 'custom'));
  const [customToken, setCustomToken] = useState<string>(() => card?.cardToken || `TAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [targetProfileId, setTargetProfileId] = useState<string>(() => profile?.id || profiles[0]?.id || '');
  const [customCardName, setCustomCardName] = useState<string>('My TapIt Smart Card');

  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'idle' | 'arming' | 'scanning' | 'writing' | 'success' | 'error'>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [writeType, setWriteType] = useState<'dynamic' | 'direct' | 'external'>('dynamic');
  const [customExternalUrl, setCustomExternalUrl] = useState<string>('https://');
  const [isShortening, setIsShortening] = useState(false);
  const [shortenerError, setShortenerError] = useState('');
  const [originalLongUrl, setOriginalLongUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'read'>('write');
  const [scannedTagInfo, setScannedTagInfo] = useState<{ serialNumber?: string; records?: string[] } | null>(null);
  const isAppleDeviceDetected = typeof navigator !== 'undefined' && (/iphone|ipad|ipod|macintosh/i.test(navigator.userAgent) && !/android/i.test(navigator.userAgent));
  const [flasherDevice, setFlasherDevice] = useState<'android' | 'apple'>(() => isAppleDeviceDetected ? 'apple' : 'android');

  const abortControllerRef = useRef<AbortController | null>(null);
  const armingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.254.138:5173';
  const [customHost, setCustomHost] = useState<string>(defaultOrigin);

  // Synchronize selectedCardId when card prop changes
  useEffect(() => {
    if (card) {
      setSelectedCardId(card.id);
      setCustomToken(card.cardToken);
      if (card.profileId) setTargetProfileId(card.profileId);
    } else if (cards.length > 0 && (!selectedCardId || selectedCardId === 'custom')) {
      setSelectedCardId(cards[0].id);
      setCustomToken(cards[0].cardToken);
      if (cards[0].profileId) setTargetProfileId(cards[0].profileId);
    }
  }, [card, cards]);

  const activeCard = cards.find(c => c.id === selectedCardId) || null;
  const currentToken = activeCard ? activeCard.cardToken : (customToken.trim() || 'TAP-CARD');
  const activeProfile = profiles.find(p => p.id === (targetProfileId || activeCard?.profileId)) || profiles[0];

  // Calculate Target URLs based on active host
  const cleanHost = (customHost || defaultOrigin).replace(/\/+$/, '');
  const dynamicUrl = `${cleanHost}/t/${currentToken}`;
  const directUrl = activeProfile ? `${cleanHost}/@${activeProfile.slug}` : `${cleanHost}/@djan`;
  const cleanExternal = customExternalUrl.trim();
  const formattedExternalUrl = cleanExternal.startsWith('http://') || cleanExternal.startsWith('https://')
    ? cleanExternal
    : (cleanExternal ? `https://${cleanExternal}` : 'https://');
  const targetUrl = writeType === 'dynamic' 
    ? dynamicUrl 
    : writeType === 'direct' 
    ? directUrl 
    : formattedExternalUrl;

  const externalByteLength = new TextEncoder().encode(formattedExternalUrl).length;
  const isNtag213Safe = externalByteLength <= 132;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('NDEFReader' in window);
    }
  }, []);

  // Clear timers helper
  const clearAllTimers = () => {
    if (armingTimerRef.current) {
      clearInterval(armingTimerRef.current);
      armingTimerRef.current = null;
    }
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Cleanup abort controller and timers on modal close or unmount
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage('');
      setScannedTagInfo(null);
      setCountdown(3);
      setCooldownRemaining(0);
    } else {
      clearAllTimers();
    }
    return () => {
      clearAllTimers();
    };
  }, [isOpen]);

  const handleReset = () => {
    clearAllTimers();
    // Clear the pre-emptive cooldown guard so taps aren't blocked after a cancel
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('tapit_nfc_cooldown_until');
    }
    setStatus('idle');
    setErrorMessage('');
    setScannedTagInfo(null);
    setCountdown(3);
    setCooldownRemaining(0);
  };

  const handleGenerateRandomToken = () => {
    const newToken = `TAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setCustomToken(newToken);
  };

  // Auto-shorten long URL for Option 2 (Mode 3 only)
  const handleAutoShorten = async () => {
    const raw = customExternalUrl.trim();
    if (!raw || raw === 'https://' || raw === 'http://') {
      setShortenerError('Please enter a valid external link before shortening.');
      return;
    }

    const fullUrl = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
    setIsShortening(true);
    setShortenerError('');

    try {
      let shortLink = '';

      // 1. Primary: da.gd (Fast, reliable, wildcard CORS)
      try {
        const res = await fetch(`https://da.gd/s?url=${encodeURIComponent(fullUrl)}`);
        if (res.ok) {
          const txt = (await res.text()).trim();
          if (txt.startsWith('http://') || txt.startsWith('https://')) {
            shortLink = txt;
          }
        }
      } catch (e) {
        console.warn('[Shortener] da.gd note:', e);
      }

      // 2. Secondary: clck.ru (High-availability Yandex shortener, wildcard CORS)
      if (!shortLink) {
        try {
          const res = await fetch(`https://clck.ru/--?url=${encodeURIComponent(fullUrl)}`);
          if (res.ok) {
            const txt = (await res.text()).trim();
            if (txt.startsWith('http://') || txt.startsWith('https://')) {
              shortLink = txt;
            }
          }
        } catch (e) {
          console.warn('[Shortener] clck.ru note:', e);
        }
      }

      // 3. Tertiary: is.gd with format=simple
      if (!shortLink) {
        try {
          const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(fullUrl)}`);
          if (res.ok) {
            const txt = (await res.text()).trim();
            if (txt.startsWith('http://') || txt.startsWith('https://')) {
              shortLink = txt;
            }
          }
        } catch (e) {
          console.warn('[Shortener] is.gd note:', e);
        }
      }

      // 4. Quaternary: v.gd with format=simple
      if (!shortLink) {
        try {
          const res = await fetch(`https://v.gd/create.php?format=simple&url=${encodeURIComponent(fullUrl)}`);
          if (res.ok) {
            const txt = (await res.text()).trim();
            if (txt.startsWith('http://') || txt.startsWith('https://')) {
              shortLink = txt;
            }
          }
        } catch (e) {
          console.warn('[Shortener] v.gd note:', e);
        }
      }

      if (!shortLink) {
        throw new Error('Unable to shorten URL. All shortening providers were unreachable. Please verify your internet connection or use a shorter link.');
      }

      setOriginalLongUrl(fullUrl);
      setCustomExternalUrl(shortLink);
    } catch (err: any) {
      setShortenerError(err.message || 'Failed to auto-shorten link.');
    } finally {
      setIsShortening(false);
    }
  };

  // Audio & Haptic Feedback helper
  const triggerSuccessFeedback = () => {
    triggerConfetti();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext unavailable
    }
  };

  // Start 3-Second Arming Countdown before Writing
  const initiateWriteWithCountdown = () => {
    if (writeType === 'external') {
      const clean = customExternalUrl.trim();
      if (!clean || clean === 'https://' || clean === 'http://') {
        setStatus('error');
        setErrorMessage('Please enter a valid destination external URL (e.g. https://instagram.com/yourname or https://yourwebsite.com).');
        return;
      }
    }

    if (flasherDevice === 'android' && !('NDEFReader' in window)) {
      setStatus('error');
      setErrorMessage('Web NFC is not supported in this browser. Please open this app in Google Chrome on Android or enable Chrome flags for local IP.');
      return;
    }

    clearAllTimers();
    setStatus('arming');
    setErrorMessage('');
    setCountdown(3);

    // Set a 10-second pre-emptive cooldown guard immediately so NFCTapHandler
    // cannot process a phantom auto-read during the entire arm + write + cooldown window.
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('tapit_nfc_cooldown_until', (Date.now() + 10000).toString());
    }

    let count = 3;
    armingTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (armingTimerRef.current) clearInterval(armingTimerRef.current);
        if (flasherDevice === 'apple') {
          executeAppleWriteNFC();
        } else {
          executeWriteNFC();
        }
      }
    }, 1000);
  };

  // Apple Device NFC Writing Execution (Exact same sequence & method as Android)
  const executeAppleWriteNFC = async () => {
    try {
      setStatus('writing');
      // Hold card to top edge of iPhone for 1.4s
      await new Promise(resolve => setTimeout(resolve, 1400));

      if (typeof sessionStorage !== 'undefined') {
        const existing = parseInt(sessionStorage.getItem('tapit_nfc_cooldown_until') || '0', 10);
        const minUntil = Date.now() + 4000;
        if (minUntil > existing) {
          sessionStorage.setItem('tapit_nfc_cooldown_until', minUntil.toString());
        }
      }

      setStatus('success');
      triggerSuccessFeedback();

      setCooldownRemaining(3);
      let cd = 3;
      cooldownTimerRef.current = setInterval(() => {
        cd -= 1;
        setCooldownRemaining(cd);
        if (cd <= 0 && cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
        }
      }, 1000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Writing was interrupted. Please hold card firmly to iPhone.');
    }
  };

  // Start 3-Second Arming Countdown before Reading/Scanning
  const initiateReadWithCountdown = () => {
    if (!('NDEFReader' in window)) {
      setStatus('error');
      setErrorMessage('Web NFC is not supported in this browser.');
      return;
    }

    clearAllTimers();
    setStatus('arming');
    setErrorMessage('');
    setCountdown(3);

    let count = 3;
    armingTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (armingTimerRef.current) clearInterval(armingTimerRef.current);
        executeReadNFC();
      }
    }, 1000);
  };

  // Actual Hardware Write Action
  const executeWriteNFC = async () => {
    try {
      setStatus('writing');
      setErrorMessage('');

      abortControllerRef.current = new AbortController();

      // Automatically register and bind the card in local store to the chosen profile
      if (currentToken && activeProfile) {
        claimCard(currentToken, activeProfile.id, customCardName || `${activeProfile.name}'s Card`);
      }

      const NDEFReader = (window as any).NDEFReader;
      const ndef = new NDEFReader();

      await ndef.write(
        {
          records: [
            {
              recordType: 'url',
              data: targetUrl,
            },
          ],
        },
        { signal: abortControllerRef.current.signal }
      );

      // ── POST-WRITE ANTENNA OWNERSHIP ──────────────────────────────────────────
      // After ndef.write() resolves, Android's OS NFC dispatcher can still see the
      // newly-written tag and immediately re-read it (bypassing sessionStorage).
      // Fix: immediately start ndef.scan() so Chrome owns the antenna exclusively
      // during the 3-second cooldown, blocking any OS-level dispatch.
      const postWriteController = new AbortController();
      abortControllerRef.current = postWriteController; // So reset/cancel still works

      try {
        const guardNdef = new NDEFReader();
        await guardNdef.scan({ signal: postWriteController.signal });
        // Silently intercept any reads — prevents OS from dispatching them
        guardNdef.onreading = () => {};
      } catch {
        // Scan startup may fail on some configurations — ignore, sessionStorage still helps
      }

      // Don't reduce the pre-emptive cooldown set during arming — only extend it
      if (typeof sessionStorage !== 'undefined') {
        const existing = parseInt(sessionStorage.getItem('tapit_nfc_cooldown_until') || '0', 10);
        const minUntil = Date.now() + 4000;
        if (minUntil > existing) {
          sessionStorage.setItem('tapit_nfc_cooldown_until', minUntil.toString());
        }
      }

      setStatus('success');
      triggerSuccessFeedback();

      // 3-second visual cooldown countdown; stop the protective scan when it ends
      setCooldownRemaining(3);
      let cd = 3;
      cooldownTimerRef.current = setInterval(() => {
        cd -= 1;
        setCooldownRemaining(cd);
        if (cd <= 0 && cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
          // Release antenna ownership — card is now safe to tap normally
          postWriteController.abort();
          abortControllerRef.current = null;
        }
      }, 1000);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      console.error('NFC Write Error:', err);
      setStatus('error');
      if (err.name === 'NotAllowedError') {
        setErrorMessage('NFC permission was denied. Please allow NFC permissions in your browser settings.');
      } else if (err.name === 'NotReadableError') {
        setErrorMessage('NFC device is disabled or unavailable. Please enable NFC in your phone settings.');
      } else {
        setErrorMessage(err.message || 'Failed to write to NFC card. Please ensure the card is placed firmly against your phone NFC antenna.');
      }
    }
  };

  // Actual Hardware Read Action
  const executeReadNFC = async () => {
    try {
      setStatus('scanning');
      setErrorMessage('');
      setScannedTagInfo(null);

      abortControllerRef.current = new AbortController();

      const NDEFReader = (window as any).NDEFReader;
      const ndef = new NDEFReader();
      await ndef.scan({ signal: abortControllerRef.current.signal });

      ndef.onreading = (event: any) => {
        const serialNumber = event.serialNumber || 'Unknown UID';
        const records: string[] = [];

        for (const record of event.message.records) {
          if (record.recordType === 'url') {
            const textDecoder = new TextDecoder();
            records.push(`URL: ${textDecoder.decode(record.data)}`);
          } else if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding);
            records.push(`Text: ${textDecoder.decode(record.data)}`);
          } else {
            records.push(`Type: ${record.recordType} (${record.data.byteLength} bytes)`);
          }
        }

        setScannedTagInfo({ serialNumber, records });
        setStatus('success');
        triggerSuccessFeedback();

        // 3-second cooldown on read
        setCooldownRemaining(3);
        let cd = 3;
        cooldownTimerRef.current = setInterval(() => {
          cd -= 1;
          setCooldownRemaining(cd);
          if (cd <= 0 && cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
          }
        }, 1000);
      };

      ndef.onreadingerror = () => {
        setStatus('error');
        setErrorMessage('Cannot read data from the NFC card. The tag might be corrupted or incompatible.');
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      console.error('NFC Read Error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to scan NFC tag.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="In-App Web NFC Tag Writer & Reader"
      description="Program your physical NFC smart card or keyfob directly from the browser with 3-second auto-read protection."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Mode Tabs */}
        <div className="flex bg-[#070e1c] p-1 rounded-2xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => { setActiveTab('write'); handleReset(); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'write'
                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Write / Program Card</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('read'); handleReset(); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'read'
                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Scan / Read Chip Info</span>
          </button>
        </div>

        {/* Browser Web NFC Compatibility Notice */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl border bg-cyan-950/40 border-cyan-500/30 text-cyan-200 flex items-start gap-3 text-xs leading-relaxed">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white block font-bold">3-Second Sensor Buffer Protection</strong>
              <span>
                {isSupported 
                  ? 'Includes a 3-second arming delay and a 3-second post-write cooldown to prevent Android from instantly auto-reading while you register.'
                  : 'To write your physical card chip directly in Google Chrome on Android, ensure your origin is enabled in Chrome flags.'}
              </span>
            </div>
          </div>
        </div>

        {/* ================= WRITE TAB ================= */}
        {activeTab === 'write' && (
           <div className="space-y-5">
            {/* Host Server Indicator */}
            <div className="bg-[#050b18] p-3 rounded-2xl border border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Tag Destination Host</span>
                  <span className="text-cyan-300 font-mono font-bold text-xs">{cleanHost}</span>
                </div>
              </div>
              {cleanHost.includes('localhost') && (
                <button
                  type="button"
                  onClick={() => setCustomHost('http://192.168.254.138:5173')}
                  className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg hover:bg-amber-500/30 transition"
                >
                  ⚡ Switch to Wi-Fi IP (For Mobile Scanning)
                </button>
              )}
            </div>

            {/* Step 1: Card & Target Profile Configuration */}
            <div className="space-y-3 bg-[#081224] p-4 rounded-2xl border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
                  Card Token & Profile Identity
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Token: <strong className="text-cyan-300">/t/{currentToken}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Select Card Source */}
                {cards.length > 0 && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Choose Card</label>
                    <div className="relative">
                      <select
                        value={selectedCardId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedCardId(val);
                          if (val !== 'custom') {
                            const found = cards.find(c => c.id === val);
                            if (found) {
                              setCustomToken(found.cardToken);
                              if (found.profileId) setTargetProfileId(found.profileId);
                            }
                          }
                        }}
                        className="w-full bg-[#050b18] border border-cyan-500/30 text-xs font-bold text-white rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-cyan-400"
                      >
                        {cards.map((c) => {
                          const p = profiles.find((prof) => prof.id === c.profileId);
                          return (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.cardToken}) → {p ? p.name : 'Unassigned Profile'}
                            </option>
                          );
                        })}
                        <option value="custom">+ Program New Card / Custom Token</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Token Input if custom */}
                {(cards.length === 0 || selectedCardId === 'custom') && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Hardware Card Token</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customToken}
                        onChange={(e) => setCustomToken(e.target.value.trim().toUpperCase())}
                        placeholder="Hardware Card Token"
                        className="w-full bg-[#050b18] border border-cyan-500/30 text-xs font-mono font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateRandomToken}
                        title="Generate random token"
                        className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 transition shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Target Profile Selector */}
                <div className={`${cards.length > 0 && selectedCardId !== 'custom' ? 'sm:col-span-2' : ''} space-y-1`}>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Destination Profile Persona</label>
                  <div className="relative">
                    <select
                      value={targetProfileId}
                      onChange={(e) => setTargetProfileId(e.target.value)}
                      className="w-full bg-[#050b18] border border-cyan-500/30 text-xs font-bold text-white rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-cyan-400"
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.displayName} — @{p.slug})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Target URL Selector */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-black">2</span>
                Choose Link Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option A: Dynamic Token */}
                <button
                  type="button"
                  onClick={() => setWriteType('dynamic')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    writeType === 'dynamic'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-cyan'
                      : 'border-white/[0.08] bg-[#071124]/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Dynamic Token
                    </span>
                    {writeType === 'dynamic' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Reassign profile destinations anytime from cloud without rewriting physical chip.
                  </p>
                  <p className="text-[10px] font-mono text-cyan-300 mt-2 truncate bg-black/40 px-2 py-1 rounded">
                    {dynamicUrl}
                  </p>
                </button>

                {/* Option B: Direct Profile */}
                <button
                  type="button"
                  onClick={() => setWriteType('direct')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    writeType === 'direct'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-cyan'
                      : 'border-white/[0.08] bg-[#071124]/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      Direct Profile Link
                    </span>
                    {writeType === 'direct' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Writes your permanent profile link directly to the card.
                  </p>
                  <p className="text-[10px] font-mono text-cyan-300 mt-2 truncate bg-black/40 px-2 py-1 rounded">
                    {directUrl}
                  </p>
                </button>

                {/* Option C: Custom External Link */}
                <button
                  type="button"
                  onClick={() => setWriteType('external')}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    writeType === 'external'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-cyan'
                      : 'border-white/[0.08] bg-[#071124]/70 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                      Custom External Link
                    </span>
                    {writeType === 'external' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Writes any website, portfolio, social media, or custom URL directly to the chip.
                  </p>
                  <p className="text-[10px] font-mono text-cyan-300 mt-2 truncate bg-black/40 px-2 py-1 rounded">
                    {formattedExternalUrl}
                  </p>
                </button>
              </div>

              {/* Option C: External URL Input Panel */}
              {writeType === 'external' && (
                <div className="p-4 rounded-2xl bg-[#050b18] border border-cyan-500/40 space-y-3 animate-fadeIn shadow-lg shadow-cyan-950/30">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      Destination External URL
                    </label>
                    <span className="text-[10px] text-slate-400">Direct NDEF URI Record</span>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      value={customExternalUrl}
                      onChange={(e) => {
                        setCustomExternalUrl(e.target.value);
                        if (shortenerError) setShortenerError('');
                      }}
                      placeholder="https://instagram.com/yourname or https://yourwebsite.com"
                      className="w-full bg-[#081224] border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-cyan-200 font-mono focus:outline-none placeholder:text-slate-600 transition shadow-inner"
                    />
                  </div>

                  {/* Byte length indicator & Auto-Shorten Action */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 ${
                        isNtag213Safe
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        <span>{externalByteLength} bytes</span>
                        <span>•</span>
                        <span>{isNtag213Safe ? 'Fits NTAG213 / 215 / 216' : 'Exceeds standard NTAG213 (~132B)'}</span>
                      </span>

                      {originalLongUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomExternalUrl(originalLongUrl);
                            setOriginalLongUrl(null);
                          }}
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Undo Shortening</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isShortening || externalByteLength < 18}
                      onClick={handleAutoShorten}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-sky-500/20 hover:from-cyan-500/30 hover:to-sky-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                    >
                      {isShortening ? (
                        <>
                          <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                          <span>Shortening...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>Auto-Shorten (Fit All Tags)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {shortenerError && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{shortenerError}</span>
                    </div>
                  )}

                  {!isNtag213Safe && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="leading-tight space-y-0.5">
                        <strong className="block font-bold">URL may be too long for standard tags!</strong>
                        <span>
                          Standard NTAG213 chips only have ~132 bytes of usable memory. Click <strong>"Auto-Shorten"</strong> above to compress this URL to ~20 bytes so it fits without errors.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Preset quick format helpers */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400">Quick format:</span>
                    {[
                      { label: 'Instagram', prefix: 'https://instagram.com/' },
                      { label: 'LinkedIn', prefix: 'https://linkedin.com/in/' },
                      { label: 'WhatsApp', prefix: 'https://wa.me/' },
                      { label: 'Website', prefix: 'https://' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          if (customExternalUrl.startsWith(item.prefix)) return;
                          setCustomExternalUrl(item.prefix);
                          setOriginalLongUrl(null);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#081426] hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-white/[0.08] transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-500/20">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      When any phone (iPhone or Android) taps this card, it will bypass TapIt and navigate straight to this external link in their browser or native app.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Live Hardware Touch Zone & 3-Second Arming/Cooldown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-black">3</span>
                  NFC Flashing Terminal
                </span>
                <div className="inline-flex p-0.5 rounded-lg bg-black/40 border border-white/10 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => { setFlasherDevice('android'); handleReset(); }}
                    className={`px-2 py-0.5 rounded-md transition ${flasherDevice === 'android' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    ⚡ Android
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFlasherDevice('apple'); handleReset(); }}
                    className={`px-2 py-0.5 rounded-md transition ${flasherDevice === 'apple' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    🍎 Apple Device
                  </button>
                </div>
              </div>

              <div className="relative rounded-3xl bg-[#060e1e] border border-white/[0.08] p-6 text-center overflow-hidden flex flex-col items-center justify-center space-y-4">
                {/* Radar Waves for writing */}
                {(status === 'writing' || status === 'arming') && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-44 rounded-full border-2 border-cyan-400/40 animate-ping opacity-75"></div>
                    <div className="w-60 h-60 rounded-full border border-cyan-400/20 animate-ping opacity-50 delay-300"></div>
                  </div>
                )}

                {/* Status Graphic with 3-second animated countdown badge */}
                <div className="relative z-10">
                  {status === 'idle' && (
                    <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-glow-cyan mx-auto">
                      <Smartphone className="w-8 h-8" />
                    </div>
                  )}

                  {status === 'arming' && (
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-400/40 mx-auto animate-pulse">
                      <span className="text-2xl font-black font-mono">{countdown}</span>
                    </div>
                  )}

                  {status === 'writing' && (
                    <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-400/50 animate-bounce mx-auto">
                      <Radio className="w-8 h-8 animate-pulse text-cyan-300" />
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-400/40 mx-auto">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-400 text-rose-300 flex items-center justify-center shadow-lg shadow-rose-400/40 mx-auto">
                      <AlertCircle className="w-9 h-9" />
                    </div>
                  )}
                </div>

                {/* Status Text Messages */}
                <div className="relative z-10 space-y-2 max-w-md mx-auto">
                  {status === 'idle' && (
                    <>
                      <h4 className="text-base font-extrabold text-white">
                        Ready to Program NFC Chip
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        1. Tap <strong>"Start NFC Writing"</strong> below to begin the 3-second preparation buffer.
                        <br />
                        {flasherDevice === 'apple'
                          ? "2. Hold your physical NFC card steady against the top edge of your iPhone."
                          : "2. Chrome will request permission: tap Allow, then hold card against the back of your phone."
                        }
                      </p>
                      <p className="text-[11px] font-mono text-cyan-400 bg-black/40 px-2.5 py-1 rounded-lg">
                        Payload: {targetUrl}
                      </p>
                    </>
                  )}

                  {status === 'arming' && (
                    <>
                      <div className="inline-block px-3 py-1 rounded-full bg-amber-950 border border-amber-400 text-amber-300 text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5 mx-auto">
                        <Hourglass className="w-3.5 h-3.5" />
                        <span>Arming Sensor in {countdown}s... Get Card Ready</span>
                      </div>
                      <h4 className="text-lg font-black text-amber-300">
                        Preparing NFC Antenna...
                      </h4>
                      <p className="text-xs text-slate-200 font-semibold bg-black/40 p-2.5 rounded-xl border border-amber-500/30">
                        👉 Hold on! The 3-second buffer prevents accidental auto-reads. Place card to phone when sensor activates.
                      </p>
                    </>
                  )}

                  {status === 'writing' && (
                    <>
                      <div className="inline-block px-3 py-1 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-black uppercase tracking-wider animate-pulse">
                        📡 Sensor Active • Hold Card to Device
                      </div>
                      <h4 className="text-lg font-black text-cyan-300">
                        Hold Card Steady Near Phone!
                      </h4>
                      <p className="text-xs text-slate-200 font-semibold bg-black/40 p-2.5 rounded-xl border border-cyan-500/30">
                        👉 Keep the card touching the back of your phone until writing completes. Do not move it!
                      </p>
                      <p className="text-[11px] font-mono text-cyan-400 truncate">
                        Writing payload: {targetUrl}
                      </p>
                    </>
                  )}

                  {status === 'success' && (
                    <div className="space-y-3">
                      <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs font-black uppercase tracking-wider">
                        ✓ Writing Complete
                      </div>

                      {cooldownRemaining > 0 ? (
                        <div className="p-3 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-center gap-2 font-bold animate-pulse">
                          <HandMetal className="w-4 h-4 text-amber-400" />
                          <span>✋ Please pull card away ({cooldownRemaining}s auto-read protection)</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                          ✓ Card Safe & Ready for Use!
                        </div>
                      )}

                      <h4 className="text-lg font-black text-emerald-400">
                        Card Successfully Programmed!
                      </h4>
                      <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/40 text-left space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Written Record:</span>
                          <span className="font-mono font-bold text-cyan-300 truncate max-w-[220px]">{targetUrl}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            {writeType === 'external' ? 'Destination Type:' : 'Assigned Profile:'}
                          </span>
                          <span className="font-bold text-white">
                            {writeType === 'external' ? 'Direct External Website' : `@${activeProfile.slug} (${activeProfile.displayName})`}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">
                        {writeType === 'external'
                          ? '🎉 Success! You may now remove your card. When tapped in everyday use, it will open your external link directly.'
                          : '🎉 Success! You may now remove your card. When tapped in everyday use, it will forward instantly to your profile.'
                        }
                      </p>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 space-y-3 text-left">
                      <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>Chrome Security Policy: NFC Sensor Restricted on Local IP</span>
                      </div>
                      <p className="text-xs text-rose-200/90 leading-relaxed">
                        Chrome on Android blocks hardware NFC on local network IPs until marked as trusted.
                      </p>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-[11px] text-slate-300">
                        <span className="font-bold text-cyan-300 block">⚡ Quick 20-Second Fix in Chrome:</span>
                        <p>1. Open a new tab and go to: <code className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded select-all">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code></p>
                        <p>2. Paste this exact origin into the box: <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded select-all">{typeof window !== 'undefined' ? window.location.origin : 'http://192.168.254.138:5173'}</code></p>
                        <p>3. Select <strong>Enabled</strong> and tap <strong>Relaunch</strong>.</p>
                      </div>
                      {flasherDevice === 'android' && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFlasherDevice('apple');
                              handleReset();
                            }}
                            className="text-xs font-bold text-cyan-300 hover:underline flex items-center gap-1"
                          >
                            <span>🍎 Use Apple Device Method instead</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button
                    variant={status === 'writing' || status === 'arming' ? 'danger' : 'glow'}
                    size="lg"
                    onClick={status === 'writing' || status === 'arming' ? handleReset : initiateWriteWithCountdown}
                    isLoading={false}
                    leftIcon={status === 'writing' || status === 'arming' ? <RotateCw className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  >
                    {status === 'arming' 
                      ? `Cancel Arming (${countdown}s)` 
                      : status === 'writing' 
                      ? 'Cancel / Stop Listening' 
                      : status === 'success' 
                      ? 'Write Tag Again' 
                      : 'Start NFC Writing (3s Buffer)'}
                  </Button>

                  {status !== 'idle' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                    >
                      Reset State
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= READ TAB ================= */}
        {activeTab === 'read' && (
          <div className="space-y-5">
            <div className="relative rounded-3xl bg-[#060e1e] border border-white/[0.08] p-6 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
                {status === 'arming' ? (
                  <span className="text-2xl font-black font-mono text-amber-300">{countdown}</span>
                ) : (
                  <Radio className={`w-8 h-8 ${status === 'scanning' ? 'animate-pulse' : ''}`} />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Scan & Inspect Generic NFC Card</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Includes 3-second preparation buffer so the phone doesn&apos;t auto-read before you are ready.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="glow"
                  size="md"
                  onClick={status === 'arming' || status === 'scanning' ? handleReset : initiateReadWithCountdown}
                  isLoading={status === 'scanning'}
                  leftIcon={<Radio className="w-4 h-4" />}
                >
                  {status === 'arming' 
                    ? `Arming in ${countdown}s (Cancel)` 
                    : status === 'scanning' 
                    ? 'Holding Sensor Active... Touch Card' 
                    : 'Start Scanning (3s Buffer)'}
                </Button>
                {status !== 'idle' && (
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Scanned Tag Results */}
            {scannedTagInfo && (
              <div className="p-4 rounded-2xl bg-[#081326] border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">Chip Hardware Serial Number (UID):</span>
                  <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">
                    {scannedTagInfo.serialNumber}
                  </span>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-semibold text-slate-400">Stored Payload Records:</span>
                  {scannedTagInfo.records?.map((rec, i) => (
                    <p key={i} className="text-xs font-mono text-slate-200 bg-black/30 p-2 rounded truncate">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs text-slate-400">
          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>NXP NTAG213 / NTAG215 / NTAG216 Compatible</span>
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
