import React, { useState } from 'react';
import { SavingsGoal } from '../../types';
import SavingsGoalItemCard from './SavingsGoalItemCard';

interface SavingsGoalsProps {
  savingsGoals: SavingsGoal[];
  onSelectSavingsGoal: (id: string) => void;
  onAddSavingsGoal: () => void;
  onViewHistory: () => void;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ savingsGoals, onSelectSavingsGoal, onAddSavingsGoal, onViewHistory }) => {
  const [isOpen, setIsOpen] = useState(true);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  return (
     <div className="group relative bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl shadow-lg overflow-hidden">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-6 text-left hover:bg-[var(--bg-interactive-hover)] transition-colors"
          aria-expanded={isOpen}
        >
          <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center border border-[var(--border-primary)] flex-shrink-0">
                  <i className="fa-solid fa-piggy-bank text-2xl" style={{color: 'var(--color-savings)'}}></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Tujuan Tabungan</h2>
                <p className="text-sm text-[var(--text-tertiary)]">Wujudkan impian finansial Anda.</p>
              </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                    className="flex items-center space-x-2 bg-[var(--bg-interactive)] text-[var(--text-secondary)] text-xs font-bold px-4 py-2 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors border border-[var(--border-primary)]"
                >
                    <i className="fa-solid fa-history"></i>
                    <span>Riwayat</span>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onAddSavingsGoal(); }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Tambah Tujuan</span>
                </button>
            </div>
             <div className="w-8 h-8 flex items-center justify-center bg-[var(--bg-interactive)] rounded-full">
                <i className={`fa-solid fa-chevron-down text-[var(--text-tertiary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
              </div>
          </div>
        </button>

        <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : ''}`}>
          <div className="overflow-hidden">
            <div className="px-6 pb-6 border-t border-[var(--border-primary)]">
              <div className="pt-6 mb-6">
                <p className="text-sm text-[var(--text-tertiary)]">Total Tabungan Aktif</p>
                <p className="text-3xl font-bold" style={{color: 'var(--color-income)'}}>Rp {totalSaved.toLocaleString('id-ID')}</p>
              </div>
              <div className="space-y-4">
                {savingsGoals.length > 0 ? (
                  savingsGoals.map(goal => (
                    <SavingsGoalItemCard key={goal.id} goal={goal} onSelect={onSelectSavingsGoal} />
                  ))
                ) : (
                  <button
                      onClick={onAddSavingsGoal}
                      className="w-full text-center py-10 px-4 border-2 border-dashed border-[var(--border-secondary)] rounded-xl hover:bg-[var(--bg-interactive-hover)] hover:border-[var(--primary-glow)] transition-all duration-300 group"
                  >
                      <div className="w-16 h-16 mx-auto bg-[var(--bg-interactive)] rounded-full flex items-center justify-center mb-4 group-hover:bg-[var(--primary-glow)]/20 transition-colors duration-300 border border-[var(--border-primary)]">
                          <i className="fa-solid fa-plus text-3xl text-[var(--text-tertiary)] group-hover:text-[var(--primary-glow)] transition-colors duration-300"></i>
                      </div>
                      <p className="font-bold text-lg text-[var(--text-secondary)] group-hover:text-[var(--primary-glow)] transition-colors duration-300">Buat Tujuan Pertamamu</p>
                      <p className="text-sm text-[var(--text-tertiary)]">Klik di sini untuk mulai menabung demi impian Anda.</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoals;