import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { View } from '../types';
import type { MonthlyTarget, TargetFormField, ArchivedMonthlyTarget, DebtItem, SavingsGoal } from '../types';
import { AccordionSection } from './AccordionSection';
import Modal from './Modal';

interface AddTargetFormProps {
  setView: (view: View) => void;
  onSave: (data: MonthlyTarget) => void;
  initialData: MonthlyTarget | null;
  archivedTargets: ArchivedMonthlyTarget[];
  currentMonthYear: string;
  activeDebts: DebtItem[];
  activeSavingsGoals: SavingsGoal[];
  onAddDebt: () => void;
  onAddSavingsGoal: () => void;
}

const emptyForm: MonthlyTarget = {
  pendapatan: [{ id: uuidv4(), name: 'Gaji Utama', amount: '' }],
  cicilanUtang: [],
  pengeluaranUtama: [{ id: uuidv4(), name: 'Sewa Kos/Rumah', amount: '' }],
  kebutuhan: [{ id: uuidv4(), name: 'Belanja Dapur', amount: '' }],
  penunjang: [{ id: uuidv4(), name: 'Transportasi', amount: '' }],
  pendidikan: [],
  tabungan: [],
};

const sectionAccentColors: { [key in keyof MonthlyTarget]: string } = {
  pendapatan: 'border-l-[var(--color-income)]',
  cicilanUtang: 'border-l-[var(--color-debt)]',
  pengeluaranUtama: 'border-l-[var(--color-expense)]',
  kebutuhan: 'border-l-[var(--color-expense)]',
  penunjang: 'border-l-[var(--color-expense)]',
  pendidikan: 'border-l-[var(--color-expense)]',
  tabungan: 'border-l-[var(--color-savings)]',
};


