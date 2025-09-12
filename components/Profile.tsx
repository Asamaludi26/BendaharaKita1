import React from 'react';

interface ProfileProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onOpenTour: () => void;
    onOpenFormGuide: () => void;
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

const ProfileButton: React.FC<{ onClick: () => void; label: string; icon: string; isDestructive?: boolean }> = ({ onClick, label, icon, isDestructive = false }) => (
    <div className="relative rounded-xl p-px bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 hover:from-white/10">
      <button onClick={onClick} className={`w-full bg-[var(--bg-secondary)] text-left p-4 rounded-[10px] flex justify-between items-center hover:bg-[var(--bg-interactive-hover)] transition-colors ${isDestructive ? 'text-[var(--color-warning)]' : 'text-[var(--text-secondary)]'}`}>
        <span className="font-medium">{label}</span>
        <i className={`fa-solid ${icon} ${isDestructive ? 'text-[var(--color-warning)]' : 'text-[var(--text-tertiary)]'}`}></i>
      </button>
    </div>
);


const Profile: React.FC<ProfileProps> = ({ theme, onToggleTheme, onOpenTour, onOpenFormGuide }) => {

  return (
    <>
      <div className="p-4 md:p-6 flex flex-col items-center h-full text-center animate-fade-in">
          <div className="relative mt-8">
            <img src={`https://i.pravatar.cc/150?u=budihartono`} alt="Budi Hartono" className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mb-4 shadow-lg border-4 border-[var(--bg-secondary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Budi Hartono</h1>
          <p className="text-[var(--text-tertiary)]">Karyawan Swasta / Freelancer</p>
          
          <div className="mt-10 w-full max-w-sm space-y-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] text-left px-2">Pengaturan & Bantuan</h2>
              <div className="space-y-3">
                <div className="relative rounded-xl p-px bg-gradient-to-b from-white/5 to-transparent">
                  <div className="w-full bg-[var(--bg-secondary)] p-4 rounded-[10px] flex justify-between items-center">
                      <span className="font-medium text-[var(--text-secondary)]">Mode Tampilan</span>
                      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                  </div>
                </div>
                <ProfileButton onClick={onOpenTour} label="Panduan Alur Aplikasi" icon="fa-book-open" />
                <ProfileButton onClick={onOpenFormGuide} label="Panduan Pengisian Form" icon="fa-file-pen" />
              </div>
          </div>

          <div className="mt-auto pt-8 w-full max-w-sm">
              <div className="relative rounded-xl p-px bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 hover:from-white/10">
                <button className="w-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] p-4 rounded-[10px] shadow-lg font-bold hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-all">
                    Keluar
                </button>
              </div>
          </div>
      </div>
    </>
  );
};

export default Profile;