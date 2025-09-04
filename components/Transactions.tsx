import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { ExpenseIcon, IncomeIcon } from './icons';

interface TransactionsProps {
  transactions: Transaction[];
}

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  return (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isIncome ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
        {isIncome ? <IncomeIcon className="w-6 h-6 text-green-500" /> : <ExpenseIcon className="w-6 h-6 text-red-500" />}
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800 dark:text-white">{transaction.description}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
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
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Riwayat Transaksi</h1>
      
      <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-900 rounded-full w-full md:w-auto">
        <FilterChip type="all" label="Semua" />
        <FilterChip type="income" label="Pemasukan" />
        <FilterChip type="expense" label="Pengeluaran" />
      </div>

      <div className="space-y-6">
        {Object.keys(groupedAndFilteredTransactions).length > 0 ? (
          Object.entries(groupedAndFilteredTransactions).map(([monthYear, txs]) => (
            <div key={monthYear}>
              <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 py-2 mb-3 border-b-2 border-gray-200 dark:border-gray-700">{monthYear}</h2>
              <div className="space-y-3">
                {txs.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
              </div>
            </div>
          ))
        ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 pt-8">Tidak ada transaksi yang cocok dengan filter Anda.</p>
        )}
      </div>
    </div>
  );
};

export default Transactions;