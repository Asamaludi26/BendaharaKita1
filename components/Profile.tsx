import React, { useState } from 'react';
import Modal from './Modal';

interface ProfileProps {
  onClearAllData: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onClearAllData }) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleConfirmReset = () => {
    onClearAllData();
    setIsResetModalOpen(false);
  };

  return (
    <>
      <div className="p-4 md:p-6 flex flex-col items-center h-full text-center animate-fade-in">
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

          <div className="mt-8 w-full max-w-sm space-y-4">
              <h2 className="text-lg font-semibold text-red-400 text-left">Zona Berbahaya</h2>
              <button 
                onClick={() => setIsResetModalOpen(true)}
                className="w-full bg-red-900/40 border border-red-500/50 text-red-300 p-4 rounded-xl shadow-lg font-bold hover:bg-red-900/60 hover:text-red-200 transition-all"
              >
                  Reset Seluruh Aplikasi
              </button>
          </div>

          <div className="mt-auto pt-8 w-full max-w-sm">
              <button className="w-full bg-black/20 backdrop-blur-lg border border-white/10 text-white/80 p-4 rounded-xl shadow-lg font-bold hover:bg-black/30 hover:text-white transition-all">
                  Keluar
              </button>
          </div>
      </div>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <div className="relative bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-center p-6 pt-16">
          <button 
              onClick={() => setIsResetModalOpen(false)} 
              className="absolute top-4 right-4 w-10 h-10 rounded-full text-gray-400 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
              aria-label="Close modal"
          >
              <i className="fa-solid fa-times text-xl"></i>
          </button>

          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-lg shadow-red-500/40">
              <i className="fa-solid fa-trash-can text-5xl text-white"></i>
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
              Hapus Semua Data?
          </h3>
          <p className="text-gray-300 mb-6">
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
                  className="w-full bg-transparent text-gray-400 font-semibold py-3 px-6 rounded-full hover:bg-white/10 transition-colors"
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