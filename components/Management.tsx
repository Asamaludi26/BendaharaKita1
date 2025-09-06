import React, { useState } from 'react';
import { View, DebtItem, SavingsGoal } from '../types';
import DebtManagement from './goals/DebtManagement';
import SavingsGoals from './goals/SavingsGoals';
import Modal from './Modal';

interface ManagementProps {
  setView: (view: View) => void;
  debts: DebtItem[];
  savingsGoals: SavingsGoal[];
  onSelectDebt: (id: string) => void;
  onSelectSavingsGoal: (id: string) => void;
  onAddDebt: () => void;
  onAddSavingsGoal: () => void;
  onViewHistory: () => void;
  onViewSavingsHistory: () => void;
  totalAllTimeSavings: number;
  totalAllTimeDebt: number;
  onResetGoals: () => void;
}

const SummaryCard: React.FC<{ title: string; amount: number; icon: string; gradient: string; }> = ({ title, amount, icon, gradient }) => (
    <div className={`relative p-5 rounded-2xl shadow-lg overflow-hidden ${gradient}`}>
        <div className="relative z-10">
            <p className="text-white/80 font-semibold">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">Rp {amount.toLocaleString('id-ID')}</p>
        </div>
        <i className={`fa-solid ${icon} absolute -right-4 -bottom-4 text-8xl text-white/10 transform-gpu rotate-[-20deg]`}></i>
    </div>
);


const Management: React.FC<ManagementProps> = ({ 
  setView, 
  debts, 
  savingsGoals, 
  onSelectDebt, 
  onSelectSavingsGoal, 
  onAddDebt, 
  onAddSavingsGoal, 
  onViewHistory, 
  onViewSavingsHistory,
  totalAllTimeSavings,
  totalAllTimeDebt,
  onResetGoals
}) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleConfirmReset = () => {
    onResetGoals();
    setIsResetModalOpen(false);
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tujuan Finansial</h1>
           <button 
            onClick={() => setIsResetModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-colors shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Atur Ulang Data Awal"
            title="Atur Ulang Data Awal"
          >
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>
        
        {/* All-Time Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <SummaryCard 
                title="Total Aset Tabungan"
                amount={totalAllTimeSavings}
                icon="fa-landmark"
                gradient="bg-gradient-to-br from-green-400 to-emerald-600"
           />
           <SummaryCard 
                title="Total Riwayat Pinjaman"
                amount={totalAllTimeDebt}
                icon="fa-file-invoice-dollar"
                gradient="bg-gradient-to-br from-orange-400 to-red-600"
           />
        </div>

        <SavingsGoals 
          savingsGoals={savingsGoals} 
          onSelectSavingsGoal={onSelectSavingsGoal} 
          onAddSavingsGoal={onAddSavingsGoal}
          onViewHistory={onViewSavingsHistory}
        />
        <DebtManagement 
          debts={debts} 
          onSelectDebt={onSelectDebt} 
          onAddDebt={onAddDebt}
          onViewHistory={onViewHistory}
        />
      </div>

       <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center p-6 pt-16">
          <button 
              onClick={() => setIsResetModalOpen(false)} 
              className="absolute top-4 right-4 w-10 h-10 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
              aria-label="Close modal"
          >
              <i className="fa-solid fa-times text-xl"></i>
          </button>

          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-lg shadow-red-500/40">
              <i className="fa-solid fa-triangle-exclamation text-5xl text-white"></i>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Anda Yakin?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tindakan ini akan <strong>menghapus semua data</strong> pinjaman dan tujuan tabungan Anda saat ini. Anda akan dipandu untuk memasukkannya kembali.
              <br/><br/>
              <span className="font-semibold text-gray-500 dark:text-gray-400">Data transaksi tidak akan terpengaruh.</span>
          </p>
          
          <div className="flex flex-col gap-3">
              <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
              >
                  Ya, Atur Ulang
              </button>
              <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-full bg-transparent text-gray-500 dark:text-gray-400 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                  Batal
              </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Management;