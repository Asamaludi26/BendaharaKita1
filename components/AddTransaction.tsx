// FIX: Implemented the ActualsReportView component to resolve module not found and syntax errors.
import React, { useMemo } from 'react';
import { View, MonthlyTarget, Transaction, UserCategory, TransactionType, TargetFormField, DebtItem, SavingsGoal } from '../types';
import { AccordionSection } from './AccordionSection';

interface ActualsReportViewProps {
  setView: (view: View) => void;
  monthlyTarget: MonthlyTarget | null;
  transactions: Transaction[];
  activeDebts: DebtItem[];
  activeSavingsGoals: SavingsGoal[];
  displayDate: Date;
  userCategories: UserCategory[];
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

const ProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
    <div className="w-full bg-[var(--bg-interactive)] rounded-full h-2.5">
        <div className="h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
    </div>
);

const ReportItem: React.FC<{
    name: string;
    target: number;
    actual: number;
    type: TransactionType;
}> = ({ name, target, actual, type }) => {
    const difference = actual - target;
    const progress = target > 0 ? (actual / target) * 100 : (actual > 0 ? 100 : 0);
    const isIncome = type === TransactionType.INCOME;

    let diffColor = '';
    let progressColor = '';
    let diffPrefix = '';

    if (isIncome) {
        progressColor = 'var(--color-income)';
        if (difference >= 0) {
            diffColor = 'text-[var(--color-income)]';
            diffPrefix = '+';
        } else {
            diffColor = 'text-[var(--color-warning)]';
            diffPrefix = ''; // Negative is implied
        }
    } else { // Expense
        // For expenses, being under target is good (income color)
        // Over target is bad (warning color)
        progressColor = actual <= target ? 'var(--secondary-glow)' : 'var(--color-expense)';
        if (difference <= 0) {
            diffColor = 'text-[var(--color-income)]';
            diffPrefix = ''; // Negative is implied, which is good
        } else {
            diffColor = 'text-[var(--color-warning)]';
            diffPrefix = '+';
        }
    }

    return (
        <div className="space-y-2 py-3">
            <div className="flex justify-between items-center text-sm">
                <p className="font-semibold text-[var(--text-primary)]">{name}</p>
                <p className={`font-bold ${diffColor}`}>
                    {difference !== 0 ? `${diffPrefix}${formatCurrency(difference)}` : 'Sesuai'}
                </p>
            </div>
            <ProgressBar progress={progress} color={progressColor} />
            <div className="flex justify-between items-center text-xs">
                <p className="text-[var(--text-secondary)]">Aktual: <span className="font-bold text-[var(--text-primary)]">{formatCurrency(actual)}</span></p>
                <p className="text-[var(--text-tertiary)]">Target: {formatCurrency(target)}</p>
            </div>
        </div>
    );
};


const SummaryCard: React.FC<{ title: string; actual: number; target: number; colorClass: string }> = ({ title, actual, target, colorClass }) => (
    <div className="bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-xl p-3 text-center">
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">{title}</p>
        <p className={`text-lg font-bold ${colorClass}`}>{formatCurrency(actual)}</p>
        <p className="text-xs text-[var(--text-tertiary)]">/ {formatCurrency(target)}</p>
    </div>
);

const SectionHeader: React.FC<{title: string, color: string, icon: string}> = ({title, color, icon}) => (
    <div className="flex items-center space-x-3 mb-3 border-b-2 pb-2" style={{borderColor: `var(--color-${color})`}}>
        <i className={`fa-solid ${icon} text-lg`} style={{color: `var(--color-${color})`}}></i>
        <h2 className="text-lg font-semibold" style={{color: `var(--color-${color})`}}>{title}</h2>
    </div>
);

