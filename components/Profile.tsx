import React, { useState } from 'react';
import Modal from './Modal';

interface ProfileProps {
  onClearAllData: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onClearAllData, theme, toggleTheme }) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleConfirmReset = () => {
    onClearAllData();
    setIsResetModalOpen(false);
  };

  return (
    <>
      <div className="p-4 md:p-6 flex flex-col items-center h-full text-center animate-fade-in">
          <div className="relative">
            <img src={`https://i.pravatar.cc/150?u=budihartono`} alt="Budi Hartono" className="w-32 h-32 rounded-full mb-4 shadow-lg border-4 border-[var(--border-primary)]" />
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary-glow)]" style={{boxShadow: '0 0 20px var(--primary-glow)'}}></div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Budi Hartono</h1>
          <p className="text-[var(--text-tertiary)]">Karyawan Swasta / Freelancer</p>
          
          <div className="mt-8 w-full max-w-sm space-y-3">
              <h2 className="text-lg font-semibold text-[var(--text-secondary)] text-left">Pengaturan</h2>
              <button className="w-full bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] text-left p-4 rounded-xl flex justify-between items-center hover:bg-[var(--bg-interactive-hover)] hover:border-[var(--border-secondary)] transition-all">
                  <span className="font-medium text-[var(--text-secondary)]">Pengaturan Akun</span>
                  <i className="fa-solid fa-chevron-right text-[var(--text-tertiary)]"></i>
              </button>
              
              <div className="w-full bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] p-4 rounded-xl flex justify-between items-center">
                <span className="font-medium text-[var(--text-secondary)]">{theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</span>
                <button onClick={toggleTheme} className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors ${theme === 'dark' ? 'bg-[var(--primary-500)]' : 'bg-[var(--border-secondary)]'}`}>
                    <span className="sr-only">Toggle Theme</span>
                    <span className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'}`} />
                    <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'} absolute ${theme === 'dark' ? 'left-1.5' : 'right-1.5'} text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-[var(--color-warning)]'}`}></i>
                </button>
              </div>

          </div>

          <div className="mt-8 w-full max-w-sm space-y-4">
              <h2 className="text-lg font-semibold text-[var(--color-expense)] text-left">Zona Berbahaya</h2>
              <button 
                onClick={() => setIsResetModalOpen(true)}
                className="w-full bg-[var(--bg-danger-subtle)] border border-red-500/20 text-[var(--text-danger-strong)] p-4 rounded-xl shadow-lg font-bold hover:bg-red-500/20 hover:text-red-600 transition-all"
              >
                  Reset Seluruh Aplikasi
              </button>
          </div>

          <div className="mt-auto pt-8 w-full max-w-sm">
              <button className="w-full bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] text-[var(--text-secondary)] p-4 rounded-xl shadow-lg font-bold hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-all">
                  Keluar
              </button>
          </div>
      </div>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-6 pt-16">
          <button 
              onClick={() => setIsResetModalOpen(false)} 
              className="absolute top-4 right-4 w-10 h-10 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors z-10"
              aria-label="Close modal"
          >
              <i className="fa-solid fa-times text-xl"></i>
          </button>

          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-lg shadow-red-500/40">
              <i className="fa-solid fa-trash-can text-5xl text-white"></i>
          </div>
          
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Hapus Semua Data?
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
              Tindakan ini akan <strong>menghapus semua data Anda secara permanen</strong>, termasuk transaksi, target, dan tujuan. Aplikasi akan kembali ke keadaan awal.
          </p>
          
          <div className="flex flex-col gap-3">
              <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
              >
                  Ya, Hapus Semua Data
              </button>
              <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors"
              >
                  Batal
              </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Profile;