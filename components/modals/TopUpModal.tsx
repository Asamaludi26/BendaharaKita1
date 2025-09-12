import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Account, Transaction, TransactionType, UserCategory, MonthlyTarget } from '../../types';

interface TopUpModalProps {
    accounts: Account[];
    onSave: (transaction: Transaction) => void;
    onClose: () => void;
    userCategories: UserCategory[];
    currentMonthlyTarget: MonthlyTarget | null;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ accounts, onSave, onClose, userCategories, currentMonthlyTarget }) => {

    const [selectedAccountId, setSelectedAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');

    const incomeCategories = useMemo(() => {
        if (currentMonthlyTarget && currentMonthlyTarget.pendapatan && currentMonthlyTarget.pendapatan.length > 0) {
            return currentMonthlyTarget.pendapatan.map(item => ({ id: item.id, name: item.name, type: TransactionType.INCOME }));
        }
        return userCategories.filter(c => c.type === TransactionType.INCOME);
    }, [userCategories, currentMonthlyTarget]);
    
    const defaultCategory = useMemo(() => {
        const topUpCategory = incomeCategories.find(c => c.name === 'Isi Saldo');
        if (topUpCategory) return topUpCategory.name;
        
        const salaryCategory = incomeCategories.find(c => c.name === 'Gaji');
        if (salaryCategory) return salaryCategory.name;

        return incomeCategories.length > 0 ? incomeCategories[0].name : '';
    }, [incomeCategories]);

    const selectedAccount = useMemo(() => accounts.find(a => a.id === selectedAccountId), [accounts, selectedAccountId]);

    const [formData, setFormData] = useState({
        amount: '',
        description: '', 
        category: defaultCategory,
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (selectedAccount) {
            setFormData(prev => ({
                ...prev,
                description: `Isi Saldo ${selectedAccount.name}`,
                category: defaultCategory
            }));
        }
    }, [selectedAccount, defaultCategory]);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        const finalTransaction: Transaction = {
            id: uuidv4(),
            description: formData.description,
            amount: parseInt(formData.amount),
            type: TransactionType.INCOME,
            category: formData.category,
            date: new Date(formData.date).toISOString(),
            accountId: selectedAccountId,
        };
        onSave(finalTransaction);
    };

    const isFormValid = parseInt(formData.amount || '0') > 0 && formData.category !== '' && selectedAccountId !== '';
    const labelClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-1";
    const inputClasses = "w-full p-3 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]";
    const selectClasses = "w-full appearance-none p-3 pr-10 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-interactive)]";

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-primary)] text-[var(--color-income)] bg-[var(--color-income)]/10 flex-shrink-0">
                        <i className="fa-solid fa-circle-plus text-2xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">Isi Saldo</h1>
                        <p className="text-sm text-[var(--text-tertiary)]">Tambah dana ke akun Anda</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClasses}>Pilih Akun</label>
                    <div className="relative group">
                        <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className={selectClasses}>
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Saldo: Rp {acc.balance.toLocaleString('id-ID')})</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)]"><i className="fa-solid fa-chevron-down text-xs"></i></div>
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Jumlah</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.amount ? parseInt(formData.amount).toLocaleString('id-ID') : ''}
                            onChange={e => handleInputChange('amount', e.target.value.replace(/[^0-9]/g, ''))}
                            className={`${inputClasses} pl-8 text-right text-lg font-semibold`}
                            placeholder="0"
                            autoFocus
                        />
                    </div>
                </div>
                
                <div>
                    <label className={labelClasses}>Deskripsi</label>
                    <input type="text" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} className={inputClasses} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Kategori</label>
                        <div className="relative group">
                            <select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className={selectClasses}>
                                {incomeCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)]"><i className="fa-solid fa-chevron-down text-xs"></i></div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Tanggal</label>
                        <input type="date" value={formData.date} onChange={e => handleInputChange('date', e.target.value)} className={inputClasses} />
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-transparent text-[var(--text-secondary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors">
                        Batal
                    </button>
                    <button type="submit" disabled={!isFormValid} className="bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TopUpModal;