import React, { useState } from 'react';
import { DebtItem, SavingsGoal } from '../../types';
import Modal from '../Modal';

interface OnboardingWizardProps {
    onComplete: (data: { debts: DebtItem[], savingsGoals: SavingsGoal[] }) => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { name: 'Selamat Datang', icon: 'fa-hands-holding-circle' },
        { name: 'Catat Pinjaman', icon: 'fa-wallet' },
        { name: 'Catat Tabungan', icon: 'fa-piggy-bank' },
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
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-[var(--primary-600)] text-white' : isActive ? 'bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] text-white scale-110 shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                                <i className={`fa-solid ${step.icon} text-xl`}></i>
                            </div>
                            <p className={`mt-2 text-xs font-bold transition-colors ${isActive || isCompleted ? 'text-[var(--primary-500)] dark:text-[var(--primary-400)]' : 'text-gray-500'}`}>{step.name}</p>
                        </div>
                        {stepNumber < steps.length && (
                             <div className={`flex-1 h-1 mx-2 transition-colors duration-500 ${isCompleted ? 'bg-[var(--primary-600)]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [debts, setDebts] = useState<Partial<DebtItem & { remainingAmount: string, remainingTenor: string }>[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<Partial<SavingsGoal>[]>([]);
    
    const [showDebtConfirm, setShowDebtConfirm] = useState(false);
    const [showSavingsConfirm, setShowSavingsConfirm] = useState(false);
    const [isSavingsCheckboxChecked, setIsSavingsCheckboxChecked] = useState(false);


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

        const finalSavings: SavingsGoal[] = savingsGoals.map(sg => ({
            id: sg.id!,
            name: sg.name || 'Tabungan Tanpa Nama',
            targetAmount: Number(sg.targetAmount) || 0,
            currentAmount: Number(sg.currentAmount) || 0,
            deadline: sg.deadline || new Date().toISOString()
        })).filter(sg => sg.name !== 'Tabungan Tanpa Nama' && sg.targetAmount > 0);
        
        onComplete({ debts: finalDebts, savingsGoals: finalSavings });
    };
    
    const handleAttemptNextFromDebts = () => {
        setShowDebtConfirm(true);
    };

    const handleConfirmDebtStep = () => {
        setStep(3);
        setShowDebtConfirm(false);
    };

    const handleAttemptFinish = () => {
        setIsSavingsCheckboxChecked(false); 
        setShowSavingsConfirm(true);
    };

    const handleConfirmFinish = () => {
        handleFinish();
        setShowSavingsConfirm(false);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center p-4">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-400)] to-[var(--secondary-500)] shadow-lg shadow-indigo-500/30 mx-auto mb-6">
                            <i className="fa-solid fa-rocket text-5xl text-white"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Selamat Datang di BendaharaKita!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">Mari siapkan kondisi keuangan Anda saat ini agar kami dapat membantu secara akurat. Proses ini hanya butuh beberapa menit.</p>
                        <button onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">Mulai Pengaturan</button>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Langkah 1: Catat Pinjaman Berjalan</h3>
                         <div className="space-y-4 max-h-64 overflow-y-auto p-1 pr-3">
                            {debts.length === 0 && (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Tidak ada pinjaman berjalan? Klik tombol di bawah untuk melewati langkah ini.</p>
                            )}
                            {debts.map((debt, index) => (
                                <div key={debt.id} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl space-y-3 relative">
                                    <button onClick={() => handleRemoveDebt(debt.id!)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 w-6 h-6 rounded-full flex items-center justify-center"><i className="fa-solid fa-times"></i></button>
                                    <input type="text" placeholder="Nama Pinjaman (misal: Cicilan Motor)" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" onChange={e => handleDebtChange(index, 'name', e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" inputMode="numeric" placeholder="Sisa Pinjaman (Rp)" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" value={(debt.remainingAmount || '') && parseInt(debt.remainingAmount).toLocaleString('id-ID')} onChange={e => handleDebtChange(index, 'remainingAmount', e.target.value)} />
                                        <input type="text" inputMode="numeric" placeholder="Sisa Tenor (bulan)" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" value={debt.remainingTenor} onChange={e => handleDebtChange(index, 'remainingTenor', e.target.value)} />
                                        <input type="text" inputMode="numeric" placeholder="Cicilan /bln (Rp)" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" value={(debt.monthlyInstallment || '') && parseInt(String(debt.monthlyInstallment)).toLocaleString('id-ID')} onChange={e => handleDebtChange(index, 'monthlyInstallment', e.target.value)} />
                                        <input type="text" inputMode="numeric" placeholder="Total Tenor (bulan)" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" value={debt.tenor} onChange={e => handleDebtChange(index, 'tenor', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddDebt} className="text-sm font-semibold text-[var(--primary-500)] hover:text-[var(--primary-600)] mt-4 w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"><i className="fa-solid fa-plus mr-2"></i>Tambah Pinjaman Lain</button>
                    </div>
                );
             case 3:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Langkah 2: Catat Saldo Tabungan</h3>
                        <div className="space-y-4 max-h-64 overflow-y-auto p-1 pr-3">
                             {savingsGoals.length === 0 && (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Tidak ada tabungan berjalan? Klik tombol di bawah untuk menyelesaikan.</p>
                            )}
                            {savingsGoals.map((goal, index) => (
                                <div key={goal.id} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl space-y-3 relative">
                                    <button onClick={() => handleRemoveSavingsGoal(goal.id!)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 w-6 h-6 rounded-full flex items-center justify-center"><i className="fa-solid fa-times"></i></button>
                                    <input type="text" placeholder="Nama Tujuan (misal: Dana Darurat)" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" onChange={e => handleSavingsChange(index, 'name', e.target.value)} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" inputMode="numeric" placeholder="Target Dana (Rp)" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" value={(goal.targetAmount || '') && parseInt(String(goal.targetAmount)).toLocaleString('id-ID')} onChange={e => handleSavingsChange(index, 'targetAmount', e.target.value)} />
                                        <input type="text" inputMode="numeric" placeholder="Dana Terkumpul (Rp)" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" value={(goal.currentAmount || '') && parseInt(String(goal.currentAmount)).toLocaleString('id-ID')} onChange={e => handleSavingsChange(index, 'currentAmount', e.target.value)} />
                                    </div>
                                     <input type="date" placeholder="Tenggat Waktu" className="w-full p-2 bg-white dark:bg-gray-800 text-sm rounded-md border-gray-300 dark:border-gray-600" onChange={e => handleSavingsChange(index, 'deadline', e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddSavingsGoal} className="text-sm font-semibold text-[var(--primary-500)] hover:text-[var(--primary-600)] mt-4 w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"><i className="fa-solid fa-plus mr-2"></i>Tambah Tujuan Lain</button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const renderNavButtons = () => {
        if (step === 1) return null;
        if (step === 2) {
            return (
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(1)} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-full transition-opacity">Kembali</button>
                    <button onClick={handleAttemptNextFromDebts} className="bg-[var(--primary-600)] text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-[var(--primary-700)] transition-all">
                        {debts.length > 0 ? 'Lanjut' : 'Lewati & Lanjut'}
                    </button>
                </div>
            )
        }
         if (step === 3) {
            return (
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(2)} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-full transition-opacity">Kembali</button>
                    <button onClick={handleAttemptFinish} className="bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                        {savingsGoals.length > 0 ? 'Selesai & Simpan' : 'Selesaikan Pengaturan'}
                    </button>
                </div>
            )
        }
    }

    return (
        <>
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                <ProgressBar currentStep={step} />
                <div key={step} className="animate-fade-in">
                    {renderStep()}
                </div>
                {renderNavButtons()}
            </div>
        </div>

        {/* Debt Confirmation Modal */}
        <Modal isOpen={showDebtConfirm} onClose={() => setShowDebtConfirm(false)}>
             <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center p-6">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Konfirmasi Langkah</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    {debts.length > 0
                        ? "Apakah Anda yakin telah memasukkan semua pinjaman yang sedang berjalan?"
                        : "Anda yakin tidak memiliki pinjaman berjalan untuk dicatat?"
                    }
                 </p>
                 <div className="flex gap-3">
                    <button onClick={() => setShowDebtConfirm(false)} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-full">Batal</button>
                    <button onClick={handleConfirmDebtStep} className="w-full bg-[var(--primary-600)] text-white font-bold py-2 px-4 rounded-full">{debts.length > 0 ? 'Ya, Lanjut' : 'Ya, Lewati'}</button>
                 </div>
             </div>
        </Modal>

        {/* Savings Confirmation Modal */}
        <Modal isOpen={showSavingsConfirm} onClose={() => setShowSavingsConfirm(false)}>
             <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center p-6">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Konfirmasi Akhir</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {savingsGoals.length > 0
                        ? "Pastikan semua data tabungan sudah benar sebelum menyelesaikan pengaturan."
                        : "Anda yakin tidak memiliki tujuan tabungan untuk dicatat saat ini?"
                    }
                 </p>
                 {savingsGoals.length > 0 && (
                    <div className="mb-4 text-left p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isSavingsCheckboxChecked}
                                onChange={(e) => setIsSavingsCheckboxChecked(e.target.checked)}
                                className="w-5 h-5 rounded text-[var(--primary-500)] bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-[var(--primary-500)]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Saya sadar telah mengisi semua data dengan benar.</span>
                        </label>
                    </div>
                 )}
                 <div className="flex gap-3">
                    <button onClick={() => setShowSavingsConfirm(false)} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-full">Batal</button>
                    <button 
                        onClick={handleConfirmFinish} 
                        className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        disabled={savingsGoals.length > 0 && !isSavingsCheckboxChecked}
                    >
                        {savingsGoals.length > 0 ? 'Ya, Simpan' : 'Ya, Selesaikan'}
                    </button>
                 </div>
             </div>
        </Modal>
        </>
    );
};

export default OnboardingWizard;
