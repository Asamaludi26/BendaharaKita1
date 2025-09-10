import React from 'react';
import type { SummaryCardData } from '../types';

interface SummaryCardProps {
  data: SummaryCardData;
  isComparisonMode: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ data, isComparisonMode }) => {
  const { title, amount, previousAmount, target, icon: Icon, color, type } = data;
  const percentageChange = previousAmount !== 0 ? ((amount - previousAmount) / Math.abs(previousAmount)) * 100 : 0;
  
  const isPositiveChange = (type === 'income' && percentageChange >= 0) || (type === 'expense' && percentageChange <= 0) || (type === 'balance' && percentageChange >= 0) || (type === 'savings' && percentageChange >= 0);

  const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

  const progressPercentage = target ? (amount / target) * 100 : 0;
  
  const mainColor = `var(--color-${color})`;
  const changeColor = isPositiveChange ? 'var(--color-income)' : 'var(--color-expense)';

  return (
    <div 
        className="relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent group transition-all duration-300 hover:from-white/20"
    >
      <div className="relative bg-[var(--bg-secondary)] rounded-[15px] p-4 flex flex-col justify-between h-full">
        <div 
          className="absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle at 70% 20%, ${mainColor}, transparent 60%)` }}
        ></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[var(--text-tertiary)]">{title}</p>
                    <Icon className="w-5 h-5" style={{ color: mainColor }}/>
                </div>
                {isComparisonMode && target ? (
                <div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(amount)}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">/ {formatCurrency(target)}</p>
                </div>
                ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(amount)}</p>
                )}
            </div>
            <div className="mt-4">
                {isComparisonMode && target ? (
                <div>
                    <div className="w-full bg-[var(--bg-interactive)] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(progressPercentage, 100)}%`, backgroundColor: mainColor, boxShadow: `0 0 8px ${mainColor}` }}></div>
                    </div>
                    <p className="text-xs text-right text-[var(--text-tertiary)] mt-1">{Math.min(progressPercentage, 100).toFixed(0)}%</p>
                </div>
                ) : (
                <div className={`text-xs font-medium flex items-center`} style={{color: changeColor}}>
                    {percentageChange !== 0 && (
                        <i className={`fa-solid fa-arrow-${percentageChange > 0 ? 'up' : 'down'} mr-1`}></i>
                    )}
                    {Math.abs(percentageChange).toFixed(1)}% vs Last Month
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
