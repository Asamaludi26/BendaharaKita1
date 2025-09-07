import React, { useState, useMemo } from 'react';
import { View, ArchivedActualReport, MonthlyTarget, TargetFormField } from '../../types';

const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) || 0 : value;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

const getDifferenceClass = (actual: number, target: number, isIncome = false) => {
    if (isIncome) { // For income and savings, higher is better
        if (actual >= target) return 'text-[var(--color-income)]';
        return 'text-[var(--color-expense)]';
    }
    // For expenses, lower is better
    if (actual <= target) return 'text-[var(--color-income)]';
    return 'text-[var(--color-expense)]';
}

const ActualsDetail: React.FC<{ report: ArchivedActualReport }> = ({ report }) => {
    const { target, actuals } = report;

    const sections: { key: keyof MonthlyTarget, title: string, isIncome?: boolean }[] = [
        { key: 'pendapatan', title: 'Pendapatan', isIncome: true },
        { key: 'cicilanUtang', title: 'Cicilan Utang' },
        { key: 'pengeluaranUtama', title: 'Pengeluaran Utama' },
        { key: 'kebutuhan', title: 'Kebutuhan' },
        { key: 'penunjang', title: 'Penunjang' },
        { key: 'pendidikan', title: 'Pendidikan' },
        { key: 'tabungan', title: 'Tabungan', isIncome: true },
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
                        <ul className="space-y-1 text-sm">
                             <li className="grid grid-cols-3 gap-4 font-semibold text-[var(--text-tertiary)] text-xs mb-1">
                                <span className="col-span-1">Item</span>
                                <span className="text-right">Target</span>
                                <span className="text-right">Aktual</span>
                            </li>
                            {items.map((item: TargetFormField) => {
                                const actualAmount = parseInt(actuals[item.id] || '0');
                                const targetAmount = parseInt(item.amount || '0');
                                return (
                                <li key={item.id} className="grid grid-cols-3 gap-4 items-center text-[var(--text-tertiary)]">
                                    <span className="col-span-1 truncate">{item.name}</span>
                                    <span className="font-mono text-right">{formatCurrency(targetAmount)}</span>
                                    <span className={`font-mono font-semibold text-right ${getDifferenceClass(actualAmount, targetAmount, sectionInfo.isIncome)}`}>
                                        {formatCurrency(actualAmount)}
                                    </span>
                                </li>
                            )})}
                        </ul>
                         <div className="grid grid-cols-3 gap-4 font-bold text-sm mt-2 pt-2 border-t border-[var(--border-primary)]">
                           <span className="col-span-1 text-[var(--text-secondary)]">Total</span>
                           <span className="text-right text-[var(--text-secondary)]">{formatCurrency(totalTarget)}</span>
                           <span className={`text-right ${getDifferenceClass(totalActual, totalTarget, sectionInfo.isIncome)}`}>{formatCurrency(totalActual)}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const ActualsReportCard: React.FC<{ report: ArchivedActualReport }> = ({ report }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { target, actuals } = report;

    const summary = useMemo(() => {
        const calculateTotals = (items: TargetFormField[]) => {
            const targetTotal = items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
            const actualTotal = items.reduce((sum, item) => sum + (parseInt(actuals[item.id]) || 0), 0);
            return { targetTotal, actualTotal };
        };
        const income = calculateTotals(target.pendapatan || []);
        const expenses = calculateTotals([
            ...(target.pengeluaranUtama || []),
            ...(target.kebutuhan || []),
            ...(target.penunjang || []),
            ...(target.pendidikan || []),
            ...(target.cicilanUtang || [])
        ]);
        const savings = calculateTotals(target.tabungan || []);
        
        const isAchieved = income.actualTotal >= income.targetTotal && expenses.actualTotal <= expenses.targetTotal && savings.actualTotal >= savings.targetTotal;

        return { income, expenses, savings, isAchieved };
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
        <div className={`rounded-2xl shadow-md border ${statusStyles.container} transition-all duration-300`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">{monthName}</h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles.badge}`}>
                            <i className={`fa-solid ${statusStyles.icon} mr-1.5`}></i>
                            {summary.isAchieved ? 'Target Tercapai' : 'Tidak Tercapai'}
                        </span>
                    </div>
                    <i className={`fa-solid fa-chevron-down text-[var(--text-tertiary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
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
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-[var(--border-primary)]">
                    <ActualsDetail report={report} />
                </div>
            </div>
        </div>
    );
};

interface ActualsHistoryProps {
    archives: ArchivedActualReport[];
    setView: (view: View) => void;
}

const ActualsHistory: React.FC<ActualsHistoryProps> = ({ archives, setView }) => {
  const sortedArchives = [...archives].sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(View.REPORT)} className="text-[var(--text-secondary)]">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Riwayat Laporan Aktual</h1>
      </div>

      {sortedArchives.length > 0 ? (
        <div className="space-y-4 pb-20">
            {sortedArchives.map(archive => (
                <ActualsReportCard key={archive.monthYear} report={archive} />
            ))}
        </div>
       ) : (
        <div className="text-center p-8 bg-[var(--bg-secondary)] rounded-2xl">
            <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
            <p className="text-[var(--text-tertiary)]">Belum ada riwayat laporan aktual yang tersimpan.</p>
        </div>
      )}
    </div>
  );
};

export default ActualsHistory;