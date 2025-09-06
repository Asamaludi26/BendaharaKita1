
import React from 'react';
import { View, SavingsGoal } from '../../types';

interface SavingsGoalDetailProps {
  goal: SavingsGoal;
  setView: (view: View) => void;
}

const SavingsGoalDetail: React.FC<SavingsGoalDetailProps> = ({ goal, setView }) => {
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(View.MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{goal.name}</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Dana Terkumpul</p>
          <p className="text-4xl font-bold text-green-500">Rp {goal.currentAmount.toLocaleString('id-ID')}</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div className="bg-green-500 h-4 rounded-full text-center text-white text-xs font-bold" style={{ width: `${progress}%` }}>
            {progress.toFixed(1)}%
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <p>Kurang: Rp {remainingAmount.toLocaleString('id-ID')}</p>
          <p>Target: Rp {goal.targetAmount.toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold mb-3">Informasi</h2>
        <p>Tenggat Waktu: {new Date(goal.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        {/* Add more details or history here */}
      </div>
    </div>
  );
};

export default SavingsGoalDetail;
