
import React, { useState, useMemo, useEffect } from 'react';
import { SavingsGoal } from '../../types';

interface AddSavingsGoalFormProps {
    onClose: () => void;
    onSave: (goal: Omit<SavingsGoal, 'id'>) => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { name: 'Nama Tujuan', icon: 'fa-flag-checkered' },
        { name: 'Target Dana', icon: 'fa-sack-dollar' },
        { name: 'Jadwal & Status', icon: 'fa-calendar-check' },
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
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-[var(--primary-600)] text-white' : isActive ? 'bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] text-white scale-110 shadow-lg' : 'bg-black/20 text-gray-400'}`}>
                                <i className={`fa-solid ${step.icon} text-xl`}></i>
                            </div>
                            <p className={`mt-2 text-xs font-bold transition-colors ${isActive || isCompleted ? 'text-[var(--primary-glow)]' : 'text-gray-400'}`}>{step.name}</p>
                        </div>
                        {stepNumber < steps.length && (
                             <div className={`flex-1 h-1 mx-2 transition-colors duration-500 ${isCompleted ? 'bg-[var(--primary-600)]' : 'bg-black/20'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// FIX: Added list of popular savers for source selection.
const popularSavers = [
    'Bank BCA', 'Bank Mandiri', 'GoPay Tabungan', 'OVO', 'Bibit', 'Ajaib'
];

const AddSavingsGoalForm: React.FC<AddSavingsGoalFormProps> = ({ onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        // FIX: Added 'source' to the form state to align with the SavingsGoal type.
        source: '',
        targetAmount: '',
        deadline: '',
        currentAmount: '',
    });
    // FIX: Added state for custom source input.
    const [customSource, setCustomSource] = useState('');
    
    useEffect(() => {
        setStep(1);
        // FIX: Reset 'source' field on component mount.
        setFormData({ name: '', source: '', targetAmount: '', deadline: '', currentAmount: '' });
        setCustomSource('');
    }, []);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
         const isNumeric = ['targetAmount', 'currentAmount'].includes(field);
         const processedValue = isNumeric ? value.replace(/[^0-9]/g, '') : value;
         setFormData(prev => ({ ...prev, [field]: processedValue }));
    };

    // FIX: Added handler for source selection buttons.
    const handleSourceSelection = (sourceName: string) => {
        setFormData(prev => ({...prev, source: sourceName }));
        if (sourceName !== 'Lainnya') {
            setCustomSource('');
        }
    };

    const isStepValid = useMemo(() => {
        // FIX: Updated step 1 validation to include the 'source' field.
        if (step === 1) {
            const isNameValid = formData.name.trim() !== '';
            const isSourceValid = formData.source.trim() !== '' && (formData.source !== 'Lainnya' || customSource.trim() !== '');
            return isNameValid && isSourceValid;
        }
        if (step === 2) return formData.targetAmount.trim() !== '' && parseInt(formData.targetAmount) > 0;
        if (step === 3) return formData.deadline.trim() !== '';
        return false;
    }, [step, formData, customSource]);

    const handleNext = () => {
        if (isStepValid) setStep(s => s + 1);
    };

    const handlePrev = () => {
        setStep(s => s - 1);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStepValid) return;
        const currentAmount = parseInt(formData.currentAmount || '0');

        // FIX: Add missing 'contributions' property to satisfy SavingsGoal type.
        // Create a synthetic contribution if an initial amount is provided.
        const contributions = currentAmount > 0 ? [{ date: new Date().toISOString(), amount: currentAmount }] : [];

        // FIX: Included 'source' in the saved data object to resolve the type error.
        onSave({
            name: formData.name,
            source: formData.source === 'Lainnya' ? customSource : formData.source,
            targetAmount: parseInt(formData.targetAmount),
            deadline: new Date(formData.deadline).toISOString(),
            currentAmount: currentAmount,
            contributions: contributions,
        });
    };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    // FIX: Added UI for selecting the source of funds in step 1.
                     <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nama Tujuan</label>
                            <input type="text" placeholder="Contoh: Liburan ke Bali" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full p-3 bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Sumber Dana</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {popularSavers.map(saver => (
                                    <button key={saver} type="button" onClick={() => handleSourceSelection(saver)} className={`p-3 border rounded-lg text-sm font-semibold transition-all duration-200 ${formData.source === saver ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white border-transparent shadow-md' : 'bg-black/20 border-white/10 hover:border-[var(--primary-glow)]'}`}>{saver}</button>
                                ))}
                                <button type="button" onClick={() => handleSourceSelection('Lainnya')} className={`p-3 border rounded-lg text-sm font-semibold transition-all duration-200 ${formData.source === 'Lainnya' ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white border-transparent shadow-md' : 'bg-black/20 border-white/10 hover:border-[var(--primary-glow)]'}`}>Lainnya...</button>
                            </div>
                            {formData.source === 'Lainnya' && (<input type="text" placeholder="Masukkan sumber dana lain" value={customSource} onChange={e => setCustomSource(e.target.value)} className="w-full p-3 mt-3 bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent" />)}
                         </div>
                     </div>
                );
            case 2:
                return (
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Dana</label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">Rp</span>
                            <input type="text" inputMode="numeric" placeholder="5.000.000" value={formData.targetAmount ? parseInt(formData.targetAmount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('targetAmount', e.target.value)} className="w-full p-3 pl-9 bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent text-right" />
                        </div>
                     </div>
                );
            case 3:
                 return (
                     <div className="space-y-6">
                         <div>
                             <label className="block text-sm font-medium text-gray-300 mb-2">Tanggal Target Menabung</label>
                             <input type="date" value={formData.deadline} onChange={e => handleInputChange('deadline', e.target.value)} className="w-full p-3 bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Dana Terkumpul Saat Ini (Opsional)</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">Rp</span>
                                <input type="text" inputMode="numeric" placeholder="0" value={formData.currentAmount ? parseInt(formData.currentAmount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('currentAmount', e.target.value)} className="w-full p-3 pl-9 bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent text-right" />
                            </div>
                         </div>
                     </div>
                );
            default: return null;
        }
    }

    return (
        <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-between space-x-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center border border-white/10 flex-shrink-0">
                      <i className="fa-solid fa-piggy-bank text-2xl text-cyan-300"></i>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">Buat Tujuan Tabungan</h1>
                      <p className="text-sm text-gray-400">Langkah {step} dari 3</p>
                    </div>
                </div>
                 <button 
                    onClick={onClose} 
                    className="w-8 h-8 rounded-full bg-black/20 text-gray-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
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
                    <button type="button" onClick={handlePrev} disabled={step === 1} className="bg-black/20 border border-white/10 text-gray-300 font-bold py-3 px-6 rounded-full disabled:opacity-50 transition-opacity">
                        Kembali
                    </button>
                    {step < 3 ? (
                        <button type="button" onClick={handleNext} disabled={!isStepValid} className="bg-[var(--primary-600)] text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            Lanjut
                        </button>
                    ) : (
                         <button type="submit" disabled={!isStepValid} className="w-auto bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                            Simpan Tujuan
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddSavingsGoalForm;
