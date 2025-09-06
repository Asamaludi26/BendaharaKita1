
import React from 'react';
import { View, DebtItem } from '../../types';

interface DebtDetailProps {
  debt: DebtItem;
  setView: (view: View) => void;
}

const DebtDetail: React.FC<DebtDetailProps> = ({ debt, setView }) => {
  const paidAmount = debt.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = debt.totalAmount - paidAmount;
  const progress = (paidAmount / debt.totalAmount) * 100;
  
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(View.MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{debt.name}</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sisa Utang</p>
          <p className="text-4xl font-bold text-red-500">Rp {remainingAmount.toLocaleString('id-ID')}</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div className="bg-red-500 h-4 rounded-full text-center text-white text-xs font-bold" style={{ width: `${progress}%` }}>
            {progress.toFixed(1)}%
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <p>Terbayar: Rp {paidAmount.toLocaleString('id-ID')}</p>
          <p>Total: Rp {debt.totalAmount.toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold mb-3">Riwayat Pembayaran</h2>
        {debt.payments.length > 0 ? (
          <ul className="space-y-2">
            {debt.payments.map((p, i) => (
              <li key={i} className="flex justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-700/50">
                <span>{new Date(p.date).toLocaleDateString('id-ID')}</span>
                <span className="font-semibold">Rp {p.amount.toLocaleString('id-ID')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">Belum ada pembayaran.</p>
        )}
      </div>
    </div>
  );
};

export default DebtDetail;
