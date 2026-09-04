import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Crop, 
  Trash2, 
  Link as LinkIcon, 
  Sparkles, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ImageCropperModal } from './ImageCropperModal';
import { uploadAvatarImage } from '../../services/storageService';

export interface AvatarUploadProps {
  currentAvatar: string;
  name?: string;
  userId?: string;
  label?: string;
  description?: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  allowUrlInput?: boolean;
  extraActions?: React.ReactNode;
  size?: 'md' | 'lg';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  name = 'Avatar',
  userId = 'usr_current',
  label = 'Avatar Image',
  description = 'Upload, crop, and readjust your profile picture. Recommended 1:1 square.',
  onAvatarChange,
  allowUrlInput = true,
  extraActions,
  size = 'md',
}) => {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImageForCrop(reader.result);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Clear input so selecting the same file again triggers change
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAdjustCurrentAvatar = () => {
    if (!currentAvatar) return;
    setRawImageForCrop(currentAvatar);
    setCropperOpen(true);
  };

  const handleApplyCroppedAvatar = async (dataUrl: string, blob: Blob) => {
    setIsApplying(true);
    try {
      const finalUrl = await uploadAvatarImage(blob, userId, dataUrl, 'avatar');
      onAvatarChange(finalUrl);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    onAvatarChange('');
  };

  const handleApplyManualUrl = () => {
    if (!manualUrl.trim()) return;
    setRawImageForCrop(manualUrl.trim());
    setCropperOpen(true);
    setShowUrlField(false);
    setManualUrl('');
  };

  const avatarDimensions = size === 'lg' ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20 sm:w-24 sm:h-24';

  return (
    <div className="space-y-3">
      {label && (
        <div className="space-y-0.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Main Avatar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-[#050c18] border border-white/[0.06]">
        {/* Clickable / Dropzone Avatar Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative ${avatarDimensions} rounded-full shrink-0 cursor-pointer group overflow-hidden border-2 transition-all duration-200 shadow-xl ${
            isDragging
              ? 'border-cyan-400 ring-4 ring-cyan-500/30 scale-105'
              : 'border-cyan-500/40 hover:border-cyan-400 hover:ring-2 hover:ring-cyan-500/20'
          }`}
          title="Click to upload or drag & drop photo"
        >
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-7 h-7 text-cyan-400/80 mb-1" />
              <span className="text-[9px] uppercase font-bold tracking-wider text-cyan-300">Upload</span>
            </div>
          )}

          {/* Hover Camera Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
            <Camera className="w-5 h-5 text-cyan-400 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
          </div>

          {/* Drag Indicator Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-300">
              <Upload className="w-6 h-6 animate-bounce mb-1" />
              <span className="text-[9px] font-bold uppercase">Drop Image</span>
            </div>
          )}
        </div>

        {/* Action Buttons & Helpers */}
        <div className="flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Native File Input Trigger */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={onFileInputChange}
            />

            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload className="w-3.5 h-3.5 text-cyan-300" />}
            >
              Upload Photo
            </Button>

            {currentAvatar && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAdjustCurrentAvatar}
                leftIcon={<Crop className="w-3.5 h-3.5 text-cyan-400" />}
                title="Crop or readjust current avatar"
              >
                Adjust / Crop
              </Button>
            )}

            {currentAvatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                className="text-slate-400 hover:text-rose-400"
                title="Remove photo"
              >
                Remove
              </Button>
            )}

            {extraActions}
          </div>

          {/* Secondary Options: Drag & Drop hint or Enter URL */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span>Drag & drop image onto photo circle</span>
            {allowUrlInput && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <LinkIcon className="w-3 h-3" />
                  {showUrlField ? 'Hide URL input' : 'Or use image URL'}
                </button>
              </>
            )}
          </div>

          {/* Expandable URL Input */}
          {allowUrlInput && showUrlField && (
            <div className="pt-1.5 flex items-center gap-2">
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Avatar Image URL"
                className="flex-1 rounded-xl bg-[#081224] border border-white/[0.1] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleApplyManualUrl}
                disabled={!manualUrl.trim()}
                leftIcon={<Crop className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Crop URL
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (manualUrl.trim()) {
                    onAvatarChange(manualUrl.trim());
                    setShowUrlField(false);
                    setManualUrl('');
                  }
                }}
                disabled={!manualUrl.trim()}
              >
                Set Direct
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImageForCrop}
        onClose={() => {
          setCropperOpen(false);
          setRawImageForCrop(null);
        }}
        onApplyCrop={handleApplyCroppedAvatar}
        title={`Adjust & Crop ${label}`}
      />
    </div>
  );
};
