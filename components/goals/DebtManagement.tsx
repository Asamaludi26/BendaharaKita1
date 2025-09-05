import React, { useState } from 'react';
import { View, DebtItem, DebtCategory } from '../../types';

interface DebtCardProps {
  debt: DebtItem;
  onClick: () => void;
}

const DebtCard: React.FC<DebtCardProps> = ({ debt, onClick }) => {
    const progress = (debt.paidAmount / debt.totalAmount) * 100;
    return (
        <button onClick={onClick} className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 space-y-2 text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{debt.name}</h3>
                    <span className="text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full">{debt.category}</span>
                </div>
            </div>
            <div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                    <span>Rp {debt.paidAmount.toLocaleString('id-ID')}</span>
                    <span>Rp {debt.totalAmount.toLocaleString('id-ID')}</span>
                </div>
            </div>
        </button>
    );
};

interface DebtManagementProps {
  debts: DebtItem[];
  setView: (view: View, item?: DebtItem) => void;
  onAdd: () => void;
}

const DebtManagement: React.FC<DebtManagementProps> = ({ debts, setView, onAdd }) => {
  const [filter, setFilter] = useState<'all' | DebtCategory>('all');
  
  const filteredDebts = debts.filter(d => filter === 'all' || d.category === filter);

  const FilterChip: React.FC<{ value: 'all' | DebtCategory, label: string }> = ({ value, label }) => (
    <button
        onClick={() => setFilter(value)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filter === value ? 'bg-[var(--primary-600)] text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(View.MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Manajemen Utang</h1>
      </div>

      <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-900 rounded-full">
        <FilterChip value="all" label="Semua" />
        <FilterChip value="Produktif" label="Produktif" />
        <FilterChip value="Konsumtif" label="Konsumtif" />
      </div>

      <div className="space-y-4 pb-20">
        {filteredDebts.map(debt => (
          <DebtCard key={debt.id} debt={debt} onClick={() => setView(View.DEBT_DETAIL, debt)} />
        ))}
        {filteredDebts.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 pt-8">Tidak ada data utang untuk kategori ini.</p>}
      </div>

       <button onClick={onAdd} className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-light shadow-lg transform hover:scale-110 transition-transform duration-300">
        +
      </button>
    </div>
  );
};

export default DebtManagement;