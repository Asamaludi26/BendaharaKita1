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
        className="relative bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 group"
    >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
              boxShadow: `inset 0 0 10px 0 ${mainColor}40, 0 0 15px -5px ${mainColor}`,
              border: `1px solid ${mainColor}80`
          }}
        ></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[var(--text-tertiary)]">{title}</p>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-primary)]`} style={{boxShadow: `0 0 10px ${mainColor}80`}}>
                    <Icon className={`w-5 h-5`} style={{ color: mainColor }}/>
                </div>
                </div>
                {isComparisonMode && target ? (
                <div>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(amount)}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">/ {formatCurrency(target)}</p>
                </div>
                ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(amount)}</p>
                )}
            </div>
            <div className="mt-2">
                {isComparisonMode && target ? (
                <div className="mt-4">
                    <div className="w-full bg-[var(--bg-interactive)] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min(progressPercentage, 100)}%`, backgroundColor: mainColor, boxShadow: `0 0 8px ${mainColor}` }}></div>
                    </div>
                </div>
                ) : (
                <div className={`text-xs font-medium flex items-center mt-2`} style={{color: changeColor}}>
                    {percentageChange !== 0 && (
                        <i className={`fa-solid fa-arrow-${percentageChange > 0 ? 'up' : 'down'} mr-1`}></i>
                    )}
                    {Math.abs(percentageChange).toFixed(1)}% vs Last Month
                </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default SummaryCard;