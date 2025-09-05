import React from 'react';
import { View, DebtItem, SavingsGoal } from '../types';

interface ManagementProps {
  setView: (view: View, item?: DebtItem | SavingsGoal) => void;
}

const Management: React.FC<ManagementProps> = ({ setView }) => {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Goals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setView(View.SAVINGS_GOALS)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-left hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-piggy-bank text-green-500 text-2xl"></i>
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800 dark:text-white">Tujuan Tabungan</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Lacak progres tujuan finansial Anda.</p>
          </div>
        </button>
        <button onClick={() => setView(View.DEBT_MANAGEMENT)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-left hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-credit-card text-red-500 text-2xl"></i>
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800 dark:text-white">Manajemen Utang</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Kelola dan lunasi utang Anda.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Management;