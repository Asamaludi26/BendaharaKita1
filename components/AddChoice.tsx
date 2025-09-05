import React from 'react';
import { ExpenseIcon, IncomeIcon } from './icons';

interface AddChoiceProps {
    onClose: () => void;
    onSelectActual: () => void;
    onSelectTarget: () => void;
}

const AddChoice: React.FC<AddChoiceProps> = ({ onClose, onSelectActual, onSelectTarget }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-end" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-3xl p-8 space-y-8 shadow-2xl animate-slide-up">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Pilih Jenis Laporan</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white" aria-label="Tutup">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>

                <div className="space-y-6">
                    <button 
                        onClick={onSelectActual}
                        className="w-full flex items-center p-8 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-900)]/50 border-2 border-transparent hover:border-[var(--primary-500)] transition-all duration-300 transform hover:scale-105"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-[var(--primary-100)] dark:bg-[var(--primary-900)] flex items-center justify-center mr-6">
                            <i className="fa-solid fa-file-invoice-dollar text-[var(--primary-500)] text-5xl"></i>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-left text-gray-800 dark:text-white">Laporan Aktual</p>
                            <p className="text-base text-left text-gray-500 dark:text-gray-400">Isi laporan realisasi bulanan.</p>
                        </div>
                    </button>

                     <button 
                        onClick={onSelectTarget}
                        className="w-full flex items-center p-8 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-[var(--secondary-500)]/10 dark:hover:bg-[var(--secondary-500)]/20 border-2 border-transparent hover:border-[var(--secondary-500)] transition-all duration-300 transform hover:scale-105"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-[var(--secondary-500)]/20 flex items-center justify-center mr-6">
                           <i className="fa-solid fa-bullseye text-[var(--secondary-500)] text-5xl"></i>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-left text-gray-800 dark:text-white">Target Bulanan</p>
                            <p className="text-base text-left text-gray-500 dark:text-gray-400">Buat anggaran & target.</p>
                        </div>
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default AddChoice;