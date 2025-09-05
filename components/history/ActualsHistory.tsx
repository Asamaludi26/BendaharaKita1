import React, { useState, useMemo } from 'react';
import { View, ArchivedActualReport, MonthlyTarget } from '../../types';
import { AccordionSection } from '../AccordionSection';

interface ActualsHistoryProps {
  archives: ArchivedActualReport[];
  setView: (view: View) => void;
}

const ReadOnlyActualsSection: React.FC<{ 
    title: string; 
    items: { name: string; amount: string }[];
    actuals: { [key: string]: string };
    itemIds: string[];
}> = ({ title, items, actuals, itemIds }) => (
    <AccordionSection title={title} isOpen={title === 'Pendapatan'}>
        <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 px-2">
                <label className="col-span-6 text-xs font-semibold text-slate-400">ITEM</label>
                <label className="col-span-3 text-xs font-semibold text-slate-400 text-right">TARGET</label>
                <label className="col-span-3 text-xs font-semibold text-slate-400 text-right">AKTUAL</label>
            </div>
            {items.map((item, index) => {
                const actualAmount = actuals[itemIds[index]] || '0';
                const targetAmount = parseInt(item.amount);
                const isExceeded = parseInt(actualAmount) > targetAmount && title !== 'Pendapatan';
                return (
                    <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-slate-700/50 border border-slate-600 rounded-md">
                        <p className="col-span-6 text-slate-300">{item.name}</p>
                        <p className="col-span-3 text-slate-300 text-right">Rp {targetAmount.toLocaleString('id-ID')}</p>
                        <p className={`col-span-3 text-right font-semibold ${isExceeded ? 'text-red-400' : 'text-green-400'}`}>
                            Rp {parseInt(actualAmount).toLocaleString('id-ID')}
                        </p>
                    </div>
                );
            })}
        </div>
    </AccordionSection>
);

const ActualsHistory: React.FC<ActualsHistoryProps> = ({ archives, setView }) => {
  const [displayDate, setDisplayDate] = useState(new Date());

  const handlePrevMonth = () => setDisplayDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; });
  const handleNextMonth = () => setDisplayDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; });

  const now = new Date();
  const isNextMonthDisabled = displayDate.getFullYear() > now.getFullYear() || 
                             (displayDate.getFullYear() === now.getFullYear() && displayDate.getMonth() >= now.getMonth());

  const selectedReport = useMemo(() => {
    const monthYear = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;
    return archives.find(a => a.monthYear === monthYear);
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Riwayat Laporan Aktual</h1>
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
        {selectedReport ? (
          <>
            <ReadOnlyActualsSection title="Pendapatan" items={selectedReport.target.pendapatan} actuals={selectedReport.actuals} itemIds={selectedReport.target.pendapatan.map(i => i.id)} />
            <ReadOnlyActualsSection title="Cicilan Utang" items={selectedReport.target.cicilanUtang} actuals={selectedReport.actuals} itemIds={selectedReport.target.cicilanUtang.map(i => i.id)} />
            <ReadOnlyActualsSection title="Pengeluaran Utama" items={selectedReport.target.pengeluaranUtama} actuals={selectedReport.actuals} itemIds={selectedReport.target.pengeluaranUtama.map(i => i.id)} />
            <ReadOnlyActualsSection title="Kebutuhan" items={selectedReport.target.kebutuhan} actuals={selectedReport.actuals} itemIds={selectedReport.target.kebutuhan.map(i => i.id)} />
            <ReadOnlyActualsSection title="Penunjang" items={selectedReport.target.penunjang} actuals={selectedReport.actuals} itemIds={selectedReport.target.penunjang.map(i => i.id)} />
            <ReadOnlyActualsSection title="Pendidikan" items={selectedReport.target.pendidikan} actuals={selectedReport.actuals} itemIds={selectedReport.target.pendidikan.map(i => i.id)} />
            <ReadOnlyActualsSection title="Tujuan Tabungan" items={selectedReport.target.tabungan} actuals={selectedReport.actuals} itemIds={selectedReport.target.tabungan.map(i => i.id)} />
          </>
        ) : (
          <div className="text-center p-8">
            <i className="fa-solid fa-folder-open text-5xl text-slate-500 mb-4"></i>
            <p className="text-slate-400">Tidak ada data laporan untuk bulan ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActualsHistory;