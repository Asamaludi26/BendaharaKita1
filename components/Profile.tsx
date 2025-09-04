
import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="p-4 md:p-6 flex flex-col items-center justify-center h-full text-center">
        <img src={`https://i.pravatar.cc/150?u=budihartono`} alt="Budi Hartono" className="w-32 h-32 rounded-full mb-4 shadow-lg border-4 border-white dark:border-gray-800" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Budi Hartono</h1>
        <p className="text-gray-500 dark:text-gray-400">Karyawan Swasta / Freelancer</p>
        <div className="mt-8 w-full max-w-sm space-y-3">
            <button className="w-full bg-white dark:bg-gray-800 text-left p-4 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-700 dark:text-gray-300">Pengaturan Akun</span>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
            </button>
            <button className="w-full bg-white dark:bg-gray-800 text-left p-4 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="font-medium text-gray-700 dark:text-gray-300">Notifikasi</span>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
            </button>
            <button className="w-full bg-red-500 text-white p-4 rounded-lg shadow-sm font-bold hover:bg-red-600 transition-colors">
                Keluar
            </button>
        </div>
    </div>
  );
};

export default Profile;
