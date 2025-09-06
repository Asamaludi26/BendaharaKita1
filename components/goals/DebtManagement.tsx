import React, { useState } from 'react';
import { DebtItem } from '../../types';
import DebtItemCard from './DebtItemCard';

interface DebtManagementProps {
  debts: DebtItem[];
  onSelectDebt: (id: string) => void;
  onAddDebt: () => void;
  onViewHistory: () => void;
}

const DebtManagement: React.FC<DebtManagementProps> = ({ debts, onSelectDebt, onAddDebt, onViewHistory }) => {
  const [isOpen, setIsOpen] = useState(true);

  const totalRemainingDebt = debts.reduce((sum, debt) => {
    const paidAmount = debt.payments.reduce((paidSum, p) => paidSum + p.amount, 0);
    const remaining = debt.totalAmount - paidAmount;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  return (
    <div className="group relative bg-gray-800/80 rounded-2xl shadow-lg border border-white/10 overflow-hidden">
      {/* Animated Background */}
      <div 
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-spin-slow"
          style={{
              backgroundImage: `radial-gradient(circle at center, #F97316 0%, #EF4444 40%, transparent 70%)`
          }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-black/30"></div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-6 text-left"
          aria-expanded={isOpen}
        >
          <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center backdrop-blur-sm border border-white/10 flex-shrink-0">
                  <i className="fa-solid fa-wallet text-2xl text-orange-300"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Manajemen Utang</h2>
                <p className="text-sm text-gray-400">Lacak dan kelola semua pinjaman Anda.</p>
              </div>
          </div>
          <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
                  className="flex items-center space-x-2 bg-black/20 text-gray-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-black/40 transition-colors"
                >
                  <i className="fa-solid fa-history"></i>
                  <span>Riwayat</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddDebt(); }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Catat Pinjaman</span>
                </button>
              </div>
              <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
          </div>
        </button>

        <div className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="px-6 pb-6">
            <div className="border-t border-white/10 pt-6 mb-6">
              <p className="text-sm text-gray-400">Total Sisa Utang Aktif</p>
              <p className="text-3xl font-bold text-red-400">Rp {totalRemainingDebt.toLocaleString('id-ID')}</p>
            </div>
            <div className="space-y-4">
              {debts.length > 0 ? (
                debts.map(debt => (
                  <DebtItemCard key={debt.id} debt={debt} onSelect={onSelectDebt} />
                ))
              ) : (
                <div className="text-center py-10 px-4 bg-gradient-to-br from-green-900/20 to-emerald-900/30 rounded-xl border border-white/10">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                        <i className="fa-solid fa-trophy text-5xl text-white drop-shadow-lg"></i>
                    </div>
                    <p className="font-bold text-xl text-white mt-6">Anda Bebas Utang!</p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto">Kerja bagus! Terus pertahankan kondisi finansial yang sehat ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
       <style>{`
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 20s linear infinite;
            }
        `}</style>
    </div>
  );
};

export default DebtManagement;