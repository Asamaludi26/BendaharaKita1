import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
}

const TransactionItem: React.FC<{ transaction: Transaction; style: React.CSSProperties }> = ({ transaction, style }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  const itemClasses = `
    relative p-4 bg-black/20 backdrop-blur-lg border border-white/10 
    rounded-xl shadow-md overflow-hidden group
    transition-all duration-300 hover:border-white/20 hover:bg-black/30 hover:-translate-y-1
  `;
  const indicatorColor = isIncome ? 'var(--color-income)' : 'var(--color-expense)';

  return (
    <div className={itemClasses} style={style}>
      <div 
        className="absolute top-0 left-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: indicatorColor, boxShadow: `0 0 15px 2px ${indicatorColor}` }}
      ></div>
      <div className="flex items-center pl-4">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center mr-4">
              <i className={`fa-solid ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'} text-xl ${isIncome ? 'text-green-400' : 'text-red-400'}`}></i>
        </div>
        <div className="flex-1">
          <p className="font-bold text-white">{transaction.description}</p>
          <p className="text-sm text-gray-400">{transaction.category}</p>
        </div>
        <div className="text-right">
          <p className={`font-bold text-lg ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
            {isIncome ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-gray-400">
            {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </div>
  );
};


const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const groupedAndFilteredTransactions = useMemo(() => {
    const filtered = transactions
      .filter(t => filter === 'all' || t.type === filter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
      const date = new Date(tx.date);
      const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(tx);
      return acc;
    }, {});
    
    return grouped;
  }, [transactions, filter]);
  
  const FilterChip: React.FC<{ type: 'all' | 'income' | 'expense', label: string }> = ({ type, label }) => (
    <button 
        onClick={() => setFilter(type)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${filter === type ? 'bg-[var(--primary-600)] text-white shadow-md' : 'bg-black/20 backdrop-blur-sm border border-white/10 text-gray-300'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Riwayat Transaksi</h1>
      
      <div className="flex space-x-2 p-1 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full w-full md:w-auto">
        <FilterChip type="all" label="Semua" />
        <FilterChip type="income" label="Pemasukan" />
        <FilterChip type="expense" label="Pengeluaran" />
      </div>

      <div className="space-y-6">
        {Object.keys(groupedAndFilteredTransactions).length > 0 ? (
          Object.entries(groupedAndFilteredTransactions).map(([monthYear, txs]) => (
            <div key={monthYear} className="animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-300 py-2 mb-3 border-b-2 border-white/10 sticky top-0 bg-gray-900/30 backdrop-blur-xl z-10">{monthYear}</h2>
              <div className="space-y-3 stagger-children">
                {txs.map((tx, index) => <TransactionItem key={tx.id} transaction={tx} style={{ animationDelay: `${index * 50}ms` }} />)}
              </div>
            </div>
          ))
        ) : (
            <div className="text-center p-8 mt-4 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10">
                <i className="fa-solid fa-folder-open text-4xl text-gray-500 mb-4"></i>
                <p className="font-semibold text-gray-200">Tidak Ada Transaksi</p>
                <p className="text-sm text-gray-400">Tidak ada transaksi yang cocok dengan filter Anda.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;