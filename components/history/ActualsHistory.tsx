import React from 'react';
import { View, ArchivedActualReport } from '../../types';

interface ActualsHistoryProps {
  archives: ArchivedActualReport[];
  setView: (view: View) => void;
}

const calculateActualTotals = (report: ArchivedActualReport) => {
    let totalPendapatan = 0;
    let totalPengeluaranNonTabungan = 0;
    let totalTabungan = 0;
    
    const { actuals, target } = report;

    target.pendapatan.forEach(item => {
        totalPendapatan += parseInt(actuals[item.id] || '0');
    });

    [
        ...target.cicilanUtang,
        ...target.pengeluaranUtama,
        ...target.kebutuhan,
        ...target.penunjang,
        ...target.pendidikan,
    ].forEach(item => {
        totalPengeluaranNonTabungan += parseInt(actuals[item.id] || '0');
    });

    target.tabungan.forEach(item => {
        totalTabungan += parseInt(actuals[item.id] || '0');
    });

    const totalPengeluaran = totalPengeluaranNonTabungan + totalTabungan;
    const sisa = totalPendapatan - totalPengeluaran;

    return { totalPendapatan, totalPengeluaran, totalTabungan, sisa };
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

      <div className="space-y-4 pb-20">
        {sortedArchives.length > 0 ? (
          sortedArchives.map(report => {
            const { monthYear } = report;
            const totals = calculateActualTotals(report);
            const date = new Date(`${monthYear}-02`); // Use day 2 to avoid timezone issues
            const monthYearFormatted = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
            
            return (
              <div key={monthYear} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 space-y-3">
                <h2 className="font-bold text-lg text-gray-800 dark:text-white">{monthYearFormatted}</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aktual Pendapatan</p>
                        <p className="font-bold text-green-500">Rp {totals.totalPendapatan.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aktual Pengeluaran</p>
                        <p className="font-bold text-red-500">Rp {totals.totalPengeluaran.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Aktual Tabungan</p>
                        <p className="font-bold text-blue-500">Rp {totals.totalTabungan.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sisa Uang (Aktual)</p>
                        <p className={`font-bold ${totals.sisa >= 0 ? 'text-gray-700 dark:text-gray-300' : 'text-yellow-500'}`}>Rp {totals.sisa.toLocaleString('id-ID')}</p>
                    </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 pt-8">Tidak ada riwayat laporan aktual yang tersimpan.</p>
        )}
      </div>
    </div>
  );
};

export default ActualsHistory;
