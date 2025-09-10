import React, { useState, useCallback } from 'react';
import { getFinancialInsight } from '../services/geminiService';
import type { FinancialInsight as Insight, Transaction } from '../types';

interface FinancialInsightProps {
  transactions: Transaction[];
  income: number;
  expense: number;
}

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => (
    <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 hover:from-[var(--primary-glow)]/20">
      <div className="bg-[var(--bg-secondary)] rounded-[15px] p-5 flex items-start space-x-4 h-full">
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-interactive)] flex items-center justify-center border border-[var(--border-primary)] flex-shrink-0">
            <i className={`fa-solid fa-${insight.icon} text-[var(--primary-glow)] text-xl`}></i>
        </div>
        <div>
            <h4 className="font-bold text-[var(--text-primary)]">{insight.title}</h4>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{insight.description}</p>
        </div>
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
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Financial Insights</h3>
      
      <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent">
        <div className="bg-[var(--bg-secondary)] rounded-[15px] p-6 min-h-[10rem] flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-glow)] mx-auto"></div>
                <p className="mt-4 text-[var(--text-secondary)] font-semibold">Menganalisis data Anda...</p>
            </div>
          ) : insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleGetInsights}
                className="bg-[var(--gradient-primary)] text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-[var(--primary-glow)]/30 transform hover:scale-105 transition-all duration-300"
                disabled={isLoading}
              >
                Dapatkan Insight Finansial ✨
              </button>
              {error && <p className="mt-4" style={{color: 'var(--color-expense)'}}>{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialInsight;
