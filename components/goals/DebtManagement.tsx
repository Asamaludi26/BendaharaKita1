import React from 'react';
import { DebtItem } from '../../types';
import DebtItemCard from './DebtItemCard';

interface DebtManagementProps {
  debts: DebtItem[];
  onSelectDebt: (id: string) => void;
  onAddDebt: () => void;
  onViewHistory: () => void;
}

const DebtManagement: React.FC<DebtManagementProps> = ({ debts, onSelectDebt, onAddDebt, onViewHistory }) => {
  const totalRemainingDebt = debts.reduce((sum, debt) => {
    const paidAmount = debt.payments.reduce((paidSum, p) => paidSum + p.amount, 0);
    const remaining = debt.totalAmount - paidAmount;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
              <i className="fa-solid fa-wallet mr-3 text-xl text-gray-400 dark:text-gray-500"></i>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manajemen Utang</h2>
          </div>
          <div className="flex items-center space-x-2">
              <button
                onClick={onViewHistory}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <i className="fa-solid fa-history"></i>
                <span>Riwayat</span>
              </button>
              <button 
                onClick={onAddDebt} 
                className="flex items-center space-x-2 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Catat Pinjaman</span>
              </button>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Sisa Utang Aktif</p>
          <p className="text-3xl font-bold text-red-500">Rp {totalRemainingDebt.toLocaleString('id-ID')}</p>
        </div>
        <div className="space-y-4">
          {debts.length > 0 ? (
            debts.map(debt => (
              <DebtItemCard key={debt.id} debt={debt} onSelect={onSelectDebt} />
            ))
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <i className="fa-solid fa-shield-check text-4xl text-green-500 mb-3"></i>
                <p className="font-semibold text-gray-700 dark:text-gray-200">Tidak Ada Pinjaman Aktif</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kerja bagus! Anda tidak memiliki utang yang sedang berjalan.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DebtManagement;