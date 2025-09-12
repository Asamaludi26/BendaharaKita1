import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    isEditingMode: boolean;
    onChange: (field: 'name' | 'amount', value: string) => void;
    onRemove: () => void;
}> = ({ item, isLocked = false, isEditingMode, onChange, onRemove }) => {
    const isItemLocked = isLocked || item.id.startsWith('goal-');
    
    return (
        <div className="flex items-center space-x-2 py-2">
            <input
                type="text"
                placeholder="Nama item"
                value={item.name}
                onChange={(e) => onChange('name', e.target.value)}
                className={`flex-1 p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-sm min-w-0 ${!isEditingMode || isItemLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                readOnly={!isEditingMode || isItemLocked}
            />
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-[var(--text-tertiary)] text-sm">Rp</span>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={Number(item.amount || '0').toLocaleString('id-ID')}
                    onChange={(e) => onChange('amount', e.target.value.replace(/[^0-9]/g, ''))}
                    className={`w-28 md:w-32 p-2 pl-7 text-right bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-sm ${!isEditingMode || isItemLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                    readOnly={!isEditingMode || isItemLocked}
                />
            </div>
            <button
                type="button"
                onClick={onRemove}
                disabled={!isEditingMode || isItemLocked}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[var(--text-tertiary)] rounded-md hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--color-expense)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <i className="fa-solid fa-trash-can text-sm"></i>
            </button>
        </div>
    );
};

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
    const [isActionBarVisible, setIsActionBarVisible] = useState(true);

    const [isEditingMode, setIsEditingMode] = useState(!initialData);
    const [hasChanges, setHasChanges] = useState(false);
    const [showEditConfirm, setShowEditConfirm] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const initialTargetState = useRef<MonthlyTarget | null>(null);
    
    const lastScrollY = useRef(0);

    useEffect(() => {
        const scrollableContainer = document.querySelector('#root > div');
        if (!scrollableContainer) return;

        const handleScroll = () => {
            const currentScrollY = scrollableContainer.scrollTop;
            
            if (currentScrollY < 50) {
                setIsActionBarVisible(true);
                lastScrollY.current = currentScrollY;
                return;
            }

            if (Math.abs(currentScrollY - lastScrollY.current) < 20) return;

            if (currentScrollY > lastScrollY.current) { // Scrolling down
                setIsActionBarVisible(true);
            } else { // Scrolling up
                setIsActionBarVisible(false);
            }
            lastScrollY.current = currentScrollY;
        };
        
        scrollableContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            scrollableContainer.removeEventListener('scroll', handleScroll);
        };
    }, []);


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
        const autoPopulatedTarget: MonthlyTarget = initialData ? JSON.parse(JSON.stringify(initialData)) : {};

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
        initialTargetState.current = JSON.parse(JSON.stringify(autoPopulatedTarget));
        
        const goalAccordionStates: Record<string, boolean> = {};
        [...debtCategories, ...savingsCategories].forEach(cat => {
            goalAccordionStates[cat.id] = true;
        });
        setOpenAccordions(prev => ({...prev, ...goalAccordionStates}));

    }, [initialData, activeDebts, activeSavingsGoals, debtCategories, savingsCategories]);

    useEffect(() => {
        if (initialTargetState.current) {
            const changes = JSON.stringify(target) !== JSON.stringify(initialTargetState.current);
            setHasChanges(changes);
        } else if (!initialData) {
            const isEmpty = Object.values(target).every(items => items.length === 0);
            setHasChanges(!isEmpty);
        }
    }, [target, initialData]);


    const handleCopyFromLastMonth = () => {
        if (!isEditingMode) return;
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
        if (!isEditingMode || !aiPrompt.trim()) return;
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
        if (!isEditingMode) return;
        const newItem: TargetFormField = { id: uuidv4(), name: '', amount: '' };
        setTarget(prev => ({
            ...prev,
            [categoryId]: [...(prev[categoryId] || []), newItem],
        }));
        setOpenAccordions(prev => ({...prev, [categoryId]: true}));
    };
    
    const handleRemoveItem = (categoryId: string, itemId: string) => {
        if (!isEditingMode) return;
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
    
    const handleMainActionClick = () => {
        if (!isEditingMode) {
            setShowEditConfirm(true);
        } else {
            setShowSaveConfirm(true);
        }
    };

    const confirmEdit = () => {
        setIsEditingMode(true);
        setShowEditConfirm(false);
        initialTargetState.current = JSON.parse(JSON.stringify(target));
    };

    const confirmSave = () => {
        onSave(target);
        setShowSaveConfirm(false);
    };

    const getButtonText = () => {
        if (initialData) {
            return isEditingMode ? 'Simpan Perubahan' : 'Ubah Target';
        }
        return 'Simpan Target';
    };

    const isButtonDisabled = isEditingMode && !hasChanges;

    const Section: React.FC<{
        title: string;
        color: string;
        icon: string;
        categories: UserCategory[];
        isLocked?: boolean;
        noItemsText: string;
        noItemsAction?: () => void;
        noItemsActionText?: string;
    }> = ({ title, color, icon, categories, isLocked, noItemsText, noItemsAction, noItemsActionText }) => (
        <div>
            <div className="flex items-center space-x-3 mb-3 border-b-2 pb-2" style={{borderColor: `var(--color-${color})`}}>
                <i className={`fa-solid ${icon} text-lg`} style={{color: `var(--color-${color})`}}></i>
                <h2 className="text-lg font-semibold" style={{color: `var(--color-${color})`}}>{title}</h2>
            </div>
            <div className="space-y-3">
                {categories.length > 0 ? categories.map(cat => (
                    <AccordionSection 
                        key={cat.id} 
                        title={cat.name} 
                        isOpen={openAccordions[cat.id] || isLocked}
                        headerClassName={isLocked && !isEditingMode ? 'bg-[var(--bg-interactive)]/50' : ''}
                        badge={isLocked ? <i className="fa-solid fa-lock text-xs text-[var(--text-tertiary)]"></i> : undefined}
                    >
                        <div className="divide-y divide-[var(--border-primary)]">
                            {(target[cat.id] || []).map(item => 
                                <TargetItem 
                                    key={item.id} 
                                    item={item} 
                                    isLocked={isLocked} 
                                    isEditingMode={isEditingMode}
                                    onChange={(f, v) => handleItemChange(cat.id, item.id, f, v)} 
                                    onRemove={() => handleRemoveItem(cat.id, item.id)} 
                                />
                            )}
                        </div>
                        {!isLocked && (
                            <button type="button" onClick={() => handleAddItem(cat.id)} disabled={!isEditingMode} className="text-sm font-semibold text-[var(--primary-glow)] hover:text-[var(--text-primary)] mt-2 p-2 -ml-2 rounded-md hover:bg-[var(--bg-interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed">+ Tambah Item</button>
                        )}
                    </AccordionSection>
                )) : (
                    <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg border border-dashed border-[var(--border-primary)]">
                        <p className="text-sm text-[var(--text-tertiary)]">{noItemsText}</p>
                        {noItemsAction && noItemsActionText && (
                            <button type="button" onClick={noItemsAction} disabled={!isEditingMode} className="mt-2 text-sm font-semibold text-[var(--primary-glow)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed">{noItemsActionText}</button>
                        )}
                    </div>
                )}
            </div>
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
                            <p className="text-[var(--text-tertiary)]">{isEditingMode ? 'Rencanakan keuangan Anda.' : 'Mode lihat.'}</p>
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

                <div className="flex flex-col sm:flex-row gap-3">
                     <button onClick={() => setIsAiModalOpen(true)} disabled={!isEditingMode} className="flex-1 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"><i className="fa-solid fa-robot mr-2"></i>Buat dengan AI</button>
                     <button onClick={handleCopyFromLastMonth} disabled={!isEditingMode} className="flex-1 text-sm bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"><i className="fa-solid fa-copy mr-2"></i>Salin Bulan Lalu</button>
                </div>
                
                <div className="space-y-6 pb-48">
                    <Section title="Pendapatan" color="income" icon="fa-arrow-down" categories={incomeCategories} noItemsText="Tidak ada kategori pendapatan aktif." noItemsAction={onManageCategories} noItemsActionText="Kelola Kategori" />
                    <Section title="Hutang" color="debt" icon="fa-file-invoice-dollar" categories={debtCategories} isLocked={true} noItemsText="Tidak ada utang aktif." noItemsAction={onAddDebt} noItemsActionText="Tambah Utang" />
                    <Section title="Tabungan" color="savings" icon="fa-piggy-bank" categories={savingsCategories} isLocked={true} noItemsText="Tidak ada tujuan tabungan aktif." noItemsAction={onAddSavingsGoal} noItemsActionText="Tambah Tujuan Tabungan" />
                    <Section title="Pengeluaran" color="expense" icon="fa-arrow-up" categories={expenseCategories} noItemsText="Tidak ada kategori pengeluaran aktif." noItemsAction={onManageCategories} noItemsActionText="Kelola Kategori" />
                </div>

                <div className={`fixed bottom-28 left-0 right-0 z-20 transition-all duration-500 ease-in-out ${isActionBarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
                    <div className="p-4 bg-[var(--bg-secondary)]/80 backdrop-blur-lg border-t border-[var(--border-primary)]">
                        <div className="max-w-lg mx-auto">
                            <button
                                type="button"
                                onClick={handleMainActionClick}
                                disabled={isButtonDisabled}
                                className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {getButtonText()}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* AI Modal */}
            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)}>
                <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Buat Target dengan AI</h2>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">Jelaskan kondisi keuangan atau tujuan Anda bulan ini. Contoh: "Bulan ini saya mau lebih hemat, coba kurangi jajan dan hiburan 20%".</p>
                    <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ketikkan prompt Anda di sini..." className="w-full h-32 p-3 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md text-sm" />
                    <div className="mt-4 flex justify-end gap-3">
                        <button onClick={() => setIsAiModalOpen(false)} className="font-semibold text-[var(--text-secondary)] py-2 px-4 rounded-md">Batal</button>
                        <button onClick={handleGenerateWithAI} disabled={isGenerating || !aiPrompt.trim()} className="font-bold text-white bg-[var(--primary-600)] py-2 px-4 rounded-md disabled:opacity-50">{isGenerating ? 'Memproses...' : 'Buat Target'}</button>
                    </div>
                </div>
            </Modal>
            
            {/* Edit Confirmation Modal */}
            <Modal isOpen={showEditConfirm} onClose={() => setShowEditConfirm(false)}>
                <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500"><i className="fa-solid fa-pencil-alt text-3xl text-white"></i></div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ubah Target?</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">Anda akan masuk ke mode edit untuk mengubah target bulan ini. Lanjutkan?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowEditConfirm(false)} className="w-full bg-[var(--bg-interactive)] text-[var(--text-secondary)] font-semibold py-2 px-4 rounded-full">Batal</button>
                        <button onClick={confirmEdit} className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-full">Ya, Ubah</button>
                    </div>
                </div>
            </Modal>

            {/* Save Confirmation Modal */}
            <Modal isOpen={showSaveConfirm} onClose={() => setShowSaveConfirm(false)}>
                <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)]"><i className="fa-solid fa-save text-3xl text-white"></i></div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Simpan Target?</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">Apakah Anda yakin ingin menyimpan target untuk bulan ini?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowSaveConfirm(false)} className="w-full bg-[var(--bg-interactive)] text-[var(--text-secondary)] font-semibold py-2 px-4 rounded-full">Batal</button>
                        <button onClick={confirmSave} className="w-full bg-[var(--primary-600)] text-white font-bold py-2 px-4 rounded-full">Ya, Simpan</button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AddTargetForm;