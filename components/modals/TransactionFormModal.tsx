import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionType, UserCategory, Account, MonthlyTarget } from '../../types';

interface TransactionFormModalProps {
    transactionToEdit: Transaction | null;
    onSave: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
    onClose: () => void;
    userCategories: UserCategory[];
    accounts: Account[];
    forcedType?: TransactionType | null;
    currentMonthlyTarget: MonthlyTarget | null;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
    transactionToEdit,
    onSave,
    onDelete,
    onClose,
    userCategories,
    accounts,
    forcedType,
    currentMonthlyTarget,
}) => {
    const isEditing = useMemo(() => !!transactionToEdit, [transactionToEdit]);

    const getInitialState = () => {
        const initialType = forcedType || TransactionType.EXPENSE;
        const defaultAccount = accounts.length > 0 ? accounts[0].id : '';
        return {
            description: '',
            amount: '',
            type: initialType,
            category: '',
            date: new Date().toISOString().split('T')[0],
            accountId: defaultAccount,
        };
    };

    const [formData, setFormData] = useState(getInitialState());
    
    const availableCategories = useMemo(() => {
        if (currentMonthlyTarget) {
            const targetCategories = new Set<string>();
            if (formData.type === TransactionType.INCOME) {
                (currentMonthlyTarget.pendapatan || []).forEach(item => targetCategories.add(item.name));
            } else { // EXPENSE
                (currentMonthlyTarget.pengeluaranUtama || []).forEach(item => targetCategories.add(item.name));
                (currentMonthlyTarget.kebutuhan || []).forEach(item => targetCategories.add(item.name));
                (currentMonthlyTarget.penunjang || []).forEach(item => targetCategories.add(item.name));
                (currentMonthlyTarget.pendidikan || []).forEach(item => targetCategories.add(item.name));
                (currentMonthlyTarget.cicilanUtang || []).forEach(item => targetCategories.add(item.name));
                (currentMonthlyTarget.tabungan || []).forEach(item => targetCategories.add(item.name));
            }
            if (targetCategories.size === 0) {
                 const fallbackCategory = userCategories.find(c => c.type === formData.type);
                 if (fallbackCategory) targetCategories.add(fallbackCategory.name);
            }
            return Array.from(targetCategories).map(name => ({ id: name, name, type: formData.type as TransactionType }));
        }
        return userCategories.filter(c => c.type === formData.type);
    }, [formData.type, userCategories, currentMonthlyTarget]);

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
             setFormData(getInitialState());
        }
    }, [transactionToEdit, isEditing, forcedType, accounts, userCategories]);

    useEffect(() => {
        if (!isEditing) {
            const firstCategory = availableCategories[0]?.name || '';
            if (formData.category !== firstCategory) {
                 setFormData(prev => ({ ...prev, category: firstCategory }));
            }
        }
    }, [formData.type, availableCategories, isEditing]);

    const handleInputChange = (field: keyof typeof formData, value: string | TransactionType) => {
        if (field === 'type') {
            const newType = value as TransactionType;
            setFormData(prev => ({ ...prev, type: newType, category: '' })); // Reset category on type change
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
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

    const isFormValid = formData.description.trim() !== '' && parseInt(formData.amount) > 0 && formData.category !== '' && formData.accountId !== '';
    const inputClasses = "w-full p-3 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--primary-glow)] focus:border-transparent outline-none text-[var(--text-primary)]";
    const selectClasses = "w-full appearance-none p-3 pr-10 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--primary-glow)] focus:border-transparent outline-none hover:bg-[var(--bg-interactive)]";
    const labelClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-1";


    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold text-[var(--text-primary)]">{isEditing ? 'Ubah Transaksi' : forcedType === TransactionType.EXPENSE ? 'Tambah Pengeluaran' : 'Tambah Transaksi'}</h1>
                <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                 { !forcedType && (
                    <div className="flex items-center justify-center space-x-2 p-1 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-full w-full">
                        <button type="button" onClick={() => handleInputChange('type', TransactionType.EXPENSE)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-[var(--color-expense)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>Pengeluaran</button>
                        <button type="button" onClick={() => handleInputChange('type', TransactionType.INCOME)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${formData.type === TransactionType.INCOME ? 'bg-[var(--color-income)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>Pemasukan</button>
                    </div>
                 )}

                <div>
                    <label className={labelClasses}>Deskripsi</label>
                    <input type="text" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="Contoh: Makan siang" className={inputClasses} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className={labelClasses}>Jumlah</label>
                        <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span><input type="text" inputMode="numeric" value={formData.amount ? parseInt(formData.amount).toLocaleString('id-ID') : ''} onChange={e => handleInputChange('amount', e.target.value.replace(/[^0-9]/g, ''))} className={`${inputClasses} pl-8 text-right`} /></div>
                    </div>
                     <div>
                        <label className={labelClasses}>Tanggal</label>
                        <input type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} className={inputClasses} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Kategori</label>
                        <div className="relative group"><select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className={selectClasses}>{availableCategories.length > 0 ? availableCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>) : <option disabled>Buat target & kategori dulu</option>}</select><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)]"><i className="fa-solid fa-chevron-down text-xs transition-transform duration-300 group-focus-within:rotate-180"></i></div></div>
                    </div>
                     <div>
                        <label className={labelClasses}>Akun</label>
                         <div className="relative group"><select value={formData.accountId} onChange={e => handleInputChange('accountId', e.target.value)} className={selectClasses}>{accounts.length > 0 ? accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>) : <option disabled>Buat akun dulu</option>}</select><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)]"><i className="fa-solid fa-chevron-down text-xs transition-transform duration-300 group-focus-within:rotate-180"></i></div></div>
                    </div>
                </div>
                
                <div className="pt-4 flex items-center justify-between gap-3">
                    {isEditing && (
                        <button type="button" onClick={handleDeleteClick} className="bg-transparent text-[var(--color-expense)] font-bold py-3 px-6 rounded-lg hover:bg-[var(--bg-danger-subtle)] transition-colors">Hapus</button>
                    )}
                    <button type="submit" disabled={!isFormValid} className="w-full bg-[var(--gradient-primary)] text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ml-auto">Simpan</button>
                </div>

            </form>
        </div>
    );
};

export default TransactionFormModal;