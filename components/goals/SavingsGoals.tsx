import React, { useState } from 'react';
import { View, SavingsGoal, SavingsGoalCategory } from '../../types';

interface SavingsGoalCardProps {
    goal: SavingsGoal;
    onClick: () => void;
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({ goal, onClick }) => {
    const progress = (goal.savedAmount / goal.targetAmount) * 100;
    return (
        <button onClick={onClick} className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 space-y-2 text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <i className={`fa-solid fa-${goal.icon} text-green-500`}></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{goal.name}</h3>
                        <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">{goal.category}</span>
                    </div>
                </div>
            </div>
            <div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                    <span>Rp {goal.savedAmount.toLocaleString('id-ID')}</span>
                    <span>Rp {goal.targetAmount.toLocaleString('id-ID')}</span>
                </div>
            </div>
        </button>
    );
};


interface SavingsGoalsProps {
  goals: SavingsGoal[];
  setView: (view: View, item?: SavingsGoal) => void;
  onAdd: () => void;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals, setView, onAdd }) => {
  const [filter, setFilter] = useState<'all' | SavingsGoalCategory>('all');
  
  const filteredGoals = goals.filter(g => filter === 'all' || g.category === filter);

  const FilterChip: React.FC<{ value: 'all' | SavingsGoalCategory, label: string }> = ({ value, label }) => (
    <button
        onClick={() => setFilter(value)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === value ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
    >
        {label}
    </button>
  );
  
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(View.MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Tujuan Tabungan</h1>
      </div>

      <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-900 rounded-full">
        <FilterChip value="all" label="Semua" />
        <FilterChip value="Jangka Pendek" label="Jangka Pendek" />
        <FilterChip value="Jangka Panjang" label="Jangka Panjang" />
        <FilterChip value="Dana Darurat" label="Dana Darurat" />
      </div>

      <div className="space-y-4 pb-20">
        {filteredGoals.map(goal => (
           <SavingsGoalCard key={goal.id} goal={goal} onClick={() => setView(View.SAVINGS_GOAL_DETAIL, goal)} />
        ))}
        {filteredGoals.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 pt-8">Tidak ada data tujuan untuk kategori ini.</p>}
      </div>

      <button onClick={onAdd} className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-light shadow-lg transform hover:scale-110 transition-transform duration-300">
        +
      </button>
    </div>
  );
};

export default SavingsGoals;