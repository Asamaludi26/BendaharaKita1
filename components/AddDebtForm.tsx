import React, { useState, useMemo, useEffect } from 'react';
import { DebtItem } from '../../types';

interface AddDebtFormProps {
    onClose: () => void;
    onSave: (debt: Omit<DebtItem, 'id'>) => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { name: 'Informasi Dasar', icon: 'fa-file-signature' },
        { name: 'Rincian Nominal', icon: 'fa-coins' },
        { name: 'Jadwal Pinjaman', icon: 'fa-calendar-days' },
    ];

    return (
        <div className="flex items-center justify-between w-full mx-auto mb-8">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = currentStep > stepNumber;
                const isActive = currentStep === stepNumber;

                return (
                    <React.Fragment key={step.name}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-[var(--primary-600)] text-white' : isActive ? 'bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] text-white scale-110 shadow-lg' : 'bg-[var(--bg-interactive)] text-[var(--text-tertiary)]'}`}>
                                <i className={`fa-solid ${step.icon} text-xl`}></i>
                            </div>
                            <p className={`mt-2 text-xs font-bold transition-colors ${isActive || isCompleted ? 'text-[var(--primary-glow)]' : 'text-[var(--text-tertiary)]'}`}>{step.name}</p>
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

const AddDebtForm: React.FC<AddDebtFormProps> = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [isExistingDebt, setIsExistingDebt] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        source: '', 
        totalAmount: '',
        monthlyInstallment: '',
        tenor: '',
        dueDate: '',
        remainingAmount: '',
        remainingTenor: '',
    });
    const [customSource, setCustomSource] = useState('');
    
    useEffect(() => {
        // Reset form when opening (though it's unmounted/remounted by App state)
        setStep(1);
        setFormData({
            name: '', source: '', totalAmount: '', monthlyInstallment: '', tenor: '',
            dueDate: '', remainingAmount: '', remainingTenor: '',
        });
        setIsExistingDebt(false);
        setCustomSource('');
    }, []);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
         const isNumeric = !['name', 'source'].includes(field);
         const processedValue = isNumeric ? value.replace(/[^0-9]/g, '') : value;
         setFormData(prev => ({ ...prev, [field]: processedValue }));
    };
    
    const handleSourceSelection = (sourceName: string) => {
        setFormData(prev => ({...prev, source: sourceName }));
        if (sourceName !== 'Lainnya') {
            setCustomSource('');
        }
    };

    const isStepValid = useMemo(() => {
        if (step === 1) {
            const isNameValid = formData.name.trim() !== '';
            const isSourceValid = formData.source.trim() !== '' && (formData.source !== 'Lainnya' || customSource.trim() !== '');
            return isNameValid && isSourceValid;
        }
        if (step === 2) {
            const isMonthlyInstallmentValid = formData.monthlyInstallment.trim() !== '';
            if (isExistingDebt) {
                return isMonthlyInstallmentValid && formData.remainingAmount.trim() !== '';
            }
            return isMonthlyInstallmentValid && formData.totalAmount.trim() !== '';
        }
        if (step === 3) {
             const isDueDateValid = formData.dueDate.trim() !== '' && parseInt(formData.dueDate) >= 1 && parseInt(formData.dueDate) <= 31;
             if (isExistingDebt) {
                 return isDueDateValid && formData.remainingTenor.trim() !== '' && formData.tenor.trim() !== '';
             }
             return isDueDateValid && formData.tenor.trim() !== '';
        }
        return false;
    }, [step, formData, customSource, isExistingDebt]);

    const handleNext = () => {
        if (isStepValid) setStep(s => s + 1);
    };

    const handlePrev = () => {
        setStep(s => s - 1);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStepValid) return;

        let finalDebtData: Omit<DebtItem, 'id'>;
        if (isExistingDebt) {
            const monthlyInstallment = parseInt(formData.monthlyInstallment);
            const remainingTenor = parseInt(formData.remainingTenor);
            const remainingAmount = parseInt(formData.remainingAmount);
            const totalTenor = parseInt(formData.tenor);
            const paymentsMadeCount = totalTenor - remainingTenor;
            const paidAmount = paymentsMadeCount > 0 ? paymentsMadeCount * monthlyInstallment : 0;
            const totalAmount = remainingAmount + paidAmount;
            
            const payments = Array.from({ length: paymentsMadeCount }, (_, i) => ({
                date: new Date(new Date().setMonth(new Date().getMonth() - (paymentsMadeCount - i))).toISOString(),
                amount: monthlyInstallment
            }));
            finalDebtData = {
                name: formData.name, source: formData.source === 'Lainnya' ? customSource : formData.source, totalAmount, monthlyInstallment,
                tenor: totalTenor, dueDate: parseInt(formData.dueDate), payments
            };
        } else {
             finalDebtData = {
                name: formData.name, source: formData.source === 'Lainnya' ? customSource : formData.source, totalAmount: parseInt(formData.totalAmount),
                monthlyInstallment: parseInt(formData.monthlyInstallment), tenor: parseInt(formData.tenor),
                dueDate: parseInt(formData.dueDate), payments: []
            };
        }
        onSave(finalDebtData);
    };

    const renderStepContent = () => {
        const inputClasses = "w-full p-3 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent text-[var(--text-primary)]";
        const labelClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-2";

        switch(step) {
            case 1: return (
                <div className="space-y-6">
                     <div>
                        <label className={labelClasses}>Nama Pinjaman</label>
                        <input type="text" placeholder="Contoh: Cicilan Motor Vario" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className={inputClasses} />
                     </div>
                     <div>
                        <label className={labelClasses}>Sumber Pinjaman</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {popularLenders.map(lender => (
                                <button key={lender} type="button" onClick={() => handleSourceSelection(lender)} className={`p-3 border rounded-lg text-sm font-semibold transition-all duration-200 ${formData.source === lender ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white border-transparent shadow-md' : 'bg-[var(--bg-interactive)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--primary-glow)]'}`}>{lender}</button>
                            ))}
                            <button type="button" onClick={() => handleSourceSelection('Lainnya')} className={`p-3 border rounded-lg text-sm font-semibold transition-all duration-200 ${formData.source === 'Lainnya' ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white border-transparent shadow-md' : 'bg-[var(--bg-interactive)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--primary-glow)]'}`}>Lainnya...</button>
                        </div>
                        {formData.source === 'Lainnya' && (<input type="text" placeholder="Masukkan sumber pinjaman lain" value={customSource} onChange={e => setCustomSource(e.target.value)} className={`${inputClasses} mt-3`} />)}
                     </div>
                </div>
            );
            case 2: return (
                 <div className="space-y-6">
                     <div className="p-3 bg-[var(--bg-interactive)]/50 rounded-lg flex items-center space-x-3">
                         <input type="checkbox" id="existingDebt" checked={isExistingDebt} onChange={e => setIsExistingDebt(e.target.checked)} className="h-5 w-5 rounded text-[var(--primary-glow)] focus:ring-[var(--primary-glow)] cursor-pointer bg-[var(--bg-interactive)] border-[var(--border-primary)]" />
                         <label htmlFor="existingDebt" className="text-sm font-medium text-[var(--text-secondary)] cursor-pointer">Centang jika ini adalah pinjaman yang sedang berjalan.</label>
                     </div>
                     {isExistingDebt ? (
                         <div>
                            <label className={labelClasses}>Sisa Pokok Pinjaman</label>
                            <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span><input type="text" inputMode="numeric" placeholder="10.000.000" value={formData.remainingAmount ? parseInt(formData.remainingAmount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('remainingAmount', e.target.value)} className={`${inputClasses} pl-9`} /></div>
                         </div>
                     ) : (
                         <div>
                            <label className={labelClasses}>Jumlah Total Pinjaman</label>
                            <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span><input type="text" inputMode="numeric" placeholder="15.000.000" value={formData.totalAmount ? parseInt(formData.totalAmount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('totalAmount', e.target.value)} className={`${inputClasses} pl-9`} /></div>
                         </div>
                     )}
                     <div>
                        <label className={labelClasses}>Cicilan per Bulan</label>
                        <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span><input type="text" inputMode="numeric" placeholder="800.000" value={formData.monthlyInstallment ? parseInt(formData.monthlyInstallment).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('monthlyInstallment', e.target.value)} className={`${inputClasses} pl-9`} /></div>
                     </div>
                 </div>
            );
            case 3: return (
                 <div className="space-y-6">
                     <div>
                         <label className={labelClasses}>Total Tenor</label>
                         <div className="relative"><input type="text" inputMode="numeric" placeholder="12" value={formData.tenor} onChange={e => handleInputChange('tenor', e.target.value)} className={`${inputClasses} pr-14 text-right`} /><span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-tertiary)]">bulan</span></div>
                     </div>
                    {isExistingDebt && (
                         <div>
                             <label className={labelClasses}>Sisa Tenor</label>
                             <div className="relative"><input type="text" inputMode="numeric" placeholder="8" value={formData.remainingTenor} onChange={e => handleInputChange('remainingTenor', e.target.value)} className={`${inputClasses} pr-14 text-right`} /><span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-tertiary)]">bulan</span></div>
                         </div>
                    )}
                      <div>
                         <label className={labelClasses}>Tanggal Jatuh Tempo</label>
                        <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Setiap tgl.</span><input type="text" inputMode="numeric" min="1" max="31" placeholder="10" value={formData.dueDate} onChange={e => handleInputChange('dueDate', e.target.value)} className={`${inputClasses} pl-20 text-center`} /></div>
                     </div>
                 </div>
            );
            default: return null;
        }
    }

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
             <header className="flex items-center justify-between space-x-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-interactive)] flex items-center justify-center border border-[var(--border-primary)] flex-shrink-0">
                      <i className="fa-solid fa-wallet text-2xl" style={{color: 'var(--color-debt)'}}></i>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-[var(--text-primary)]">Catat Pinjaman Baru</h1>
                      <p className="text-sm text-[var(--text-tertiary)]">Langkah {step} dari 3</p>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 rounded-full bg-[var(--bg-interactive)] text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors"
                    aria-label="Close"
                >
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            <ProgressBar currentStep={step} />

            <form onSubmit={handleSubmit} className="mt-8">
                <div key={step} className="animate-fade-in">
                    {renderStepContent()}
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <button type="button" onClick={handlePrev} disabled={step === 1} className="bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold py-3 px-6 rounded-full disabled:opacity-50 transition-opacity">
                        Kembali
                    </button>
                    {step < 3 ? (
                        <button type="button" onClick={handleNext} disabled={!isStepValid} className="bg-[var(--primary-600)] text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            Lanjut
                        </button>
                    ) : (
                         <button type="submit" disabled={!isStepValid} className="w-auto bg-gradient-to-r from-[var(--color-debt)] to-[var(--color-expense)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                            Simpan Pinjaman
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddDebtForm;