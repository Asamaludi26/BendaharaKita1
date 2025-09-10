import React, { useState } from 'react';
// FIX: Corrected imports. The component was previously in types.ts causing errors.
import { DebtItem, SavingsGoal } from '../../types';
import Modal from '../Modal';

interface OnboardingWizardProps {
    onComplete: (data: { debts: DebtItem[], savingsGoals: SavingsGoal[] }) => void;
    onSkip: () => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { name: 'Selamat Datang', icon: 'fa-hands-holding-circle' },
        { name: 'Catat Tabungan', icon: 'fa-piggy-bank' },
        { name: 'Catat Pinjaman', icon: 'fa-wallet' },
    ];

    return (
        <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-8">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = currentStep > stepNumber;
                const isActive = currentStep === stepNumber;

                return (
                    <React.Fragment key={step.name}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-[var(--primary-600)] text-white' : isActive ? 'text-white scale-110 shadow-lg' : 'bg-[var(--bg-interactive)] text-[var(--text-tertiary)]'}`}
                                 style={isActive ? { backgroundImage: 'var(--gradient-active-nav)' } : {}}
                            >
                                <i className={`fa-solid ${step.icon} text-xl text-inherit`}></i>
                            </div>
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

const popularLenders = [
    'Kredivo', 'ShopeePay Later', 'GoPay Later', 'Bank BCA', 'Bank Mandiri', 'Bank BRI'
];

const popularSavers = [
    'Bank BCA', 'Bank Mandiri', 'GoPay Tabungan', 'OVO', 'Bibit', 'Ajaib'
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(1);
    const [debts, setDebts] = useState<Partial<DebtItem & { remainingAmount: string, remainingTenor: string }>[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<Partial<SavingsGoal>[]>([]);
    
    const [showSavingsConfirm, setShowSavingsConfirm] = useState(false);
    const [showDebtConfirm, setShowDebtConfirm] = useState(false);
    const [isDebtCheckboxChecked, setIsDebtCheckboxChecked] = useState(false);


    const handleAddDebt = () => {
        setDebts([...debts, { id: `new-debt-${Date.now()}` }]);
    };
    
    const handleRemoveDebt = (idToRemove: string) => {
        setDebts(debts.filter(d => d.id !== idToRemove));
    };

    const handleAddSavingsGoal = () => {
        setSavingsGoals([...savingsGoals, { id: `new-sg-${Date.now()}` }]);
    };
    
    const handleRemoveSavingsGoal = (idToRemove: string) => {
        setSavingsGoals(savingsGoals.filter(sg => sg.id !== idToRemove));
    };

    const handleDebtChange = (index: number, field: keyof (DebtItem & { remainingAmount: string, remainingTenor: string }), value: any) => {
        const newDebts = [...debts];
        const isNumeric = ['remainingAmount', 'remainingTenor', 'monthlyInstallment', 'tenor', 'dueDate'].includes(field);
        const processedValue = isNumeric ? String(value).replace(/[^0-9]/g, '') : value;
        // @ts-ignore
        newDebts[index][field] = processedValue;
        setDebts(newDebts);
    };

    const handleSavingsChange = (index: number, field: keyof SavingsGoal, value: any) => {
        const newGoals = [...savingsGoals];
         const isNumeric = ['targetAmount', 'currentAmount'].includes(field);
         const processedValue = isNumeric ? String(value).replace(/[^0-9]/g, '') : value;
        // @ts-ignore
        newGoals[index][field] = processedValue;
        setSavingsGoals(newGoals);
    };

    const handleFinish = () => {
        const finalDebts: DebtItem[] = debts.map(d => {
            const monthlyInstallment = Number(d.monthlyInstallment) || 0;
            const tenor = Number(d.tenor) || 0;
            const remainingTenor = Number(d.remainingTenor) || 0;
            
            const paymentsMadeCount = tenor - remainingTenor;
            const paidAmount = paymentsMadeCount * monthlyInstallment;
            const totalAmount = (Number(d.remainingAmount) || 0) + paidAmount;

            const payments = Array.from({ length: paymentsMadeCount }, (_, i) => ({
                date: new Date(new Date().setMonth(new Date().getMonth() - (paymentsMadeCount - i))).toISOString(),
                amount: monthlyInstallment
            }));

            return {
                id: d.id!,
                name: d.name || 'Pinjaman Tanpa Nama',
                source: d.source || 'Lainnya',
                totalAmount: totalAmount,
                monthlyInstallment: monthlyInstallment,
                tenor: tenor,
                dueDate: Number(d.dueDate) || 1,
                payments: payments
            };
        }).filter(d => d.name !== 'Pinjaman Tanpa Nama' && d.totalAmount > 0);

        const finalSavings: SavingsGoal[] = savingsGoals.map(sg => {
            const currentAmount = Number(sg.currentAmount) || 0;
            return {
                id: sg.id!,
                name: sg.name || 'Tabungan Tanpa Nama',
                source: sg.source || 'Lainnya',
                targetAmount: Number(sg.targetAmount) || 0,
                currentAmount: currentAmount,
                deadline: sg.deadline ? new Date(sg.deadline).toISOString() : new Date().toISOString(),
                contributions: currentAmount > 0 ? [{ date: new Date().toISOString(), amount: currentAmount }] : [],
                // FIX: Added missing isEmergencyFund property.
                isEmergencyFund: sg.isEmergencyFund || false,
            };
        }).filter(sg => sg.name !== 'Tabungan Tanpa Nama' && sg.targetAmount > 0);
        
        onComplete({ debts: finalDebts, savingsGoals: finalSavings });
    };
    
    const handleAttemptNextFromSavings = () => {
        setShowSavingsConfirm(true);
    };

    const handleConfirmSavingsStep = () => {
        setStep(3);
        setShowSavingsConfirm(false);
    };
    
    const handleAttemptFinish = () => {
        setIsDebtCheckboxChecked(false); 
        setShowDebtConfirm(true);
    };

    const handleConfirmFinish = () => {
        handleFinish();
        setShowDebtConfirm(false);
    };

    const renderStep = () => {
        const inputClasses = "w-full p-2 bg-[var(--bg-interactive)] text-sm rounded-md border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent";
        const labelClasses = "block text-xs font-semibold text-[var(--text-tertiary)] mb-1";
        const buttonClasses = (isSelected: boolean) => `p-2 border rounded-lg text-xs font-semibold truncate transition-all duration-200 ${isSelected ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white border-transparent shadow-md' : 'bg-[var(--bg-interactive)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--primary-glow)]'}`;
        
        switch (step) {
            case 1:
                return (
                    <div className="text-center p-4">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] shadow-lg shadow-[var(--primary-glow)]/30 mx-auto mb-6">
                            <i className="fa-solid fa-rocket text-5xl text-white"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Selamat Datang!</h3>
                        <p className="text-[var(--text-secondary)] mb-8">Mari siapkan kondisi keuangan Anda saat ini agar kami dapat membantu secara akurat. Proses ini hanya butuh beberapa menit.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">Mulai</button>
                            <button onClick={onSkip} className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors">
                                Nanti Saja
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Langkah 1: Catat Saldo Tabungan</h3>
                        <div className="space-y-4 max-h-[20rem] overflow-y-auto p-1 pr-3">
                             {savingsGoals.length === 0 && (
                                <p className="text-center text-sm text-[var(--text-tertiary)] py-4">Tidak ada tabungan? Klik tombol di bawah untuk lanjut.</p>
                            )}
                            {savingsGoals.map((goal, index) => (
                                <div key={goal.id} className="p-4 bg-[var(--bg-interactive)] rounded-xl space-y-4 relative">
                                    <button onClick={() => handleRemoveSavingsGoal(goal.id!)} className="absolute top-2 right-2 text-[var(--text-tertiary)] hover:text-[var(--color-expense)] w-6 h-6 rounded-full flex items-center justify-center"><i className="fa-solid fa-times"></i></button>
                                    
                                    <div>
                                        <label className={labelClasses}>Nama Tujuan</label>
                                        <input type="text" placeholder="misal: Dana Darurat" className={inputClasses} onChange={e => handleSavingsChange(index, 'name', e.target.value)} />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Sumber Dana</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {popularSavers.map(saver => (
                                                <button key={saver} type="button" onClick={() => handleSavingsChange(index, 'source', saver)} className={buttonClasses(goal.source === saver)}>{saver}</button>
                                            ))}
                                            <button type="button" onClick={() => handleSavingsChange(index, 'source', 'Lainnya')} className={buttonClasses(goal.source === 'Lainnya')}>Lainnya...</button>
                                        </div>
                                        {goal.source === 'Lainnya' && (<input type="text" placeholder="Masukkan sumber dana lain" className={`${inputClasses} mt-2`} onChange={e => handleSavingsChange(index, 'source', e.target.value)} />)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClasses}>Target Dana (Rp)</label>
                                            <input type="text" inputMode="numeric" placeholder="10.000.000" className={inputClasses} value={(goal.targetAmount || '') && parseInt(String(goal.targetAmount)).toLocaleString('id-ID')} onChange={e => handleSavingsChange(index, 'targetAmount', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Terkumpul (Rp)</label>
                                            <input type="text" inputMode="numeric" placeholder="1.500.000" className={inputClasses} value={(goal.currentAmount || '') && parseInt(String(goal.currentAmount)).toLocaleString('id-ID')} onChange={e => handleSavingsChange(index, 'currentAmount', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 items-center">
                                         <div>
                                            <label className={labelClasses}>Tanggal Target</label>
                                            <input type="date" className={inputClasses} onChange={e => handleSavingsChange(index, 'deadline', e.target.value)} />
                                        </div>
                                        <div className="p-3 bg-[var(--bg-interactive)]/50 rounded-lg flex items-center space-x-3 mt-auto">
                                            <input type="checkbox" id={`emergency-${goal.id}`} checked={goal.isEmergencyFund} onChange={e => handleSavingsChange(index, 'isEmergencyFund', e.target.checked)} className="h-5 w-5 rounded text-[var(--primary-glow)] focus:ring-[var(--primary-glow)] cursor-pointer bg-[var(--bg-interactive)] border-[var(--border-primary)]" />
                                            <label htmlFor={`emergency-${goal.id}`} className="text-sm font-medium text-[var(--text-secondary)] cursor-pointer">Dana Darurat?</label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddSavingsGoal} className="text-sm font-semibold text-[var(--primary-glow)] hover:text-[var(--text-primary)] mt-4 w-full text-left p-2 rounded-lg hover:bg-[var(--bg-interactive-hover)] transition-colors"><i className="fa-solid fa-plus mr-2"></i>Tambah Tujuan Lain</button>
                    </div>
                );
             case 3:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Langkah 2: Catat Pinjaman Berjalan</h3>
                         <div className="space-y-4 max-h-[20rem] overflow-y-auto p-1 pr-3">
                            {debts.length === 0 && (
                                <p className="text-center text-sm text-[var(--text-tertiary)] py-4">Tidak ada pinjaman? Klik tombol di bawah untuk menyelesaikan.</p>
                            )}
                            {debts.map((debt, index) => (
                                <div key={debt.id} className="p-4 bg-[var(--bg-interactive)] rounded-xl space-y-4 relative">
                                    <button onClick={() => handleRemoveDebt(debt.id!)} className="absolute top-2 right-2 text-[var(--text-tertiary)] hover:text-[var(--color-expense)] w-6 h-6 rounded-full flex items-center justify-center"><i className="fa-solid fa-times"></i></button>
                                    
                                    <div>
                                        <label className={labelClasses}>Nama Pinjaman</label>
                                        <input type="text" placeholder="misal: Cicilan Motor" className={inputClasses} onChange={e => handleDebtChange(index, 'name', e.target.value)} />
                                    </div>
                                    
                                    <div>
                                        <label className={labelClasses}>Sumber Pinjaman</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {popularLenders.map(lender => (
                                                <button key={lender} type="button" onClick={() => handleDebtChange(index, 'source', lender)} className={buttonClasses(debt.source === lender)}>{lender}</button>
                                            ))}
                                            <button type="button" onClick={() => handleDebtChange(index, 'source', 'Lainnya')} className={buttonClasses(debt.source === 'Lainnya')}>Lainnya...</button>
                                        </div>
                                        {debt.source === 'Lainnya' && (<input type="text" placeholder="Masukkan sumber lain" className={`${inputClasses} mt-2`} onChange={e => handleDebtChange(index, 'source', e.target.value)} />)}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClasses}>Sisa Pinjaman (Rp)</label>
                                            <input type="text" inputMode="numeric" placeholder="5.000.000" className={inputClasses} value={(debt.remainingAmount || '') && parseInt(debt.remainingAmount).toLocaleString('id-ID')} onChange={e => handleDebtChange(index, 'remainingAmount', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Sisa Tenor (bulan)</label>
                                            <input type="text" inputMode="numeric" placeholder="6" className={inputClasses} value={debt.remainingTenor} onChange={e => handleDebtChange(index, 'remainingTenor', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Cicilan /bln (Rp)</label>
                                            <input type="text" inputMode="numeric" placeholder="900.000" className={inputClasses} value={(debt.monthlyInstallment || '') && parseInt(String(debt.monthlyInstallment)).toLocaleString('id-ID')} onChange={e => handleDebtChange(index, 'monthlyInstallment', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Total Tenor (bulan)</label>
                                            <input type="text" inputMode="numeric" placeholder="12" className={inputClasses} value={debt.tenor} onChange={e => handleDebtChange(index, 'tenor', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Tgl. Jatuh Tempo (1-31)</label>
                                        <input type="text" inputMode="numeric" min="1" max="31" placeholder="15" className={inputClasses} value={debt.dueDate} onChange={e => handleDebtChange(index, 'dueDate', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddDebt} className="text-sm font-semibold text-[var(--primary-glow)] hover:text-[var(--text-primary)] mt-4 w-full text-left p-2 rounded-lg hover:bg-[var(--bg-interactive-hover)] transition-colors"><i className="fa-solid fa-plus mr-2"></i>Tambah Pinjaman Lain</button>
                    </div>
                );
            default: return null;
        }
    };
    
    const renderNavButtons = () => {
        if (step === 1) return null;
        if (step === 2) {
            return (
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(1)} className="bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold py-3 px-6 rounded-full transition-opacity">Kembali</button>
                    <button onClick={handleAttemptNextFromSavings} className="bg-[var(--primary-600)] text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-[var(--primary-700)] transition-all">
                        {savingsGoals.length > 0 ? 'Lanjut' : 'Lewati & Lanjut'}
                    </button>
                </div>
            )
        }
         if (step === 3) {
            return (
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(2)} className="bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold py-3 px-6 rounded-full transition-opacity">Kembali</button>
                    <button onClick={handleAttemptFinish} className="bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                        {debts.length > 0 ? 'Selesai & Simpan' : 'Selesaikan'}
                    </button>
                </div>
            )
        }
    }

    return (
        <>
            <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                <ProgressBar currentStep={step} />
                <div key={step} className="animate-fade-in">
                    {renderStep()}
                </div>
                {renderNavButtons()}
            </div>

            {/* Savings Confirmation Modal */}
            <Modal isOpen={showSavingsConfirm} onClose={() => setShowSavingsConfirm(false)}>
                 <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-6">
                     <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)]">
                        <i className="fa-solid fa-circle-question text-3xl text-white"></i>
                    </div>
                     <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Konfirmasi Langkah</h3>
                     <p className="text-sm text-[var(--text-secondary)] mb-6">
                        {savingsGoals.length > 0
                            ? "Apakah Anda yakin telah memasukkan semua tujuan tabungan Anda?"
                            : "Anda yakin tidak memiliki tujuan tabungan untuk dicatat?"
                        }
                     </p>
                     <div className="flex gap-3">
                        <button onClick={() => setShowSavingsConfirm(false)} className="w-full bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold py-2 px-4 rounded-full">Batal</button>
                        <button onClick={handleConfirmSavingsStep} className="w-full bg-[var(--primary-600)] text-white font-bold py-2 px-4 rounded-full">{savingsGoals.length > 0 ? 'Ya, Lanjut' : 'Ya, Lewati'}</button>
                     </div>
                 </div>
            </Modal>

            {/* Debt Confirmation Modal */}
            <Modal isOpen={showDebtConfirm} onClose={() => setShowDebtConfirm(false)}>
                 <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)]">
                        <i className="fa-solid fa-flag-checkered text-3xl text-white"></i>
                    </div>
                     <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Konfirmasi Akhir</h3>
                     <p className="text-sm text-[var(--text-secondary)] mb-6">
                        {debts.length > 0
                            ? "Pastikan semua data pinjaman sudah benar sebelum menyelesaikan pengaturan."
                            : "Anda yakin tidak memiliki pinjaman berjalan untuk dicatat saat ini?"
                        }
                     </p>
                     {debts.length > 0 && (
                        <div className="mb-6 text-left p-3 bg-[var(--bg-interactive)] rounded-lg">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isDebtCheckboxChecked}
                                    onChange={(e) => setIsDebtCheckboxChecked(e.target.checked)}
                                    className="w-5 h-5 rounded text-[var(--primary-glow)] bg-[var(--bg-interactive)] border-[var(--border-primary)] focus:ring-[var(--primary-glow)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)]">Saya sadar telah mengisi semua data dengan benar.</span>
                            </label>
                        </div>
                     )}
                     <div className="flex gap-3">
                        <button onClick={() => setShowDebtConfirm(false)} className="w-full bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold py-2 px-4 rounded-full">Batal</button>
                        <button 
                            onClick={handleConfirmFinish} 
                            className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            disabled={debts.length > 0 && !isDebtCheckboxChecked}
                        >
                            {debts.length > 0 ? 'Ya, Simpan' : 'Ya, Selesaikan'}
                        </button>
                     </div>
                 </div>
            </Modal>
        </>
    );
};

export default OnboardingWizard;