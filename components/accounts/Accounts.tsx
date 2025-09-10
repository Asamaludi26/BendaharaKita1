import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { Account } from '../../types';
import Modal from '../Modal';

interface AccountsProps {
  accounts: Account[];
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onTransfer: () => void;
  onReset: () => void;
  onSelectAccount: (accountId: string) => void;
  onInitiateTopUp: () => void;
  onInitiateWithdrawSavings: () => void;
}

// A helper function to render highlighted text
const renderContentWithHighlight = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="font-bold text-[var(--primary-glow)]">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
};


// A new, more prominent card for the total balance and primary actions.
const TotalBalanceCard: React.FC<{ totalNetWorth: number; onAddAccount: () => void; onTransfer: () => void; onTopUp: () => void; onWithdrawSavings: () => void; }> = ({ totalNetWorth, onAddAccount, onTransfer, onTopUp, onWithdrawSavings }) => (
    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[var(--primary-glow)]/20 via-transparent to-transparent"></div>
        <div className="relative z-10">
            <p className="text-lg font-semibold text-[var(--text-secondary)]">Total Saldo Gabungan</p>
            <p className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mt-2" style={{ filter: 'drop-shadow(0 0 10px var(--bg-primary))' }}>
                Rp {totalNetWorth.toLocaleString('id-ID')}
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <button 
                    onClick={onAddAccount} 
                    className="flex items-center justify-center space-x-3 p-4 bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <i className="fa-solid fa-plus-circle text-xl"></i>
                    <span className="font-bold">Tambah Akun</span>
                </button>
                 <button 
                    onClick={onTransfer} 
                    className="flex items-center justify-center space-x-3 p-4 bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors"
                 >
                    <i className="fa-solid fa-right-left text-xl"></i>
                    <span className="font-semibold">Transfer</span>
                </button>
                <button 
                    onClick={onWithdrawSavings} 
                    className="flex items-center justify-center space-x-3 p-4 bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <i className="fa-solid fa-vault text-xl"></i>
                    <span className="font-semibold">Ambil Tabungan</span>
                </button>
                <button 
                    onClick={onTopUp} 
                    className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-[var(--primary-glow)]/30 transform hover:scale-105 transition-all"
                >
                    <i className="fa-solid fa-arrow-up-from-bracket text-xl"></i>
                    <span className="font-bold">Isi Saldo</span>
                </button>
            </div>
        </div>
    </div>
);