const AddTargetForm: React.FC<AddTargetFormProps> = ({
  setView,
  onSave,
  initialData,
  archivedTargets,
  currentMonthYear,
  activeDebts,
  activeSavingsGoals,
  onAddDebt,
  onAddSavingsGoal,
}) => {
  const [formData, setFormData] = useState<MonthlyTarget>(initialData || emptyForm);
  const [isReadOnly, setIsReadOnly] = useState(!!initialData);
  const [originalData, setOriginalData] = useState<MonthlyTarget | null>(initialData);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditOptionsModal, setShowEditOptionsModal] = useState(false);

  useEffect(() => {
      const dataToSet = initialData || emptyForm;
      setFormData(dataToSet);
      setOriginalData(dataToSet);
      setIsReadOnly(!!initialData);
  }, [initialData]);

  const handleFieldChange = (section: keyof MonthlyTarget, id: string, field: 'name' | 'amount', value: string) => {
    const numericValue = field === 'amount' ? value.replace(/[^0-9]/g, '') : value;
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, [field]: numericValue } : item
      ),
    }));
  };

  const addField = (section: keyof MonthlyTarget) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], { id: uuidv4(), name: '', amount: '' }],
    }));
  };
  
  const removeField = (section: keyof MonthlyTarget, id: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id),
    }));
  };

  const handleEdit = (mode: 'adjust' | 'blank' | 'copy') => {
    setShowEditOptionsModal(false);

    if (mode === 'adjust') {
      setIsReadOnly(false);
    } else if (mode === 'blank') {
      const syncedEmptyForm = prePopulateGoals(emptyForm);
      setFormData(syncedEmptyForm);
      setIsReadOnly(false);
    } else if (mode === 'copy') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthYear = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      const lastTarget = archivedTargets.find(t => t.monthYear === lastMonthYear);
      if (lastTarget) {
        const syncedForm = prePopulateGoals(lastTarget.target);
        setFormData(syncedForm);
        setIsReadOnly(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData(originalData || emptyForm);
    setIsReadOnly(true);
  };
  
  const calculateTotal = useCallback((items: TargetFormField[]) => {
    return items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
  }, []);
  
  const totalPendapatan = useMemo(() => calculateTotal(formData.pendapatan), [formData.pendapatan, calculateTotal]);
  const totalPengeluaran = useMemo(() => 
      calculateTotal(formData.cicilanUtang) +
      calculateTotal(formData.pengeluaranUtama) +
      calculateTotal(formData.kebutuhan) +
      calculateTotal(formData.penunjang) +
      calculateTotal(formData.pendidikan), 
  [formData, calculateTotal]);
  const totalTabungan = useMemo(() => calculateTotal(formData.tabungan), [formData.tabungan, calculateTotal]);
  const sisa = useMemo(() => totalPendapatan - totalPengeluaran - totalTabungan, [totalPendapatan, totalPengeluaran, totalTabungan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    onSave(formData);
    setShowConfirmModal(false);
    setIsReadOnly(true);
    setOriginalData(formData);
  };
  
  const prePopulateGoals = (baseForm: MonthlyTarget): MonthlyTarget => {
    const newForm = JSON.parse(JSON.stringify(baseForm));

    newForm.cicilanUtang = activeDebts.map(debt => ({
      id: `debt-${debt.id}`,
      name: debt.name,
      amount: String(debt.monthlyInstallment)
    }));

    const savingsMap = new Map(newForm.tabungan.map((item: TargetFormField) => [item.name, item]));
    activeSavingsGoals.forEach(goal => {
      const remainingAmount = goal.targetAmount - goal.currentAmount;
      if (remainingAmount > 0 && !savingsMap.has(goal.name)) {
        const deadline = new Date(goal.deadline);
        const now = new Date();
        const monthsRemaining = Math.max(1, (deadline.getFullYear() - now.getFullYear()) * 12 + deadline.getMonth() - now.getMonth());
        const suggestedAmount = Math.ceil(remainingAmount / monthsRemaining);
        
        savingsMap.set(goal.name, {
          id: `sg-${goal.id}`,
          name: goal.name,
          amount: String(suggestedAmount > 0 ? suggestedAmount : 0)
        });
      }
    });
    newForm.tabungan = Array.from(savingsMap.values());
    
    return newForm;
  };

  const lastMonthTarget = useMemo(() => {
    if (archivedTargets.length === 0) return null;
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthYear = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    return archivedTargets.find(t => t.monthYear === lastMonthYear);
  }, [archivedTargets]);

  const lastMonthSummary = useMemo(() => {
    if (!lastMonthTarget) return null;
    const totalPendapatan = calculateTotal(lastMonthTarget.target.pendapatan);
    const totalPengeluaran = calculateTotal(lastMonthTarget.target.cicilanUtang) +
                           calculateTotal(lastMonthTarget.target.pengeluaranUtama) +
                           calculateTotal(lastMonthTarget.target.kebutuhan) +
                           calculateTotal(lastMonthTarget.target.penunjang) +
                           calculateTotal(lastMonthTarget.target.pendidikan);
    return { totalPendapatan, totalPengeluaran };
  }, [lastMonthTarget, calculateTotal]);
  

  const renderSection = (sectionKey: keyof MonthlyTarget, title: string) => {
    const items = formData[sectionKey];
    const sectionTotal = calculateTotal(items);
    const allowAdd = !['cicilanUtang', 'tabungan'].includes(sectionKey);
    
    const hasItems = items.length > 0;
    const hasActiveGoals = (sectionKey === 'cicilanUtang' && activeDebts.length > 0) || (sectionKey === 'tabungan' && activeSavingsGoals.length > 0);
    const showEmptyStateButton = !hasItems && !hasActiveGoals && ['cicilanUtang', 'tabungan'].includes(sectionKey);

    return (
      <AccordionSection title={title} isOpen={sectionKey === 'pendapatan'} headerClassName={`border-l-4 ${sectionAccentColors[sectionKey]}`}>
        <div className="space-y-3">
            {items.map((field) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                {isReadOnly ? (
                  <>
                    <p className="col-span-7 p-2 text-[var(--text-secondary)] truncate">{field.name}</p>
                    <p className="col-span-5 p-2 text-[var(--text-primary)] text-right font-semibold">Rp {parseInt(field.amount || '0').toLocaleString('id-ID')}</p>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Nama item"
                      value={field.name}
                      readOnly={field.id.startsWith('debt-') || field.id.startsWith('sg-')}
                      onChange={e => handleFieldChange(sectionKey, field.id, 'name', e.target.value)}
                      className="col-span-7 p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent read-only:bg-[var(--bg-interactive-hover)] read-only:text-[var(--text-tertiary)] text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Jumlah (Rp)"
                      value={field.amount ? parseInt(field.amount).toLocaleString('id-ID') : ''}
                      onChange={e => handleFieldChange(sectionKey, field.id, 'amount', e.target.value)}
                      className="col-span-4 p-2 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-md focus:ring-2 focus:ring-[var(--primary-glow)] focus:border-transparent text-right text-[var(--text-primary)]"
                    />
                    {allowAdd ? (
                        <button
                        type="button"
                        onClick={() => removeField(sectionKey, field.id)}
                        className="col-span-1 text-[var(--text-tertiary)] hover:text-[var(--color-expense)] transition-colors"
                        aria-label={`Hapus ${field.name}`}
                        >
                        <i className="fa-solid fa-trash-can"></i>
                        </button>
                    ) : <div className="col-span-1"></div>}
                  </>
                )}
              </div>
            ))}
            
            {showEmptyStateButton && (
                 <button
                    type="button"
                    onClick={sectionKey === 'cicilanUtang' ? onAddDebt : onAddSavingsGoal}
                    className="w-full text-center py-6 px-4 border-2 border-dashed border-[var(--border-secondary)] rounded-xl hover:bg-[var(--bg-interactive-hover)] hover:border-[var(--primary-glow)] transition-all duration-300 group"
                  >
                      <p className="font-semibold text-[var(--text-secondary)] group-hover:text-[var(--primary-glow)] transition-colors duration-300">
                        {sectionKey === 'cicilanUtang' 
                            ? "Belum ada utang tercatat. Klik untuk mulai." 
                            : "Anda belum punya tujuan. Klik untuk wujudkan impianmu!"
                        }
                      </p>
                  </button>
            )}

            {!isReadOnly && allowAdd && (
                <button 
                  type="button" 
                  onClick={() => addField(sectionKey)} 
                  className="w-full border-2 border-dashed border-[var(--border-secondary)] rounded-lg py-2 text-sm font-semibold text-[var(--text-tertiary)] hover:border-[var(--primary-glow)] hover:text-[var(--primary-glow)] transition-all duration-300"
                >
                    <i className="fa-solid fa-plus mr-2"></i>Tambah Item
                </button>
            )}

            {hasItems && (
                 <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-primary)]">
                     <span className="font-bold text-[var(--text-secondary)]">TOTAL</span>
                     <span className="text-lg font-bold text-[var(--text-primary)]">Rp {sectionTotal.toLocaleString('id-ID')}</span>
                 </div>
            )}
        </div>
      </AccordionSection>
    );
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center space-x-4">
        <button onClick={() => setView(View.REPORT)} className="text-[var(--text-tertiary)]">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Target Bulanan</h1>
      </header>
      
        <div className="sticky top-0 z-20 p-4 bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl shadow-2xl">
            <h3 className="font-bold text-[var(--text-primary)] mb-3 text-lg">Ringkasan Target</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center"><span className="flex items-center text-[var(--text-secondary)]"><div className="w-2.5 h-2.5 rounded-sm bg-[var(--color-income)] mr-2"></div>Pemasukan</span><span className="font-bold" style={{color: 'var(--color-income)'}}>Rp {totalPendapatan.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center text-[var(--text-secondary)]"><div className="w-2.5 h-2.5 rounded-sm bg-[var(--color-expense)] mr-2"></div>Pengeluaran</span><span className="font-bold" style={{color: 'var(--color-expense)'}}>Rp {totalPengeluaran.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center text-[var(--text-secondary)]"><div className="w-2.5 h-2.5 rounded-sm bg-[var(--color-savings)] mr-2"></div>Tabungan</span><span className="font-bold" style={{color: 'var(--color-savings)'}}>Rp {totalTabungan.toLocaleString('id-ID')}</span></div>
                <div className="border-t border-[var(--border-primary)] my-2"></div>
                <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-[var(--text-secondary)]">Potensi Sisa Uang</span>
                    <span className={`font-bold text-lg ${sisa >= 0 ? 'text-[var(--text-primary)]' : 'text-[var(--color-warning)]'}`}>
                        {sisa < 0 && <i className="fa-solid fa-triangle-exclamation mr-2"></i>}
                        Rp {sisa.toLocaleString('id-ID')}
                    </span>
                </div>
            </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-6">
            {renderSection('pendapatan', 'Pemasukan')}
            {renderSection('cicilanUtang', 'Hutang')}
            {renderSection('tabungan', 'Tabungan')}
            {renderSection('pengeluaranUtama', 'Pengeluaran Utama')}
            {renderSection('kebutuhan', 'Kebutuhan')}
            {renderSection('penunjang', 'Penunjang')}
            {renderSection('pendidikan', 'Pendidikan')}
        </div>
        
        <div className="pt-4 pb-20 flex gap-3">
            {isReadOnly ? (
                 <button type="button" onClick={() => setShowEditOptionsModal(true)} className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    Ubah Target
                </button>
            ) : (
                <>
                    <button type="button" onClick={handleCancel} className="w-full bg-[var(--bg-interactive)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-bold py-4 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors">
                        Batal
                    </button>
                    <button type="submit" className="w-full bg-gradient-to-r from-[var(--secondary-600)] to-[var(--primary-500)] text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                        Simpan Perubahan
                    </button>
                </>
            )}
        </div>
      </form>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <div className="text-center p-6 bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-xl">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Simpan Perubahan?</h3>
            <div className="flex gap-3 mt-6">
                <button onClick={() => setShowConfirmModal(false)} className="w-full bg-[var(--bg-interactive)] text-[var(--text-secondary)] py-2 rounded-full">Batal</button>
                <button onClick={handleConfirmSave} className="w-full bg-[var(--primary-600)] text-white font-bold py-2 rounded-full">Ya, Simpan</button>
            </div>
        </div>
      </Modal>

       <Modal isOpen={showEditOptionsModal} onClose={() => setShowEditOptionsModal(false)}>
        <div className="p-4 bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-xl">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4 text-center">Ubah Target</h3>
            <div className="space-y-3">
                <button onClick={() => handleEdit('adjust')} className="w-full text-left p-4 bg-[var(--bg-interactive)] hover:border-[var(--primary-glow)] rounded-xl transition-all duration-300 border border-[var(--border-primary)] group">
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--bg-primary)] rounded-lg text-[var(--primary-glow)] border border-[var(--border-primary)]"><i className="fa-solid fa-sliders text-xl"></i></div>
                        <div>
                            <p className="font-bold text-[var(--text-secondary)]">Sesuaikan Target Saat Ini</p>
                            <p className="text-sm text-[var(--text-tertiary)]">Ubah angka-angka dari target yang ditampilkan.</p>
                        </div>
                    </div>
                </button>
                
                <button onClick={() => handleEdit('blank')} className="w-full text-left p-4 bg-[var(--bg-interactive)] hover:border-[var(--primary-glow)] rounded-xl transition-all duration-300 border border-[var(--border-primary)] group">
                     <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--bg-primary)] rounded-lg text-[var(--primary-glow)] border border-[var(--border-primary)]"><i className="fa-solid fa-file text-xl"></i></div>
                        <div>
                            <p className="font-bold text-[var(--text-secondary)]">Mulai dari Awal (Kosong)</p>
                            <p className="text-sm text-[var(--text-tertiary)]">Buat target baru dari formulir kosong.</p>
                        </div>
                    </div>
                </button>

                {lastMonthTarget && (
                    <button onClick={() => handleEdit('copy')} className="w-full text-left p-4 bg-[var(--bg-interactive)] hover:border-[var(--primary-glow)] rounded-xl transition-all duration-300 border border-[var(--border-primary)] group">
                         <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--bg-primary)] rounded-lg text-[var(--primary-glow)] border border-[var(--border-primary)]"><i className="fa-solid fa-copy text-xl"></i></div>
                            <div>
                                <p className="font-bold text-[var(--text-secondary)]">Salin dari Bulan Lalu</p>
                                <p className="text-sm text-[var(--text-tertiary)]">Gunakan data bulan sebelumnya sebagai dasar.</p>
                                {lastMonthSummary && (
                                     <div className="mt-2 text-xs flex space-x-4 text-[var(--text-tertiary)] border-t border-[var(--border-primary)] pt-2">
                                         <span>Pemasukan: <strong style={{color: 'var(--color-income)'}}>Rp {lastMonthSummary.totalPendapatan.toLocaleString('id-ID')}</strong></span>
                                         <span>Pengeluaran: <strong style={{color: 'var(--color-expense)'}}>Rp {lastMonthSummary.totalPengeluaran.toLocaleString('id-ID')}</strong></span>
                                     </div>
                                )}
                            </div>
                        </div>
                    </button>
                )}
            </div>
        </div>
      </Modal>
    </div>
  );
};
export default AddTargetForm;