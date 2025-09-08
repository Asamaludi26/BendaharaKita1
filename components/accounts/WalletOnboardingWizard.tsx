import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../Modal';

interface NewAccountData {
    id: string;
    name: string;
    type: 'Bank' | 'E-Wallet';
    balance: number;
}

interface WalletOnboardingWizardProps {
    onComplete: (data: Omit<NewAccountData, 'id'>[]) => void;
    onSkip: () => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { name: 'Selamat Datang', icon: 'fa-hand-holding-dollar' },
        { name: 'Tambah Akun', icon: 'fa-landmark' },
    ];

    return (
        <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-8">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = currentStep > stepNumber;
                const isActive = currentStep === stepNumber;
                return (
                    <React.Fragment key={step.name}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-[var(--primary-600)] text-white' : isActive ? 'text-white scale-110 shadow-lg' : 'bg-[var(--bg-interactive)] text-[var(--text-tertiary)]'}`}
                                 style={isActive ? { backgroundImage: 'var(--gradient-active-nav)' } : {}}
                            > <i className={`fa-solid ${step.icon} text-xl text-inherit`}></i></div>
                            <p className={`mt-2 text-xs font-bold transition-colors ${isActive || isCompleted ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>{step.name}</p>
                        </div>
                        {stepNumber < steps.length && (
                             <div className={`flex-1 h-1 mx-2 transition-colors duration-500 ${isCompleted ? 'bg-[var(--primary-600)]' : 'bg-[var(--bg-interactive)]'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const WalletOnboardingWizard: React.FC<WalletOnboardingWizardProps> = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(1);
    const [accounts, setAccounts] = useState<NewAccountData[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleAddAccount = () => {
        setAccounts([...accounts, { id: uuidv4(), name: '', type: 'Bank', balance: 0 }]);
    };
    
    const handleRemoveAccount = (id: string) => {
        setAccounts(accounts.filter(acc => acc.id !== id));
    };

    const handleAccountChange = (id: string, field: keyof NewAccountData, value: any) => {
        const newAccounts = [...accounts];
        const accountIndex = newAccounts.findIndex(acc => acc.id === id);
        if (accountIndex !== -1) {
            const isNumeric = field === 'balance';
            const processedValue = isNumeric ? String(value).replace(/[^0-9]/g, '') : value;
            // @ts-ignore
            newAccounts[accountIndex][field] = isNumeric ? parseInt(processedValue || '0') : processedValue;
            setAccounts(newAccounts);
        }
    };

    const handleFinish = () => {
        const finalAccounts = accounts.filter(acc => acc.name.trim() !== '');
        onComplete(finalAccounts);
    };

    const renderStep = () => {
        const inputClasses = "w-full p-2 bg-[var(--bg-interactive)] text-sm rounded-md border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent";
        const labelClasses = "block text-xs font-semibold text-[var(--text-tertiary)] mb-1";
        
        switch (step) {
            case 1:
                return (
                    <div className="text-center p-4">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] shadow-lg shadow-[var(--primary-glow)]/30 mx-auto mb-6">
                            <i className="fa-solid fa-wallet text-5xl text-white"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Atur Dompet & Akun Anda</h3>
                        <p className="text-[var(--text-secondary)] mb-8">Hubungkan semua akun bank dan e-wallet Anda untuk mendapatkan gambaran finansial yang lengkap dan akurat.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg">Mulai</button>
                            <button onClick={onSkip} className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)]">Nanti Saja</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Tambah Akun Anda</h3>
                        <div className="space-y-4 max-h-[20rem] overflow-y-auto p-1 pr-3">
                             {accounts.length === 0 && (
                                <p className="text-center text-sm text-[var(--text-tertiary)] py-4">Klik tombol di bawah untuk menambahkan akun pertama Anda.</p>
                            )}
                            {accounts.map((acc) => (
                                <div key={acc.id} className="p-4 bg-[var(--bg-interactive)] rounded-xl space-y-4 relative">
                                    <button onClick={() => handleRemoveAccount(acc.id)} className="absolute top-2 right-2 text-[var(--text-tertiary)] hover:text-[var(--color-expense)] w-6 h-6"><i className="fa-solid fa-times"></i></button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClasses}>Nama Akun</label>
                                            <input type="text" placeholder="misal: Bank BCA" className={inputClasses} value={acc.name} onChange={e => handleAccountChange(acc.id, 'name', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Tipe Akun</label>
                                            <select className={inputClasses} value={acc.type} onChange={e => handleAccountChange(acc.id, 'type', e.target.value)}>
                                                <option value="Bank">Bank</option>
                                                <option value="E-Wallet">E-Wallet</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Saldo Saat Ini (Rp)</label>
                                        <input type="text" inputMode="numeric" placeholder="1.500.000" className={inputClasses} value={acc.balance.toLocaleString('id-ID')} onChange={e => handleAccountChange(acc.id, 'balance', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddAccount} className="text-sm font-semibold text-[var(--primary-glow)] hover:text-[var(--text-primary)] mt-4 w-full text-left p-2"><i className="fa-solid fa-plus mr-2"></i>Tambah Akun Lain</button>
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <>
            <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                <ProgressBar currentStep={step} />
                <div key={step} className="animate-fade-in">{renderStep()}</div>
                {step === 2 && (
                    <div className="flex justify-between mt-8">
                        <button onClick={() => setStep(1)} className="bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold py-3 px-6 rounded-full">Kembali</button>
                        <button onClick={() => setShowConfirm(true)} className="bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg">Selesai</button>
                    </div>
                )}
            </div>
            <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
                 <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-8">
                     <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)]"><i className="fa-solid fa-flag-checkered text-3xl text-white"></i></div>
                     <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Konfirmasi Akhir</h3>
                     <p className="text-sm text-[var(--text-secondary)] mb-8">Apakah Anda yakin telah memasukkan semua akun dan saldo dengan benar?</p>
                     <div className="flex gap-3">
                        <button onClick={() => setShowConfirm(false)} className="w-full bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold py-2 px-4 rounded-full">Batal</button>
                        <button onClick={handleFinish} className="w-full bg-[var(--primary-600)] text-white font-bold py-2 px-4 rounded-full">Ya, Selesai</button>
                     </div>
                 </div>
            </Modal>
        </>
    );
};

export default WalletOnboardingWizard;