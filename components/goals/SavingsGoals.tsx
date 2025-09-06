import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import SavingsGoalItemCard from './SavingsGoalItemCard';

interface SavingsGoalsProps {
  savingsGoals: SavingsGoal[];
  onSelectSavingsGoal: (id: string) => void;
  onAddSavingsGoal: () => void;
  onViewHistory: () => void;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ savingsGoals, onSelectSavingsGoal, onAddSavingsGoal, onViewHistory }) => {
  const [isOpen, setIsOpen] = useState(true);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-lg">
       <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-6 text-left"
          aria-expanded={isOpen}
        >
        <div className="flex items-center">
            <i className="fa-solid fa-piggy-bank mr-3 text-xl text-gray-400 dark:text-gray-500"></i>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Tujuan Tabungan</h2>
        </div>
         <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                >
                    <i className="fa-solid fa-history"></i>
                    <span>Riwayat</span>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onAddSavingsGoal(); }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Tambah Tujuan</span>
                </button>
            </div>
            <i className={`fa-solid fa-chevron-down text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      <div className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}>
        <div className="px-6 pb-6">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tabungan Aktif</p>
            <p className="text-3xl font-bold text-green-500">Rp {totalSaved.toLocaleString('id-ID')}</p>
          </div>
          <div className="space-y-4">
            {savingsGoals.length > 0 ? (
              savingsGoals.map(goal => (
                <SavingsGoalItemCard key={goal.id} goal={goal} onSelect={onSelectSavingsGoal} />
              ))
            ) : (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <i className="fa-solid fa-paper-plane text-4xl text-blue-500 mb-3"></i>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">Tidak Ada Tujuan Aktif</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mulai tabungan untuk tujuan finansial Anda selanjutnya!</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoals;