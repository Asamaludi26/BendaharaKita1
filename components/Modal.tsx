import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalRoot) {
    return null;
  }

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div 
            className="relative w-full max-w-sm m-4 animate-fade-in-up max-h-full overflow-y-auto no-scrollbar"
            onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
    </div>,
    modalRoot
  );
};

export default Modal;