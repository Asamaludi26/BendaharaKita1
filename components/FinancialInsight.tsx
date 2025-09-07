import React, { useState, useCallback } from 'react';
import { getFinancialInsight } from '../services/geminiService';
import type { FinancialInsight as Insight, Transaction } from '../types';

interface FinancialInsightProps {
  transactions: Transaction[];
  income: number;
  expense: number;
}

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => (
    <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex items-start space-x-4 transition-all duration-300 hover:border-[var(--primary-glow)]/50 hover:bg-black/30">
        <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center border border-white/10 flex-shrink-0">
            <i className={`fa-solid fa-${insight.icon} text-[var(--primary-glow)] text-xl`}></i>
        </div>
        <div>
            <h4 className="font-bold text-white">{insight.title}</h4>
            <p className="text-sm text-gray-300 mt-1">{insight.description}</p>
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
      <h3 className="text-xl font-bold text-white mb-4">Financial Insights</h3>
      
      {isLoading ? (
        <div className="text-center p-8 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-glow)] mx-auto"></div>
            <p className="mt-4 text-gray-300 font-semibold">Menganalisis data Anda...</p>
        </div>
      ) : insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10">
          <button
            onClick={handleGetInsights}
            className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:shadow-[var(--primary-glow)]/30 transform hover:scale-105 transition-all duration-300"
            disabled={isLoading}
          >
            Dapatkan Insight Finansial ✨
          </button>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default FinancialInsight;