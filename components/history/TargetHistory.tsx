import React, { useState, useMemo } from 'react';
import { View, ArchivedMonthlyTarget, MonthlyTarget, TargetFormField } from '../../types';

const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseInt(value) || 0 : value;
    return `Rp ${num.toLocaleString('id-ID')}`;
};

const TargetDetail: React.FC<{ target: MonthlyTarget }> = ({ target }) => {
    const sections: { key: keyof MonthlyTarget, title: string }[] = [
        { key: 'pendapatan', title: 'Pendapatan' },
        { key: 'cicilanUtang', title: 'Cicilan Utang' },
        { key: 'pengeluaranUtama', title: 'Pengeluaran Utama' },
        { key: 'kebutuhan', title: 'Kebutuhan' },
        { key: 'penunjang', title: 'Penunjang' },
        { key: 'pendidikan', title: 'Pendidikan' },
        { key: 'tabungan', title: 'Tabungan' },
    ];

    return (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50">
            {sections.map(sectionInfo => {
                const items = target[sectionInfo.key];
                if (!items || items.length === 0) return null;
                const total = items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
                return (
                    <div key={sectionInfo.key}>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{sectionInfo.title}</h4>
                        <ul className="space-y-1 text-sm">
                            {items.map((item: TargetFormField) => (
                                <li key={item.id} className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                    <span>{item.name}</span>
                                    <span className="font-mono">{formatCurrency(item.amount)}</span>
                                </li>
                            ))}
                        </ul>
                         <div className="flex justify-end font-bold text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                           <span>Total: {formatCurrency(total)}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const TargetReportCard: React.FC<{ archive: ArchivedMonthlyTarget }> = ({ archive }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { target, monthYear } = archive;

    const summary = useMemo(() => {
        const calculateTotal = (items: TargetFormField[]) => items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
        
        const income = calculateTotal(target.pendapatan || []);
        const expenses = calculateTotal([
            ...(target.pengeluaranUtama || []),
            ...(target.kebutuhan || []),
            ...(target.penunjang || []),
            ...(target.pendidikan || []),
            ...(target.cicilanUtang || [])
        ]);
        const savings = calculateTotal(target.tabungan || []);
        
        return { income, expenses, savings };
    }, [target]);

    const [year, month] = monthYear.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    const monthName = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    return (
        <div className="rounded-2xl shadow-md border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{monthName}</h3>
                    <i className={`fa-solid fa-chevron-down text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                </div>
                {/* Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <div><strong>Pemasukan:</strong> <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(summary.income)}</span></div>
                    <div><strong>Pengeluaran:</strong> <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(summary.expenses)}</span></div>
                    <div><strong>Tabungan:</strong> <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(summary.savings)}</span></div>
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-gray-200 dark:border-gray-700">
                    <TargetDetail target={target} />
                </div>
            </div>
        </div>
    );
};

// FIX: Added TargetHistoryProps interface to define component props.
interface TargetHistoryProps {
    archives: ArchivedMonthlyTarget[];
    setView: (view: View) => void;
}

const TargetHistory: React.FC<TargetHistoryProps> = ({ archives, setView }) => {
  const sortedArchives = [...archives].sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={() => setView(View.REPORT)} className="text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Riwayat Target Bulanan</h1>
      </div>

      {sortedArchives.length > 0 ? (
        <div className="space-y-4 pb-20">
            {sortedArchives.map(archive => (
                <TargetReportCard key={archive.monthYear} archive={archive} />
            ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl">
            <i className="fa-solid fa-folder-open text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">Belum ada riwayat target yang tersimpan.</p>
        </div>
      )}
    </div>
  );
};

export default TargetHistory;