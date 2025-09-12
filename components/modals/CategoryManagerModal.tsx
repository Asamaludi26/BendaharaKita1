import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UserCategory, TransactionType, DebtItem, SavingsGoal } from '../../types';

interface CategoryManagerModalProps {
    categories: UserCategory[];
    onSave: (category: UserCategory) => void;
    onDelete: (categoryId: string) => void;
    onClose: () => void;
    activeDebts: DebtItem[];
    activeSavingsGoals: SavingsGoal[];
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ categories, onSave, onDelete, onClose, activeDebts, activeSavingsGoals }) => {
    const [editingCategory, setEditingCategory] = useState<Partial<UserCategory> | null>(null);

    const usedCategoryNames = useMemo(() => {
        const debtNames = new Set(activeDebts.map(d => d.name));
        const savingsNames = new Set(activeSavingsGoals.map(s => s.name));
        return new Set([...debtNames, ...savingsNames]);
    }, [activeDebts, activeSavingsGoals]);

    const handleStartAdd = (type: TransactionType) => {
        setEditingCategory({ id: uuidv4(), name: '', type, isActive: true });
    };

    const handleSave = () => {
        if (editingCategory && editingCategory.name) {
            onSave(editingCategory as UserCategory);
            setEditingCategory(null);
        }
    };

    const handleDelete = (categoryId: string) => {
        if (window.confirm('Yakin ingin menghapus kategori ini?')) {
            onDelete(categoryId);
        }
    };
    
    const renderCategoryList = (type: TransactionType) => {
        const filteredCategories = categories.filter(c => c.type === type && !usedCategoryNames.has(c.name));
        
        return (
            <div className="space-y-2">
                {filteredCategories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 bg-[var(--bg-interactive)] rounded-md">
                        <span className="font-medium text-[var(--text-secondary)]">{cat.name}</span>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => setEditingCategory(cat)} className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--primary-glow)]"><i className="fa-solid fa-pencil text-sm"></i></button>
                             <button onClick={() => handleDelete(cat.id)} className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--color-expense)]"><i className="fa-solid fa-trash-can text-sm"></i></button>
                        </div>
                    </div>
                ))}
                <button onClick={() => handleStartAdd(type)} className="w-full text-left text-sm font-semibold text-[var(--primary-glow)] p-2 rounded-md hover:bg-[var(--bg-interactive-hover)] transition-colors">
                    + Tambah Kategori
                </button>
            </div>
        )
    };

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold text-[var(--text-primary)]">Kelola Kategori</h1>
                <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            {editingCategory ? (
                <div className="space-y-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-primary)]">
                    <h2 className="font-semibold text-lg text-[var(--text-primary)]">{editingCategory.id ? 'Ubah Kategori' : 'Kategori Baru'}</h2>
                    <div>
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Nama Kategori</label>
                        <input
                            type="text"
                            value={editingCategory.name || ''}
                            onChange={(e) => setEditingCategory(prev => ({...prev, name: e.target.value}))}
                            className="w-full p-2 mt-1 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md"
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isActive" checked={editingCategory.isActive} onChange={e => setEditingCategory(prev => ({...prev, isActive: e.target.checked}))} />
                        <label htmlFor="isActive" className="text-sm text-[var(--text-secondary)]">Aktif</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setEditingCategory(null)} className="font-semibold text-[var(--text-secondary)] py-2 px-4 rounded-md hover:bg-[var(--bg-interactive)]">Batal</button>
                        <button onClick={handleSave} className="font-bold text-white bg-[var(--primary-600)] py-2 px-4 rounded-md">Simpan</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--color-income)] mb-2">Pemasukan</h2>
                        {renderCategoryList(TransactionType.INCOME)}
                    </div>
                     <div>
                        <h2 className="text-lg font-semibold text-[var(--color-expense)] mb-2">Pengeluaran</h2>
                        {renderCategoryList(TransactionType.EXPENSE)}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-tertiary)] mb-2">Kategori Terkunci</h2>
                        <p className="text-xs text-[var(--text-tertiary)] mb-2">Kategori ini terkait dengan Goals aktif dan tidak dapat diubah atau dihapus.</p>
                        <div className="space-y-2">
                            {[...activeDebts, ...activeSavingsGoals].map(goal => (
                                <div key={goal.id} className="flex items-center space-x-2 p-2 bg-[var(--bg-interactive)] rounded-md text-[var(--text-tertiary)]">
                                    <i className="fa-solid fa-lock text-xs"></i>
                                    <span className="text-sm font-medium">{goal.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagerModal;
