import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'w-full max-w-[400px]',
  md: 'w-full max-w-[560px]',
  lg: 'w-full max-w-[720px]',
  xl: 'w-full max-w-[960px]',
  full: 'w-full h-full max-w-none rounded-none',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousOverflow = useRef<string>('');

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousOverflow.current;
    }
    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const isFull = size === 'full';

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      <div
        className={[
          'bg-white rounded-[8px] shadow-[#1E293B_4px_4px_0px_0px] flex flex-col max-h-[90vh]',
          'animate-in fade-in zoom-in-95 duration-150',
          sizeClasses[size],
          isFull ? 'max-h-screen' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          animation: 'modalIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] flex-shrink-0">
            {title ? (
              <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-[#64748B] hover:text-[#0F172A] rounded-[4px] p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
