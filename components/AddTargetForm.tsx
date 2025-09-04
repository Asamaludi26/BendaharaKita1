import React, { useState } from 'react';
import { AddTargetFormData, TargetFormField } from '../types';
import { AccordionSection } from './AccordionSection';

interface AddTargetFormProps {
  onClose: () => void;
  onSave: (data: AddTargetFormData) => void;
}

const initialFormData: AddTargetFormData = {
  pendapatan: [{ id: `pendapatan-${Date.now()}`, name: 'Gaji', amount: '5000000' }],
  cicilanUtang: [{ id: `cicilanUtang-${Date.now()}`, name: 'Cicilan Motor', amount: '750000' }],
  pengeluaranUtama: [{ id: `pengeluaranUtama-${Date.now()}`, name: 'Sewa Rumah', amount: '900000' }],
  kebutuhan: [{ id: `kebutuhan-${Date.now()}`, name: 'Makan', amount: '600000' }],
  penunjang: [{ id: `penunjang-${Date.now()}`, name: 'Pulsa', amount: '50000' }],
  tabungan: [{ id: `tabungan-${Date.now()}`, name: 'Dana Darurat', amount: '500000' }],
};

const AddTargetForm: React.FC<AddTargetFormProps> = ({ onClose, onSave }) => {
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
        itemToUpdate.amount = value;
    }
    updatedSection[index] = itemToUpdate;
    setFormData(prev => ({ ...prev, [section]: updatedSection }));
  };

  const addField = (section: keyof AddTargetFormData) => {
    const newField: TargetFormField = {
      // FIX: Removed unnecessary String() conversion as `section` is already a string.
      id: `${section}-${Date.now()}`,
      name: '',
      amount: '',
    };
    setFormData(prev => ({ ...prev, [section]: [...prev[section], newField] }));
  };

  const removeField = (section: keyof AddTargetFormData, index: number) => {
    if (formData[section].length <= 1) return;
    const updatedSection = formData[section].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [section]: updatedSection }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const renderSection = (section: keyof AddTargetFormData, title: string) => (
      <AccordionSection title={title} isOpen={section === 'pendapatan'}>
        <div className="space-y-3">
          {formData[section].map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
              <input 
                type="text" 
                placeholder="Nama Item" 
                value={field.name}
                onChange={(e) => handleFieldChange(section, index, 'name', e.target.value)}
                className="col-span-8 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input 
                type="number" 
                placeholder="Jumlah" 
                value={field.amount}
                onChange={(e) => handleFieldChange(section, index, 'amount', e.target.value)}
                className="col-span-4 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
              />
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => addField(section)} 
            className="text-sm font-semibold text-purple-400 hover:text-purple-300 mt-2 transition-colors"
          >
            + Tambah Item
          </button>
        </div>
      </AccordionSection>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <form onSubmit={handleSubmit} className="bg-slate-800 w-full max-w-2xl h-[90vh] rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Target Bulanan</h2>
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
            Simpan Target
          </button>
        </footer>
      </form>
       <style>{`
          @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
          .group[open] summary .fa-chevron-down { transform: rotate(180deg); }
      `}</style>
    </div>
  );
};

export default AddTargetForm;