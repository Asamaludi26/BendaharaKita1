import React, { useMemo } from 'react';
import { MonthlyTarget, View, Transaction, DebtItem, SavingsGoal } from '../types';
import { AccordionSection } from './AccordionSection';

interface ActualsReportViewProps {
  setView: (view: View) => void;
  monthlyTarget: MonthlyTarget | null;
  transactions: Transaction[];
  debts: DebtItem[];
  savingsGoals: SavingsGoal[];
  displayDate: Date;
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

const ActualsSummaryCard: React.FC<{
    actualsData: { [key: string]: number };
    monthlyTarget: MonthlyTarget;
}> = ({ actualsData, monthlyTarget }) => {

    const { actual, target, remaining } = useMemo(() => {
        const calculateTotal = (sectionKeys: (keyof MonthlyTarget)[], source: 'target' | 'actual') => {
            let total = 0;
            sectionKeys.forEach(key => {
                monthlyTarget[key].forEach(item => {
                    if (source === 'target') {
                        total += parseInt(item.amount) || 0;
                    } else {
                        total += actualsData[item.id] || 0;
                    }
                });
            });
            return total;
        };

        const incomeKeys: (keyof MonthlyTarget)[] = ['pendapatan'];
        const expenseKeys: (keyof MonthlyTarget)[] = ['cicilanUtang', 'pengeluaranUtama', 'kebutuhan', 'penunjang', 'pendidikan'];
        const savingsKeys: (keyof MonthlyTarget)[] = ['tabungan'];

        const actualIncome = calculateTotal(incomeKeys, 'actual');
        const actualExpense = calculateTotal(expenseKeys, 'actual');
        const actualSavings = calculateTotal(savingsKeys, 'actual');
        
        const targetIncome = calculateTotal(incomeKeys, 'target');
        const targetExpense = calculateTotal(expenseKeys, 'target');
        const targetSavings = calculateTotal(savingsKeys, 'target');

        return {
            actual: { income: actualIncome, expense: actualExpense, savings: actualSavings },
            target: { income: targetIncome, expense: targetExpense, savings: targetSavings },
            remaining: actualIncome - actualExpense - actualSavings,
        };
    }, [actualsData, monthlyTarget]);

    const SummaryItem: React.FC<{ label: string; actual: number; target: number; color: string; }> = ({ label, actual, target, color }) => (
        <div className="flex justify-between items-center text-sm">
            <span className="flex items-center text-[var(--text-secondary)]">
                <div className="w-2.5 h-2.5 rounded-sm mr-2" style={{ backgroundColor: `var(--color-${color})` }}></div>
                {label}
            </span>
            <div className="font-semibold text-right">
                <span style={{ color: `var(--color-${color})` }}>Rp {actual.toLocaleString('id-ID')}</span>
                <span className="text-[var(--text-tertiary)] text-xs"> / {target.toLocaleString('id-ID')}</span>
            </div>
        </div>
    );

    return (
        <div className="sticky top-0 z-20 p-4 bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl shadow-2xl">
            <h3 className="font-bold text-[var(--text-primary)] mb-3 text-lg">Ringkasan Aktual</h3>
            <div className="space-y-2">
                <SummaryItem label="Pemasukan" actual={actual.income} target={target.income} color="income" />
                <SummaryItem label="Pengeluaran" actual={actual.expense} target={target.expense} color="expense" />
                <SummaryItem label="Tabungan" actual={actual.savings} target={target.savings} color="savings" />
                <div className="border-t border-[var(--border-primary)] my-2"></div>
                <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-[var(--text-secondary)]">Sisa Uang Aktual</span>
                    <span className={`font-bold text-lg ${remaining >= 0 ? 'text-[var(--text-primary)]' : 'text-[var(--color-warning)]'}`}>
                        Rp {remaining.toLocaleString('id-ID')}
                    </span>
                </div>
            </div>
        </div>
    );
};

const ActualsReportView: React.FC<ActualsReportViewProps> = ({ setView, monthlyTarget, transactions, debts, savingsGoals, displayDate }) => {

  const actualsData = useMemo(() => {
    const data: { [key: string]: number } = {};
    if (!monthlyTarget) return data;

    // Initialize all with 0
    Object.values(monthlyTarget).flat().forEach(item => {
        data[item.id] = 0;
    });

    const monthStart = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const monthEnd = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
    monthStart.setHours(0, 0, 0, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const currentMonthTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= monthStart && txDate <= monthEnd;
    });

    // Sync general transactions by matching target item name with transaction category
    const generalSections: (keyof MonthlyTarget)[] = ['pendapatan', 'pengeluaranUtama', 'kebutuhan', 'penunjang', 'pendidikan'];
    generalSections.forEach(sectionKey => {
        monthlyTarget[sectionKey].forEach(targetItem => {
            const categoryTransactions = currentMonthTransactions.filter(t => t.category === targetItem.name);
            const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
            data[targetItem.id] = total;
        });
    });

    // Sync debt payments from Goals
    monthlyTarget.cicilanUtang.forEach(targetItem => {
        const debt = debts.find(d => d.name === targetItem.name);
        if (debt) {
            const total = debt.payments
                .filter(p => {
                    const pDate = new Date(p.date);
                    return pDate >= monthStart && pDate <= monthEnd;
                })
                .reduce((sum, p) => sum + p.amount, 0);
            data[targetItem.id] = total;
        }
    });

    // Sync savings contributions from Goals
    monthlyTarget.tabungan.forEach(targetItem => {
        const goal = savingsGoals.find(g => g.name === targetItem.name);
        if (goal) {
            const total = goal.contributions
                .filter(c => {
                    const cDate = new Date(c.date);
                    return cDate >= monthStart && cDate <= monthEnd;
                })
                .reduce((sum, c) => sum + c.amount, 0);
            data[targetItem.id] = total;
        }
    });

    return data;
  }, [monthlyTarget, transactions, debts, savingsGoals, displayDate]);

  
  if (!monthlyTarget) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center h-full text-center">
         <div className="bg-[var(--bg-secondary)] p-8 rounded-2xl shadow-2xl max-w-sm">
             <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Target Bulanan Belum Dibuat</h2>
             <p className="text-[var(--text-secondary)] mb-6">Anda harus membuat "Target Bulanan" terlebih dahulu sebelum bisa melihat Laporan Aktual.</p>
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

