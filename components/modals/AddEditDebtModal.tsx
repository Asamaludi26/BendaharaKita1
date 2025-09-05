import React, { useState } from 'react';
import { DebtItem, DebtCategory } from '../../types';

interface AddEditDebtModalProps {
  onClose: () => void;
  onSave: (debt: DebtItem) => void;
  debt: DebtItem | null;
}

const AddEditDebtModal: React.FC<AddEditDebtModalProps> = ({ onClose, onSave, debt }) => {
  const [name, setName] = useState(debt?.name || '');
  const [totalAmount, setTotalAmount] = useState(debt?.totalAmount || 0);
  const [paidAmount, setPaidAmount] = useState(debt?.paidAmount || 0);
  const [category, setCategory] = useState<DebtCategory>(debt?.category || 'Konsumtif');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const debtData = {
      id: debt?.id || `debt-${Date.now()}`,
      name,
      totalAmount,
      paidAmount,
      category,
    };
    onSave(debtData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <form onSubmit={handleSubmit} className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{debt ? 'Edit Utang' : 'Tambah Utang Baru'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Tutup">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </header>
        
        <main className="flex-1 p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nama Utang</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]" />
          </div>
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-slate-300 mb-1">Jumlah Total</label>
            <input type="number" id="totalAmount" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value))} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]" />
          </div>
          <div>
            <label htmlFor="paidAmount" className="block text-sm font-medium text-slate-300 mb-1">Telah Dibayar</label>
            <input type="number" id="paidAmount" value={paidAmount} onChange={e => setPaidAmount(Number(e.target.value))} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">Kategori</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value as DebtCategory)} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]">
              <option value="Konsumtif">Konsumtif</option>
              <option value="Produktif">Produktif</option>
            </select>
          </div>
        </main>
        
        <footer className="p-4 border-t border-slate-700">
          <button type="submit" className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-3 rounded-full shadow-lg hover:scale-[1.02] transition-transform">
            Simpan
          </button>
        </footer>
      </form>
      <style>{`.animate-fade-in { animation: fade-in 0.3s ease-out; } @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default AddEditDebtModal;