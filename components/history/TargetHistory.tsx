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
        { key: 'tabungan', title: 'Tabungan' },
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
                const total = items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
                return (
                    <div key={sectionInfo.key}>
                        <h4 className="font-semibold text-[var(--text-secondary)] mb-2">{sectionInfo.title}</h4>
                        <ul className="space-y-1 text-sm">
                            {items.map((item: TargetFormField) => (
                                <li key={item.id} className="flex justify-between items-center text-[var(--text-tertiary)]">
                                    <span>{item.name}</span>
                                    <span className="font-mono">{formatCurrency(item.amount)}</span>
                                </li>
                            ))}
                        </ul>
                         <div className="flex justify-end font-bold text-sm mt-2 pt-2 border-t border-[var(--border-primary)] text-[var(--text-secondary)]">
                           <span>Total: {formatCurrency(total)}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const TargetReportCard: React.FC<{ archive: ArchivedMonthlyTarget }> = ({ archive }) => {
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
        <details className="group rounded-2xl shadow-md border bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[var(--primary-glow)] transition-all duration-300 overflow-hidden">
            <summary className="list-none p-4 cursor-pointer">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">{monthName}</h3>
                    <i className={`fa-solid fa-chevron-down text-[var(--text-tertiary)] transition-transform duration-300 group-open:rotate-180`}></i>
                </div>
                {/* Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mt-3 text-xs text-[var(--text-tertiary)]">
                    <div><strong>Pemasukan:</strong> <span className="font-semibold text-[var(--color-income)]">{formatCurrency(summary.income)}</span></div>
                    <div><strong>Pengeluaran:</strong> <span className="font-semibold text-[var(--color-expense)]">{formatCurrency(summary.expenses)}</span></div>
                    <div><strong>Tabungan:</strong> <span className="font-semibold text-[var(--color-savings)]">{formatCurrency(summary.savings)}</span></div>
                </div>
            </summary>
            <div className="border-t border-[var(--border-primary)]">
                <TargetDetail target={target} />
            </div>
        </details>
    );
};

interface TargetHistoryProps {
    archives: ArchivedMonthlyTarget[];
    setView: (view: View) => void;
}

const TargetHistory: React.FC<TargetHistoryProps> = ({ archives, setView }) => {
  const sortedArchives = [...archives].sort((a, b) => b.monthYear.localeCompare(a.monthYear));

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      <header className="flex items-center space-x-4">
        <button onClick={() => setView(View.DASHBOARD)} className="w-10 h-10 rounded-full bg-[var(--bg-interactive)] text-[var(--text-tertiary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]">
            <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Riwayat Target Bulanan</h1>
            <p className="text-[var(--text-tertiary)]">Lihat semua rencana keuangan Anda dari bulan-bulan sebelumnya.</p>
        </div>
      </header>

      {sortedArchives.length > 0 ? (
        <div className="space-y-4 pb-20">
            {sortedArchives.map(archive => (
                <TargetReportCard key={archive.monthYear} archive={archive} />
            ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-[var(--bg-secondary)] rounded-2xl mt-8">
            <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
            <p className="text-[var(--text-primary)] font-semibold">Riwayat Kosong</p>
            <p className="text-[var(--text-tertiary)]">Belum ada riwayat target yang tersimpan.</p>
        </div>
      )}
    </div>
  );
};

export default TargetHistory;