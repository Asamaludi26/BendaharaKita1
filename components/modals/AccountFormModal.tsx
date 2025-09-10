import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Account } from '../../types';

interface AccountFormModalProps {
    accountToEdit: Account | null;
    onSave: (account: Account) => void;
    onClose: () => void;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({ accountToEdit, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Bank' as 'Bank' | 'E-Wallet',
        balance: '',
    });

    const isEditing = !!accountToEdit;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: accountToEdit.name,
                type: accountToEdit.type,
                balance: String(accountToEdit.balance),
            });
        }
    }, [accountToEdit, isEditing]);

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAccount: Account = {
            id: isEditing ? accountToEdit.id : uuidv4(),
            name: formData.name,
            type: formData.type,
            balance: isEditing ? parseInt(formData.balance) : parseInt(formData.balance || '0'),
        };
        onSave(finalAccount);
    };

    const isFormValid = formData.name.trim() !== '';

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold text-[var(--text-primary)]">{isEditing ? 'Ubah Akun' : 'Tambah Akun Baru'}</h1>
                <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nama Akun</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => handleInputChange('name', e.target.value)} 
                        placeholder="Contoh: Bank BCA" 
                        className="w-full p-3 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]" 
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tipe Akun</label>
                    <div className="relative group">
                        <select 
                            value={formData.type} 
                            onChange={e => handleInputChange('type', e.target.value)} 
                            className="w-full appearance-none p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent hover:border-[var(--border-secondary)] hover:bg-[var(--bg-interactive)] pr-10"
                        >
                            <option value="Bank">Bank</option>
                            <option value="E-Wallet">E-Wallet</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-tertiary)]">
                            <i className="fa-solid fa-chevron-down text-xs transition-transform duration-300 group-focus-within:rotate-180"></i>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Saldo {isEditing ? 'Saat Ini' : 'Awal'}</label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span>
                        <input 
                            type="text" 
                            inputMode="numeric" 
                            value={formData.balance ? parseInt(formData.balance).toLocaleString('id-ID') : ''} 
                            onChange={e => handleInputChange('balance', e.target.value.replace(/[^0-9]/g, ''))} 
                            className="w-full p-3 pl-8 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] text-right" 
                            readOnly={isEditing}
                        />
                    </div>
                    {isEditing && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                            Saldo diperbarui otomatis dari transaksi. Gunakan fitur <strong className="font-semibold text-[var(--text-secondary)]">Isi Saldo</strong> untuk menambah dana, atau <strong className="font-semibold text-[var(--text-secondary)]">Transfer</strong> untuk memindahkan dana.
                        </p>
                    )}
                </div>
                 <div className="pt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-transparent text-[var(--text-secondary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors">
                        Batal
                    </button>
                    <button type="submit" disabled={!isFormValid} className="bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountFormModal;