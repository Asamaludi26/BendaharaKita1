import React, { useState } from 'react';
import { View } from '../types';
import Modal from './Modal';

interface ReportProps {
    setView: (view: View) => void;
    isTargetSet: boolean;
}

const Report: React.FC<ReportProps> = ({ setView, isTargetSet }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleActualReportClick = () => {
        if (isTargetSet) {
            setView(View.ADD_ACTUAL);
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className="p-4 md:p-6 space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Manajemen</h1>
                <div className="space-y-4">
                    <button
                        onClick={handleActualReportClick}
                        className="w-full flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-transparent hover:border-[var(--primary-500)] transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[var(--primary-100)] dark:bg-[var(--primary-900)] flex items-center justify-center mr-6">
                            <i className="fa-solid fa-file-invoice-dollar text-[var(--primary-500)] text-4xl"></i>
                        </div>
                        <div className="text-left flex-grow">
                            <p className="text-xl font-bold text-gray-800 dark:text-white">Manajemen Laporan</p>
                            <p className="text-base text-gray-500 dark:text-gray-400">Isi laporan realisasi bulanan.</p>
                        </div>
                         <div className="ml-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setView(View.ACTUALS_HISTORY);
                                }}
                                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                            >
                                <i className="fa-solid fa-history"></i>
                                <span>Riwayat</span>
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
                        <div className="text-left flex-grow">
                            <p className="text-xl font-bold text-gray-800 dark:text-white">Manajemen Target</p>
                            <p className="text-base text-gray-500 dark:text-gray-400">Buat anggaran & target.</p>
                        </div>
                         <div className="ml-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setView(View.TARGET_HISTORY);
                                }}
                                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                            >
                                <i className="fa-solid fa-history"></i>
                                <span>Riwayat</span>
                            </button>
                        </div>
                    </button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center p-6 pt-16">
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="absolute top-4 right-4 w-10 h-10 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
                        aria-label="Close modal"
                    >
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>

                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-orange-500 shadow-lg shadow-orange-500/40 animate-float">
                        <i className="fa-solid fa-bullseye text-5xl text-white"></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Oops, Tunggu Dulu!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Anda harus membuat <strong>Target Bulanan</strong> sebelum bisa mengisi Laporan Aktual.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setView(View.ADD_TARGET);
                            }}
                            className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            Buat Target Sekarang
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full bg-transparent text-gray-500 dark:text-gray-400 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Nanti Saja
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Report;