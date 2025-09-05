import React from 'react';
import { View } from '../types';

interface ReportProps {
    setView: (view: View) => void;
}

const Report: React.FC<ReportProps> = ({ setView }) => {
    return (
        <div className="p-4 md:p-6 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Manajemen</h1>
            <div className="space-y-4">
                <button
                    onClick={() => setView(View.ADD_ACTUAL)}
                    className="w-full flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-transparent hover:border-[var(--primary-500)] transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                    <div className="w-16 h-16 rounded-2xl bg-[var(--primary-100)] dark:bg-[var(--primary-900)] flex items-center justify-center mr-6">
                        <i className="fa-solid fa-file-invoice-dollar text-[var(--primary-500)] text-4xl"></i>
                    </div>
                    <div className="text-left">
                        <p className="text-xl font-bold text-gray-800 dark:text-white">Laporan Aktual</p>
                        <p className="text-base text-gray-500 dark:text-gray-400">Isi laporan realisasi bulanan.</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setView(View.ACTUALS_HISTORY);
                            }}
                            className="text-sm font-semibold text-[var(--primary-500)] hover:underline mt-2 inline-block"
                        >
                            Lihat Riwayat <i className="fa-solid fa-arrow-right-long text-xs"></i>
                        </button>
                    </div>
                </button>

                 <button
                    onClick={() => setView(View.ADD_TARGET)}
                    className="w-full flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-transparent hover:border-[var(--secondary-500)] transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                    <div className="w-16 h-16 rounded-2xl bg-[var(--secondary-500)]/20 flex items-center justify-center mr-6">
                       <i className="fa-solid fa-bullseye text-[var(--secondary-500)] text-4xl"></i>
                    </div>
                    <div className="text-left">
                        <p className="text-xl font-bold text-gray-800 dark:text-white">Target Bulanan</p>
                        <p className="text-base text-gray-500 dark:text-gray-400">Buat anggaran & target.</p>
                         <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setView(View.TARGET_HISTORY);
                            }}
                            className="text-sm font-semibold text-[var(--secondary-500)] hover:underline mt-2 inline-block"
                        >
                            Lihat Riwayat <i className="fa-solid fa-arrow-right-long text-xs"></i>
                        </button>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Report;