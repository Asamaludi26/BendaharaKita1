import React, { useState } from 'react';
import { SavingsGoal, SavingsGoalCategory } from '../../types';

interface AddEditSavingsGoalModalProps {
  onClose: () => void;
  onSave: (goal: SavingsGoal) => void;
  goal: SavingsGoal | null;
}

const AddEditSavingsGoalModal: React.FC<AddEditSavingsGoalModalProps> = ({ onClose, onSave, goal }) => {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || 0);
  const [savedAmount, setSavedAmount] = useState(goal?.savedAmount || 0);
  const [category, setCategory] = useState<SavingsGoalCategory>(goal?.category || 'Jangka Pendek');
  const [icon, setIcon] = useState(goal?.icon || 'piggy-bank');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goalData = {
      id: goal?.id || `goal-${Date.now()}`,
      name,
      targetAmount,
      savedAmount,
      category,
      icon,
    };
    onSave(goalData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <form onSubmit={handleSubmit} className="bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{goal ? 'Edit Tujuan' : 'Tambah Tujuan Baru'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Tutup">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </header>
        
        <main className="flex-1 p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nama Tujuan</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]" />
          </div>
          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-300 mb-1">Jumlah Target</label>
            <input type="number" id="targetAmount" value={targetAmount} onChange={e => setTargetAmount(Number(e.target.value))} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]" />
          </div>
          <div>
            <label htmlFor="savedAmount" className="block text-sm font-medium text-slate-300 mb-1">Telah Tersimpan</label>
            <input type="number" id="savedAmount" value={savedAmount} onChange={e => setSavedAmount(Number(e.target.value))} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">Kategori</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value as SavingsGoalCategory)} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]">
              <option value="Jangka Pendek">Jangka Pendek</option>
              <option value="Jangka Panjang">Jangka Panjang</option>
              <option value="Dana Darurat">Dana Darurat</option>
            </select>
          </div>
           <div>
            <label htmlFor="icon" className="block text-sm font-medium text-slate-300 mb-1">Ikon (Font Awesome)</label>
            <input type="text" id="icon" value={icon} onChange={e => setIcon(e.target.value)} required className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-[var(--primary-500)]" />
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

export default AddEditSavingsGoalModal;