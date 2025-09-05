import React, { useState, useCallback } from 'react';
import { getFinancialInsight } from '../services/geminiService';
import type { FinancialInsight as Insight, Transaction } from '../types';

interface FinancialInsightProps {
  transactions: Transaction[];
  income: number;
  expense: number;
}

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex items-start space-x-4 transform hover:scale-105 transition-transform duration-300">
        <div className="bg-[var(--primary-100)] dark:bg-[var(--primary-900)]/50 rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <i className={`fa-solid fa-${insight.icon} text-[var(--primary-500)] dark:text-[var(--primary-400)] text-xl`}></i>
        </div>
        <div>
            <h4 className="font-bold text-gray-800 dark:text-white">{insight.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
        </div>
    </div>
);

const FinancialInsight: React.FC<FinancialInsightProps> = ({ transactions, income, expense }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsights([]);
    try {
      const result = await getFinancialInsight(transactions, income, expense);
      setInsights(result);
    } catch (err) {
      setError("Failed to fetch financial insights.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transactions, income, expense]);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Financial Insights</h3>
      
      {isLoading ? (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-500)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-semibold">Menganalisis data Anda...</p>
        </div>
      ) : insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
          <button
            onClick={handleGetInsights}
            className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-600)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            disabled={isLoading}
          >
            Dapatkan Insight Finansial ✨
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default FinancialInsight;