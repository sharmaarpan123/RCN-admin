import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  locked?: boolean;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  locked = false,
  maxWidth = '900px'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, locked, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (locked) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/55 flex items-center justify-center p-3 sm:p-5 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full"
        style={{ maxWidth: `min(${maxWidth}, calc(100vw - 1.5rem))` }}
      >
        <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 max-h-[85vh] sm:max-h-[80vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
