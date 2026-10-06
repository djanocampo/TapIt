import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper, { Area } from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Check, 
  Crop, 
  Loader2, 
  Sparkles,
  RefreshCw,
  Maximize2,
  Circle,
  Square,
  HelpCircle,
  Hand
} from 'lucide-react';
import { Button } from '../ui/Button';
import { getCroppedImg, PixelCrop } from '../../utils/cropImage';

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onApplyCrop: (dataUrl: string, blob: Blob) => Promise<void> | void;
  title?: string;
  cropShape?: 'round' | 'rect';
  aspectRatio?: number;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApplyCrop,
  title = 'Adjust & Crop Photo',
  cropShape: initialCropShape = 'round',
  aspectRatio = 1,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [currentShape, setCurrentShape] = useState<'round' | 'rect'>(initialCropShape);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Complete background and document scroll locking while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      // Prevent touch scroll on the background page on iOS Safari and mobile Chrome
      const preventBackgroundTouch = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('#image-cropper-dialog')) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventBackgroundTouch, { passive: false });

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalTouchAction;
        document.removeEventListener('touchmove', preventBackgroundTouch);
      };
    }
  }, [isOpen]);

  // Reset state when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setIsFlippedH(false);
      setCurrentShape(initialCropShape);
      setShowGuide(true);
    }
  }, [isOpen, initialCropShape, imageSrc]);

  const onCropAreaChange = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setIsFlippedH(false);
  };

  const handleRotate90 = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleToggleFlipH = () => {
    setIsFlippedH((prev) => !prev);
  };

  const handleToggleShape = () => {
    setCurrentShape((prev) => (prev === 'round' ? 'rect' : 'round'));
  };

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const result = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        { horizontal: isFlippedH, vertical: false },
        512
      );

      await onApplyCrop(result.dataUrl, result.blob);
      onClose();
    } catch (err) {
      console.error('[ImageCropperModal] Error generating cropped image:', err);
      alert('Could not crop image. Please try another image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const modalMarkup = (
    <AnimatePresence>
      {/* 
        TOP-LEVEL POP-UP OVERLAY CONTAINER:
        Portaled directly into document.body with z-[99999] so it is completely
        isolated from any parent scrolling, transforms, or overflow-y-auto layout containers.
      */}
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pl-[calc(0.75rem+env(safe-area-inset-left,0px))] pr-[calc(0.75rem+env(safe-area-inset-right,0px))] overflow-hidden select-none touch-none pointer-events-auto"
        style={{ isolation: 'isolate' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark High-Contrast Backdrop (Blocks all underlying clicks) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 w-screen h-screen bg-[#02050f]/95 sm:bg-black/85 backdrop-blur-2xl transition-opacity z-0"
          onClick={onClose}
        />

        {/* Modal Dialog Pop-up Card */}
        <motion.div
          id="image-cropper-dialog"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-1.5rem)] sm:max-h-[90dvh] bg-[#060c1c] border border-cyan-500/40 rounded-[28px] sm:rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.3)] overflow-hidden z-10 flex flex-col justify-between my-auto"
        >
          {/* ========================================================
              1. ENTERPRISE STUDIO HEADER
              ======================================================== */}
          <div className="px-4 py-3 sm:py-3.5 border-b border-white/[0.08] bg-[#070e20]/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0 shadow-sm">
                <Crop className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white font-display truncate">
                    {title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider shrink-0 hidden xs:inline-block">
                    {currentShape === 'round' ? 'Circular Avatar' : 'Square Frame'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Pinch or drag to position • 1:1 HD export
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition flex items-center justify-center shrink-0 cursor-pointer border border-transparent hover:border-white/10"
              aria-label="Close Crop Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ========================================================
              2. CENTRAL CROPPER VIEWPORT (Guaranteed Isolated Viewport)
              ======================================================== */}
          <div 
            className="relative flex-1 w-full min-h-[260px] sm:min-h-[320px] max-h-[50dvh] sm:max-h-[46dvh] bg-[#01040a] overflow-hidden select-none touch-none shrink-0"
            onTouchStart={() => setShowGuide(false)}
            onMouseDown={() => setShowGuide(false)}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              cropShape={currentShape}
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropAreaChange}
              classes={{
                containerClassName: 'relative w-full h-full touch-none',
                cropAreaClassName: currentShape === 'round'
                  ? 'border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.45)] ring-1 ring-white/30 rounded-full'
                  : 'border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.45)] ring-1 ring-white/30 rounded-2xl',
              }}
              transform={isFlippedH ? 'scaleX(-1)' : undefined}
            />

            {/* Non-intrusive Gesture Guide Pill (Fades on interaction) */}
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-[11px] text-cyan-200 font-medium flex items-center gap-1.5 shadow-xl whitespace-nowrap"
              >
                <Hand className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Drag to pan • Pinch to zoom</span>
              </motion.div>
            )}
          </div>

          {/* ========================================================
              3. STUDIO CONTROL DOCK (Touch Controls Isolated to Modal)
              ======================================================== */}
          <div className="bg-[#070e20]/95 border-t border-[#1b2d55] px-4 py-3 sm:py-3.5 space-y-3 shrink-0">
            {/* Row A: Zoom Slider & Snap Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  Magnification
                </span>
                
                {/* Live Zoom Percentage Badge */}
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-mono text-[11px] font-bold bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              {/* Slider Track with Minus/Plus Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white border border-white/[0.08] flex items-center justify-center transition shrink-0 cursor-pointer"
                  title="Zoom Out"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                {/* Styled Native Range Slider */}
                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                    aria-label="Zoom level slider"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))))}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-300 hover:text-white border border-white/[0.08] flex items-center justify-center transition shrink-0 cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Quick Snap Preset Pills */}
                <div className="hidden xs:flex items-center gap-1 pl-1 border-l border-white/[0.08]">
                  {[
                    { label: '1×', val: 1 },
                    { label: '1.5×', val: 1.5 },
                    { label: '2×', val: 2 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setZoom(p.val)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        Math.abs(zoom - p.val) < 0.08
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row B: 4-Segmented Tool Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/[0.06]">
              {/* Tool 1: Rotate 90° */}
              <button
                type="button"
                onClick={handleRotate90}
                className="py-2 px-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/15 text-slate-200 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-500/30 active:scale-95 transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                title="Rotate 90 degrees clockwise"
              >
                <RotateCw className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-[11px] font-medium leading-none">
                  {rotation !== 0 ? `${rotation}°` : 'Rotate'}
                </span>
              </button>

              {/* Tool 2: Horizontal Mirror / Flip */}
              <button
                type="button"
                onClick={handleToggleFlipH}
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold border active:scale-95 transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  isFlippedH
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-glow-cyan/20'
                    : 'bg-white/[0.04] text-slate-200 hover:text-cyan-300 border-white/[0.08] hover:border-cyan-500/30'
                }`}
                title="Mirror horizontally"
              >
                <RefreshCw className={`w-4 h-4 shrink-0 ${isFlippedH ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className="text-[11px] font-medium leading-none">Flip</span>
              </button>

              {/* Tool 3: Aperture Mask Shape Toggle */}
              <button
                type="button"
                onClick={handleToggleShape}
                className="py-2 px-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/15 text-slate-200 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-500/30 active:scale-95 transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                title="Toggle between circular and square aperture preview"
              >
                {currentShape === 'round' ? (
                  <Circle className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-purple-400 shrink-0" />
                )}
                <span className="text-[11px] font-medium leading-none">
                  {currentShape === 'round' ? 'Circle' : 'Square'}
                </span>
              </button>

              {/* Tool 4: Reset Position & Transform */}
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-1.5 rounded-xl text-xs font-semibold bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 border border-white/[0.06] active:scale-95 transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                title="Reset zoom, rotation, and position to center"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-medium leading-none">Reset</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              4. FOOTER ACTIONS (Pinned, Ergonomic Safe-Area Padding)
              ======================================================== */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:py-3.5 border-t border-white/[0.08] bg-[#050b18] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10 active:scale-95 transition border border-white/[0.08] min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 active:scale-98 shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 min-h-[44px] cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3] text-slate-950" />
                  <span>Apply Avatar Photo</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Mount directly to document.body via React Portal to escape all ancestor transforms and scrollable containers
  return typeof document !== 'undefined'
    ? createPortal(modalMarkup, document.body)
    : modalMarkup;
};
