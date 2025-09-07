import React from 'react';

// FIX: Removed unused 'ProfileProps' type, as the component does not accept any props.
const Profile: React.FC = () => {
  return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center h-full text-center animate-fade-in">
        <div className="relative">
          <img src={`https://i.pravatar.cc/150?u=budihartono`} alt="Budi Hartono" className="w-32 h-32 rounded-full mb-4 shadow-lg border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-[var(--primary-glow)]" style={{boxShadow: '0 0 20px var(--primary-glow)'}}></div>
        </div>
        <h1 className="text-2xl font-bold text-white">Budi Hartono</h1>
        <p className="text-gray-400">Karyawan Swasta / Freelancer</p>
        
        <div className="mt-8 w-full max-w-sm space-y-3">
            <h2 className="text-lg font-semibold text-gray-300 text-left">Pengaturan</h2>
            <button className="w-full bg-black/20 backdrop-blur-lg border border-white/10 text-left p-4 rounded-xl flex justify-between items-center hover:bg-black/30 hover:border-white/20 transition-all">
                <span className="font-medium text-gray-300">Pengaturan Akun</span>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
            </button>
            <button className="w-full bg-black/20 backdrop-blur-lg border border-white/10 text-left p-4 rounded-xl flex justify-between items-center hover:bg-black/30 hover:border-white/20 transition-all">
                <span className="font-medium text-gray-300">Notifikasi</span>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
            </button>
        </div>

        <div className="mt-8 w-full max-w-sm">
             <button className="w-full bg-red-500/80 border border-red-400 text-white p-4 rounded-xl shadow-lg font-bold hover:bg-red-500/100 hover:shadow-red-500/40 transition-all">
                Keluar
            </button>
        </div>
    </div>
  );
};

export default Profile;