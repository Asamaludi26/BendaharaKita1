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
     <div className="group relative bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg overflow-hidden">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors"
          aria-expanded={isOpen}
        >
          <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <i className="fa-solid fa-piggy-bank text-2xl text-cyan-300"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tujuan Tabungan</h2>
                <p className="text-sm text-gray-400">Wujudkan impian finansial Anda.</p>
              </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                    className="flex items-center space-x-2 bg-black/20 text-gray-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-black/40 transition-colors border border-white/10"
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
             <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full">
                <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
              </div>
          </div>
        </button>

        <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : ''}`}>
          <div className="overflow-hidden">
            <div className="px-6 pb-6 border-t border-white/10">
              <div className="pt-6 mb-6">
                <p className="text-sm text-gray-400">Total Tabungan Aktif</p>
                <p className="text-3xl font-bold text-green-400">Rp {totalSaved.toLocaleString('id-ID')}</p>
              </div>
              <div className="space-y-4">
                {savingsGoals.length > 0 ? (
                  savingsGoals.map(goal => (
                    <SavingsGoalItemCard key={goal.id} goal={goal} onSelect={onSelectSavingsGoal} />
                  ))
                ) : (
                  <button
                      onClick={onAddSavingsGoal}
                      className="w-full text-center py-10 px-4 border-2 border-dashed border-gray-600 rounded-xl hover:bg-white/5 hover:border-[var(--primary-glow)] transition-all duration-300 group"
                  >
                      <div className="w-16 h-16 mx-auto bg-black/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-[var(--primary-glow)]/20 transition-colors duration-300 border border-white/10">
                          <i className="fa-solid fa-plus text-3xl text-gray-400 group-hover:text-[var(--primary-glow)] transition-colors duration-300"></i>
                      </div>
                      <p className="font-bold text-lg text-gray-200 group-hover:text-[var(--primary-glow)] transition-colors duration-300">Buat Tujuan Pertamamu</p>
                      <p className="text-sm text-gray-400">Klik di sini untuk mulai menabung demi impian Anda.</p>
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