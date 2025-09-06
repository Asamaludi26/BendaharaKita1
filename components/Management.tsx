

import React from 'react';
import { View, DebtItem, SavingsGoal } from '../types';
import DebtManagement from './goals/DebtManagement';
import SavingsGoals from './goals/SavingsGoals';

interface ManagementProps {
  setView: (view: View) => void;
  debts: DebtItem[];
  savingsGoals: SavingsGoal[];
  onSelectDebt: (id: string) => void;
  onSelectSavingsGoal: (id: string) => void;
  onAddDebt: () => void;
  onAddSavingsGoal: () => void;
  onViewHistory: () => void;
  onViewSavingsHistory: () => void;
  totalAllTimeSavings: number;
  totalAllTimeDebt: number;
}

const Management: React.FC<ManagementProps> = ({ 
  setView, 
  debts, 
  savingsGoals, 
  onSelectDebt, 
  onSelectSavingsGoal, 
  onAddDebt, 
  onAddSavingsGoal, 
  onViewHistory, 
  onViewSavingsHistory,
  totalAllTimeSavings,
  totalAllTimeDebt
}) => {
  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tujuan Finansial</h1>
      
      {/* All-Time Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500 text-white flex-shrink-0">
                <i className="fa-solid fa-landmark text-xl"></i>
            </div>
            <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Total Aset Tabungan</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">Rp {totalAllTimeSavings.toLocaleString('id-ID')}</p>
            </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 p-4 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-500 text-white flex-shrink-0">
                <i className="fa-solid fa-file-invoice-dollar text-xl"></i>
            </div>
            <div>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Total Riwayat Pinjaman</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">Rp {totalAllTimeDebt.toLocaleString('id-ID')}</p>
            </div>
        </div>
      </div>

      <DebtManagement 
        debts={debts} 
        onSelectDebt={onSelectDebt} 
        onAddDebt={onAddDebt}
        onViewHistory={onViewHistory}
      />
      <SavingsGoals 
        savingsGoals={savingsGoals} 
        onSelectSavingsGoal={onSelectSavingsGoal} 
        onAddSavingsGoal={onAddSavingsGoal}
        onViewHistory={onViewSavingsHistory}
      />
    </div>
  );
};

export default Management;