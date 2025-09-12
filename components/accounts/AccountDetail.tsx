import React from 'react';
import { Account, Transaction, View, TransactionType } from '../../types';

interface AccountDetailProps {
    account: Account;
    transactions: Transaction[];
    setView: (view: View) => void;
}

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const indicatorColor = isIncome ? 'var(--color-income)' : 'var(--color-expense)';

    return (
        <div className="relative rounded-xl p-px bg-gradient-to-b from-white/5 to-transparent">
            <div className="relative p-4 bg-[var(--bg-secondary)] rounded-[11px] overflow-hidden">
                <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: indicatorColor }}
                ></div>
                <div className="flex items-center pl-4">
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-base text-[var(--text-primary)] truncate">{transaction.description}</p>
                        <p className="text-sm text-[var(--text-tertiary)]">{transaction.category}</p>
                    </div>
                    <div className="text-right ml-2">
                        <p className={`font-bold text-lg whitespace-nowrap`} style={{ color: indicatorColor }}>
                            {isIncome ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-[var(--text-tertiary)]">
                            {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AccountDetail: React.FC<AccountDetailProps> = ({ account, transactions, setView }) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const isNegative = account.balance < 0;

    // Conditionally set all visual elements
    const icon = isNegative ? 'fa-triangle-exclamation' : account.type === 'Bank' ? 'fa-building-columns' : 'fa-wallet';
    const color = isNegative ? 'var(--color-warning)' : account.type === 'Bank' ? 'var(--primary-glow)' : 'var(--secondary-glow)';
    
    const heroCardStyle = isNegative ? {
        background: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.5)'
    } : {
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)'
    };
    
    const textColor = isNegative ? 'text-white' : 'text-[var(--text-primary)]';
    const subTextColor = isNegative ? 'text-white/80' : 'text-[var(--text-tertiary)]';


    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in pb-24">
            <header className="flex items-center space-x-4">
                <button onClick={() => setView(View.WALLET)} className="w-10 h-10 rounded-full bg-[var(--bg-interactive)] text-[var(--text-tertiary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                 <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <i className={`fa-solid ${icon}`} style={{ color }}></i>
                        <span>{account.name}</span>
                    </h1>
                    <p className="text-sm text-[var(--text-tertiary)]">Detail Akun</p>
                </div>
            </header>
            
            <div 
                className="border rounded-3xl p-8 md:p-10 text-center relative overflow-hidden transition-all duration-300 cursor-pointer"
                style={heroCardStyle}
            >
                {!isNegative && (
                    <div 
                        className="absolute inset-0 opacity-10"
                        style={{ background: `radial-gradient(circle at 50% 0%, ${color} 0%, transparent 60%)` }}
                    ></div>
                )}
                <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border border-current"
                         style={{ backgroundColor: `${color}1A`, color }}
                    >
                        <i className={`fa-solid ${icon} text-3xl`}></i>
                    </div>
                    
                    <h2 className={`text-xl font-bold ${textColor}`}>{account.name}</h2>
                    <p className={`text-sm uppercase tracking-widest ${subTextColor} mt-4 mb-2`}>Saldo Saat Ini</p>

                    <p className={`text-4xl font-bold tracking-tight ${textColor}`}>
                        Rp {account.balance.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>


            <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Riwayat Transaksi Akun</h3>
                {sortedTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {sortedTransactions.map(tx => (
                            <TransactionItem key={tx.id} transaction={tx} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-[var(--bg-secondary)] rounded-2xl mt-4">
                        <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
                        <p className="font-semibold text-[var(--text-primary)]">Tidak Ada Transaksi</p>
                        <p className="text-sm text-[var(--text-tertiary)]">Belum ada transaksi yang tercatat untuk akun ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountDetail;