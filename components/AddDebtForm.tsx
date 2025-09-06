import React, { useState, useMemo, useEffect } from 'react';
import { View, DebtItem } from '../../types';

interface AddDebtFormProps {
    setView: (view: View) => void;
    onSave: (debt: Omit<DebtItem, 'id'>) => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { name: 'Informasi Dasar', icon: 'fa-file-signature' },
        { name: 'Rincian Nominal', icon: 'fa-coins' },
        { name: 'Jadwal Pinjaman', icon: 'fa-calendar-days' },
    ];

    return (
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8">
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

const popularLenders = [
    'Kredivo', 'ShopeePay Later', 'GoPay Later', 'Bank BCA', 'Bank Mandiri', 'Bank BRI'
];

const AddDebtForm: React.FC<AddDebtFormProps> = ({ setView, onSave }) => {
    const [step, setStep] = useState(1);
    const [isExistingDebt, setIsExistingDebt] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        source: '', 
        totalAmount: '',
        monthlyInstallment: '',
        tenor: '',
        dueDate: '',
        // Fields for existing debt
        remainingAmount: '',
        remainingTenor: '',
    });
    const [customSource, setCustomSource] = useState('');

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
        if (!isStepValid) {
            alert("Harap lengkapi semua data pada langkah ini.");
            return;
        }

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
                name: formData.name,
                source: formData.source === 'Lainnya' ? customSource : formData.source,
                totalAmount: totalAmount,
                monthlyInstallment: monthlyInstallment,
                tenor: totalTenor,
                dueDate: parseInt(formData.dueDate),
                payments: payments
            };
        } else {
             finalDebtData = {
                name: formData.name,
                source: formData.source === 'Lainnya' ? customSource : formData.source,
                totalAmount: parseInt(formData.totalAmount),
                monthlyInstallment: parseInt(formData.monthlyInstallment),
                tenor: parseInt(formData.tenor),
                dueDate: parseInt(formData.dueDate),
                payments: []
            };
        }
        
        onSave(finalDebtData);
    };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Pinjaman</label>
                            <input type="text" placeholder="Contoh: Cicilan Motor Vario" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent" />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Berikan nama yang deskriptif agar mudah diingat.</p>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sumber Pinjaman</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {popularLenders.map(lender => (
                                    <button 
                                        key={lender} type="button" 
                                        onClick={() => handleSourceSelection(lender)}
                                        className={`p-3 border rounded-lg text-sm font-semibold transition-all duration-200 ${formData.source === lender ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white border-transparent shadow-md' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-[var(--primary-400)] dark:hover:border-[var(--primary-400)]'}`}
                                    >
                                        {lender}
                                    </button>
                                ))}
                                 <button 
                                    type="button" 
                                    onClick={() => handleSourceSelection('Lainnya')}
                                    className={`p-3 border rounded-lg text-sm font-semibold transition-all duration-200 ${formData.source === 'Lainnya' ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white border-transparent shadow-md' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-[var(--primary-400)] dark:hover:border-[var(--primary-400)]'}`}
                                >
                                    Lainnya...
                                </button>
                            </div>
                            {formData.source === 'Lainnya' && (
                                <div className="mt-3">
                                    <input type="text" placeholder="Masukkan sumber pinjaman lain" value={customSource} onChange={e => setCustomSource(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent" />
                                </div>
                            )}
                         </div>
                    </div>
                );
            case 2:
                return (
                     <div className="space-y-6">
                         <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center space-x-3">
                             <input type="checkbox" id="existingDebt" checked={isExistingDebt} onChange={e => setIsExistingDebt(e.target.checked)} className="h-5 w-5 rounded text-[var(--primary-500)] focus:ring-[var(--primary-500)] cursor-pointer" />
                             <label htmlFor="existingDebt" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Centang jika ini adalah pinjaman yang sedang berjalan.</label>
                         </div>

                         {isExistingDebt ? (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sisa Pokok Pinjaman</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                                    <input type="text" inputMode="numeric" placeholder="10.000.000" value={formData.remainingAmount ? parseInt(formData.remainingAmount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('remainingAmount', e.target.value)} className="w-full p-3 pl-9 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                                </div>
                             </div>
                         ) : (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah Total Pinjaman</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                                    <input type="text" inputMode="numeric" placeholder="15.000.000" value={formData.totalAmount ? parseInt(formData.totalAmount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('totalAmount', e.target.value)} className="w-full p-3 pl-9 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                                </div>
                                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Total pokok pinjaman awal.</p>
                             </div>
                         )}

                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cicilan per Bulan</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                                <input type="text" inputMode="numeric" placeholder="800.000" value={formData.monthlyInstallment ? parseInt(formData.monthlyInstallment).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('monthlyInstallment', e.target.value)} className="w-full p-3 pl-9 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Jumlah yang harus dibayar setiap bulan.</p>
                         </div>
                     </div>
                );
            case 3:
                 return (
                     <div className="space-y-6">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Tenor</label>
                             <div className="relative">
                                <input type="text" inputMode="numeric" placeholder="12" value={formData.tenor} onChange={e => handleInputChange('tenor', e.target.value)} className="w-full p-3 pr-14 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md text-right" />
                                 <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">bulan</span>
                             </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Jangka waktu pinjaman total dalam bulan.</p>
                         </div>

                        {isExistingDebt && (
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sisa Tenor</label>
                                 <div className="relative">
                                    <input type="text" inputMode="numeric" placeholder="8" value={formData.remainingTenor} onChange={e => handleInputChange('remainingTenor', e.target.value)} className="w-full p-3 pr-14 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md text-right" />
                                     <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">bulan</span>
                                 </div>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Sisa jangka waktu pinjaman dalam bulan.</p>
                             </div>
                        )}
                          <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Jatuh Tempo</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Setiap tgl.</span>
                                <input type="text" inputMode="numeric" min="1" max="31" placeholder="10" value={formData.dueDate} onChange={e => handleInputChange('dueDate', e.target.value)} className="w-full p-3 pl-20 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md text-center" />
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tanggal pembayaran setiap bulannya (1-31).</p>
                         </div>
                     </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="p-4 md:p-6 space-y-6 pb-24">
            <header className="flex items-center space-x-4">
                <button onClick={() => setView(View.MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Catat Pinjaman Baru</h1>
            </header>

            <ProgressBar currentStep={step} />

            <form onSubmit={handleSubmit}>
                <div key={step} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md animate-fade-in">
                    {renderStepContent()}
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <button type="button" onClick={handlePrev} disabled={step === 1} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-full disabled:opacity-50 transition-opacity">
                        Kembali
                    </button>
                    {step < 3 ? (
                        <button type="button" onClick={handleNext} disabled={!isStepValid} className="bg-[var(--primary-600)] text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            Lanjut
                        </button>
                    ) : (
                         <button type="submit" disabled={!isStepValid} className="w-auto bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                            Simpan Rincian Pinjaman
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddDebtForm;