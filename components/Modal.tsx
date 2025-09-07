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
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalRoot) {
    return null;
  }

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out opacity-100"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 ease-in-out opacity-100"></div>
        <div 
            className="relative w-full max-w-sm m-4 transform transition-all duration-300 ease-[cubic-bezier(0.25,1.5,0.5,1)] scale-100 opacity-100"
            onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
    </div>,
    modalRoot
  );
};

export default Modal;