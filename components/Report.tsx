import React, { useState } from 'react';
import { View } from '../types';
import Modal from './Modal';

interface ReportProps {
    setView: (view: View) => void;
    isTargetSet: boolean;
}

const ManagementCard: React.FC<{
    title: string;
    description: string;
    icon: string;
    gradientFrom: string;
    gradientTo: string;
    actionText: string;
    onCardClick: () => void;
    onHistoryClick: () => void;
}> = ({ title, description, icon, gradientFrom, gradientTo, actionText, onCardClick, onHistoryClick }) => (
    <div className="group relative bg-black/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/20 flex flex-col">
        {/* Glow on hover */}
        <div 
            className="absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
                boxShadow: `inset 0 0 20px 0 ${gradientFrom}80`,
                border: `1px solid ${gradientFrom}`
            }}
        ></div>

        {/* Main Content Area */}
        <div className="relative p-6 flex-grow">
            <div className="flex items-start space-x-5">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-black/30 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <i className={`fa-solid ${icon} text-4xl bg-clip-text text-transparent`} style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`}}></i>
                </div>
                {/* Text */}
                <div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{description}</p>
                </div>
            </div>
        </div>

        {/* Action Buttons Area */}
        <div className="relative bg-black/30 backdrop-blur-sm px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
                onClick={onCardClick}
                className="flex-1 text-white font-bold py-2.5 px-4 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all text-sm"
                style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
            >
                {actionText}
            </button>
            <button
                onClick={onHistoryClick}
                className="flex-1 bg-black/20 border border-white/10 text-gray-300 font-semibold py-2.5 px-4 rounded-full hover:bg-white/10 hover:text-white transition-colors text-sm"
            >
                Lihat Riwayat
            </button>
        </div>
    </div>
);


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
            <div className="p-4 md:p-6 space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Manajemen</h1>
                    {/* Settings Button can go here if needed in the future */}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ManagementCard 
                        title="Manajemen Laporan"
                        description="Isi realisasi keuangan bulanan Anda."
                        icon="fa-file-invoice-dollar"
                        gradientFrom="var(--primary-glow)"
                        gradientTo="var(--secondary-glow)"
                        actionText="Isi Laporan"
                        onCardClick={handleActualReportClick}
                        onHistoryClick={() => setView(View.ACTUALS_HISTORY)}
                    />

                    <ManagementCard 
                        title="Manajemen Target"
                        description="Buat anggaran & target bulanan."
                        icon="fa-bullseye"
                        gradientFrom="var(--color-expense)"
                        gradientTo="var(--color-debt)"
                        actionText="Buat/Ubah Target"
                        onCardClick={() => setView(View.ADD_TARGET)}
                        onHistoryClick={() => setView(View.TARGET_HISTORY)}
                    />
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="relative bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-center p-6 pt-16">
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="absolute top-4 right-4 w-10 h-10 rounded-full text-gray-400 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
                        aria-label="Close modal"
                    >
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>

                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-orange-500 shadow-lg shadow-orange-500/40">
                        <i className="fa-solid fa-bullseye text-5xl text-white"></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Oops, Tunggu Dulu!
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Anda harus membuat <strong>Target Bulanan</strong> sebelum bisa mengisi Laporan Aktual.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setView(View.ADD_TARGET);
                            }}
                            className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:shadow-[var(--primary-glow)]/30 transform hover:scale-105 transition-all duration-300"
                        >
                            Buat Target Sekarang
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full bg-transparent text-gray-400 font-semibold py-3 px-6 rounded-full hover:bg-white/10 transition-colors"
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