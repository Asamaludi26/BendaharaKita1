import React, { useMemo } from 'react';
import { View, Account, Transaction, TransactionType } from '../../types';

interface AccountDetailProps {
  account: Account;
  transactions: Transaction[];
  setView: (view: View) => void;
}

const StatCard: React.FC<{ icon: string; label: string; value: string; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-xl p-4 flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${colorClass}`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <div>
            <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
            <p className="text-md font-bold text-[var(--text-primary)]">{value}</p>
        </div>
    </div>
);

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const amountColor = isIncome ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]';
    const indicatorColor = isIncome ? 'bg-[var(--color-income)]' : 'bg-[var(--color-expense)]';

    return (
        <div className="relative p-4 bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-transparent hover:border-[var(--border-secondary)] transition-colors duration-300">
             <div className={`absolute top-0 left-0 bottom-0 w-1`} style={{ backgroundColor: indicatorColor }}></div>
             <div className="flex items-center space-x-4 pl-3">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-[var(--text-primary)] truncate">{transaction.description}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{transaction.category}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                    <p className={`font-bold text-lg whitespace-nowrap ${amountColor}`}>
                        {isIncome ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-[var(--text-tertiary)]">
                        {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                </div>
            </div>
        </div>
    );
};


const AccountDetail: React.FC<AccountDetailProps> = ({ account, transactions, setView }) => {
    const { totalIncome, totalExpense, transactionCount } = useMemo(() => {
        let income = 0;
        let expense = 0;
        transactions.forEach(tx => {
            if (tx.type === TransactionType.INCOME) {
                income += tx.amount;
            } else {
                expense += tx.amount;
            }
        });
        return {
            totalIncome: income,
            totalExpense: expense,
            transactionCount: transactions.length
        };
    }, [transactions]);

    const iconBgClass = account.type === 'Bank' ? 'bg-sky-500/10 text-sky-400' : 'bg-green-500/10 text-green-400';

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header className="flex items-center space-x-4">
                <button onClick={() => setView(View.WALLET)} className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--text-tertiary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex items-center space-x-4">
                     <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBgClass} border-2 border-current`}>
                        <i className={`fa-solid ${account.type === 'Bank' ? 'fa-building-columns' : 'fa-wallet'} text-2xl`}></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{account.name}</h1>
                        <p className="text-sm text-[var(--text-tertiary)]">{account.type}</p>
                    </div>
                </div>
            </header>

            <div className="relative bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-3xl shadow-2xl p-6 text-center">
                 <p className="text-lg font-semibold text-[var(--text-secondary)]">Saldo Saat Ini</p>
                 <p className="text-5xl font-bold text-[var(--text-primary)] my-2">
                    Rp {account.balance.toLocaleString('id-ID')}
                 </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon="fa-arrow-down" label="Total Pemasukan" value={`Rp ${totalIncome.toLocaleString('id-ID')}`} colorClass="bg-green-500/10 text-green-400" />
                <StatCard icon="fa-arrow-up" label="Total Pengeluaran" value={`Rp ${totalExpense.toLocaleString('id-ID')}`} colorClass="bg-red-500/10 text-red-400" />
                <StatCard icon="fa-receipt" label="Jumlah Transaksi" value={`${transactionCount}`} colorClass="bg-purple-500/10 text-purple-400" />
            </div>

            <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Riwayat Transaksi Akun</h3>
                {transactions.length > 0 ? (
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                        {transactions.map(tx => (
                            <TransactionRow key={tx.id} transaction={tx} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl">
                        <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
                        <h4 className="font-semibold text-[var(--text-primary)]">Tidak Ada Transaksi</h4>
                        <p className="text-sm text-[var(--text-tertiary)]">Belum ada riwayat transaksi untuk akun ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountDetail;