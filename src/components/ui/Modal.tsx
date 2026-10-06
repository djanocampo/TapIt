import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
  bodyClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
  className,
  bodyClassName,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-5xl',
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pt-[calc(0.875rem+env(safe-area-inset-top,0px))] pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] pl-[calc(0.75rem+env(safe-area-inset-left,0px))] pr-[calc(0.75rem+env(safe-area-inset-right,0px))] overflow-hidden"
        style={{ isolation: 'isolate' }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity z-0"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'relative w-full max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem)] sm:max-h-[88dvh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#0a142c] border border-[#1b2d55] shadow-2xl overflow-hidden z-10 my-auto shadow-black/80',
            maxWidths[maxWidth],
            className
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-4 sm:p-6 border-b border-[#1b2d55] shrink-0 bg-[#0a142c]/95 backdrop-blur-md z-10 gap-3">
              <div className="min-w-0 flex-1">
                {title && <h3 className="text-base sm:text-lg font-bold text-white font-display truncate sm:whitespace-normal">{title}</h3>}
                {description && <p className="text-xs text-slate-300 mt-1 line-clamp-2 sm:line-clamp-none">{description}</p>}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 sm:p-1.5 text-slate-400 hover:text-white hover:bg-[#124294]/30 transition-colors -mr-1 -mt-1 cursor-pointer shrink-0 min-w-[40px] min-h-[40px] w-10 h-10 flex items-center justify-center"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={cn('p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 touch-pan-y', bodyClassName)}>
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
