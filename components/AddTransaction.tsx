import React, { useState, useEffect } from 'react';
import { MonthlyTarget } from '../types';
import { AccordionSection } from './AccordionSection';

interface AddTransactionProps {
  onClose: () => void;
  onSave: (data: { [key: string]: string }) => void;
  monthlyTarget: MonthlyTarget | null;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ onClose, onSave, monthlyTarget }) => {
  const [actualsData, setActualsData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Pre-fill state with empty strings for each target item
    if (monthlyTarget) {
      const initialState: { [key: string]: string } = {};
      Object.values(monthlyTarget).forEach(section => {
        section.forEach(item => {
          initialState[item.id] = '';
        });
      });
      setActualsData(initialState);
    }
  }, [monthlyTarget]);

  const handleActualChange = (id: string, value: string) => {
    setActualsData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(actualsData);
  };
  
  if (!monthlyTarget) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center" aria-modal="true" role="dialog">
         <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm text-center animate-fade-in">
             <h2 className="text-2xl font-bold text-white mb-4">Target Bulanan Belum Dibuat</h2>
             <p className="text-slate-300 mb-6">Anda harus membuat "Target Bulanan" terlebih dahulu sebelum bisa mengisi Laporan Aktual.</p>
             <button
                type="button"
                onClick={onClose}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            >
                Mengerti
            </button>
         </div>
          <style>{`
              @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
              .animate-fade-in { animation: fade-in 0.3s ease-out; }
          `}</style>
      </div>
    );
  }

  const renderSection = (section: keyof MonthlyTarget, title: string) => (
    <AccordionSection title={title} isOpen={section === 'pendapatan'}>
      <div className="space-y-3">
         <div className="grid grid-cols-12 gap-2 px-2">
            <label className="col-span-6 text-xs font-semibold text-slate-400">ITEM</label>
            <label className="col-span-3 text-xs font-semibold text-slate-400 text-right">TARGET</label>
            <label className="col-span-3 text-xs font-semibold text-slate-400 text-right">AKTUAL</label>
         </div>
        {monthlyTarget[section].map((field) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
            <input 
              type="text" 
              value={field.name}
              readOnly
              className="col-span-6 p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300 focus:outline-none"
            />
            <input 
              type="number" 
              value={field.amount}
              readOnly
              className="col-span-3 p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300 text-right focus:outline-none"
            />
            <input 
              type="number" 
              placeholder="0"
              value={actualsData[field.id] || ''}
              onChange={(e) => handleActualChange(field.id, e.target.value)}
              className="col-span-3 p-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
            />
          </div>
        ))}
      </div>
    </AccordionSection>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <form onSubmit={handleSubmit} className="bg-slate-800 w-full max-w-3xl h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Laporan Aktual</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Tutup">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 space-y-3">
          {renderSection('pendapatan', 'Pendapatan')}
          {renderSection('cicilanUtang', 'Cicilan Utang')}
          {renderSection('pengeluaranUtama', 'Pengeluaran Utama')}
          {renderSection('kebutuhan', 'Kebutuhan')}
          {renderSection('penunjang', 'Penunjang')}
          {renderSection('tabungan', 'Tujuan Tabungan')}
        </main>
        
        <footer className="p-4 border-t border-slate-700 flex-shrink-0 bg-slate-800/80 backdrop-blur-sm rounded-b-2xl">
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            Simpan Laporan Aktual
          </button>
        </footer>
      </form>
      <style>{`
          @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AddTransaction;