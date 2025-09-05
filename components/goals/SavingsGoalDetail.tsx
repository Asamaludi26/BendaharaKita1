import React from 'react';
import { View, SavingsGoal } from '../../types';

interface SavingsGoalDetailProps {
    goal: SavingsGoal;
    setView: (view: View) => void;
    onEdit: (goal: SavingsGoal) => void;
    onDelete: (id: string) => void;
}

const SavingsGoalDetail: React.FC<SavingsGoalDetailProps> = ({ goal, setView, onEdit, onDelete }) => {
    const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
    const isCompleted = progress >= 100;
    const isNearingCompletion = progress >= 90 && !isCompleted;

    const progressBarColor = isCompleted
        ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
        : isNearingCompletion
        ? 'bg-yellow-500'
        : 'bg-green-500';

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => setView(View.SAVINGS_GOALS)} className="text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                 <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <i className={`fa-solid fa-${goal.icon} text-green-500 text-lg`}></i>
                 </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white truncate">{goal.name}</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Progres Tabungan</h2>
                    {isCompleted ? (
                        <span className="text-sm font-semibold bg-yellow-400 text-yellow-900 px-2.5 py-1 rounded-full flex items-center space-x-1.5">
                            <i className="fa-solid fa-star"></i>
                            <span>Selesai!</span>
                        </span>
                    ) : (
                       <span className="text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2.5 py-1 rounded-full">{goal.category}</span>
                    )}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div className={`${progressBarColor} h-4 rounded-full flex items-center justify-end text-white text-xs pr-2 transition-all duration-500`} style={{ width: `${progress}%` }}>
                       {progress.toFixed(0)}%
                    </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Terkumpul</p>
                        <p className="text-xl font-bold text-green-500">Rp {goal.savedAmount.toLocaleString('id-ID')}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
                        <p className="text-xl font-bold text-gray-700 dark:text-gray-300">Rp {goal.targetAmount.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
                <button onClick={() => onEdit(goal)} className="flex-1 bg-[var(--primary-600)] text-white font-bold py-3 rounded-lg shadow-md hover:bg-[var(--primary-700)] transition-colors flex items-center justify-center space-x-2">
                    <i className="fa-solid fa-pencil"></i>
                    <span>Edit</span>
                </button>
                <button onClick={() => onDelete(goal.id)} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                    <i className="fa-solid fa-trash"></i>
                    <span>Hapus</span>
                </button>
            </div>
        </div>
    );
};

export default SavingsGoalDetail;