import React, { useMemo, useState } from 'react';
import type { Account } from '../../types';
import Modal from '../Modal';

interface AccountsProps {
  accounts: Account[];
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onTransfer: () => void;
  onReset: () => void;
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

const Accounts: React.FC<AccountsProps> = ({ accounts, onAddAccount, onEditAccount, onDeleteAccount, onTransfer, onReset }) => {
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
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dompet Saya</h1>
                        <p className="text-[var(--text-tertiary)]">Lihat dan kelola semua dompet, bank, & e-wallet Anda.</p>
                    </div>
                     <button 
                        onClick={() => setIsResetModalOpen(true)}
                        className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--text-tertiary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]"
                        aria-label="Atur Ulang Data Dompet"
                        title="Atur Ulang Data Dompet"
                      >
                        <i className="fa-solid fa-gear"></i>
                      </button>
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
                        <button
                            onClick={onAddAccount}
                            className="w-full text-center py-10 px-4 mt-4 border-2 border-dashed border-[var(--border-secondary)] rounded-xl hover:bg-[var(--bg-interactive-hover)] hover:border-[var(--primary-glow)] transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 mx-auto bg-[var(--bg-interactive)] rounded-full flex items-center justify-center mb-4 group-hover:bg-[var(--primary-glow)]/20 transition-colors duration-300 border border-[var(--border-primary)]">
                                <i className="fa-solid fa-plus text-3xl text-[var(--text-tertiary)] group-hover:text-[var(--primary-glow)] transition-colors duration-300"></i>
                            </div>
                            <p className="font-bold text-lg text-[var(--text-secondary)] group-hover:text-[var(--primary-glow)] transition-colors duration-300">Tambah Dompet Pertamamu</p>
                            <p className="text-sm text-[var(--text-tertiary)]">Klik di sini untuk menambahkan akun bank atau e-wallet.</p>
                        </button>
                    )}
                </div>
            </div>
             <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
                <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-6 pt-16">
                  <button 
                      onClick={() => setIsResetModalOpen(false)} 
                      className="absolute top-4 right-4 w-10 h-10 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors z-10"
                      aria-label="Close modal"
                  >
                      <i className="fa-solid fa-times text-xl"></i>
                  </button>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-lg shadow-red-500/40">
                      <i className="fa-solid fa-triangle-exclamation text-5xl text-white"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Atur Ulang Dompet?</h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                      Tindakan ini akan <strong>menghapus semua data dompet & transaksi</strong> Anda. Anda akan dipandu untuk memasukkannya kembali.
                  </p>
                  <div className="flex flex-col gap-3">
                      <button type="button" onClick={handleConfirmReset} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700">Ya, Atur Ulang</button>
                      <button type="button" onClick={() => setIsResetModalOpen(false)} className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)]">Batal</button>
                  </div>
                </div>
              </Modal>
        </>
    );
};

export default Accounts;