const ActualsReportView: React.FC<ActualsReportViewProps> = ({ setView, monthlyTarget, transactions, displayDate, userCategories, activeDebts, activeSavingsGoals }) => {

    const categoryActuals = useMemo(() => {
        const currentMonthStart = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
        const currentMonthEnd = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);

        const currentMonthTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= currentMonthStart && txDate <= currentMonthEnd;
        });

        const actualsMap: { [categoryName: string]: number } = {};
        
        currentMonthTransactions.forEach(tx => {
            // The transaction category should match the target item name
            if (!actualsMap[tx.category]) {
                actualsMap[tx.category] = 0;
            }
            actualsMap[tx.category] += tx.amount;
        });
        
        return actualsMap;
    }, [transactions, displayDate]);

    const { 
        incomeCategories, 
        expenseCategories, 
        savingsCategories, 
        debtCategories, 
        totalTargetIncome, 
        totalTargetExpenses, 
        totalTargetSavings, 
        totalActualIncome, 
        totalActualExpenses, 
        totalActualSavings 
    } = useMemo(() => {
        const debtNames = new Set(activeDebts.map(d => d.name));
        const savingsNames = new Set(activeSavingsGoals.map(sg => sg.name));

        const incomeCats: UserCategory[] = [];
        const expenseCats: UserCategory[] = [];
        const savingsCats: UserCategory[] = [];
        const debtCats: UserCategory[] = [];

        userCategories.forEach(cat => {
            if (!monthlyTarget || !monthlyTarget[cat.id] || monthlyTarget[cat.id].length === 0) {
                return;
            }

            if (debtNames.has(cat.name)) {
                debtCats.push(cat);
            } else if (savingsNames.has(cat.name)) {
                savingsCats.push(cat);
            } else if (cat.isActive) {
                if (cat.type === TransactionType.INCOME) {
                    incomeCats.push(cat);
                } else {
                    expenseCats.push(cat);
                }
            }
        });

        const calculateTotals = (categories: UserCategory[]) => {
            let targetTotal = 0;
            let actualTotal = 0;
            categories.forEach(cat => {
                const items = monthlyTarget?.[cat.id] || [];
                items.forEach(item => {
                    targetTotal += parseInt(item.amount || '0');
                    actualTotal += categoryActuals[item.name] || 0;
                });
            });
            return { targetTotal, actualTotal };
        };

        const { targetTotal: targetIncome, actualTotal: actualIncome } = calculateTotals(incomeCats);
        const { targetTotal: targetExpensesRegular, actualTotal: actualExpensesRegular } = calculateTotals(expenseCats);
        const { targetTotal: targetDebts, actualTotal: actualDebts } = calculateTotals(debtCats);
        const { targetTotal: targetSavings, actualTotal: actualSavings } = calculateTotals(savingsCats);

        return { 
            incomeCategories: incomeCats, 
            expenseCategories: expenseCats, 
            savingsCategories: savingsCats, 
            debtCategories: debtCats, 
            totalTargetIncome: targetIncome,
            totalTargetExpenses: targetExpensesRegular + targetDebts, 
            totalTargetSavings: targetSavings,
            totalActualIncome: actualIncome,
            totalActualExpenses: actualExpensesRegular + actualDebts,
            totalActualSavings: actualSavings
        };
    }, [monthlyTarget, userCategories, activeDebts, activeSavingsGoals, categoryActuals]);


    if (!monthlyTarget) {
        return (
            <div className="p-4 md:p-6 text-center animate-fade-in">
                 <header className="flex items-center space-x-4 mb-4">
                    <button onClick={() => setView(View.DASHBOARD)} className="text-[var(--text-tertiary)]"><i className="fa-solid fa-arrow-left text-xl"></i></button>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Laporan Aktual</h1>
                </header>
                <div className="p-8 bg-[var(--bg-secondary)] rounded-xl mt-8">
                    <p className="text-[var(--text-secondary)]">Target untuk bulan ini belum dibuat. Silakan buat target terlebih dahulu.</p>
                     <button onClick={() => setView(View.ADD_TARGET)} className="mt-4 bg-[var(--gradient-primary)] text-white font-bold py-2 px-4 rounded-lg">Buat Target</button>
                </div>
            </div>
        )
    }

    const sisaUangActual = totalActualIncome - totalActualExpenses - totalActualSavings;
    const sisaUangTarget = totalTargetIncome - totalTargetExpenses - totalTargetSavings;

    return (
        <div className="p-4 md:p-6 space-y-6 pb-20 animate-fade-in">
            <header className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => setView(View.DASHBOARD)} className="text-[var(--text-tertiary)]"><i className="fa-solid fa-arrow-left text-xl"></i></button>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Laporan Aktual</h1>
                        <p className="text-[var(--text-tertiary)]">Perbandingan target dan realisasi bulan ini.</p>
                    </div>
                </div>
            </header>

            <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/80 backdrop-blur-lg -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-b border-[var(--border-primary)]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <SummaryCard title="Pemasukan" actual={totalActualIncome} target={totalTargetIncome} colorClass="text-[var(--color-income)]" />
                    <SummaryCard title="Pengeluaran" actual={totalActualExpenses} target={totalTargetExpenses} colorClass="text-[var(--color-expense)]" />
                    <SummaryCard title="Tabungan" actual={totalActualSavings} target={totalTargetSavings} colorClass="text-[var(--color-savings)]" />
                    <SummaryCard title="Sisa Uang" actual={sisaUangActual} target={sisaUangTarget} colorClass={sisaUangActual >= 0 ? 'text-[var(--text-primary)]' : 'text-[var(--color-warning)]'} />
                </div>
            </div>

            <div className="space-y-6">
                {/* PENDAPATAN */}
                <div>
                    <SectionHeader title="Pendapatan" color="income" icon="fa-arrow-down" />
                    <div className="space-y-3">
                        {incomeCategories.map(cat => (
                            <AccordionSection key={cat.id} title={cat.name} isOpen={true}>
                                <div className="divide-y divide-[var(--border-primary)]">
                                    {(monthlyTarget[cat.id] || []).map(item => (
                                        <ReportItem key={item.id} name={item.name} target={parseInt(item.amount) || 0} actual={categoryActuals[item.name] || 0} type={TransactionType.INCOME} />
                                    ))}
                                </div>
                            </AccordionSection>
                        ))}
                        {incomeCategories.length === 0 && <p className="text-sm text-center text-[var(--text-tertiary)] py-4">Tidak ada target pendapatan.</p>}
                    </div>
                </div>
                {/* HUTANG */}
                <div>
                    <SectionHeader title="Hutang" color="debt" icon="fa-file-invoice-dollar" />
                     <div className="space-y-3">
                        {debtCategories.map(cat => (
                            <AccordionSection key={cat.id} title={cat.name} isOpen={true} badge={<i className="fa-solid fa-lock text-xs text-[var(--text-tertiary)]"></i>}>
                                <div className="divide-y divide-[var(--border-primary)]">
                                     {(monthlyTarget[cat.id] || []).map(item => (
                                        <ReportItem key={item.id} name={item.name} target={parseInt(item.amount) || 0} actual={categoryActuals[item.name] || 0} type={TransactionType.EXPENSE} />
                                    ))}
                                </div>
                            </AccordionSection>
                        ))}
                        {debtCategories.length === 0 && <p className="text-sm text-center text-[var(--text-tertiary)] py-4">Tidak ada target pembayaran utang.</p>}
                    </div>
                </div>
                 {/* TABUNGAN */}
                <div>
                    <SectionHeader title="Tabungan" color="savings" icon="fa-piggy-bank" />
                    <div className="space-y-3">
                        {savingsCategories.map(cat => (
                            <AccordionSection key={cat.id} title={cat.name} isOpen={true} badge={<i className="fa-solid fa-lock text-xs text-[var(--text-tertiary)]"></i>}>
                                <div className="divide-y divide-[var(--border-primary)]">
                                     {(monthlyTarget[cat.id] || []).map(item => (
                                        <ReportItem key={item.id} name={item.name} target={parseInt(item.amount) || 0} actual={categoryActuals[item.name] || 0} type={TransactionType.EXPENSE} />
                                    ))}
                                </div>
                            </AccordionSection>
                        ))}
                         {savingsCategories.length === 0 && <p className="text-sm text-center text-[var(--text-tertiary)] py-4">Tidak ada target tabungan.</p>}
                    </div>
                </div>
                 {/* PENGELUARAN */}
                <div>
                    <SectionHeader title="Pengeluaran" color="expense" icon="fa-arrow-up" />
                     <div className="space-y-3">
                        {expenseCategories.map(cat => (
                            <AccordionSection key={cat.id} title={cat.name} isOpen={true}>
                                <div className="divide-y divide-[var(--border-primary)]">
                                     {(monthlyTarget[cat.id] || []).map(item => (
                                        <ReportItem key={item.id} name={item.name} target={parseInt(item.amount) || 0} actual={categoryActuals[item.name] || 0} type={TransactionType.EXPENSE} />
                                    ))}
                                </div>
                            </AccordionSection>
                        ))}
                         {expenseCategories.length === 0 && <p className="text-sm text-center text-[var(--text-tertiary)] py-4">Tidak ada target pengeluaran lainnya.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActualsReportView;