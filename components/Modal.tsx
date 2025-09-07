import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>
        <div 
            className={`relative w-full max-w-sm m-4 transform transition-all duration-300 ease-[cubic-bezier(0.25,1.5,0.5,1)] ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
    </div>
  );
};

export default Modal;