  const renderSection = (sectionKey: keyof MonthlyTarget, title: string) => {
    const sectionItems = monthlyTarget[sectionKey];
    if (!sectionItems || sectionItems.length === 0) return null;

    return (
      <AccordionSection title={title} isOpen={sectionKey === 'pendapatan'} headerClassName={`border-l-4 ${sectionAccentColors[sectionKey]}`}>
        <div className="space-y-3">
          <div className="grid grid-cols-10 gap-2 px-2 items-center">
            <label className="col-span-4 text-xs font-semibold text-[var(--text-tertiary)]">ITEM</label>
            <label className="col-span-3 text-xs font-semibold text-[var(--text-tertiary)] text-right">TARGET</label>
            <label className="col-span-3 text-xs font-semibold text-[var(--text-tertiary)] text-right">AKTUAL</label>
          </div>
          {sectionItems.map((field) => {
            const targetAmount = parseInt(field.amount || '0');
            const actualAmount = actualsData[field.id] || 0;
            const progress = targetAmount > 0 ? (actualAmount / targetAmount) * 100 : 0;
            
            const isIncomeType = sectionKey === 'pendapatan';
            const isSavingsType = sectionKey === 'tabungan';
            
            let progressBarColor = 'var(--color-expense)'; // Default for overspent expenses
            if (isIncomeType) {
                progressBarColor = 'var(--color-income)';
            } else if (isSavingsType) {
                // Savings is always positive, using the dedicated savings color.
                progressBarColor = 'var(--color-savings)';
            } else if (progress <= 100) {
                 // Use a neutral/positive color for expenses under or at target
                 progressBarColor = 'var(--secondary-glow)';
            }
            
            return (
                <div key={field.id} className="p-2 bg-[var(--bg-interactive)] border border-transparent rounded-lg space-y-2">
                    <div className="grid grid-cols-10 gap-2 items-center">
                        <span className="col-span-4 text-[var(--text-secondary)] truncate font-semibold">{field.name}</span>
                        <span className="col-span-3 text-[var(--text-tertiary)] text-right">Rp {targetAmount.toLocaleString('id-ID')}</span>
                        <span className="col-span-3 text-[var(--text-primary)] font-bold text-right">Rp {actualAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5">
                        <div 
                            className="h-1.5 rounded-full" 
                            style={{ 
                                width: `${Math.min(progress, 100)}%`, 
                                backgroundColor: progressBarColor,
                                boxShadow: isSavingsType ? `0 0 8px ${progressBarColor}` : 'none'
                            }}>
                        </div>
                    </div>
                    {isSavingsType && progress < 100 && actualAmount > 0 && (
                        <p className="text-xs text-center text-[var(--text-tertiary)] pt-1">
                            <i className="fa-solid fa-star fa-xs mr-1.5" style={{color: 'var(--color-warning)'}}></i>
                            Setiap kontribusi berarti!
                        </p>
                    )}
                    {isSavingsType && progress >= 100 && (
                        <p className="text-xs text-center font-semibold pt-1" style={{color: 'var(--color-income)'}}>
                            <i className="fa-solid fa-trophy fa-xs mr-1.5"></i>
                            Target tercapai, kerja bagus!
                        </p>
                    )}
                </div>
            );
          })}
        </div>
      </AccordionSection>
    );
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center space-x-4">
        <button onClick={() => setView(View.DASHBOARD)} className="text-[var(--text-tertiary)]">
            <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Laporan Aktual Real-Time</h1>
            <p className="text-[var(--text-tertiary)]">Disinkronkan dari transaksi & goals Anda.</p>
        </div>
      </header>
      
      <ActualsSummaryCard actualsData={actualsData} monthlyTarget={monthlyTarget} />

      <div className="space-y-4 pb-20">
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-tertiary)] mb-2 border-b border-[var(--border-primary)] pb-2">Pendapatan</h2>
                {renderSection('pendapatan', 'Rincian Pendapatan')}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-tertiary)] mb-2 border-b border-[var(--border-primary)] pb-2">Pengeluaran</h2>
                <div className="space-y-3">
                  {renderSection('cicilanUtang', 'Cicilan Utang')}
                  {renderSection('pengeluaranUtama', 'Pengeluaran Utama')}
                  {renderSection('kebutuhan', 'Kebutuhan')}
                  {renderSection('penunjang', 'Penunjang')}
                  {renderSection('pendidikan', 'Pendidikan')}
                </div>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-tertiary)] mb-2 border-b border-[var(--border-primary)] pb-2">Tabungan</h2>
                {renderSection('tabungan', 'Tujuan Tabungan')}
            </div>
      </div>
    </div>
  );
};

export default ActualsReportView;