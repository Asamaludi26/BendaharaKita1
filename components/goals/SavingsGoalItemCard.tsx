import React from 'react';
import { SavingsGoal } from '../../types';

interface SavingsGoalItemCardProps {
    goal: SavingsGoal;
    onSelect: (id: string) => void;
}

const SavingsGoalItemCard: React.FC<SavingsGoalItemCardProps> = ({ goal, onSelect }) => {
    const isAchieved = goal.currentAmount >= goal.targetAmount;
    const progress = isAchieved ? 100 : (goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0);
    const remainingAmount = isAchieved ? 0 : goal.targetAmount - goal.currentAmount;
    
    const cardClasses = `p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border dark:border-gray-700/50 ${
        isAchieved
        ? 'bg-green-50/50 dark:bg-green-900/20 border-green-500/50 dark:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/30' 
        : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
    }`;
    
    const progressBarGradient = isAchieved
        ? "bg-gradient-to-r from-green-400 to-emerald-500"
        : "bg-gradient-to-r from-blue-400 to-cyan-500";
    
    const deadline = new Date(goal.deadline);
    const deadlineFormatted = deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div 
            onClick={() => onSelect(goal.id)} 
            className={cardClasses}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-bold text-gray-800 dark:text-white">{goal.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{goal.source}</p>
                </div>
                {isAchieved && (
                     <div className="flex-shrink-0 ml-2 text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 px-2.5 py-1.5 rounded-full">
                        <i className="fa-solid fa-trophy mr-1.5"></i>
                        Tercapai
                    </div>
                )}
            </div>

            {/* Progress Section */}
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden ${isAchieved ? 'border border-green-200 dark:border-green-800' : ''}`}>
                <div 
                    className={`${progressBarGradient} h-full rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                <span className={`font-semibold ${isAchieved ? 'text-green-600 dark:text-green-400' : 'text-blue-500/80'}`}>{progress.toFixed(1)}% Tercapai</span>
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Terkumpul: </span>
                    <span className="font-bold text-gray-800 dark:text-white">Rp {goal.currentAmount.toLocaleString('id-ID')}</span>
                </div>
            </div>

            {/* Details Section */}
             <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-sack-dollar text-base text-gray-400 mt-0.5"></i>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">Rp {goal.targetAmount.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                 <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-calendar-check text-base text-gray-400 mt-0.5"></i>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tenggat</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{deadlineFormatted}</p>
                    </div>
                </div>
                {!isAchieved && (
                     <div className="flex items-start space-x-2 col-span-2">
                        <i className="fa-solid fa-coins text-base text-gray-400 mt-0.5"></i>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sisa Dibutuhkan</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">Rp {remainingAmount.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavingsGoalItemCard;