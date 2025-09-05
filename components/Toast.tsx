import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Automatically close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const successStyles = {
    bg: 'bg-green-100 dark:bg-green-900',
    iconBg: 'bg-green-500',
    icon: 'fa-check-circle',
    text: 'text-green-800 dark:text-green-200',
  };

  const errorStyles = {
    bg: 'bg-red-100 dark:bg-red-900',
    iconBg: 'bg-red-500',
    icon: 'fa-exclamation-triangle',
    text: 'text-red-800 dark:text-red-200',
  };

  const styles = type === 'success' ? successStyles : errorStyles;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center w-full max-w-xs p-4 space-x-4 rounded-lg shadow-lg ${styles.bg} ${styles.text} animate-slide-down-fade-in`}
      role="alert"
    >
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white rounded-lg ${styles.iconBg}`}>
        <i className={`fa-solid ${styles.icon}`}></i>
      </div>
      <div className="text-sm font-semibold">{message}</div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100/20 inline-flex items-center justify-center h-8 w-8"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <i className="fa-solid fa-times"></i>
      </button>
      <style>{`
        @keyframes slide-down-fade-in {
          0% {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-down-fade-in {
          animation: slide-down-fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
