import React, { useState, useCallback } from 'react';
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
  Maximize2
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
  title = 'Adjust & Crop Avatar',
  cropShape = 'round',
  aspectRatio = 1,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#030712]/85 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#081224] border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden z-10 flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#050c18]/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  {title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Drag to pan • Wheel or slider to zoom • 1:1 circular crop
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cropper Viewport */}
          <div className="relative w-full h-72 sm:h-80 bg-black/90 overflow-hidden select-none">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              cropShape={cropShape}
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropAreaChange}
              classes={{
                containerClassName: 'relative w-full h-full',
                cropAreaClassName: cropShape === 'round' 
                  ? 'border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]' 
                  : 'border-2 border-cyan-400',
              }}
              transform={isFlippedH ? 'scaleX(-1)' : undefined}
            />

            {/* Subtle Overlay Guide Badge */}
            <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] text-cyan-300 font-mono flex items-center gap-1.5 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Circular Avatar Aperture
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-5 space-y-4 bg-[#050c18]/60 border-t border-white/[0.06]">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  Zoom & Scale
                </span>
                <span className="text-cyan-400 font-mono text-xs font-bold bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transform Controls (Rotate, Flip, Reset) */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotate90}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-500/30 transition flex items-center gap-1.5"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Rotate 90°
                </button>

                <button
                  type="button"
                  onClick={handleToggleFlipH}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    isFlippedH 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                      : 'text-slate-300 bg-white/[0.04] hover:bg-cyan-500/20 hover:text-cyan-300 border-white/[0.08] hover:border-cyan-500/30'
                  }`}
                  title="Flip Image Horizontally"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Flip
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] transition flex items-center gap-1"
                  title="Reset Position & Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                512×512 HD Output
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/[0.08] bg-[#050c18]">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            <Button
              variant="glow"
              size="sm"
              onClick={handleApply}
              disabled={isProcessing}
              leftIcon={isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-cyan-300" />}
            >
              {isProcessing ? 'Processing...' : 'Apply & Save Avatar'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
