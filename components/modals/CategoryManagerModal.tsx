import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TransactionType } from '../../types';
import type { UserCategory, DebtItem, SavingsGoal } from '../../types';

interface CategoryManagerModalProps {
    categories: UserCategory[];
    onSave: (category: UserCategory) => void;
    onDelete: (categoryId: string) => void;
    onClose: () => void;
    activeDebts: DebtItem[];
    activeSavingsGoals: SavingsGoal[];
}

interface CategoryRowProps {
    category: UserCategory;
    isLocked: boolean;
    onDelete: (id: string) => void;
    onSave: (category: UserCategory) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ category, isLocked, onDelete, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(category.name);

    const handleSaveName = () => {
        if (name.trim() && name !== category.name) {
            onSave({ ...category, name: name.trim() });
        }
        setIsEditing(false);
    };

    const handleToggleActive = () => {
        if (!isLocked) {
            onSave({ ...category, isActive: !category.isActive });
        }
    };

    return (
        <div className={`flex items-center justify-between p-3 bg-[var(--bg-interactive)] rounded-lg transition-opacity ${!category.isActive ? 'opacity-50' : ''}`}>
            {isEditing ? (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="flex-1 p-1 bg-transparent border-b border-[var(--primary-glow)] focus:outline-none"
                    autoFocus
                />
            ) : (
                <span className={`text-sm font-medium ${isLocked ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                    {category.name}
                </span>
            )}
            <div className="flex items-center space-x-2">
                {isLocked ? (
                    <div className="group relative">
                        <i className="fa-solid fa-lock text-sm text-[var(--text-tertiary)]"></i>
                        <span className="absolute bottom-full mb-2 -right-2 w-40 text-xs bg-[var(--bg-primary)] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[var(--border-primary)]">
                            Terkunci karena terhubung dengan Tujuan Finansial.
                        </span>
                    </div>
                ) : isEditing ? (
                    <button onClick={handleSaveName} className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-income)] hover:bg-[var(--bg-success-subtle)]"><i className="fa-solid fa-check"></i></button>
                ) : (
                    <>
                        <button
                            onClick={handleToggleActive}
                            role="switch"
                            aria-checked={category.isActive}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary-glow)] focus:ring-offset-2 focus:ring-offset-[var(--bg-interactive)] ${category.isActive ? 'bg-[var(--primary-glow)]' : 'bg-[var(--bg-interactive-hover)]'}`}
                        >
                            <span
                                aria-hidden="true"
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${category.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                        <button onClick={() => setIsEditing(true)} className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--primary-glow)]"><i className="fa-solid fa-pencil text-xs"></i></button>
                        <button onClick={() => onDelete(category.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--color-expense)]"><i className="fa-solid fa-trash-can text-xs"></i></button>
                    </>
                )}
            </div>
        </div>
    );
};


const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ categories, onSave, onDelete, onClose, activeDebts, activeSavingsGoals }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<TransactionType>(TransactionType.EXPENSE);

    const lockedCategoryNames = useMemo(() => {
        const debtNames = new Set(activeDebts.map(d => d.name));
        const savingsNames = new Set(activeSavingsGoals.map(sg => sg.name));
        const specialNames = new Set(['Saldo Awal', 'Transfer Dana', 'Pencairan Tabungan']);
        return new Set([...debtNames, ...savingsNames, ...specialNames]);
    }, [activeDebts, activeSavingsGoals]);
    
    const { incomeCategories, expenseCategories } = useMemo(() => {
        const income = categories.filter(c => c.type === TransactionType.INCOME);
        const expense = categories.filter(c => c.type === TransactionType.EXPENSE);
        return { incomeCategories: income, expenseCategories: expense };
    }, [categories]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            const newCategory: UserCategory = {
                id: uuidv4(),
                name: newCategoryName.trim(),
                type: newCategoryType,
                isActive: true,
            };
            onSave(newCategory);
            setNewCategoryName('');
        }
    };

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-primary)] text-[var(--primary-glow)] bg-[var(--primary-glow)]/10 flex-shrink-0">
                        <i className="fa-solid fa-cog text-2xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">Kelola Kategori</h1>
                        <p className="text-sm text-[var(--text-tertiary)]">Atur, nonaktifkan, atau hapus kategori.</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Add new category form */}
                <form onSubmit={handleAddCategory} className="p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary)] space-y-3">
                    <h3 className="font-semibold text-[var(--text-primary)]">Tambah Kategori Baru</h3>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            placeholder="Nama kategori"
                            className="flex-1 p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md text-sm"
                        />
                         <div className="flex items-center p-0.5 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md">
                            <button type="button" onClick={() => setNewCategoryType(TransactionType.EXPENSE)} className={`px-2 py-1 rounded text-xs font-semibold ${newCategoryType === TransactionType.EXPENSE ? 'bg-[var(--color-expense)] text-white' : ''}`}>Pengeluaran</button>
                            <button type="button" onClick={() => setNewCategoryType(TransactionType.INCOME)} className={`px-2 py-1 rounded text-xs font-semibold ${newCategoryType === TransactionType.INCOME ? 'bg-[var(--color-income)] text-white' : ''}`}>Pemasukan</button>
                        </div>
                    </div>
                    <button type="submit" disabled={!newCategoryName.trim()} className="w-full text-sm font-bold text-white bg-[var(--primary-600)] py-2 rounded-md disabled:opacity-50">
                        Tambah
                    </button>
                </form>

                {/* Expense Categories */}
                <div>
                    <h3 className="font-semibold text-[var(--color-expense)] mb-2">Kategori Pengeluaran</h3>
                    <div className="space-y-2">
                        {expenseCategories.map(cat => (
                            <CategoryRow
                                key={cat.id}
                                category={cat}
                                isLocked={lockedCategoryNames.has(cat.name)}
                                onDelete={onDelete}
                                onSave={onSave}
                            />
                        ))}
                    </div>
                </div>

                {/* Income Categories */}
                 <div>
                    <h3 className="font-semibold text-[var(--color-income)] mb-2">Kategori Pemasukan</h3>
                    <div className="space-y-2">
                        {incomeCategories.map(cat => (
                            <CategoryRow
                                key={cat.id}
                                category={cat}
                                isLocked={lockedCategoryNames.has(cat.name)}
                                onDelete={onDelete}
                                onSave={onSave}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button onClick={onClose} className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg">
                    Selesai
                </button>
            </div>
        </div>
    );
};

export default CategoryManagerModal;