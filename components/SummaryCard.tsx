
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col justify-between transform hover:scale-105 transition-transform duration-300">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${color}20`}}>
              <Icon className={`w-5 h-5`} style={{ color: color }}/>
          </div>
        </div>
        {isComparisonMode && target ? (
          <div>
            <p className="text-lg font-bold text-gray-800 dark:text-white">{formatCurrency(amount)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">/ {formatCurrency(target)}</p>
          </div>
        ) : (
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(amount)}</p>
        )}
      </div>
      <div>
        {isComparisonMode && target ? (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${Math.min(progressPercentage, 100)}%`, backgroundColor: color }}></div>
            </div>
          </div>
        ) : (
          <div className={`text-xs font-medium flex items-center mt-2 ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {percentageChange !== 0 && (
                <i className={`fa-solid fa-arrow-${percentageChange > 0 ? 'up' : 'down'} mr-1`}></i>
            )}
            {Math.abs(percentageChange).toFixed(1)}% vs Last Month
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
