import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionType, UserCategory, Account } from '../../types';

interface TransactionFormModalProps {
    transactionToEdit: Transaction | null;
    onSave: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
    onClose: () => void;
    userCategories: UserCategory[];
    accounts: Account[];
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
    transactionToEdit,
    onSave,
    onDelete,
    onClose,
    userCategories,
    accounts,
}) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: TransactionType.EXPENSE,
        category: '',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        accountId: '',
    });

    const isEditing = useMemo(() => !!transactionToEdit, [transactionToEdit]);

    useEffect(() => {
        if (isEditing && transactionToEdit) {
            setFormData({
                description: transactionToEdit.description,
                amount: String(transactionToEdit.amount),
                type: transactionToEdit.type,
                category: transactionToEdit.category,
                date: new Date(transactionToEdit.date).toISOString().split('T')[0],
                accountId: transactionToEdit.accountId,
            });
        } else {
            // Reset for new transaction
             const defaultCategory = userCategories.find(c => c.type === TransactionType.EXPENSE)?.name || '';
             const defaultAccount = accounts.length > 0 ? accounts[0].id : '';
             setFormData({
                description: '',
                amount: '',
                type: TransactionType.EXPENSE,
                category: defaultCategory,
                date: new Date().toISOString().split('T')[0],
                accountId: defaultAccount,
             });
        }
    }, [transactionToEdit, isEditing, userCategories, accounts]);
    
    const handleInputChange = (field: keyof typeof formData, value: string | TransactionType) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // If type changes, reset category to the first available for that type
        if (field === 'type') {
             const defaultCategory = userCategories.find(c => c.type === value)?.name || '';
             setFormData(prev => ({...prev, category: defaultCategory}));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalTransaction: Transaction = {
            id: isEditing ? transactionToEdit!.id : uuidv4(),
            description: formData.description,
            amount: parseInt(formData.amount),
            type: formData.type,
            category: formData.category,
            date: new Date(formData.date).toISOString(),
            accountId: formData.accountId,
        };
        onSave(finalTransaction);
    };
    
    const handleDeleteClick = () => {
        if (isEditing && window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            onDelete(transactionToEdit!.id);
        }
    };
    
    const availableCategories = useMemo(() => {
        return userCategories.filter(c => c.type === formData.type);
    }, [formData.type, userCategories]);

    const isFormValid = formData.description.trim() !== '' && parseInt(formData.amount) > 0 && formData.category !== '' && formData.accountId !== '';

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold text-[var(--text-primary)]">{isEditing ? 'Ubah Transaksi' : 'Tambah Transaksi'}</h1>
                <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Transaction Type Toggle */}
                 <div className="flex items-center justify-center space-x-2 p-1 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-full w-full">
                    <button type="button" onClick={() => handleInputChange('type', TransactionType.EXPENSE)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-[var(--color-expense)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>
                        Pengeluaran
                    </button>
                    <button type="button" onClick={() => handleInputChange('type', TransactionType.INCOME)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${formData.type === TransactionType.INCOME ? 'bg-[var(--color-income)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>
                        Pemasukan
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Deskripsi</label>
                    <input type="text" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="Contoh: Makan siang" className="w-full p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Jumlah</label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span>
                            <input type="text" inputMode="numeric" value={formData.amount ? parseInt(formData.amount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('amount', e.target.value.replace(/[^0-9]/g, ''))} className="w-full p-2 pl-8 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] text-right" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tanggal</label>
                        <input type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} className="w-full p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Kategori</label>
                        <select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className="w-full p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]">
                            {availableCategories.length > 0 ? availableCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>) : <option disabled>Buat kategori dulu</option>}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Akun</label>
                        <select value={formData.accountId} onChange={e => handleInputChange('accountId', e.target.value)} className="w-full p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]">
                            {accounts.length > 0 ? accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>) : <option disabled>Buat akun dulu</option>}
                        </select>
                    </div>
                </div>
                
                <div className="pt-4 flex items-center justify-between gap-3">
                    {isEditing && (
                        <button type="button" onClick={handleDeleteClick} className="bg-transparent text-[var(--color-expense)] font-bold py-3 px-6 rounded-full hover:bg-[var(--bg-danger-subtle)] transition-colors">
                            Hapus
                        </button>
                    )}
                    <button type="submit" disabled={!isFormValid} className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                        Simpan
                    </button>
                </div>

            </form>
        </div>
    );
};

export default TransactionFormModal;