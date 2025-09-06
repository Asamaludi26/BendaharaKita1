import React, { useState, useMemo } from 'react';
import { View, SavingsGoal } from '../types';

interface AddSavingsGoalFormProps {
    setView: (view: View) => void;
    onSave: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { name: 'Nama Tujuan', icon: 'fa-flag-checkered' },
        { name: 'Target Dana', icon: 'fa-sack-dollar' },
        { name: 'Tenggat Waktu', icon: 'fa-calendar-check' },
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


const AddSavingsGoalForm: React.FC<AddSavingsGoalFormProps> = ({ setView, onSave }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        deadline: '',
    });

    const handleInputChange = (field: keyof typeof formData, value: string) => {
         const isNumeric = ['targetAmount'].includes(field);
         const processedValue = isNumeric ? value.replace(/[^0-9]/g, '') : value;
         setFormData(prev => ({ ...prev, [field]: processedValue }));
    };

    const isStepValid = useMemo(() => {
        if (step === 1) return formData.name.trim() !== '';
        if (step === 2) return formData.targetAmount.trim() !== '' && parseInt(formData.targetAmount) > 0;
        if (step === 3) return formData.deadline.trim() !== '';
        return false;
    }, [step, formData]);

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
        onSave({
            name: formData.name,
            targetAmount: parseInt(formData.targetAmount),
            deadline: new Date(formData.deadline).toISOString(),
        });
    };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Tujuan</label>
                            <input type="text" placeholder="Contoh: Liburan ke Bali" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent" />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Apa yang ingin Anda capai dengan tabungan ini?</p>
                         </div>
                    </div>
                );
            case 2:
                return (
                     <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Dana</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">Rp</span>
                                <input type="text" inputMode="numeric" placeholder="5.000.000" value={formData.targetAmount ? parseInt(formData.targetAmount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('targetAmount', e.target.value)} className="w-full p-3 pl-9 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent text-right" />
                            </div>
                             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Jumlah total uang yang ingin Anda kumpulkan.</p>
                         </div>
                     </div>
                );
            case 3:
                 return (
                     <div className="space-y-6">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenggat Waktu</label>
                             <input type="date" value={formData.deadline} onChange={e => handleInputChange('deadline', e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent" />
                             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Kapan Anda ingin tujuan ini tercapai?</p>
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Buat Tujuan Tabungan Baru</h1>
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
                            Simpan Tujuan Tabungan
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddSavingsGoalForm;