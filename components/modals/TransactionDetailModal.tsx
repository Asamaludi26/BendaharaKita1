import React from 'react';
import { Transaction, TransactionType } from '../../types';

interface TransactionDetailModalProps {
    transaction: Transaction;
    accountName: string;
    onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: string; icon: string; }> = ({ label, value, icon }) => (
    <div className="flex items-start space-x-4 p-3 bg-[var(--bg-interactive)] rounded-lg">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[var(--text-tertiary)]">
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <div>
            <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
            <p className="font-semibold text-[var(--text-primary)]">{value}</p>
        </div>
    </div>
);


const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, accountName, onClose }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const amountColor = isIncome ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]';
    const amountSign = isIncome ? '+' : '-';
    const formattedDate = new Date(transaction.date).toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <header className="flex items-center justify-center text-center mb-6">
                 <h1 className="text-xl font-bold text-[var(--text-primary)]">Detail Transaksi</h1>
            </header>

            <div className="text-center mb-6">
                <p className={`text-4xl font-bold ${amountColor}`}>
                    {amountSign}Rp {transaction.amount.toLocaleString('id-ID')}
                </p>
                <p className="text-lg text-[var(--text-secondary)] mt-2">{transaction.description}</p>
            </div>
            
            <div className="space-y-3 mb-8">
                <DetailRow label="Tanggal" value={formattedDate} icon="fa-calendar-alt" />
                <DetailRow label="Kategori" value={transaction.category} icon="fa-tags" />
                <DetailRow label="Akun" value={accountName} icon="fa-wallet" />
                <DetailRow label="Tipe" value={isIncome ? 'Pemasukan' : 'Pengeluaran'} icon={isIncome ? 'fa-arrow-down' : 'fa-arrow-up'} />
            </div>

            <div className="pt-4 border-t border-[var(--border-primary)]">
                 <button 
                    type="button" 
                    onClick={onClose} 
                    className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
};

export default TransactionDetailModal;