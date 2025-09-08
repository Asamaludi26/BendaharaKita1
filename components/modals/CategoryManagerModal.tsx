import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UserCategory, TransactionType } from '../../types';

interface CategoryManagerModalProps {
    categories: UserCategory[];
    onSave: (category: UserCategory) => void;
    onDelete: (categoryId: string) => void;
    onClose: () => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ categories, onSave, onDelete, onClose }) => {
    const [editingCategory, setEditingCategory] = useState<UserCategory | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<TransactionType>(TransactionType.EXPENSE);
    
    const handleEditClick = (category: UserCategory) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryType(category.type);
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryType(TransactionType.EXPENSE);
    };

    const handleSaveClick = () => {
        if (newCategoryName.trim() === '') return;
        
        if (editingCategory) {
            onSave({ ...editingCategory, name: newCategoryName, type: newCategoryType });
        } else {
            onSave({ id: uuidv4(), name: newCategoryName, type: newCategoryType });
        }
        handleCancelEdit();
    };

    const handleDeleteClick = (id: string) => {
        if(window.confirm('Menghapus kategori ini tidak akan mengubah transaksi yang sudah ada. Lanjutkan?')) {
            onDelete(id);
        }
    }
    
    const renderCategoryList = (type: TransactionType) => {
        return categories
            .filter(c => c.type === type)
            .map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-[var(--bg-interactive)] rounded-lg">
                    <span className="text-[var(--text-secondary)]">{cat.name}</span>
                    <div className="space-x-2">
                        <button onClick={() => handleEditClick(cat)} className="text-[var(--text-tertiary)] hover:text-[var(--primary-glow)] w-6 h-6"><i className="fa-solid fa-pencil"></i></button>
                        <button onClick={() => handleDeleteClick(cat.id)} className="text-[var(--text-tertiary)] hover:text-[var(--color-expense)] w-6 h-6"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            ));
    };

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold text-[var(--text-primary)]">Kelola Kategori</h1>
                <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6">
                <div>
                    <h2 className="font-semibold text-lg text-[var(--text-primary)] mb-2" style={{color: 'var(--color-expense)'}}>Pengeluaran</h2>
                    <div className="space-y-2">{renderCategoryList(TransactionType.EXPENSE)}</div>
                </div>
                 <div>
                    <h2 className="font-semibold text-lg text-[var(--text-primary)] mb-2" style={{color: 'var(--color-income)'}}>Pemasukan</h2>
                    <div className="space-y-2">{renderCategoryList(TransactionType.INCOME)}</div>
                </div>
            </div>

            <div className="space-y-4 border-t border-[var(--border-primary)] pt-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{editingCategory ? 'Ubah Kategori' : 'Tambah Kategori Baru'}</h2>
                <div className="flex items-center justify-center space-x-2 p-1 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-full w-full">
                    <button type="button" onClick={() => setNewCategoryType(TransactionType.EXPENSE)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${newCategoryType === TransactionType.EXPENSE ? 'bg-[var(--color-expense)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>
                        Pengeluaran
                    </button>
                    <button type="button" onClick={() => setNewCategoryType(TransactionType.INCOME)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${newCategoryType === TransactionType.INCOME ? 'bg-[var(--color-income)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>
                        Pemasukan
                    </button>
                </div>
                <input 
                    type="text"
                    placeholder="Nama kategori baru"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]"
                />
                 <div className="flex gap-3">
                    {editingCategory && (
                        <button onClick={handleCancelEdit} className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-2 px-4 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors">
                            Batal
                        </button>
                    )}
                    <button onClick={handleSaveClick} className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-2 px-4 rounded-full shadow-lg disabled:opacity-50" disabled={!newCategoryName.trim()}>
                        {editingCategory ? 'Simpan Perubahan' : 'Tambah'}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default CategoryManagerModal;