import React, { useState, useMemo } from 'react';
import { AddTargetFormData, TargetFormField, View } from '../types';
import { AccordionSection } from './AccordionSection';

interface AddTargetFormProps {
  setView: (view: View) => void;
  onSave: (data: AddTargetFormData) => void;
}

// FIX: Initialized form data with at least one entry per section to provide a default structure.
const initialFormData: AddTargetFormData = {
  pendapatan: [{ id: `pendapatan-${Date.now()}`, name: 'Gaji', amount: '' }],
  cicilanUtang: [{ id: `cicilanUtang-${Date.now()}`, name: 'Cicilan Motor', amount: '' }],
  pengeluaranUtama: [{ id: `pengeluaranUtama-${Date.now()}`, name: 'Sewa Rumah', amount: '' }],
  kebutuhan: [{ id: `kebutuhan-${Date.now()}`, name: 'Makan Harian', amount: '' }],
  penunjang: [{ id: `penunjang-${Date.now()}`, name: 'Transportasi', amount: '' }],
  pendidikan: [{ id: `pendidikan-${Date.now()}`, name: 'Kursus', amount: '' }],
  tabungan: [{ id: `tabungan-${Date.now()}`, name: 'Dana Darurat', amount: '' }],
};

const sectionAccentColors: { [key in keyof AddTargetFormData]: string } = {
  pendapatan: 'border-l-[var(--color-income)]',
  cicilanUtang: 'border-l-[var(--color-debt)]',
  pengeluaranUtama: 'border-l-[var(--color-expense)]',
  kebutuhan: 'border-l-[var(--color-expense)]',
  penunjang: 'border-l-[var(--color-expense)]',
  pendidikan: 'border-l-[var(--color-expense)]',
  tabungan: 'border-l-[var(--color-savings)]',
};

const AddTargetForm: React.FC<AddTargetFormProps> = ({ setView, onSave }) => {
  const [formData, setFormData] = useState<AddTargetFormData>(initialFormData);

  const handleFieldChange = (
    section: keyof AddTargetFormData, 
    index: number, 
    field: 'name' | 'amount', 
    value: string
  ) => {
    const updatedSection = [...formData[section]];
    const itemToUpdate = { ...updatedSection[index] };
    if (field === 'name') {
        itemToUpdate.name = value;
    } else if (field === 'amount') {
        // Allow only numeric input
        itemToUpdate.amount = value.replace(/[^0-9]/g, '');
    }
    updatedSection[index] = itemToUpdate;
    setFormData(prev => ({ ...prev, [section]: updatedSection }));
  };

  const addField = (section: keyof AddTargetFormData) => {
    const newField: TargetFormField = {
      id: `${section}-${Date.now()}`,
      name: '',
      amount: '',
    };
    setFormData(prev => ({ ...prev, [section]: [...prev[section], newField] }));
  };

  const removeField = (section: keyof AddTargetFormData, index: number) => {
    if (formData[section].length <= 1) return; // Prevent removing the last item
    const updatedSection = formData[section].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [section]: updatedSection }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const totals = useMemo(() => {
    const calculatedTotals: { [key in keyof AddTargetFormData]?: number } = {};
    for (const sectionKey in formData) {
      const key = sectionKey as keyof AddTargetFormData;
      calculatedTotals[key] = formData[key].reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
    }
    return calculatedTotals;
  }, [formData]);

  const totalPendapatan = totals.pendapatan || 0;
  const totalPengeluaran = (totals.cicilanUtang || 0) + (totals.pengeluaranUtama || 0) + (totals.kebutuhan || 0) + (totals.penunjang || 0) + (totals.pendidikan || 0) + (totals.tabungan || 0);
  const sisa = totalPendapatan - totalPengeluaran;

  const renderSection = (section: keyof AddTargetFormData, title: string) => (
    <AccordionSection title={title} isOpen={section === 'pendapatan'} headerClassName={`border-l-4 ${sectionAccentColors[section]}`}>
      <div className="space-y-3">
        {formData[section].map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
            <input 
              type="text" 
              placeholder="Nama Item" 
              value={field.name}
              onChange={(e) => handleFieldChange(section, index, 'name', e.target.value)}
              className="col-span-7 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={field.amount ? parseInt(field.amount).toLocaleString('id-ID') : ''}
              onChange={(e) => handleFieldChange(section, index, 'amount', e.target.value)}
              className="col-span-4 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent text-right"
            />
             <button
              type="button"
              onClick={() => removeField(section, index)}
              className={`col-span-1 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={formData[section].length <= 1}
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        ))}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
                type="button" 
                onClick={() => addField(section)} 
                className="text-sm font-semibold text-[var(--primary-500)] hover:text-[var(--primary-600)] transition-colors"
            >
                <i className="fa-solid fa-plus mr-2"></i>Tambah Item
            </button>
            <div className="font-bold text-gray-700 dark:text-gray-200">
                <span>TOTAL: </span>
                <span className="text-lg text-gray-800 dark:text-white">Rp {totals[section]?.toLocaleString('id-ID') || 0}</span>
            </div>
        </div>
      </div>
    </AccordionSection>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
       <header className="flex items-center space-x-4">
        <button onClick={() => setView(View.REPORT)} className="text-gray-500 dark:text-gray-400">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Target Bulanan</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">1. Pendapatan Bulanan</h2>
                {renderSection('pendapatan', 'Rincian Pendapatan')}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">2. Rincian Utang Bulanan (Pembayaran Cicilan)</h2>
                {renderSection('cicilanUtang', 'Rincian Cicilan Utang')}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">3. Rincian Pengeluaran Bulanan (Non-Utang)</h2>
                <div className="space-y-3">
                  {renderSection('pengeluaranUtama', 'Pengeluaran Utama')}
                  {renderSection('kebutuhan', 'Kebutuhan')}
                  {renderSection('penunjang', 'Penunjang')}
                  {renderSection('pendidikan', 'Pendidikan')}
                </div>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">4. Rincian Tabungan Bulanan</h2>
                {renderSection('tabungan', 'Tujuan Tabungan')}
            </div>
        </div>

        <div className="sticky bottom-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Pendapatan</p>
                <p className="text-lg font-bold text-green-500">Rp {totalPendapatan.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Pengeluaran</p>
                <p className="text-lg font-bold text-red-500">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sisa Uang</p>
                <p className={`text-lg font-bold ${sisa >= 0 ? 'text-blue-500' : 'text-yellow-500'}`}>Rp {sisa.toLocaleString('id-ID')}</p>
            </div>
        </div>
        
        <div className="pt-4 pb-20"> {/* Padding bottom to clear bottom nav */}
            <button type="submit" className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                Simpan Target Bulanan
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddTargetForm;