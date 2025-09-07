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
    <div className="group relative bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg overflow-hidden">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors"
          aria-expanded={isOpen}
        >
          <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center border border-white/10 flex-shrink-0">
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
                  className="flex items-center space-x-2 bg-black/20 text-gray-300 text-xs font-bold px-4 py-2 rounded-full hover:bg-black/40 transition-colors border border-white/10"
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
              <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full">
                <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
              </div>
          </div>
        </button>

        <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : ''}`}>
          <div className="overflow-hidden">
            <div className="px-6 pb-6 border-t border-white/10">
              <div className="pt-6 mb-6">
                <p className="text-sm text-gray-400">Total Sisa Utang Aktif</p>
                <p className="text-3xl font-bold text-red-400">Rp {totalRemainingDebt.toLocaleString('id-ID')}</p>
              </div>
              <div className="space-y-4">
                {debts.length > 0 ? (
                  debts.map(debt => (
                    <DebtItemCard key={debt.id} debt={debt} onSelect={onSelectDebt} />
                  ))
                ) : (
                  <div className="text-center py-10 px-4 bg-black/20 rounded-xl border border-white/10">
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
      </div>
    </div>
  );
};

export default DebtManagement;