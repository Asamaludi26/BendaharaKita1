import React, { useState } from 'react';

interface WelcomeTourModalProps {
    onClose: () => void;
    isFirstTime: boolean;
}

const tourSteps = [
    {
        icon: 'fa-hand-sparkles',
        title: 'Selamat Datang di BendaharaKita!',
        content: 'Ini bukan sekadar pencatat keuangan. Aplikasi ini adalah asisten cerdas yang **real-time**, **terintegrasi**, dan **informatif** untuk membantu Anda menguasai keuangan.'
    },
    {
        icon: 'fa-wallet',
        title: 'Semua Berawal dari Dompet',
        content: 'Menu **"Dompet"** adalah pusat dari semua dana Anda. Setiap **"Transaksi"** yang Anda catat akan secara otomatis dan instan memperbarui saldo dompet yang bersangkutan.'
    },
    {
        icon: 'fa-robot',
        title: 'Perencanaan Cerdas & Otomatis',
        content: 'Buat **"Target Bulanan"** Anda, lalu biarkan kami bekerja. **Laporan Aktual** akan terisi secara otomatis dari transaksi harian Anda. Tidak perlu lagi input manual!'
    },
    {
        icon: 'fa-trophy',
        title: 'Wujudkan Impian & Lunasi Utang',
        content: 'Gunakan menu **"Goals"** untuk mengelola tujuan jangka panjang. Setiap pembayaran utang atau setoran tabungan yang Anda catat di sini akan terintegrasi ke laporan bulanan Anda.'
    },
    {
        icon: 'fa-brain',
        title: 'Analisis Mendalam & Saran AI',
        content: 'Selami data Anda di **"Pusat Analitik"** atau dapatkan saran praktis dari AI di Dashboard. Pahami ke mana uang Anda pergi dan buat keputusan yang lebih cerdas.'
    },
    {
        icon: 'fa-thumbs-up',
        title: 'Anda Siap Memulai!',
        content: 'Sekarang Anda sudah memahami alur kerja utamanya. Jelajahi setiap fitur dan ambil kendali penuh atas masa depan finansial Anda. Selamat mencoba!'
    }
];

// A simple parser to highlight key terms
const renderContentWithHighlight = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} style={{ color: 'var(--primary-glow)', fontWeight: 'bold' }}>
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
};

const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ onClose, isFirstTime }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleNextAttempt = () => {
        if (currentStep < tourSteps.length - 1) {
            setShowConfirmation(true);
        } else {
            onClose(); // Finish on the last step
        }
    };

    const handleConfirmAndProceed = () => {
        setShowConfirmation(false);
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(s => s + 1);
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
        }
    };

    const stepData = tourSteps[currentStep];
    const hasSecondaryButton = currentStep > 0 || (currentStep === 0 && !isFirstTime);

    return (
        <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg text-center flex flex-col justify-between min-h-[30rem]">
            <div key={currentStep} className="animate-fade-in">
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] shadow-lg shadow-[var(--primary-glow)]/30 mx-auto mb-6">
                    <i className={`fa-solid ${stepData.icon} text-5xl text-white`}></i>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{stepData.title}</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed px-2">
                    {renderContentWithHighlight(stepData.content)}
                </p>
            </div>

            <div>
                 <div className="flex justify-center space-x-2 my-6">
                    {tourSteps.map((_, index) => (
                        <div 
                            key={index} 
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentStep === index ? 'bg-[var(--primary-glow)] scale-125' : 'bg-[var(--bg-interactive)]'}`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {currentStep > 0 && (
                         <button onClick={handlePrev} className="w-full bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold py-3 px-6 rounded-full transition-opacity">
                            Kembali
                        </button>
                    )}
                    
                    {currentStep === 0 && !isFirstTime && (
                         <button onClick={onClose} className="w-full bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold py-3 px-6 rounded-full transition-opacity">
                            Tutup
                        </button>
                    )}
                   
                    <button 
                        onClick={handleNextAttempt} 
                        className={`w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all ${!hasSecondaryButton ? 'flex-1' : ''}`}
                    >
                        {currentStep === tourSteps.length - 1 ? 'Mulai Jelajahi' : 'Lanjut'}
                    </button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl animate-fade-in">
                    <div className="bg-[var(--bg-primary)] p-6 rounded-xl shadow-2xl border border-[var(--border-primary)] max-w-xs mx-auto">
                        <h4 className="font-bold text-lg text-[var(--text-primary)] mb-2">Konfirmasi</h4>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">Apakah Anda sudah paham dengan penjelasan pada langkah ini?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmation(false)} className="w-full bg-[var(--bg-interactive)] text-[var(--text-secondary)] font-semibold py-2 px-4 rounded-full">Belum Paham</button>
                            <button onClick={handleConfirmAndProceed} className="w-full bg-[var(--primary-600)] text-white font-bold py-2 px-4 rounded-full">Sudah Paham</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WelcomeTourModal;