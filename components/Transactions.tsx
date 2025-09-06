import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
}

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  const itemClasses = `
    relative flex items-center p-4 bg-gray-800/50 backdrop-blur-sm 
    rounded-xl border border-white/10 overflow-hidden
    border-l-4 ${isIncome ? 'border-l-green-500' : 'border-l-red-500'}
    transition-all duration-300 hover:bg-gray-700/60 hover:shadow-lg
  `;

  return (
    <div className={itemClasses}>
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
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${filter === type ? 'bg-[var(--primary-600)] text-white shadow-md' : 'bg-gray-800/80 backdrop-blur-sm border border-white/10 text-gray-300'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold text-white">Riwayat Transaksi</h1>
      
      <div className="flex space-x-2 p-1 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-full w-full md:w-auto">
        <FilterChip type="all" label="Semua" />
        <FilterChip type="income" label="Pemasukan" />
        <FilterChip type="expense" label="Pengeluaran" />
      </div>

      <div className="space-y-6">
        {Object.keys(groupedAndFilteredTransactions).length > 0 ? (
          Object.entries(groupedAndFilteredTransactions).map(([monthYear, txs]) => (
            <div key={monthYear}>
              <h2 className="text-lg font-bold text-gray-300 py-2 mb-3 border-b-2 border-gray-700">{monthYear}</h2>
              <div className="space-y-3">
                {txs.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
              </div>
            </div>
          ))
        ) : (
            <div className="text-center p-8 mt-4 bg-gray-800/50 rounded-2xl">
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