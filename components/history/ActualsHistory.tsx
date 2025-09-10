import React, { useState, useMemo } from 'react';
import { View, ArchivedActualReport, MonthlyTarget, TargetFormField } from '../../types';

const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) || 0 : value;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

const getDifferenceClass = (actual: number, target: number, isPositiveGoal = false) => {
    // For income and savings (positive goals), higher is better
    if (isPositiveGoal) {
        if (actual >= target) return 'text-[var(--color-income)]';
        return 'text-[var(--color-expense)]';
    }
    // For expenses (negative goals), lower is better
    if (actual <= target) return 'text-[var(--color-income)]';
    return 'text-[var(--color-expense)]';
}

const ActualsDetail: React.FC<{ report: ArchivedActualReport }> = ({ report }) => {
    const { target, actuals } = report;

    const sections: { key: keyof MonthlyTarget, title: string, isPositiveGoal?: boolean }[] = [
        { key: 'pendapatan', title: 'Pendapatan', isPositiveGoal: true },
        { key: 'cicilanUtang', title: 'Cicilan Utang', isPositiveGoal: true }, // Higher payment is good
        { key: 'tabungan', title: 'Tabungan', isPositiveGoal: true }, // Higher saving is good
        { key: 'pengeluaranUtama', title: 'Pengeluaran Utama' },
        { key: 'kebutuhan', title: 'Kebutuhan' },
        { key: 'penunjang', title: 'Penunjang' },
        { key: 'pendidikan', title: 'Pendidikan' },
    ];

    return (
        <div className="space-y-4 p-4 bg-[var(--bg-primary)]">
            {sections.map(sectionInfo => {
                const items = target[sectionInfo.key];
                if (!items || items.length === 0) return null;
                
                const totalTarget = items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
                const totalActual = items.reduce((sum, item) => sum + (parseInt(actuals[item.id]) || 0), 0);

                return (
                    <div key={sectionInfo.key}>
                        <h4 className="font-semibold text-[var(--text-secondary)] mb-2">{sectionInfo.title}</h4>
                        <ul className="space-y-2 text-sm">
                            {items.map((item: TargetFormField) => {
                                const actualAmount = parseInt(actuals[item.id] || '0');
                                const targetAmount = parseInt(item.amount || '0');
                                return (
                                <li key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[var(--bg-interactive)] p-2 rounded-md">
                                    <span className="truncate font-semibold text-[var(--text-secondary)]">{item.name}</span>
                                    <div className="flex justify-between sm:justify-end sm:gap-4 w-full sm:w-auto mt-1 sm:mt-0 text-xs sm:text-sm">
                                        <div className="font-mono text-right text-[var(--text-tertiary)]">
                                            <span className="sm:hidden">Target: </span>{formatCurrency(targetAmount)}
                                        </div>
                                        <div className={`font-mono font-semibold text-right ${getDifferenceClass(actualAmount, targetAmount, sectionInfo.isPositiveGoal)}`}>
                                            <span className="sm:hidden">Aktual: </span>{formatCurrency(actualAmount)}
                                        </div>
                                    </div>
                                </li>
                            )})}
                        </ul>
                         <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-[var(--border-primary)]">
                           <span className="text-[var(--text-secondary)]">Total</span>
                           <div className="flex justify-end gap-4">
                                <span className="text-right text-[var(--text-tertiary)]">{formatCurrency(totalTarget)}</span>
                                <span className={`text-right ${getDifferenceClass(totalActual, totalTarget, sectionInfo.isPositiveGoal)}`}>{formatCurrency(totalActual)}</span>
                           </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const ActualsReportCard: React.FC<{ report: ArchivedActualReport }> = ({ report }) => {
    const { target, actuals } = report;

    const summary = useMemo(() => {
        const calculateTotals = (items: TargetFormField[]) => {
            const targetTotal = items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
            const actualTotal = items.reduce((sum, item) => sum + (parseInt(actuals[item.id]) || 0), 0);
            return { targetTotal, actualTotal };
        };

        const income = calculateTotals(target.pendapatan || []);
        const savings = calculateTotals(target.tabungan || []);
        const debt = calculateTotals(target.cicilanUtang || []);
        const spending = calculateTotals([
            ...(target.pengeluaranUtama || []),
            ...(target.kebutuhan || []),
            ...(target.penunjang || []),
            ...(target.pendidikan || [])
        ]);
        
        const totalExpensesForDisplay = {
            targetTotal: spending.targetTotal + debt.targetTotal,
            actualTotal: spending.actualTotal + debt.actualTotal,
        };
        
        // Smarter "isAchieved" logic
        const isAchieved = 
            income.actualTotal >= income.targetTotal &&
            spending.actualTotal <= spending.targetTotal &&
            debt.actualTotal >= debt.targetTotal &&
            savings.actualTotal >= savings.targetTotal;

        return { income, expenses: totalExpensesForDisplay, savings, isAchieved };
    }, [target, actuals]);

    const [year, month] = report.monthYear.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    const monthName = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const statusStyles = summary.isAchieved 
        ? {
            badge: "bg-[var(--bg-success-subtle)] text-[var(--text-success-strong)]",
            icon: "fa-check-circle",
            container: "bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--color-income)]",
        } : {
            badge: "bg-[var(--bg-danger-subtle)] text-[var(--text-danger-strong)]",
            icon: "fa-times-circle",
            container: "bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--color-expense)]",
        };

    return (
        <details className={`group rounded-2xl shadow-md border ${statusStyles.container} transition-all duration-300 overflow-hidden`}>
            <summary className="list-none p-4 cursor-pointer">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">{monthName}</h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles.badge}`}>
                            <i className={`fa-solid ${statusStyles.icon} mr-1.5`}></i>
                            {summary.isAchieved ? 'Target Tercapai' : 'Tidak Tercapai'}
                        </span>
                    </div>
                    <i className={`fa-solid fa-chevron-down text-[var(--text-tertiary)] transition-transform duration-300 group-open:rotate-180`}></i>
                </div>
                {/* Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mt-3 text-xs text-[var(--text-tertiary)]">
                    <div>
                        <strong>Pemasukan:</strong> <span className={`font-semibold ${getDifferenceClass(summary.income.actualTotal, summary.income.targetTotal, true)}`}>{formatCurrency(summary.income.actualTotal)}</span> / {formatCurrency(summary.income.targetTotal)}
                    </div>
                    <div>
                        <strong>Pengeluaran:</strong> <span className={`font-semibold ${getDifferenceClass(summary.expenses.actualTotal, summary.expenses.targetTotal)}`}>{formatCurrency(summary.expenses.actualTotal)}</span> / {formatCurrency(summary.expenses.targetTotal)}
                    </div>
                    <div>
                        <strong>Tabungan:</strong> <span className={`font-semibold ${getDifferenceClass(summary.savings.actualTotal, summary.savings.targetTotal, true)}`}>{formatCurrency(summary.savings.actualTotal)}</span> / {formatCurrency(summary.savings.targetTotal)}
                    </div>
                </div>
            </summary>
            <div className="border-t border-[var(--border-primary)]">
                <ActualsDetail report={report} />
            </div>
        </details>
    );
};

interface ActualsHistoryProps {
    archives: ArchivedActualReport[];
    setView: (view: View) => void;
}

const ActualsHistory: React.FC<ActualsHistoryProps> = ({ archives, setView }) => {
  const sortedArchives = [...archives].sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      <header className="flex items-center space-x-4">
        <button onClick={() => setView(View.DASHBOARD)} className="w-10 h-10 rounded-full bg-[var(--bg-interactive)] text-[var(--text-tertiary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]">
            <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Riwayat Laporan Aktual</h1>
            <p className="text-[var(--text-tertiary)]">Lihat perbandingan realisasi dengan target Anda dari bulan-bulan sebelumnya.</p>
        </div>
      </header>

      {sortedArchives.length > 0 ? (
        <div className="space-y-4 pb-20">
            {sortedArchives.map(archive => (
                <ActualsReportCard key={archive.monthYear} report={archive} />
            ))}
        </div>
       ) : (
        <div className="text-center p-8 bg-[var(--bg-secondary)] rounded-2xl mt-8">
            <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
             <p className="text-[var(--text-primary)] font-semibold">Riwayat Kosong</p>
            <p className="text-[var(--text-tertiary)]">Belum ada riwayat laporan aktual yang tersimpan.</p>
        </div>
      )}
    </div>
  );
};

export default ActualsHistory;