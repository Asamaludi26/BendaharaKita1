import React, { useState, useMemo } from 'react';
import { View, ArchivedMonthlyTarget, MonthlyTarget } from '../../types';
import { AccordionSection } from '../AccordionSection';

interface TargetHistoryProps {
  archives: ArchivedMonthlyTarget[];
  setView: (view: View) => void;
}

const ReadOnlySection: React.FC<{ title: string; items: { name: string; amount: string }[] }> = ({ title, items }) => (
    <AccordionSection title={title} isOpen={title === 'Pendapatan'}>
        <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 px-2">
                <label className="col-span-8 text-xs font-semibold text-slate-400">ITEM</label>
                <label className="col-span-4 text-xs font-semibold text-slate-400 text-right">JUMLAH TARGET</label>
            </div>
            {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-slate-700/50 border border-slate-600 rounded-md">
                    <p className="col-span-8 text-slate-300">{item.name}</p>
                    <p className="col-span-4 text-slate-300 text-right">Rp {parseInt(item.amount).toLocaleString('id-ID')}</p>
                </div>
            ))}
        </div>
    </AccordionSection>
);

const TargetHistory: React.FC<TargetHistoryProps> = ({ archives, setView }) => {
  const [displayDate, setDisplayDate] = useState(new Date());

  const handlePrevMonth = () => {
    setDisplayDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
    });
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
    });
  };

  const now = new Date();
  const isNextMonthDisabled = displayDate.getFullYear() > now.getFullYear() || 
                             (displayDate.getFullYear() === now.getFullYear() && displayDate.getMonth() >= now.getMonth());

  const selectedTarget = useMemo(() => {
    const monthYear = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;
    return archives.find(a => a.monthYear === monthYear)?.target;
  }, [archives, displayDate]);

  const monthYearFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <button onClick={() => setView(View.MANAGEMENT)} className="text-gray-500 dark:text-gray-400">
                <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Riwayat Target Bulanan</h1>
                <p className="text-gray-500 dark:text-gray-400">{monthYearFormatter.format(displayDate)}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors shadow-sm">
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button onClick={handleNextMonth} disabled={isNextMonthDisabled} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        </div>
      </header>

      <div className="bg-slate-800 w-full rounded-2xl shadow-2xl p-4 space-y-3">
        {selectedTarget ? (
          <>
            <ReadOnlySection title="Pendapatan" items={selectedTarget.pendapatan} />
            <ReadOnlySection title="Cicilan Utang" items={selectedTarget.cicilanUtang} />
            <ReadOnlySection title="Pengeluaran Utama" items={selectedTarget.pengeluaranUtama} />
            <ReadOnlySection title="Kebutuhan" items={selectedTarget.kebutuhan} />
            <ReadOnlySection title="Penunjang" items={selectedTarget.penunjang} />
            <ReadOnlySection title="Pendidikan" items={selectedTarget.pendidikan} />
            <ReadOnlySection title="Tujuan Tabungan" items={selectedTarget.tabungan} />
          </>
        ) : (
          <div className="text-center p-8">
            <i className="fa-solid fa-folder-open text-5xl text-slate-500 mb-4"></i>
            <p className="text-slate-400">Tidak ada data target untuk bulan ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetHistory;