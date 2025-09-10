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
    
    const completionDate = isAchieved && goal.contributions.length > 0
        ? new Date(Math.max(...goal.contributions.map(c => new Date(c.date).getTime())))
        : null;
    const completionDateFormatted = completionDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const cardClasses = `p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border border-[var(--border-primary)] ${
        isAchieved
        ? goal.isEmergencyFund ? 'bg-sky-500/10 hover:bg-sky-500/20' : 'bg-[var(--bg-success-subtle)] hover:bg-green-500/20' 
        : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-interactive-hover)]'
    }`;
    
    const progressBarGradient = isAchieved
        ? goal.isEmergencyFund ? "bg-gradient-to-r from-sky-400 to-blue-500" : "bg-gradient-to-r from-green-400 to-emerald-500"
        : "bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)]";
    
    const deadline = new Date(goal.deadline);
    const deadlineFormatted = deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const statusBadge = () => {
        if (!isAchieved) return null;
        if (goal.isEmergencyFund) {
            return (
                <div className="flex-shrink-0 ml-2 text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1.5 rounded-full">
                    <i className="fa-solid fa-shield-check mr-1.5"></i>
                    Siaga
                </div>
            );
        }
        return (
            <div className="flex-shrink-0 ml-2 text-xs font-bold text-[var(--text-success-strong)] bg-[var(--bg-success-subtle)] px-2.5 py-1.5 rounded-full">
                <i className="fa-solid fa-trophy mr-1.5"></i>
                Tercapai
            </div>
        );
    };

    return (
        <div 
            onClick={() => onSelect(goal.id)} 
            className={cardClasses}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                    {goal.isEmergencyFund && <i className="fa-solid fa-shield-halved text-sky-400 text-lg"></i>}
                    <div>
                        <p className="font-bold text-[var(--text-primary)]">{goal.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{goal.source}</p>
                    </div>
                </div>
                {statusBadge()}
            </div>

            {/* Progress Section */}
            <div className={`w-full bg-[var(--bg-interactive)] rounded-full h-3 mb-2 overflow-hidden ${isAchieved ? `border ${goal.isEmergencyFund ? 'border-sky-500/20' : 'border-green-500/20'}` : ''}`}>
                <div 
                    className={`${progressBarGradient} h-full rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-[var(--text-secondary)] mb-4">
                <span className={`font-semibold`} style={{color: isAchieved ? (goal.isEmergencyFund ? 'rgb(56 189 248)' : 'var(--color-income)') : 'var(--color-savings)'}}>{progress.toFixed(1)}% {isAchieved ? (goal.isEmergencyFund ? 'Terpenuhi' : 'Tercapai') : 'Terkumpul'}</span>
                <div>
                    <span className="text-xs text-[var(--text-tertiary)]">Terkumpul: </span>
                    <span className="font-bold text-[var(--text-primary)]">Rp {goal.currentAmount.toLocaleString('id-ID')}</span>
                </div>
            </div>

            {/* Details Section */}
             <div className="border-t border-[var(--border-primary)] pt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-sack-dollar text-base text-[var(--text-tertiary)] mt-0.5"></i>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)]">Target</p>
                        <p className="text-sm font-bold text-[var(--text-primary)]">Rp {goal.targetAmount.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                 <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-calendar-check text-base text-[var(--text-tertiary)] mt-0.5"></i>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)]">Tenggat</p>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{deadlineFormatted}</p>
                    </div>
                </div>
                {!isAchieved ? (
                     <div className="flex items-start space-x-2 col-span-2">
                        <i className="fa-solid fa-coins text-base text-[var(--text-tertiary)] mt-0.5"></i>
                        <div>
                            <p className="text-xs text-[var(--text-tertiary)]">Sisa Dibutuhkan</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Rp {remainingAmount.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                ) : completionDateFormatted && (
                    <div className="flex items-start space-x-2 col-span-2">
                        <i className="fa-solid fa-calendar-check text-base" style={{color: 'var(--color-income)'}}></i>
                        <div>
                            <p className="text-xs text-[var(--text-tertiary)]">Tercapai Pada</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{completionDateFormatted}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavingsGoalItemCard;