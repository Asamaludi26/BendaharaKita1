import React, { useMemo } from 'react';
import type { Account } from '../../types';

interface AccountsProps {
  accounts: Account[];
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onTransfer: () => void;
}

const AccountCard: React.FC<{ account: Account; onEdit: () => void; onDelete: () => void; }> = ({ account, onEdit, onDelete }) => {
    const isPositive = account.balance >= 0;
    const gradient = account.type === 'Bank' 
        ? 'from-sky-500 to-indigo-500'
        : 'from-green-400 to-emerald-500';

    return (
        <div className="relative bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl shadow-lg p-5 group transition-all duration-300 hover:border-[var(--border-secondary)] hover:-translate-y-1">
            <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${gradient} rounded-t-2xl`}></div>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-2">
                        <i className={`fa-solid ${account.type === 'Bank' ? 'fa-building-columns' : 'fa-wallet'} text-[var(--text-tertiary)]`}></i>
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">{account.name}</h3>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">{account.type}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                    <button onClick={onEdit} className="w-8 h-8 rounded-full bg-[var(--bg-interactive-hover)] text-[var(--text-tertiary)] hover:text-[var(--primary-glow)]"><i className="fa-solid fa-pencil"></i></button>
                    <button onClick={onDelete} className="w-8 h-8 rounded-full bg-[var(--bg-interactive-hover)] text-[var(--text-tertiary)] hover:text-[var(--color-expense)]"><i className="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
            <div className="mt-4 text-right">
                <p className="text-sm text-[var(--text-tertiary)]">Saldo Saat Ini</p>
                <p className={`text-3xl font-bold ${isPositive ? 'text-[var(--text-primary)]' : 'text-[var(--color-expense)]'}`}>
                    Rp {account.balance.toLocaleString('id-ID')}
                </p>
            </div>
        </div>
    );
};

const Accounts: React.FC<AccountsProps> = ({ accounts, onAddAccount, onEditAccount, onDeleteAccount, onTransfer }) => {
    const totalNetWorth = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

    const handleDelete = (accountId: string) => {
        if (window.confirm('Apakah Anda yakin? Menghapus akun hanya bisa dilakukan jika tidak ada transaksi yang terkait.')) {
            onDeleteAccount(accountId);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dompet Saya</h1>
                <p className="text-[var(--text-tertiary)]">Lihat dan kelola semua dompet, bank, & e-wallet Anda.</p>
            </header>

            {/* Net Worth Summary */}
            <div className="relative p-6 rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-[var(--primary-600)] to-[var(--secondary-600)]">
                <p className="text-white/80 font-semibold">Total Kekayaan Bersih</p>
                <p className="text-4xl font-bold text-white mt-1">Rp {totalNetWorth.toLocaleString('id-ID')}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button onClick={onAddAccount} className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-xl hover:bg-[var(--bg-interactive-hover)] hover:border-[var(--primary-glow)] transition-all duration-300">
                    <i className="fa-solid fa-plus-circle text-2xl text-[var(--primary-glow)] mb-2"></i>
                    <span className="font-semibold text-sm text-[var(--text-secondary)]">Tambah Akun</span>
                </button>
                 <button onClick={onTransfer} className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-xl hover:bg-[var(--bg-interactive-hover)] hover:border-[var(--secondary-glow)] transition-all duration-300">
                    <i className="fa-solid fa-right-left text-2xl text-[var(--secondary-glow)] mb-2"></i>
                    <span className="font-semibold text-sm text-[var(--text-secondary)]">Transfer Dana</span>
                </button>
            </div>

            {/* Account List */}
            <div className="space-y-4 pb-24">
                {accounts.length > 0 ? (
                    accounts.map(acc => (
                        <AccountCard 
                            key={acc.id} 
                            account={acc} 
                            onEdit={() => onEditAccount(acc)} 
                            onDelete={() => handleDelete(acc.id)} 
                        />
                    ))
                ) : (
                    <div className="text-center p-8 mt-4 bg-[var(--bg-secondary)] rounded-2xl border-2 border-dashed border-[var(--border-secondary)]">
                        <i className="fa-solid fa-landmark text-4xl text-[var(--text-tertiary)] mb-4"></i>
                        <p className="font-semibold text-[var(--text-primary)]">Belum Ada Akun</p>
                        <p className="text-sm text-[var(--text-tertiary)]">Mulai dengan menambahkan akun bank atau dompet digital pertama Anda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Accounts;