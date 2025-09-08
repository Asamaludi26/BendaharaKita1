import React, { useState } from 'react';
import Modal from './Modal';

interface ProfileProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onManageCategories: () => void;
    onResetApp: () => void;
}

const ThemeToggle: React.FC<{ theme: string; onToggle: () => void; }> = ({ theme, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="w-14 h-8 rounded-full bg-[var(--bg-interactive)] p-1 flex items-center transition-colors duration-300"
            role="switch"
            aria-checked={theme === 'dark'}
        >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
                <div className="relative w-full h-full flex items-center justify-center">
                    <i className={`fa-solid fa-sun absolute text-yellow-500 transition-all duration-300 ${theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></i>
                    <i className={`fa-solid fa-moon absolute text-slate-800 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></i>
                </div>
            </div>
        </button>
    );
};


const Profile: React.FC<ProfileProps> = ({ theme, onToggleTheme, onManageCategories, onResetApp }) => {
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleConfirmReset = () => {
        onResetApp();
        setIsResetModalOpen(false);
    }

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
              <div className="w-full bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] p-4 rounded-xl flex justify-between items-center">
                  <span className="font-medium text-[var(--text-secondary)]">Mode Tampilan</span>
                  <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              </div>
              <button onClick={onManageCategories} className="w-full bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] text-left p-4 rounded-xl flex justify-between items-center hover:bg-[var(--bg-interactive-hover)] hover:border-[var(--border-secondary)] transition-all">
                  <span className="font-medium text-[var(--text-secondary)]">Kelola Kategori</span>
                  <i className="fa-solid fa-chevron-right text-[var(--text-tertiary)]"></i>
              </button>
              <button onClick={() => setIsResetModalOpen(true)} className="w-full bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] text-left p-4 rounded-xl flex justify-between items-center hover:bg-[var(--bg-interactive-hover)] hover:border-[var(--border-secondary)] transition-all">
                  <span className="font-medium text-[var(--color-warning)]">Reset Seluruh Aplikasi</span>
                  <i className="fa-solid fa-triangle-exclamation text-[var(--color-warning)]"></i>
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
              <i className="fa-solid fa-database text-5xl text-white"></i>
          </div>
          
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Reset Seluruh Data?
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
              Tindakan ini akan <strong>menghapus semua data</strong> yang telah Anda simpan di aplikasi ini, termasuk transaksi, target, dan tujuan.
              <br/><br/>
              <span className="font-bold text-[var(--color-warning)]">Tindakan ini tidak dapat diurungkan.</span>
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