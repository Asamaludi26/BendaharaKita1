import React, { useState, useMemo } from 'react';
import type { Account } from '../../types';

interface TransferModalProps {
    accounts: Account[];
    onTransfer: (fromAccountId: string, toAccountId: string, amount: number) => void;
    onClose: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ accounts, onTransfer, onClose }) => {
    const [fromAccountId, setFromAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');
    const [toAccountId, setToAccountId] = useState(accounts.length > 1 ? accounts[1].id : '');
    const [amount, setAmount] = useState('');

    const fromAccount = useMemo(() => accounts.find(a => a.id === fromAccountId), [accounts, fromAccountId]);

    const isFormValid = useMemo(() => {
        const numericAmount = parseInt(amount);
        if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || !numericAmount || numericAmount <= 0) {
            return false;
        }
        const fromAccountBalance = accounts.find(a => a.id === fromAccountId)?.balance || 0;
        return numericAmount <= fromAccountBalance;
    }, [fromAccountId, toAccountId, amount, accounts]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(isFormValid) {
            onTransfer(fromAccountId, toAccountId, parseInt(amount));
        }
    };

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold text-[var(--text-primary)]">Transfer Dana</h1>
                <button onClick={onClose} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times text-lg"></i>
                </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Dari Akun</label>
                    <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="w-full p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]">
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Rp {acc.balance.toLocaleString('id-ID')})</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Ke Akun</label>
                    <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} className="w-full p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)]">
                        {accounts.filter(acc => acc.id !== fromAccountId).map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Jumlah Transfer</label>
                     <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">Rp</span>
                        <input 
                            type="text" 
                            inputMode="numeric" 
                            value={amount ? parseInt(amount).toLocaleString('id-ID') : ''} 
                            onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} 
                            className="w-full p-2 pl-8 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] text-right" 
                        />
                    </div>
                    {fromAccount && parseInt(amount) > fromAccount.balance && (
                        <p className="text-xs text-[var(--color-expense)] mt-1">Jumlah transfer melebihi saldo yang tersedia.</p>
                    )}
                </div>
                 <div className="pt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-transparent text-[var(--text-secondary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors">
                        Batal
                    </button>
                    <button type="submit" disabled={!isFormValid} className="bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                        Transfer
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransferModal;