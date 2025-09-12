import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    View,
    MonthlyTarget,
    TargetFormField,
    UserCategory,
    TransactionType,
    DebtItem,
    SavingsGoal,
    ArchivedMonthlyTarget
} from '../types';
import { generateMonthlyTarget } from '../services/geminiService';
import Modal from './Modal';
import { AccordionSection } from './AccordionSection';

interface AddTargetFormProps {
  setView: (view: View) => void;
  onSave: (data: MonthlyTarget) => void;
  initialData: MonthlyTarget | null;
  archivedTargets: ArchivedMonthlyTarget[];
  currentMonthYear: string;
  activeDebts: DebtItem[];
  activeSavingsGoals: SavingsGoal[];
  onAddDebt: () => void;
  onAddSavingsGoal: () => void;
  userCategories: UserCategory[];
  onManageCategories: () => void;
}

const SummaryCard: React.FC<{ title: string; amount: number; colorClass: string }> = ({ title, amount, colorClass }) => (
    <div className="bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-xl p-3 text-center">
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">{title}</p>
        <p className={`text-lg font-bold ${colorClass}`}>Rp {amount.toLocaleString('id-ID')}</p>
    </div>
);

const TargetItem: React.FC<{
    item: TargetFormField;
    isLocked?: boolean;
    onChange: (field: 'name' | 'amount', value: string) => void;
    onRemove: () => void;
}> = ({ item, isLocked = false, onChange, onRemove }) => (
    <div className="flex items-center space-x-2">
        <input
            type="text"
            placeholder="Nama item"
            value={item.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={`flex-1 p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-sm ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
            readOnly={isLocked}
        />
        <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-[var(--text-tertiary)] text-sm">Rp</span>
            <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={Number(item.amount || '0').toLocaleString('id-ID')}
                onChange={(e) => onChange('amount', e.target.value.replace(/[^0-9]/g, ''))}
                className="w-32 p-2 pl-7 text-right bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-sm"
                readOnly={isLocked}
            />
        </div>
        <button
            type="button"
            onClick={onRemove}
            disabled={isLocked}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[var(--text-tertiary)] rounded-md hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--color-expense)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <i className="fa-solid fa-trash-can text-sm"></i>
        </button>
    </div>
);

const AddTargetForm: React.FC<AddTargetFormProps> = ({
    setView,
    onSave,
    initialData,
    archivedTargets,
    currentMonthYear,
    activeDebts,
    activeSavingsGoals,
    onAddDebt,
    onAddSavingsGoal,
    userCategories,
    onManageCategories,
}) => {
    const [target, setTarget] = useState<MonthlyTarget>({});
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

    const categoryMap = useMemo(() => new Map(userCategories.map(c => [c.id, c])), [userCategories]);
    
    const { debtCategories, savingsCategories, incomeCategories, expenseCategories } = useMemo(() => {
        const debtNames = new Set(activeDebts.map(d => d.name));
        const savingsNames = new Set(activeSavingsGoals.map(sg => sg.name));
        
        const debtCats: UserCategory[] = [];
        const savingsCats: UserCategory[] = [];
        const incomeCats: UserCategory[] = [];
        const expenseCats: UserCategory[] = [];

        userCategories.forEach(cat => {
            if (debtNames.has(cat.name)) {
                debtCats.push(cat);
            } else if (savingsNames.has(cat.name)) {
                savingsCats.push(cat);
            } else if (cat.isActive) {
                if (cat.type === TransactionType.INCOME) {
                    incomeCats.push(cat);
                } else {
                    expenseCats.push(cat);
                }
            }
        });
        return { debtCategories: debtCats, savingsCategories: savingsCats, incomeCategories: incomeCats, expenseCategories: expenseCats };
    }, [userCategories, activeDebts, activeSavingsGoals]);

    useEffect(() => {
        const autoPopulatedTarget: MonthlyTarget = {};
        if (initialData) {
            Object.assign(autoPopulatedTarget, initialData);
        }

        activeDebts.forEach(debt => {
            const category = debtCategories.find(c => c.name === debt.name);
            if (category) {
                autoPopulatedTarget[category.id] = [{
                    id: `goal-${debt.id}`, name: debt.name, amount: String(debt.monthlyInstallment)
                }];
            }
        });
        activeSavingsGoals.forEach(goal => {
            const category = savingsCategories.find(c => c.name === goal.name);
            if (category) {
                const existingItems = autoPopulatedTarget[category.id] || [];
                if (!existingItems.some(item => item.id === `goal-${goal.id}`)) {
                     autoPopulatedTarget[category.id] = [...existingItems, {
                        id: `goal-${goal.id}`, name: goal.name, amount: ''
                    }];
                }
            }
        });
        setTarget(autoPopulatedTarget);

        // Auto-open accordions for goals
        const goalAccordionStates: Record<string, boolean> = {};
        [...debtCategories, ...savingsCategories].forEach(cat => {
            goalAccordionStates[cat.id] = true;
        });
        setOpenAccordions(prev => ({...prev, ...goalAccordionStates}));

    }, [initialData, activeDebts, activeSavingsGoals, debtCategories, savingsCategories]);


    const handleCopyFromLastMonth = () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthYear = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
        const lastMonthTarget = archivedTargets.find(t => t.monthYear === lastMonthYear);
        if (lastMonthTarget) {
            setTarget(lastMonthTarget.target);
        } else {
            alert('Tidak ada data target dari bulan sebelumnya.');
        }
    };
    
    const handleGenerateWithAI = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateMonthlyTarget(aiPrompt, activeDebts, activeSavingsGoals, userCategories);
            setTarget(result);
            setIsAiModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Gagal membuat target dengan AI. Silakan coba lagi.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleItemChange = (categoryId: string, itemId: string, field: 'name' | 'amount', value: string) => {
        setTarget(prev => ({
            ...prev,
            [categoryId]: (prev[categoryId] || []).map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
            ),
        }));
    };

    const handleAddItem = (categoryId: string) => {
        const newItem: TargetFormField = { id: uuidv4(), name: '', amount: '' };
        setTarget(prev => ({
            ...prev,
            [categoryId]: [...(prev[categoryId] || []), newItem],
        }));
        setOpenAccordions(prev => ({...prev, [categoryId]: true}));
    };
    
    const handleRemoveItem = (categoryId: string, itemId: string) => {
        setTarget(prev => ({
            ...prev,
            [categoryId]: (prev[categoryId] || []).filter(item => item.id !== itemId),
        }));
    };

    const { income, expenses, savings, potentialBalance } = useMemo(() => {
        let income = 0, expenses = 0, savings = 0;
        
        const calculateTotal = (categories: UserCategory[]) => {
            return categories.reduce((sum, cat) => {
                const categoryTotal = (target[cat.id] || []).reduce((itemSum, item) => itemSum + (parseInt(item.amount) || 0), 0);
                return sum + categoryTotal;
            }, 0);
        };
        
        income = calculateTotal(incomeCategories);
        expenses = calculateTotal(expenseCategories) + calculateTotal(debtCategories);
        savings = calculateTotal(savingsCategories);

        return { income, expenses, savings, potentialBalance: income - expenses - savings };
    }, [target, incomeCategories, expenseCategories, debtCategories, savingsCategories]);
    
    const SectionHeader: React.FC<{title: string, color: string, icon: string}> = ({title, color, icon}) => (
        <div className="flex items-center space-x-3 mb-3 border-b-2 pb-2" style={{borderColor: `var(--color-${color})`}}>
            <i className={`fa-solid ${icon} text-lg`} style={{color: `var(--color-${color})`}}></i>
            <h2 className="text-lg font-semibold" style={{color: `var(--color-${color})`}}>{title}</h2>
        </div>
    );

    return (
        <>
            <div className="p-4 md:p-6 space-y-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setView(View.DASHBOARD)} className="text-[var(--text-tertiary)]"><i className="fa-solid fa-arrow-left text-xl"></i></button>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Target Bulanan</h1>
                            <p className="text-[var(--text-tertiary)]">Rencanakan keuangan Anda untuk bulan ini.</p>
                        </div>
                    </div>
                     <button onClick={onManageCategories} className="hidden sm:flex items-center space-x-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--bg-interactive-hover)]">
                        <i className="fa-solid fa-cog"></i>
                        <span>Kelola Kategori</span>
                    </button>
                </header>

                <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/80 backdrop-blur-lg -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-b border-[var(--border-primary)]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <SummaryCard title="Pemasukan" amount={income} colorClass="text-[var(--color-income)]" />
                        <SummaryCard title="Pengeluaran" amount={expenses} colorClass="text-[var(--color-expense)]" />
                        <SummaryCard title="Tabungan" amount={savings} colorClass="text-[var(--color-savings)]" />
                        <SummaryCard title="Sisa Uang" amount={potentialBalance} colorClass={potentialBalance >= 0 ? 'text-[var(--text-primary)]' : 'text-[var(--color-warning)]'} />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                     <button onClick={() => setIsAiModalOpen(true)} className="flex-1 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl"><i className="fa-solid fa-robot mr-2"></i>Buat dengan AI</button>
                     <button onClick={handleCopyFromLastMonth} className="flex-1 text-sm bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] font-semibold py-3 px-4 rounded-lg"><i className="fa-solid fa-copy mr-2"></i>Salin Bulan Lalu</button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); onSave(target); }} className="space-y-6 pb-20">
                    {/* PENDAPATAN */}
                    <div>
                        <SectionHeader title="Pendapatan" color="income" icon="fa-arrow-down" />
                        <div className="space-y-3">
                        {incomeCategories.map(cat => (
                            <AccordionSection key={cat.id} title={cat.name} isOpen={openAccordions[cat.id]}>
                                {(target[cat.id] || []).map(item => <TargetItem key={item.id} item={item} onChange={(f, v) => handleItemChange(cat.id, item.id, f, v)} onRemove={() => handleRemoveItem(cat.id, item.id)} />)}
                                <button type="button" onClick={() => handleAddItem(cat.id)} className="text-sm font-semibold text-[var(--primary-glow)] hover:text-[var(--text-primary)] mt-2">+ Tambah Item</button>
                            </AccordionSection>
                        ))}
                        </div>
                    </div>
                    {/* HUTANG */}
                    <div>
                        <SectionHeader title="Hutang" color="debt" icon="fa-file-invoice-dollar" />
                        <div className="space-y-3">
                        {debtCategories.map(cat => (
                            <AccordionSection key={cat.id} title={cat.name} isOpen={true} headerClassName="bg-[var(--bg-interactive)]/50" badge={<i className="fa-solid fa-lock text-xs text-[var(--text-tertiary)]"></i>}>
                                {(target[cat.id] || []).map(item => <TargetItem key={item.id} item={item} isLocked={true} onChange={() => {}} onRemove={() => {}} />)}
                            </AccordionSection>
                        ))}
                        {debtCategories.length === 0 && <p className="text-xs text-center text-[var(--text-tertiary)] py-2">Tidak ada utang aktif.</p>}
                        </div>
                    </div>
                    {/* TABUNGAN */}
                    <div>
                        <SectionHeader title="Tabungan" color="savings" icon="fa-piggy-bank" />
                        <div className="space-y-3">
                        {savingsCategories.map(cat => (
                            <AccordionSection key={cat.id} title={cat.name} isOpen={true} headerClassName="bg-[var(--bg-interactive)]/50" badge={<i className="fa-solid fa-lock text-xs text-[var(--text-tertiary)]"></i>}>
                                {(target[cat.id] || []).map(item => <TargetItem key={item.id} item={item} isLocked={!item.id.includes('goal-')} onChange={(f, v) => handleItemChange(cat.id, item.id, f, v)} onRemove={() => handleRemoveItem(cat.id, item.id)} />)}
                            </AccordionSection>
                        ))}
                        {savingsCategories.length === 0 && <p className="text-xs text-center text-[var(--text-tertiary)] py-2">Tidak ada tujuan tabungan aktif.</p>}
                        </div>
                    </div>
                    {/* PENGELUARAN */}
                     <div>
                        <SectionHeader title="Pengeluaran" color="expense" icon="fa-arrow-up" />
                        <div className="space-y-3">
                        {expenseCategories.map(cat => (
                            <AccordionSection key={cat.id} title={cat.name} isOpen={openAccordions[cat.id]}>
                                {(target[cat.id] || []).map(item => <TargetItem key={item.id} item={item} onChange={(f, v) => handleItemChange(cat.id, item.id, f, v)} onRemove={() => handleRemoveItem(cat.id, item.id)} />)}
                                <button type="button" onClick={() => handleAddItem(cat.id)} className="text-sm font-semibold text-[var(--primary-glow)] hover:text-[var(--text-primary)] mt-2">+ Tambah Item</button>
                            </AccordionSection>
                        ))}
                        </div>
                    </div>

                    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
                        <button type="submit" className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                            Simpan Target
                        </button>
                    </div>
                </form>
            </div>

            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)}>
                <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Buat Target dengan AI</h2>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">Jelaskan kondisi keuangan atau tujuan Anda bulan ini. AI akan membantu membuatkan draf target untuk Anda. Contoh: "Bulan ini saya mau lebih hemat, coba kurangi jajan dan hiburan 20%".</p>
                    <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ketikkan prompt Anda di sini..."
                        className="w-full h-32 p-3 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md text-sm"
                    />
                    <div className="mt-4 flex justify-end gap-3">
                        <button onClick={() => setIsAiModalOpen(false)} className="font-semibold text-[var(--text-secondary)] py-2 px-4 rounded-md">Batal</button>
                        <button onClick={handleGenerateWithAI} disabled={isGenerating || !aiPrompt.trim()} className="font-bold text-white bg-[var(--primary-600)] py-2 px-4 rounded-md disabled:opacity-50">
                            {isGenerating ? 'Memproses...' : 'Buat Target'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AddTargetForm;