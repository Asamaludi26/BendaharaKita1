import React from 'react';
import { View, DebtItem } from '../../types';

interface DebtDetailProps {
    debt: DebtItem;
    setView: (view: View) => void;
    onEdit: (debt: DebtItem) => void;
    onDelete: (id: string) => void;
}

const DebtDetail: React.FC<DebtDetailProps> = ({ debt, setView, onEdit, onDelete }) => {
    const progress = (debt.paidAmount / debt.totalAmount) * 100;
    const remainingAmount = debt.totalAmount - debt.paidAmount;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => setView(View.DEBT_MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white truncate">{debt.name}</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Progres Pelunasan</h2>
                    <span className="text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2.5 py-1 rounded-full">{debt.category}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div className="bg-red-500 h-4 rounded-full flex items-center justify-end text-white text-xs pr-2" style={{ width: `${progress}%` }}>
                       {progress.toFixed(0)}%
                    </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Telah Dibayar</p>
                        <p className="text-xl font-bold text-green-500">Rp {debt.paidAmount.toLocaleString('id-ID')}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sisa Utang</p>
                        <p className="text-xl font-bold text-red-500">Rp {remainingAmount.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                 <div className="text-center pt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Utang</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Rp {debt.totalAmount.toLocaleString('id-ID')}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
                <button onClick={() => onEdit(debt)} className="flex-1 bg-[var(--primary-600)] text-white font-bold py-3 rounded-lg shadow-md hover:bg-[var(--primary-700)] transition-colors flex items-center justify-center space-x-2">
                    <i className="fa-solid fa-pencil"></i>
                    <span>Edit</span>
                </button>
                <button onClick={() => onDelete(debt.id)} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                    <i className="fa-solid fa-trash"></i>
                    <span>Hapus</span>
                </button>
            </div>
        </div>
    );
};

export default DebtDetail;