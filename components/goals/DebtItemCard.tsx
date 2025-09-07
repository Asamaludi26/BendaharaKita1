import React from 'react';
import { DebtItem } from '../../types';

interface DebtItemCardProps {
    debt: DebtItem;
    onSelect: (id: string) => void;
}

const DebtItemCard: React.FC<DebtItemCardProps> = ({ debt, onSelect }) => {
    const paidAmount = debt.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = debt.totalAmount - paidAmount;
    const isPaid = remainingAmount <= 0;
    const progress = isPaid ? 100 : (debt.totalAmount > 0 ? Math.min((paidAmount / debt.totalAmount) * 100, 100) : 0);
    
    const today = new Date().getDate();
    const daysUntilDue = debt.dueDate - today;
    const isDueSoon = !isPaid && daysUntilDue >= 0 && daysUntilDue <= 7;

    const remainingTenor = debt.tenor - debt.payments.length;
    
    const paidOffDate = isPaid && debt.payments.length > 0
        ? new Date(Math.max(...debt.payments.map(p => new Date(p.date).getTime())))
        : null;
    const paidOffDateFormatted = paidOffDate?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });


    const cardClasses = `p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border dark:border-gray-700/50 ${
        isPaid 
        ? 'bg-green-50/50 dark:bg-green-900/20 border-green-500/50 dark:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/30' 
        : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
    }`;
    
    const progressBarGradient = isPaid 
        ? "bg-gradient-to-r from-green-400 to-emerald-500"
        : "bg-gradient-to-r from-orange-400 to-red-500";

    return (
        <div 
            onClick={() => onSelect(debt.id)} 
            className={cardClasses}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-bold text-gray-800 dark:text-white">{debt.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{debt.source}</p>
                </div>
                {isPaid ? (
                     <div className="flex-shrink-0 ml-2 text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 px-2.5 py-1.5 rounded-full">
                        <i className="fa-solid fa-check-circle mr-1.5"></i>
                        Lunas
                    </div>
                ) : isDueSoon && (
                    <div className="flex-shrink-0 ml-2 text-xs font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-400 px-2 py-1 rounded-full animate-pulse">
                        <i className="fa-solid fa-fire mr-1.5"></i>
                        {daysUntilDue === 0 ? 'Jatuh Tempo Hari Ini' : `Jatuh Tempo ${daysUntilDue} hari lagi`}
                    </div>
                )}
            </div>

            {/* Progress Section */}
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden ${isPaid ? 'border border-green-200 dark:border-green-800' : ''}`}>
                <div 
                    className={`${progressBarGradient} h-full rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                <span className={`font-semibold ${isPaid ? 'text-green-600 dark:text-green-400' : 'text-red-500/80'}`}>{progress.toFixed(1)}% Lunas</span>
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Sisa: </span>
                    <span className="font-bold text-gray-800 dark:text-white">Rp {remainingAmount > 0 ? remainingAmount.toLocaleString('id-ID') : 0}</span>
                </div>
            </div>

            {/* Details Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-coins text-base text-gray-400 mt-0.5"></i>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Pinjaman</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">Rp {debt.totalAmount.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-money-bill-wave text-base text-gray-400 mt-0.5"></i>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Cicilan /bln</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">Rp {debt.monthlyInstallment.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                {isPaid && paidOffDateFormatted ? (
                    <div className="flex items-start space-x-2 col-span-2">
                        <i className="fa-solid fa-calendar-check text-base text-green-400 mt-0.5"></i>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Lunas Pada</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{paidOffDateFormatted}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start space-x-2">
                            <i className="fa-solid fa-calendar-day text-base text-gray-400 mt-0.5"></i>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Jatuh Tempo</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">Tgl. {debt.dueDate}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <i className="fa-solid fa-hourglass-half text-base text-gray-400 mt-0.5"></i>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sisa Tenor</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{remainingTenor > 0 ? `${remainingTenor} bulan` : 'Selesai'}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DebtItemCard;
