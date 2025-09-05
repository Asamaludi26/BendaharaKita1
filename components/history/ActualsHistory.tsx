// FIX: Implement ActualsHistory component to resolve module error.
import React from 'react';
import { View, ArchivedActualReport, MonthlyTarget, TargetFormField } from '../../types';
import { AccordionSection } from '../AccordionSection';

interface ActualsHistoryProps {
  archives: ArchivedActualReport[];
  setView: (view: View) => void;
}

const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) || 0 : value;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

const getDifferenceClass = (actual: number, target: number, isIncome = false) => {
    if (isIncome) {
        if (actual >= target) return 'text-green-500';
        return 'text-red-500';
    }
    // For expenses, lower is better
    if (actual <= target) return 'text-green-500';
    return 'text-red-500';
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
        { key: 'tabungan', title: 'Tabungan', isIncome: true }, // Treat savings like income (more is better)
    ];

    return (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {sections.map(sectionInfo => {
                const items = target[sectionInfo.key];
                if (!items || items.length === 0) return null;
                
                const totalTarget = items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
                const totalActual = items.reduce((sum, item) => sum + (parseInt(actuals[item.id]) || 0), 0);

                return (
                    <div key={sectionInfo.key}>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{sectionInfo.title}</h4>
                        <ul className="space-y-1 text-sm">
                             <li className="grid grid-cols-3 gap-4 font-semibold text-gray-500 dark:text-gray-400 text-xs mb-1">
                                <span className="col-span-1">Item</span>
                                <span className="text-right">Target</span>
                                <span className="text-right">Aktual</span>
                            </li>
                            {items.map((item: TargetFormField) => {
                                const actualAmount = parseInt(actuals[item.id] || '0');
                                const targetAmount = parseInt(item.amount || '0');
                                return (
                                <li key={item.id} className="grid grid-cols-3 gap-4 items-center text-gray-600 dark:text-gray-400">
                                    <span className="col-span-1 truncate">{item.name}</span>
                                    <span className="font-mono text-right">{formatCurrency(targetAmount)}</span>
                                    <span className={`font-mono font-semibold text-right ${getDifferenceClass(actualAmount, targetAmount, sectionInfo.isIncome)}`}>
                                        {formatCurrency(actualAmount)}
                                    </span>
                                </li>
                            )})}
                        </ul>
                         <div className="grid grid-cols-3 gap-4 font-bold text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                           <span className="col-span-1">Total</span>
                           <span className="text-right">{formatCurrency(totalTarget)}</span>
                           <span className={`text-right ${getDifferenceClass(totalActual, totalTarget, sectionInfo.isIncome)}`}>{formatCurrency(totalActual)}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


const ActualsHistory: React.FC<ActualsHistoryProps> = ({ archives, setView }) => {
  const sortedArchives = [...archives].sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(View.REPORT)} className="text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Riwayat Laporan Aktual</h1>
      </div>

      {sortedArchives.length > 0 ? (
        <div className="space-y-3 pb-20">
            {sortedArchives.map(archive => {
                const [year, month] = archive.monthYear.split('-');
                const date = new Date(Number(year), Number(month) - 1);
                const monthName = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

                return (
                    <AccordionSection key={archive.monthYear} title={monthName}>
                        <ActualsDetail report={archive} />
                    </AccordionSection>
                );
            })}
        </div>
       ) : (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl">
            <i className="fa-solid fa-folder-open text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">Belum ada riwayat laporan aktual yang tersimpan.</p>
        </div>
      )}
    </div>
  );
};

export default ActualsHistory;