// Redesigned AccountCard with an interactive options menu.
const AccountCard: React.FC<{ account: Account; onEdit: () => void; onDelete: () => void; onSelect: () => void; }> = ({ account, onEdit, onDelete, onSelect }) => {
    const isPositive = account.balance >= 0;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const iconBgClass = account.type === 'Bank' 
        ? 'bg-sky-500/10 text-sky-400'
        : 'bg-green-500/10 text-green-400';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <div
            className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl group transition-all duration-300 hover:border-[var(--border-secondary)] hover:-translate-y-1 hover:shadow-2xl"
            style={{ zIndex: isMenuOpen ? 20 : 'auto' }}
        >
            <div className="flex justify-between items-center p-5">
                {/* Main clickable area for details */}
                <div className="flex-grow flex items-center space-x-4 cursor-pointer" onClick={onSelect}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass} border border-current`}>
                        <i className={`fa-solid ${account.type === 'Bank' ? 'fa-building-columns' : 'fa-wallet'} text-xl`}></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">{account.name}</h3>
                        <p className="text-sm text-[var(--text-tertiary)]">{account.type}</p>
                    </div>
                </div>

                {/* Balance and Actions Area */}
                <div className="flex items-center space-x-3 ml-2">
                    <p className={`text-lg sm:text-xl font-bold ${isPositive ? 'text-[var(--text-primary)]' : 'text-[var(--color-expense)]'}`}>
                        Rp {account.balance.toLocaleString('id-ID')}
                    </p>

                    {/* Kebab Menu for other actions */}
                    <div className="relative" ref={menuRef}>
                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }} className="w-8 h-8 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] transition-colors">
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <div
                            className={`absolute top-full right-0 mt-2 w-36 bg-[var(--bg-interactive)] border border-[var(--border-secondary)] rounded-lg shadow-2xl z-30 py-1 origin-top-right transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                        >
                            <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors flex items-center space-x-2">
                                <i className="fa-solid fa-pencil w-4 text-center"></i>
                                <span>Edit</span>
                            </button>
                            <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-[var(--color-warning)] hover:bg-[var(--bg-interactive-hover)] transition-colors flex items-center space-x-2">
                                <i className="fa-solid fa-trash-can w-4 text-center"></i>
                                <span>Hapus</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Accounts: React.FC<AccountsProps> = ({ accounts, onAddAccount, onEditAccount, onDeleteAccount, onTransfer, onReset, onSelectAccount, onInitiateTopUp, onInitiateWithdrawSavings }) => {
    const totalNetWorth = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleDelete = (accountId: string) => {
        if (window.confirm('Apakah Anda yakin? Menghapus akun hanya bisa dilakukan jika tidak ada transaksi yang terkait.')) {
            onDeleteAccount(accountId);
        }
    };

    const handleConfirmReset = () => {
        onReset();
        setIsResetModalOpen(false);
    };
    
    return (
        <>
            <div className="p-4 md:p-6 space-y-6 animate-fade-in">
                <header className="flex justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Dompet Saya</h1>
                    <button 
                        onClick={() => setIsResetModalOpen(true)}
                        className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--text-tertiary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]"
                        aria-label="Atur Ulang Data Dompet"
                        title="Atur Ulang Data Dompet"
                    >
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </header>

                <TotalBalanceCard 
                    totalNetWorth={totalNetWorth} 
                    onAddAccount={onAddAccount} 
                    onTransfer={onTransfer} 
                    onTopUp={onInitiateTopUp}
                    onWithdrawSavings={onInitiateWithdrawSavings}
                />

                {accounts.length > 0 ? (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] pt-4">Daftar Akun</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {accounts.map(account => (
                                <AccountCard
                                    key={account.id}
                                    account={account}
                                    onEdit={() => onEditAccount(account)}
                                    onDelete={() => handleDelete(account.id)}
                                    onSelect={() => onSelectAccount(account.id)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[var(--primary-glow)]/20">
                            <i className="fa-solid fa-piggy-bank text-5xl text-white"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">Mulai Lacak Keuangan Anda</h3>
                        <p className="text-[var(--text-tertiary)] max-w-sm mx-auto mt-2 mb-6">Tambahkan akun bank atau e-wallet pertama Anda untuk mulai mencatat semua transaksi dan melihat gambaran finansial Anda.</p>
                        <button 
                            onClick={onAddAccount} 
                            className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                            Tambah Akun Pertama
                        </button>
                    </div>
                )}
            </div>

            <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
                <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-6">
                    <button onClick={() => setIsResetModalOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors z-10" aria-label="Close modal"><i className="fa-solid fa-times text-xl"></i></button>
                    
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-lg shadow-red-500/40 mb-4">
                        <i className="fa-solid fa-triangle-exclamation text-3xl text-white"></i>
                    </div>

                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Atur Ulang Data Dompet?</h3>
                    <p className="text-[var(--text-secondary)] mb-6">
                        {renderContentWithHighlight("Tindakan ini akan **menghapus semua akun dan transaksi** yang telah Anda catat. Anda akan dipandu untuk memasukkannya kembali.")}
                        <br/><br/>
                        <span className="font-semibold text-[var(--text-tertiary)]">Data Goals (Utang & Tabungan) tidak akan terpengaruh.</span>
                    </p>
                    <div className="flex flex-col gap-3">
                        <button type="button" onClick={handleConfirmReset} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg">Ya, Atur Ulang</button>
                        <button type="button" onClick={() => setIsResetModalOpen(false)} className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)]">Batal</button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Accounts;