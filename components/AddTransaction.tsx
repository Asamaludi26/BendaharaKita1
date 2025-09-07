

import React, { useState, useEffect, useMemo } from 'react';
import { MonthlyTarget, View } from '../types';
import { AccordionSection } from './AccordionSection';

interface AddTransactionProps {
  setView: (view: View) => void;
  onSave: (data: { [key: string]: string }) => void;
  monthlyTarget: MonthlyTarget | null;
}

const sectionAccentColors: { [key in keyof MonthlyTarget]: string } = {
  pendapatan: 'border-l-[var(--color-income)]',
  cicilanUtang: 'border-l-[var(--color-debt)]',
  pengeluaranUtama: 'border-l-[var(--color-expense)]',
  kebutuhan: 'border-l-[var(--color-expense)]',
  penunjang: 'border-l-[var(--color-expense)]',
  pendidikan: 'border-l-[var(--color-expense)]',
  tabungan: 'border-l-[var(--color-savings)]',
};

const AddTransaction: React.FC<AddTransactionProps> = ({ setView, onSave, monthlyTarget }) => {
  const [actualsData, setActualsData] = useState<{ [key: string]: string }>({});
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (monthlyTarget) {
      const initialState: { [key: string]: string } = {};
      (Object.keys(monthlyTarget) as Array<keyof MonthlyTarget>).forEach(sectionKey => {
        const section = monthlyTarget[sectionKey];
        if (Array.isArray(section)) {
            section.forEach(item => {
                initialState[item.id] = '';
            });
        }
      });
      setActualsData(initialState);
      setCheckedItems(new Set());
    }
  }, [monthlyTarget]);

  const handleActualChange = (id: string, value: string, targetAmount: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setActualsData(prev => ({ ...prev, [id]: numericValue }));

    if (numericValue !== targetAmount) {
      setCheckedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCheckboxChange = (id: string, targetAmount: string, isChecked: boolean) => {
    if (isChecked) {
      setActualsData(prev => ({ ...prev, [id]: targetAmount }));
      setCheckedItems(prev => new Set(prev).add(id));
    } else {
      // When unchecked, reset the actual value to 0 (represented by an empty string)
      setActualsData(prev => ({ ...prev, [id]: '' }));
      setCheckedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(actualsData);
  };
  
  if (!monthlyTarget) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center h-full text-center">
         <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl shadow-2xl max-w-sm">
             <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Target Bulanan Belum Dibuat</h2>
             <p className="text-[var(--text-secondary)] mb-6">Anda harus membuat "Target Bulanan" terlebih dahulu sebelum bisa mengisi Laporan Aktual.</p>
             <button
                type="button"
                onClick={() => setView(View.ADD_TARGET)}
                className="w-full bg-[var(--primary-600)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-[var(--primary-700)] transition-colors"
            >
                Buat Target Sekarang
            </button>
         </div>
      </div>
    );
  }
  
  const calculateTotals = (sectionKey: keyof MonthlyTarget) => {
    const sectionItems = monthlyTarget ? monthlyTarget[sectionKey] : [];
    const totalTarget = sectionItems.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
    const totalActual = sectionItems.reduce((sum, item) => sum + (parseInt(actualsData[item.id]) || 0), 0);
    return { totalTarget, totalActual };
  };

  const renderSection = (sectionKey: keyof MonthlyTarget, title: string) => {
    const { totalTarget, totalActual } = calculateTotals(sectionKey);
    const totalColorClass = totalActual >= totalTarget ? 'text-green-500' : 'text-red-500';
    const difference = totalActual - totalTarget;

    return (
      <AccordionSection title={title} isOpen={sectionKey === 'pendapatan'} headerClassName={`border-l-4 ${sectionAccentColors[sectionKey]}`}>
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 px-2 items-center">
            <label className="col-span-5 text-xs font-semibold text-[var(--text-tertiary)]">ITEM</label>
            <label className="col-span-3 text-xs font-semibold text-[var(--text-tertiary)] text-right">TARGET</label>
            <label className="col-span-1 text-xs font-semibold text-[var(--text-tertiary)] text-center">
                <i className="fa-solid fa-check"></i>
            </label>
            <label className="col-span-3 text-xs font-semibold text-[var(--text-tertiary)] text-right">AKTUAL</label>
          </div>
          {monthlyTarget[sectionKey].map((field) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-5 p-2 bg-[var(--bg-interactive)] border border-transparent rounded-md text-[var(--text-secondary)] truncate">{field.name}</span>
              <span className="col-span-3 p-2 bg-[var(--bg-interactive)] border border-transparent rounded-md text-[var(--text-secondary)] text-right">Rp {parseInt(field.amount || '0').toLocaleString('id-ID')}</span>
              <div className="col-span-1 flex justify-center relative group">
                <input
                    type="checkbox"
                    checked={checkedItems.has(field.id)}
                    onChange={(e) => handleCheckboxChange(field.id, field.amount, e.target.checked)}
                    className="w-5 h-5 rounded text-[var(--primary-500)] bg-[var(--bg-interactive)] border-[var(--border-primary)] focus:ring-[var(--primary-500)] cursor-pointer"
                />
                <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-900 text-white text-center text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10 invisible group-hover:visible">
                    Centang jika aktual sama dengan target
                    <div className="w-3 h-3 bg-gray-900 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={(actualsData[field.id] && parseInt(actualsData[field.id])) ? parseInt(actualsData[field.id] || '0').toLocaleString('id-ID') : actualsData[field.id]}
                onChange={(e) => handleActualChange(field.id, e.target.value, field.amount)}
                className="col-span-3 p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent text-right text-[var(--text-primary)]"
              />
            </div>
          ))}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-primary)]">
             <span className="font-bold text-[var(--text-primary)]">TOTAL</span>
             <div className="flex flex-col items-end">
                <div className="flex items-center space-x-4">
                    <span className="text-lg text-[var(--text-secondary)] font-bold">Rp {totalTarget.toLocaleString('id-ID')}</span>
                    <span className={`text-lg font-bold ${totalColorClass}`}>Rp {totalActual.toLocaleString('id-ID')}</span>
                </div>
                {difference !== 0 && (
                    <p className={`text-xs mt-1 font-medium ${difference > 0 ? 'text-green-500/80' : 'text-red-500/80'}`}>
                        (Rp {Math.abs(difference).toLocaleString('id-ID')} {difference > 0 ? 'di atas target' : 'di bawah target'})
                    </p>
                )}
             </div>
          </div>
        </div>
      </AccordionSection>
    );
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center space-x-4">
        <button onClick={() => setView(View.REPORT)} className="text-[var(--text-secondary)]">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Laporan Aktual</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-tertiary)] mb-2 border-b border-[var(--border-primary)] pb-2">1. Pendapatan Bulanan</h2>
                {renderSection('pendapatan', 'Rincian Pendapatan')}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-tertiary)] mb-2 border-b border-[var(--border-primary)] pb-2">2. Rincian Utang Bulanan (Pembayaran Cicilan)</h2>
                {renderSection('cicilanUtang', 'Rincian Cicilan Utang')}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-tertiary)] mb-2 border-b border-[var(--border-primary)] pb-2">3. Rincian Pengeluaran Bulanan (Non-Utang)</h2>
                <div className="space-y-3">
                  {renderSection('pengeluaranUtama', 'Pengeluaran Utama')}
                  {renderSection('kebutuhan', 'Kebutuhan')}
                  {renderSection('penunjang', 'Penunjang')}
                  {renderSection('pendidikan', 'Pendidikan')}
                </div>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-tertiary)] mb-2 border-b border-[var(--border-primary)] pb-2">4. Rincian Tabungan Bulanan</h2>
                {renderSection('tabungan', 'Tujuan Tabungan')}
            </div>
        </div>
        
        <div className="pt-4 pb-20"> {/* Padding bottom to clear bottom nav */}
            <button type="submit" className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                Simpan Laporan Aktual
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransaction;