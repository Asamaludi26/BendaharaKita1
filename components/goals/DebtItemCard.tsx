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


    const cardClasses = `p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border border-[var(--border-primary)] ${
        isPaid 
        ? 'bg-[var(--bg-success-subtle)] hover:bg-green-500/20' 
        : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-interactive-hover)]'
    }`;
    
    const progressBarGradient = isPaid 
        ? "bg-gradient-to-r from-[var(--color-income)] to-emerald-500"
        : "bg-gradient-to-r from-[var(--color-debt)] to-[var(--color-expense)]";

    return (
        <div 
            onClick={() => onSelect(debt.id)} 
            className={cardClasses}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-bold text-[var(--text-primary)]">{debt.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{debt.source}</p>
                </div>
                {isPaid ? (
                     <div className="flex-shrink-0 ml-2 text-xs font-bold text-[var(--text-success-strong)] bg-[var(--bg-success-subtle)] px-2.5 py-1.5 rounded-full">
                        <i className="fa-solid fa-check-circle mr-1.5"></i>
                        Lunas
                    </div>
                ) : isDueSoon && (
                    <div className="flex-shrink-0 ml-2 text-xs font-bold text-[var(--text-warning-strong)] bg-[var(--bg-warning-subtle)] px-2 py-1 rounded-full animate-pulse">
                        <i className="fa-solid fa-fire mr-1.5"></i>
                        {daysUntilDue === 0 ? 'Jatuh Tempo Hari Ini' : `Jatuh Tempo ${daysUntilDue} hari lagi`}
                    </div>
                )}
            </div>

            {/* Progress Section */}
            <div className={`w-full bg-[var(--bg-interactive)] rounded-full h-3 mb-2 overflow-hidden ${isPaid ? 'border border-green-500/20' : ''}`}>
                <div 
                    className={`${progressBarGradient} h-full rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-[var(--text-secondary)] mb-4">
                <span className={`font-semibold`} style={{color: isPaid ? 'var(--color-income)' : 'var(--color-debt)'}}>{progress.toFixed(1)}% Lunas</span>
                <div>
                    <span className="text-xs text-[var(--text-tertiary)]">Sisa: </span>
                    <span className="font-bold text-[var(--text-primary)]">Rp {remainingAmount > 0 ? remainingAmount.toLocaleString('id-ID') : 0}</span>
                </div>
            </div>

            {/* Details Section */}
            <div className="border-t border-[var(--border-primary)] pt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-coins text-base text-[var(--text-tertiary)] mt-0.5"></i>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)]">Total Pinjaman</p>
                        <p className="text-sm font-bold text-[var(--text-primary)]">Rp {debt.totalAmount.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div className="flex items-start space-x-2">
                    <i className="fa-solid fa-money-bill-wave text-base text-[var(--text-tertiary)] mt-0.5"></i>
                    <div>
                        <p className="text-xs text-[var(--text-tertiary)]">Cicilan /bln</p>
                        <p className="text-sm font-bold text-[var(--text-primary)]">Rp {debt.monthlyInstallment.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                {isPaid && paidOffDateFormatted ? (
                    <div className="flex items-start space-x-2 col-span-2">
                        <i className="fa-solid fa-calendar-check text-base text-[var(--color-income)] mt-0.5"></i>
                        <div>
                            <p className="text-xs text-[var(--text-tertiary)]">Lunas Pada</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{paidOffDateFormatted}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start space-x-2">
                            <i className="fa-solid fa-calendar-day text-base text-[var(--text-tertiary)] mt-0.5"></i>
                            <div>
                                <p className="text-xs text-[var(--text-tertiary)]">Jatuh Tempo</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">Tgl. {debt.dueDate}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <i className="fa-solid fa-hourglass-half text-base text-[var(--text-tertiary)] mt-0.5"></i>
                            <div>
                                <p className="text-xs text-[var(--text-tertiary)]">Sisa Tenor</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{remainingTenor > 0 ? `${remainingTenor} bulan` : 'Selesai'}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DebtItemCard;