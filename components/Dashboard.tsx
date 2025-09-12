import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
// FIX: Added UserCategory to the import list to be used in the DashboardProps interface.
import { SummaryCardData, Transaction, ArchivedMonthlyTarget, ArchivedActualReport, View, Account, DebtItem, SavingsGoal, TransactionType, MonthlyTarget, UserCategory } from '../types';
import SummaryCard from './SummaryCard';
import FinancialInsight from './FinancialInsight';
import Modal from './Modal';
import { IncomeIcon, ExpenseIcon, ShieldIcon, BalanceIcon } from './icons';

// --- INLINED ANALYTICS COMPONENTS ---

interface HighlightCardProps {
    icon: string;
    title: string;
    description: string;
    amount: number;
    color: 'income' | 'expense';
}

const HighlightCard: React.FC<HighlightCardProps> = ({ icon, title, description, amount, color }) => {
    const colorClass = color === 'income' ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]';
    const bgColor = color === 'income' ? 'var(--color-income)' : 'var(--color-expense)';
    const amountColorClass = amount < 0 ? 'text-[var(--color-expense)]' : colorClass;

    return (
        <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-5 overflow-hidden group">
            <div 
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full transition-all duration-500 opacity-5 group-hover:opacity-10 group-hover:scale-125"
                style={{ background: `radial-gradient(circle, ${bgColor} 0%, transparent 70%)` }}
            ></div>
            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-interactive)] ${colorClass}`}>
                        <i className={`fa-solid ${icon}`}></i>
                    </div>
                    <h3 className="font-semibold text-sm text-[var(--text-secondary)]">{title}</h3>
                </div>
                <p className={`text-2xl font-bold ${amountColorClass}`}>Rp {amount.toLocaleString('id-ID')}</p>
                <p className="text-sm text-[var(--text-tertiary)] truncate mt-1" title={description || 'N/A'}>{description || 'Tidak ada data'}</p>
            </div>
        </div>
    );
};

interface BreakdownData {
    name: string;
    value: number;
}

interface DetailedBreakdownProps {
    title: string;
    data: BreakdownData[];
    color: string;
    emptyText: string;
}

const renderBreakdownActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
        <g>
            <text x={cx} y={cy - 12} textAnchor="middle" fill={'var(--text-primary)'} className="font-bold text-sm" dominantBaseline="central">
                {payload.name}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill={'var(--text-secondary)'} className="font-semibold text-lg">{`Rp ${payload.value.toLocaleString('id-ID')}`}</text>
            <text x={cx} y={cy + 28} textAnchor="middle" fill={'var(--text-tertiary)'} className="text-xs">{`(${(percent * 100).toFixed(1)}%)`}</text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke={'var(--bg-secondary)'}
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 8px ${fill})` }}
            />
        </g>
    );
};

const DetailedBreakdown: React.FC<DetailedBreakdownProps> = ({ title, data, color, emptyText }) => {
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

    const pieColors = useMemo(() => {
        if (data.length === 0) return [];
        const baseColor = color.replace('var(', '').replace(')', '');
        const colorValue = getComputedStyle(document.documentElement).getPropertyValue(baseColor).trim();
        
        const hexToRgb = (hex: string) => {
          let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : null;
        };

        const rgb = hexToRgb(colorValue);
        if (!rgb) return Array(data.length).fill(color);

        return data.map((_, index) => {
            const opacity = 1 - (index / data.length) * 0.7;
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        });
    }, [data, color]);

    if (data.length === 0) {
        return (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6">
                 <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{title}</h2>
                 <div className="flex flex-col items-center justify-center min-h-[15rem]">
                    <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
                    <p className="text-center text-[var(--text-tertiary)]">{emptyText}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-60 animate-fade-in">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                dataKey="value"
                                nameKey="name"
                                innerRadius="70%"
                                outerRadius="100%"
                                paddingAngle={2}
                                activeShape={renderBreakdownActiveShape}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(-1)}
                                {...{ activeIndex: activeIndex }}
                            >
                                {data.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={pieColors[index]} 
                                        className="stroke-transparent focus:outline-none"
                                        style={{ filter: `drop-shadow(0 0 8px ${pieColors[index]})` }}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-60 pr-2">
                    {data.map((entry, index) => {
                        const percentage = totalValue > 0 ? (entry.value / totalValue) * 100 : 0;
                        return (
                            <div 
                                key={entry.name} 
                                className={`p-2 rounded-lg flex items-center justify-between text-sm transition-all duration-200 cursor-pointer ${activeIndex === index ? 'bg-[var(--bg-interactive-hover)]' : 'bg-transparent'}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(-1)}
                            >
                                <div className="flex items-center space-x-3 truncate">
                                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: pieColors[index] }}></span>
                                    <span className="text-[var(--text-secondary)] truncate" title={entry.name}>{entry.name}</span>
                                </div>
                                <div className="text-right flex-shrink-0 pl-2">
                                    <p className="font-semibold text-[var(--text-primary)]">
                                        Rp {entry.value.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-[var(--text-tertiary)]">
                                        {percentage.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const CustomTooltipAnnual = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const income = payload.find((p: any) => p.dataKey === 'income')?.value;
        const expense = payload.find((p: any) => p.dataKey === 'expense')?.value;
        const net = payload.find((p: any) => p.dataKey === 'netCashFlow')?.value;

        return (
            <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-xl text-[var(--text-primary)] p-4 rounded-xl shadow-2xl border border-[var(--border-secondary)] animate-fade-in">
                <p className="font-bold text-lg mb-2 border-b border-[var(--border-primary)] pb-2">{label}</p>
                {income !== undefined && <p className="text-[var(--color-income)]" style={{filter: 'drop-shadow(0 0 5px var(--color-income))'}}>Pemasukan: Rp {income.toLocaleString('id-ID')}</p>}
                {expense !== undefined && <p className="text-[var(--color-expense)]" style={{filter: 'drop-shadow(0 0 5px var(--color-expense))'}}>Pengeluaran: Rp {expense.toLocaleString('id-ID')}</p>}
                {net !== undefined && (
                    <p className={`font-semibold mt-2 pt-2 border-t border-[var(--border-primary)] ${net >= 0 ? 'text-[var(--color-net-positive)]' : 'text-[var(--color-net-negative)]'}`} style={{filter: `drop-shadow(0 0 5px ${net >= 0 ? 'text-[var(--color-net-positive)]' : 'text-[var(--color-net-negative)]'})`}}>
                        Arus Kas Bersih: Rp {net.toLocaleString('id-ID')}
                    </p>
                )}
            </div>
        );
    }
    return null;
};


// --- END INLINED COMPONENTS ---

interface DashboardProps {
    displayDate: Date;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    archivedTargets: ArchivedMonthlyTarget[];
    archivedActuals: ArchivedActualReport[];
    transactions: Transaction[];
    setView: (view: View) => void;
    isTargetSet: boolean;
    accounts: Account[];
    activeDebts: DebtItem[];
    savingsGoals: SavingsGoal[];
    activeSavingsGoals: SavingsGoal[];
    // FIX: Added the 'userCategories' prop to the interface to resolve the TypeScript error.
    userCategories: UserCategory[];
}

const DashboardCard: React.FC<{ title: string; children: React.ReactNode; rightContent?: React.ReactNode }> = ({ title, children, rightContent }) => (
    <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent">
      <div className="bg-[var(--bg-secondary)] rounded-[15px] overflow-hidden">
        <div className="p-6 flex justify-between items-center">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
            {rightContent}
        </div>
        <div className="border-t border-[var(--border-primary)] p-4 md:p-6">
            {children}
        </div>
      </div>
    </div>
);

const OverviewCard: React.FC<{ title: string; amount: number; icon: string; color: string; }> = ({ title, amount, icon, color }) => (
    <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent">
      <div className="relative bg-[var(--bg-secondary)] rounded-[15px] p-5 flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0`} style={{ borderColor: color, backgroundColor: `${color}1A`, color: color }}>
            <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
        <div>
            <p className="text-sm font-medium text-[var(--text-tertiary)]">{title}</p>
            <p className={`text-xl font-bold ${amount < 0 ? 'text-[var(--color-expense)]' : 'text-[var(--text-primary)]'}`}>Rp {amount.toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
);

const MiniGoalCard: React.FC<{ goal: SavingsGoal | DebtItem; type: 'savings' | 'debt' }> = ({ goal, type }) => {
  const isSavings = type === 'savings';
  const sg = isSavings ? (goal as SavingsGoal) : null;
  const d = !isSavings ? (goal as DebtItem) : null;

  const name = sg?.name || d?.name || '';
  const paidAmount = d ? d.payments.reduce((s, p) => s + p.amount, 0) : 0;
  const current = isSavings ? sg!.currentAmount : paidAmount;
  const total = isSavings ? sg!.targetAmount : d!.totalAmount;
  const progress = total > 0 ? (current / total) * 100 : 0;
  
  const barColor = isSavings ? 'var(--secondary-glow)' : 'var(--color-debt)';

  return (
    <div className="p-3 bg-[var(--bg-interactive)] rounded-lg">
      <div className="flex justify-between items-center text-xs mb-1">
        <p className="font-semibold text-[var(--text-secondary)] truncate">{name}</p>
        <p className="font-bold text-[var(--text-primary)]">{progress.toFixed(0)}%</p>
      </div>
      <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5">
        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: barColor }}></div>
      </div>
       <p className="text-xs text-right text-[var(--text-tertiary)] mt-1">
        Rp {current.toLocaleString('id-ID')} / {total.toLocaleString('id-ID')}
       </p>
    </div>
  );
};

const RecentTransactionItem: React.FC<{ transaction: Transaction; accountName: string | undefined }> = ({ transaction, accountName }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const color = isIncome ? 'var(--color-income)' : 'var(--color-expense)';
    const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';

    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3 min-w-0">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}1A`, color: color }}>
                    <i className={`fa-solid ${icon} text-sm`}></i>
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{transaction.description}</p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">{accountName}</p>
                </div>
            </div>
             <p className={`font-bold text-sm whitespace-nowrap`} style={{ color: color }}>
                {isIncome ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
            </p>
        </div>
    );
};

const DashboardSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; rightContent?: React.ReactNode }> = ({ title, children, defaultOpen = true, rightContent }) => (
    <div className="relative rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent">
      <details className="group/card bg-[var(--bg-secondary)] rounded-[15px] overflow-hidden" open={defaultOpen}>
        <summary className="list-none p-6 cursor-pointer flex justify-between items-center transition-colors group-hover/card:bg-[var(--bg-interactive-hover)]">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
            <div className="flex items-center space-x-4">
                {rightContent}
                <div className="w-8 h-8 flex items-center justify-center rounded-lg">
                  <i className="fa-solid fa-chevron-down text-[var(--text-tertiary)] transition-transform duration-300 group-open/card:rotate-180"></i>
                </div>
            </div>
        </summary>
        <div className="border-t border-[var(--border-primary)] p-4 md:p-6">
            {children}
        </div>
      </details>
    </div>
);

const getMetricsFromReport = (report: ArchivedActualReport | undefined) => {
    if (!report) return { income: 0, nonDebtExpenses: 0, debtInstallments: 0, totalExpenses: 0, savings: 0, netCashFlow: 0 };
    
    let income = 0, nonDebtExpenses = 0, debtInstallments = 0, savings = 0;

    (report.target.pendapatan || []).forEach(item => { income += parseInt(report.actuals[item.id] || '0'); });
    const nonDebtSections: (keyof typeof report.target)[] = ['pengeluaranUtama', 'kebutuhan', 'penunjang', 'pendidikan'];
    nonDebtSections.forEach(section => { (report.target[section] || []).forEach(item => { nonDebtExpenses += parseInt(report.actuals[item.id] || '0'); }); });
    (report.target.cicilanUtang || []).forEach(item => { debtInstallments += parseInt(report.actuals[item.id] || '0'); });
    (report.target.tabungan || []).forEach(item => { savings += parseInt(report.actuals[item.id] || '0'); });

    const totalExpenses = nonDebtExpenses + debtInstallments;
    const netCashFlow = income - totalExpenses;
    return { income, nonDebtExpenses, debtInstallments, totalExpenses, savings, netCashFlow };
};

const healthStatusDetails: { [key: string]: { icon: string; explanation: string; recommendation: string; } } = {
    "Sehat": { icon: "fa-shield-halved", explanation: "Kondisi keuangan Anda sangat baik! Arus kas positif, rasio utang terkendali, dan Anda rutin menabung.", recommendation: "Tingkatkan alokasi untuk investasi agar uang Anda dapat bertumbuh." },
    "Cukup Sehat": { icon: "fa-scale-balanced", explanation: "Keuangan Anda cukup stabil. Namun, ada ruang untuk perbaikan pada porsi tabungan atau rasio utang.", recommendation: "Coba tingkatkan porsi tabungan atau tinjau pengeluaran non-esensial." },
    "Perlu Perhatian": { icon: "fa-triangle-exclamation", explanation: "Arus kas negatif atau rasio utang terlalu tinggi. Kondisi ini berisiko dan perlu segera ditangani.", recommendation: "Prioritaskan untuk mengurangi pengeluaran atau mencari sumber pendapatan tambahan." },
    "Data Tidak Cukup": { icon: "fa-question-circle", explanation: "Data pendapatan atau pengeluaran bulan ini tidak cukup untuk analisis.", recommendation: "Pastikan Anda telah mengisi laporan aktual bulan ini untuk analisis mendalam." }
};

const healthStatusStyles = {
    "Sehat": { glowColor: 'var(--color-income)', textColor: 'text-[var(--color-income)]', },
    "Cukup Sehat": { glowColor: 'var(--color-warning)', textColor: 'text-[var(--color-warning)]', },
    "Perlu Perhatian": { glowColor: 'var(--color-expense)', textColor: 'text-[var(--color-expense)]', },
    "Data Tidak Cukup": { glowColor: 'var(--text-tertiary)', textColor: 'text-[var(--text-tertiary)]', }
};

const HealthAnalysisItem: React.FC<{ icon: string; iconColor: string; text: React.ReactNode }> = ({ icon, iconColor, text }) => (
    <div className="flex items-start space-x-3">
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center pt-0.5"><i className={`fa-solid ${icon} ${iconColor} text-base`}></i></div>
        <p className="text-sm text-[var(--text-secondary)] flex-1">{text}</p>
    </div>
);

const renderGaugeActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 4} // a bit more pop
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill} // fill is now a solid color
                stroke={'var(--bg-secondary)'}
                strokeWidth={2}
                cornerRadius={10}
            />
        </g>
    );
};


const GAUGE_CONFIG = {
    pengeluaran: { color: 'var(--color-expense)' },
    tabungan: { color: 'var(--color-savings)' },
    sisa: { color: 'var(--color-balance)' },
};
type AllocationItem = { name: string; value: number; config: typeof GAUGE_CONFIG[keyof typeof GAUGE_CONFIG] };

const Dashboard: React.FC<DashboardProps> = ({ displayDate, handlePrevMonth, handleNextMonth, archivedTargets, archivedActuals, transactions, setView, isTargetSet, accounts, activeDebts, savingsGoals, activeSavingsGoals }) => {
    const [isTargetMode, setIsTargetMode] = useState(false);
    const [activeAllocationIndex, setActiveAllocationIndex] = useState<number>(-1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- ANALYTICS STATE ---
    const [analyticsViewMode, setAnalyticsViewMode] = useState<'monthly' | 'yearly'>('monthly');
    const [analyticsDate, setAnalyticsDate] = useState(new Date());
    const [activeCashFlowIndex, setActiveCashFlowIndex] = useState<number | null>(null);


    const monthYearFormatter = useMemo(() => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }), []);

    const { summaryData, currentIncome, financialSummary } = useMemo(() => {
        const currentMonthStart = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
        const currentMonthEnd = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
        currentMonthStart.setHours(0, 0, 0, 0);
        currentMonthEnd.setHours(23, 59, 59, 999);
        
        const currentMonthYear = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;
        const prevMonthDate = new Date(displayDate);
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const prevMonthYear = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        
        const currentTargetReport = archivedTargets.find(a => a.monthYear === currentMonthYear);
        const monthlyTarget = currentTargetReport?.target;
        
        const prevActualReport = archivedActuals.find(a => a.monthYear === prevMonthYear);
        const prevMetrics = getMetricsFromReport(prevActualReport);

        let targetIncome = 0, targetTotalExpenses = 0, targetSavings = 0;
        if (monthlyTarget) {
            targetIncome = (monthlyTarget.pendapatan || []).reduce((sum, item) => sum + parseInt(item.amount), 0);
            const expenseSections: (keyof typeof monthlyTarget)[] = ['pengeluaranUtama', 'kebutuhan', 'penunjang', 'cicilanUtang', 'pendidikan'];
            expenseSections.forEach(section => {
                targetTotalExpenses += (monthlyTarget[section] || []).reduce((sum, item) => sum + parseInt(item.amount), 0);
            });
            targetSavings = (monthlyTarget.tabungan || []).reduce((sum, item) => sum + parseInt(item.amount), 0);
        }

        const currentMonthTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= currentMonthStart && txDate <= currentMonthEnd;
        });

        let actualIncome = 0;
        let actualTotalExpenses = 0;
        let actualSavings = 0;

        currentMonthTransactions.forEach(tx => {
            if (tx.type === TransactionType.INCOME) {
                actualIncome += tx.amount;
            } else {
                if (tx.category === 'Tabungan') {
                    actualSavings += tx.amount;
                } else {
                    actualTotalExpenses += tx.amount;
                }
            }
        });
        
        const actualSisaUang = actualIncome - actualTotalExpenses - actualSavings;
        const targetSisaUang = targetIncome - targetTotalExpenses - targetSavings;
        const prevSisaUang = prevMetrics.income - prevMetrics.totalExpenses - prevMetrics.savings;

        const emergencyFund = savingsGoals.find(g => g.isEmergencyFund);
        const emergencyFundAmount = emergencyFund ? emergencyFund.currentAmount : 0;
        const emergencyFundTarget = emergencyFund ? emergencyFund.targetAmount : 0;
        const contributionsThisMonth = emergencyFund?.contributions
            .filter(c => new Date(c.date) >= currentMonthStart)
            .reduce((sum, c) => sum + c.amount, 0) || 0;
        const amountAtStartOfMonth = emergencyFundAmount - contributionsThisMonth;
        
        const data: SummaryCardData[] = [
            { title: 'Pemasukan', amount: actualIncome, previousAmount: prevMetrics.income, target: targetIncome, icon: IncomeIcon, color: 'income', type: 'income' },
            { title: 'Pengeluaran', amount: actualTotalExpenses, previousAmount: prevMetrics.totalExpenses, target: targetTotalExpenses, icon: ExpenseIcon, color: 'expense', type: 'expense' },
            { title: 'Sisa Uang Bulan Ini', amount: actualSisaUang, previousAmount: prevSisaUang, target: targetSisaUang, icon: BalanceIcon, color: 'balance', type: 'balance' },
            { title: 'Dana Darurat Tersimpan', amount: emergencyFundAmount, previousAmount: amountAtStartOfMonth, target: emergencyFundTarget, icon: ShieldIcon, color: 'savings', type: 'savings' },
        ];
        
        const debtInstallments = currentMonthTransactions
            .filter(tx => tx.type === TransactionType.EXPENSE && tx.category === 'Utang')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const rasioHutang = actualIncome > 0 ? (debtInstallments / actualIncome) * 100 : 0;
        const rasioTabungan = actualIncome > 0 ? (actualSavings / actualIncome) * 100 : 0;
        const netCashFlow = actualIncome - actualTotalExpenses;
        
        let status = "Data Tidak Cukup";
        if (actualIncome > 0) {
            if (rasioHutang < 35 && rasioTabungan >= 10 && netCashFlow > 0) status = "Sehat";
            else if (netCashFlow > 0) status = "Cukup Sehat";
            else status = "Perlu Perhatian";
        }
        
        const totalAllocation = actualTotalExpenses + actualSavings;
        const isOverspent = actualIncome > 0 && totalAllocation > actualIncome;
        const overspendingAmount = isOverspent ? totalAllocation - actualIncome : 0;

        return { 
            summaryData: data, 
            currentIncome: actualIncome,
            financialSummary: {
                totalPendapatan: actualIncome, totalSemuaPengeluaran: actualTotalExpenses, totalTabungan: actualSavings, sisaUang: actualSisaUang, rasioHutang, rasioTabungan,
                status, styles: healthStatusStyles[status as keyof typeof healthStatusStyles], isOverspent, overspendingAmount,
            }
        };

    }, [displayDate, transactions, archivedTargets, archivedActuals, savingsGoals, activeDebts]);
    
    // --- ANALYTICS LOGIC ---
    const handlePrevAnalytics = () => setAnalyticsDate(d => {
        const newDate = new Date(d);
        if (analyticsViewMode === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
        else newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
    });

    const handleNextAnalytics = () => setAnalyticsDate(d => {
        const newDate = new Date(d);
        if (analyticsViewMode === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
        else newDate.setFullYear(newDate.getFullYear() - 1);
        return newDate;
    });

    const { analyticsFilteredTransactions, analyticsPeriodLabel } = useMemo(() => {
        let start: Date, end: Date;
        let periodText = '';
        const year = analyticsDate.getFullYear();
        const month = analyticsDate.getMonth();

        if (analyticsViewMode === 'monthly') {
            start = new Date(year, month, 1);
            end = new Date(year, month + 1, 0, 23, 59, 59, 999);
            periodText = start.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        } else {
            start = new Date(year, 0, 1);
            end = new Date(year, 11, 31, 23, 59, 59, 999);
            periodText = year.toString();
        }

        const txs = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= start && txDate <= end;
        });
        
        return { analyticsFilteredTransactions: txs, analyticsPeriodLabel: periodText };
    }, [transactions, analyticsViewMode, analyticsDate]);

    const analyticsHighlightData = useMemo(() => {
        const findMax = (txs: Transaction[], type: TransactionType) => txs.filter(t => t.type === type).reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null as Transaction | null);
        const calculateTotal = (txs: Transaction[], type: TransactionType) => txs.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0);
        
        const totalIncome = calculateTotal(analyticsFilteredTransactions, TransactionType.INCOME);
        const totalExpense = calculateTotal(analyticsFilteredTransactions, TransactionType.EXPENSE);
        const sisaUang = totalIncome - totalExpense;
        const maxIncome = findMax(analyticsFilteredTransactions, TransactionType.INCOME);
        const maxExpense = findMax(analyticsFilteredTransactions, TransactionType.EXPENSE);

        return { totalIncome, totalExpense, maxExpense, maxIncome, sisaUang };
    }, [analyticsFilteredTransactions]);

    const analyticsBreakdownData = useMemo(() => {
        const process = (txs: Transaction[], type: TransactionType) => Object.values(txs.filter(t => t.type === type).reduce((acc, t) => {
                if (!acc[t.category]) acc[t.category] = { name: t.category, value: 0 };
                acc[t.category].value += t.amount;
                return acc;
            }, {} as { [key: string]: { name: string, value: number } })).sort((a,b) => b.value - a.value);

        return { income: process(analyticsFilteredTransactions, TransactionType.INCOME), expense: process(analyticsFilteredTransactions, TransactionType.EXPENSE) }
    }, [analyticsFilteredTransactions]);
    
    const analyticsCashFlowData = useMemo(() => {
        const year = analyticsDate.getFullYear();
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({ month: new Date(year, i).toLocaleString('id-ID', { month: 'short' }), income: 0, expense: 0 }));
        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (txDate.getFullYear() === year) {
                const monthIndex = txDate.getMonth();
                if (tx.type === TransactionType.INCOME) monthlyData[monthIndex].income += tx.amount;
                else monthlyData[monthIndex].expense += tx.amount;
            }
        });
        return monthlyData.map(data => ({ ...data, netCashFlow: data.income - data.expense }));
    }, [analyticsDate, transactions]);

    const isNextAnalyticsDisabled = useMemo(() => {
        const now = new Date();
        if (analyticsViewMode === 'monthly') return analyticsDate.getFullYear() > now.getFullYear() || (analyticsDate.getFullYear() === now.getFullYear() && analyticsDate.getMonth() >= now.getMonth());
        return analyticsDate.getFullYear() >= now.getFullYear();
    }, [analyticsDate, analyticsViewMode]);

    const isNextMonthDisabled = useMemo(() => {
        const now = new Date();
        return displayDate.getFullYear() > now.getFullYear() || (displayDate.getFullYear() === now.getFullYear() && displayDate.getMonth() >= now.getMonth());
    }, [displayDate]);

    const healthDetails = healthStatusDetails[financialSummary.status];
    const { totalPendapatan, totalSemuaPengeluaran, totalTabungan, sisaUang, isOverspent } = financialSummary;
    const isDataAvailable = financialSummary.totalPendapatan > 0;
    
    const donutAllocationData = useMemo(() => {
        if (!isDataAvailable || totalPendapatan <= 0) return [];
        const itemsRaw: (Omit<AllocationItem, 'config'> & { key: keyof typeof GAUGE_CONFIG })[] = [
            { value: totalSemuaPengeluaran, name: 'Pengeluaran', key: 'pengeluaran' },
            { value: totalTabungan, name: 'Tabungan', key: 'tabungan' },
        ];
        if (!isOverspent && sisaUang > 0) itemsRaw.push({ value: sisaUang, name: 'Sisa Uang', key: 'sisa' });
        
        return itemsRaw
            .filter(item => item.value > 0)
            .map(item => ({
                ...item,
                config: GAUGE_CONFIG[item.key]
            }));
    }, [isDataAvailable, totalPendapatan, totalSemuaPengeluaran, totalTabungan, sisaUang, isOverspent]);
    
    const handleActualReportClick = () => {
        if (isTargetSet) setView(View.ADD_ACTUAL);
        else setIsModalOpen(true);
    };

    const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);
    const totalSavings = useMemo(() => activeSavingsGoals.reduce((sum, g) => sum + g.currentAmount, 0), [activeSavingsGoals]);
    const totalDebt = useMemo(() => activeDebts.reduce((sum, d) => {
      const paidAmount = d.payments.reduce((pSum, p) => pSum + p.amount, 0);
      return sum + (d.totalAmount - paidAmount);
    }, 0), [activeDebts]);

    const topGoals = useMemo(() => {
        const topSavings = [...activeSavingsGoals]
          .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))
          .slice(0, 2);
        
        const topDebts = [...activeDebts].sort((a, b) => {
          const paidA = a.payments.reduce((s, p) => s + p.amount, 0);
          const paidB = b.payments.reduce((s, p) => s + p.amount, 0);
          return (b.totalAmount > 0 ? paidB/b.totalAmount : 0) - (a.totalAmount > 0 ? paidA/a.totalAmount : 0)
        }).slice(0, 2);
    
        return { topSavings, topDebts };
    }, [activeSavingsGoals, activeDebts]);

    const recentTransactions = useMemo(() => transactions.slice(0, 4), [transactions]);
    const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc.name])), [accounts]);

    return (
    <>
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                    <p className="text-[var(--text-tertiary)]">{monthYearFormatter.format(displayDate)}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]"><i className="fa-solid fa-chevron-left"></i></button>
                    <button onClick={handleNextMonth} disabled={isNextMonthDisabled} className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]"><i className="fa-solid fa-chevron-right"></i></button>
                    <button onClick={() => setView(View.PROFILE)} className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)] ml-2" aria-label="Buka Profil"><img src="https://i.pravatar.cc/150?u=budihartono" alt="Profil" className="w-full h-full rounded-full object-cover"/></button>
                </div>
            </header>
            
            <DashboardCard title="Gambaran Umum Finansial">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <OverviewCard title="Saldo Dompet" amount={totalBalance} icon="fa-wallet" color="var(--color-balance)" />
                <OverviewCard title="Total Tabungan" amount={totalSavings} icon="fa-piggy-bank" color="var(--color-savings)" />
                <OverviewCard title="Total Hutang" amount={totalDebt} icon="fa-file-invoice-dollar" color="var(--color-debt)" />
              </div>
            </DashboardCard>

            <DashboardCard title="Ringkasan Bulan Ini" rightContent={
                <div className="flex items-center justify-center space-x-2 p-1 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-full max-w-xs">
                    <button onClick={() => setIsTargetMode(false)} className={`px-4 py-1.5 rounded-full w-1/2 text-xs font-semibold transition-all ${!isTargetMode ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-secondary)]'}`}>Aktual</button>
                    <button onClick={() => setIsTargetMode(true)} className={`px-4 py-1.5 rounded-full w-1/2 text-xs font-semibold transition-all ${isTargetMode ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-secondary)]'}`}>Target</button>
                </div>
            }>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryData.map(data => <SummaryCard key={data.title} data={data} isComparisonMode={isTargetMode} />)}
                </div>
                <div className="mt-6 border-t border-[var(--border-primary)] pt-4 grid grid-cols-2 gap-3">
                    <button onClick={() => setView(View.ADD_TARGET)} className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] font-semibold rounded-lg hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors text-sm">
                        <i className="fa-solid fa-bullseye"></i>Target
                    </button>
                     <button onClick={handleActualReportClick} className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] font-semibold rounded-lg hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors text-sm">
                        <i className="fa-solid fa-file-invoice-dollar"></i>Aktual
                    </button>
                    <button onClick={() => setView(View.TARGET_HISTORY)} className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] font-semibold rounded-lg hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors text-sm">
                        <i className="fa-solid fa-history"></i>Riwayat Target
                    </button>
                     <button onClick={() => setView(View.ACTUALS_HISTORY)} className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--bg-interactive)] border border-[var(--border-secondary)] text-[var(--text-secondary)] font-semibold rounded-lg hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors text-sm">
                        <i className="fa-solid fa-clipboard-list"></i>Riwayat Aktual
                    </button>
                </div>
            </DashboardCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title="Tujuan Finansial Utama" rightContent={
                     <button onClick={() => setView(View.MANAGEMENT)} className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Lihat Semua <i className="fa-solid fa-arrow-right ml-1"></i></button>
                }>
                    <div className="space-y-3">
                        {topGoals.topSavings.map(sg => <MiniGoalCard key={sg.id} goal={sg} type="savings" />)}
                        {topGoals.topDebts.map(d => <MiniGoalCard key={d.id} goal={d} type="debt" />)}
                        {topGoals.topSavings.length === 0 && topGoals.topDebts.length === 0 && <p className="text-sm text-center text-[var(--text-tertiary)] py-4">Belum ada tujuan aktif.</p>}
                    </div>
                </DashboardCard>

                <DashboardCard title="Aktivitas Terbaru" rightContent={
                    <button onClick={() => setView(View.TRANSACTIONS)} className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Lihat Semua <i className="fa-solid fa-arrow-right ml-1"></i></button>
                }>
                    <div className="divide-y divide-[var(--border-primary)]">
                        {recentTransactions.map(tx => <RecentTransactionItem key={tx.id} transaction={tx} accountName={accountMap.get(tx.accountId)} />)}
                         {recentTransactions.length === 0 && <p className="text-sm text-center text-[var(--text-tertiary)] py-8">Belum ada transaksi bulan ini.</p>}
                    </div>
                </DashboardCard>
            </div>
            
             <DashboardSection title="Analisis & Kesehatan Keuangan" rightContent={<span className={`hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--bg-interactive)] ${financialSummary.styles.textColor}`}>{financialSummary.status}</span>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="animate-fade-in-up" style={{animationDelay: '100ms'}}>
                           <h4 className="font-bold text-lg text-[var(--text-primary)] mb-3">Alokasi Dana</h4>
                           {isDataAvailable ? (
                            <div className="flex flex-col lg:flex-row gap-8 items-center">
                                <div className="relative w-52 h-52 lg:w-60 lg:h-60 flex-shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[{ value: 100 }]}
                                                dataKey="value"
                                                startAngle={225}
                                                endAngle={-45}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="80%"
                                                outerRadius="100%"
                                                fill="var(--bg-interactive)"
                                                stroke="none"
                                            />
                                            <Pie
                                                data={donutAllocationData}
                                                dataKey="value"
                                                startAngle={225}
                                                endAngle={-45}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="80%"
                                                outerRadius="100%"
                                                paddingAngle={4}
                                                activeShape={renderGaugeActiveShape}
                                                onMouseEnter={(_, index) => setActiveAllocationIndex(index)}
                                                onMouseLeave={() => setActiveAllocationIndex(-1)}
                                                // FIX: The 'activeIndex' prop is not recognized by the current TypeScript definitions for Recharts.
                                                // Using a spread operator bypasses this type-checking issue, which is a common workaround.
                                                {...{ activeIndex: activeAllocationIndex }}
                                                // FIX: The 'cornerRadius' prop has been moved from the invalid <Cell> component to the parent <Pie> component to style all sectors.
                                                cornerRadius={10}
                                            >
                                                {donutAllocationData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.config.color}
                                                        stroke="none"
                                                        fillOpacity={activeAllocationIndex === -1 || activeAllocationIndex === index ? 1 : 0.4}
                                                        style={{ transition: 'opacity 0.3s ease' }}
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-10 rounded-full bg-[var(--bg-secondary)]/70 backdrop-blur-lg border border-white/10 shadow-2xl flex items-center justify-center pointer-events-none">
                                        <div className="text-center animate-fade-in flex flex-col items-center justify-center p-2">
                                            {(() => {
                                                const activeSegment = activeAllocationIndex !== -1 ? donutAllocationData[activeAllocationIndex] : null;
                                                const dataToShow = activeSegment || {
                                                    name: isOverspent ? 'Dana Terlampaui' : 'Sisa Uang',
                                                    value: isOverspent ? financialSummary.overspendingAmount : financialSummary.sisaUang,
                                                    config: { color: isOverspent ? GAUGE_CONFIG.pengeluaran.color : GAUGE_CONFIG.sisa.color }
                                                };

                                                const percentage = financialSummary.totalPendapatan > 0
                                                    ? (dataToShow.value / financialSummary.totalPendapatan) * 100
                                                    : 0;

                                                return (
                                                    <>
                                                        <p className="text-sm font-semibold leading-tight" style={{ color: dataToShow.config.color }}>
                                                            {dataToShow.name}
                                                        </p>
                                                        <p className={`font-bold text-2xl leading-tight my-1 ${isOverspent && !activeSegment ? 'text-[var(--color-expense)]' : 'text-[var(--text-primary)]'}`}>
                                                            Rp {(isOverspent && !activeSegment ? -dataToShow.value : dataToShow.value).toLocaleString('id-ID')}
                                                        </p>
                                                        {dataToShow.name !== 'Dana Terlampaui' &&
                                                            <p className="text-xs text-[var(--text-tertiary)] leading-none">
                                                                {percentage.toFixed(1)}% dari Pendapatan
                                                            </p>
                                                        }
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 w-full">
                                    {donutAllocationData.map((segment, index) => {
                                        const percentage = financialSummary.totalPendapatan > 0 ? (segment.value / financialSummary.totalPendapatan) * 100 : 0;
                                        return(
                                            <div key={segment.name} className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer ${activeAllocationIndex === index ? 'bg-[var(--bg-interactive-hover)]' : 'bg-[var(--bg-interactive)]'}`} onMouseEnter={() => setActiveAllocationIndex(index)} onMouseLeave={() => setActiveAllocationIndex(-1)}>
                                                <div className="flex items-center space-x-3">
                                                    <span className="w-4 h-4 rounded-md flex-shrink-0" style={{ backgroundColor: segment.config.color, boxShadow: `0 0 8px ${segment.config.color}` }}></span>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-[var(--text-secondary)]">{segment.name}</span>
                                                        <span className="text-xs text-[var(--text-tertiary)]">{percentage.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">Rp {segment.value.toLocaleString('id-ID')}</span>
                                            </div>
                                        )
                                    })}
                                    {isOverspent && (<p className="text-xs text-red-400 font-semibold text-center animate-pulse pt-2"><i className="fa-solid fa-triangle-exclamation mr-1"></i>Alokasi melebihi pendapatan.</p>)}
                                </div>
                            </div>
                           ) : (
                            <div className="w-full h-10 flex items-center justify-center bg-[var(--bg-interactive)] rounded-lg px-4 border border-[var(--border-primary)]"><p className="text-sm text-[var(--text-tertiary)] font-medium"><i className="fa-solid fa-info-circle mr-2"></i>Data pendapatan bulan ini belum diisi.</p></div>
                           )}
                        </div>
                        <div className="space-y-3 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                           <HealthAnalysisItem icon={isDataAvailable ? (financialSummary.rasioTabungan >= 10 ? "fa-circle-check" : "fa-circle-exclamation") : "fa-question-circle"} iconColor={isDataAvailable ? (financialSummary.rasioTabungan >= 10 ? "text-[var(--color-income)]" : "text-[var(--color-warning)]") : "text-[var(--text-tertiary)]"} text={isDataAvailable ? <>Rasio Tabungan Anda <strong>{financialSummary.rasioTabungan.toFixed(1)}%</strong>, {financialSummary.rasioTabungan >= 10 ? 'di atas ideal (> 10%)' : 'di bawah ideal (> 10%)'}.</> : <>Rasio Tabungan: <strong>--%</strong>.</>} />
                           <HealthAnalysisItem icon={isDataAvailable ? (financialSummary.rasioHutang < 35 ? "fa-circle-check" : "fa-circle-exclamation") : "fa-question-circle"} iconColor={isDataAvailable ? (financialSummary.rasioHutang < 35 ? "text-[var(--color-income)]" : "text-[var(--color-warning)]") : "text-[var(--text-tertiary)]"} text={isDataAvailable ? <>Rasio Utang Anda <strong>{financialSummary.rasioHutang.toFixed(1)}%</strong>, {financialSummary.rasioHutang < 35 ? 'dalam batas aman' : 'mendekati batas'} ({'<'} 35%).</> : <>Rasio Utang: <strong>--%</strong>.</>} />
                        </div>
                    </div>
                    <div className="relative rounded-2xl p-6 flex flex-col justify-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] animate-fade-in-up" style={{animationDelay: '300ms', boxShadow: `0 0 40px -10px ${financialSummary.styles.glowColor}40`}}>
                        <div className="flex items-center space-x-3">
                           <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{backgroundColor: financialSummary.styles.glowColor, boxShadow: `0 0 15px ${financialSummary.styles.glowColor}`}}><i className={`fa-solid ${healthDetails.icon} text-xl`}></i></div>
                           <div><p className={`text-sm font-semibold ${financialSummary.styles.textColor}`}>Status Anda:</p><h4 className="font-bold text-2xl text-[var(--text-primary)]">{financialSummary.status}</h4></div>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-4">{healthDetails.explanation}</p>
                        <div className="text-sm font-semibold text-[var(--text-secondary)] mt-4 p-4 bg-[var(--bg-interactive)]/50 rounded-lg"><p className={`font-bold mb-1 ${financialSummary.styles.textColor}`}>Rekomendasi:</p><p className="font-normal">{healthDetails.recommendation}</p></div>
                    </div>
                </div>
            </DashboardSection>

             <DashboardSection title="Pusat Analitik" defaultOpen={false} rightContent={
                <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center p-1 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-full">
                        <button onClick={() => setAnalyticsViewMode('monthly')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${analyticsViewMode === 'monthly' ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-tertiary)]'}`}>Bulanan</button>
                        <button onClick={() => setAnalyticsViewMode('yearly')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${analyticsViewMode === 'yearly' ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-tertiary)]'}`}>Tahunan</button>
                    </div>
                    <div className="hidden sm:flex items-center justify-between space-x-1 bg-[var(--bg-interactive)] border border-[var(--border-primary)] rounded-full p-0.5">
                        <button onClick={handlePrevAnalytics} className="w-8 h-8 rounded-full text-[var(--text-secondary)] flex items-center justify-center transition-colors hover:bg-[var(--bg-interactive-hover)]"><i className="fa-solid fa-chevron-left"></i></button>
                        <span className="font-semibold text-sm text-center w-32 text-[var(--text-primary)]">{analyticsPeriodLabel}</span>
                        <button onClick={handleNextAnalytics} disabled={isNextAnalyticsDisabled} className="w-8 h-8 rounded-full text-[var(--text-secondary)] flex items-center justify-center transition-colors hover:bg-[var(--bg-interactive-hover)] disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>
             }>
                {analyticsViewMode === 'monthly' ? (
                    <div className="animate-fade-in space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <HighlightCard icon="fa-arrow-down" title="Total Pemasukan" description="Total dari semua sumber" amount={analyticsHighlightData.totalIncome} color="income" />
                            <HighlightCard icon="fa-arrow-up" title="Total Pengeluaran" description="Total dari semua kategori" amount={analyticsHighlightData.totalExpense} color="expense" />
                            <HighlightCard icon={analyticsHighlightData.sisaUang >= 0 ? 'fa-scale-balanced' : 'fa-scale-unbalanced-flip'} title="Sisa Uang" description="Pemasukan - Pengeluaran" amount={analyticsHighlightData.sisaUang} color={analyticsHighlightData.sisaUang >= 0 ? 'income' : 'expense'} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <HighlightCard icon="fa-trophy" title="Pemasukan Terbesar" description={analyticsHighlightData.maxIncome?.description} amount={analyticsHighlightData.maxIncome?.amount || 0} color="income" />
                            <HighlightCard icon="fa-cart-shopping" title="Pengeluaran Terbesar" description={analyticsHighlightData.maxExpense?.description} amount={analyticsHighlightData.maxExpense?.amount || 0} color="expense" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DetailedBreakdown title="Rincian Pemasukan" data={analyticsBreakdownData.income} color="var(--color-income)" emptyText="Tidak ada data pemasukan." />
                            <DetailedBreakdown title="Rincian Pengeluaran" data={analyticsBreakdownData.expense} color="var(--color-expense)" emptyText="Tidak ada data pengeluaran." />
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <HighlightCard icon="fa-arrow-down" title="Total Pemasukan (YTD)" description="Total dari semua sumber" amount={analyticsHighlightData.totalIncome} color="income" />
                            <HighlightCard icon="fa-arrow-up" title="Total Pengeluaran (YTD)" description="Total dari semua kategori" amount={analyticsHighlightData.totalExpense} color="expense" />
                            <HighlightCard icon={analyticsHighlightData.sisaUang >= 0 ? 'fa-scale-balanced' : 'fa-scale-unbalanced-flip'} title="Arus Kas Bersih (YTD)" description="Pemasukan - Pengeluaran" amount={analyticsHighlightData.sisaUang} color={analyticsHighlightData.sisaUang >= 0 ? 'income' : 'expense'} />
                        </div>
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Arus Kas Tahunan</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={analyticsCashFlowData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} onMouseMove={(state) => setActiveCashFlowIndex(state.isTooltipActive && typeof state.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null)} onMouseLeave={() => setActiveCashFlowIndex(null)}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/></linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0}/></linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="var(--border-primary)" strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                                        <YAxis tickFormatter={(value) => `${value/1000000} Jt`} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                                        <RechartsTooltip content={<CustomTooltipAnnual />} />
                                        <Legend wrapperStyle={{ color: 'var(--text-secondary)' }}/>
                                        <Area type="monotone" dataKey="income" name="Pemasukan" stroke="var(--color-income)" fillOpacity={1} fill="url(#colorIncome)" />
                                        <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="var(--color-expense)" fillOpacity={1} fill="url(#colorExpense)" />
                                        <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} legendType="none" style={{ filter: 'drop-shadow(0 0 5px var(--color-income))' }} />
                                        <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} dot={false} legendType="none" style={{ filter: 'drop-shadow(0 0 5px var(--color-expense))' }} />
                                        <Bar dataKey="netCashFlow" name="Arus Kas Bersih" barSize={20}>
                                            {analyticsCashFlowData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.netCashFlow >= 0 ? 'var(--color-net-positive)' : 'var(--color-net-negative)'} fillOpacity={activeCashFlowIndex === null || activeCashFlowIndex === index ? 1 : 0.5}/>))}
                                        </Bar>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
             </DashboardSection>

            <FinancialInsight transactions={transactions} income={currentIncome} expense={financialSummary.totalSemuaPengeluaran} />
        </div>

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-2xl p-8 text-center">
                <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute top-4 right-4 w-10 h-10 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors z-10" 
                    aria-label="Close modal"
                >
                    <i className="fa-solid fa-times text-xl"></i>
                </button>

                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] shadow-lg shadow-[var(--primary-glow)]/30 mb-6">
                    <i className="fa-solid fa-bullseye text-4xl text-white"></i>
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Target Belum Dibuat</h3>
                <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
                    Anda harus membuat <strong>Target Bulanan</strong> terlebih dahulu sebelum dapat melihat Laporan Aktual.
                </p>

                <div className="flex flex-col gap-4">
                    <button 
                        type="button" 
                        onClick={() => { setIsModalOpen(false); setView(View.ADD_TARGET); }} 
                        className="w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:shadow-[var(--primary-glow)]/30 transform hover:scale-105 transition-all duration-300"
                    >
                        Buat Target Sekarang
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)} 
                        className="w-full bg-transparent text-[var(--text-tertiary)] font-semibold py-3 px-6 rounded-full hover:bg-[var(--bg-interactive-hover)] transition-colors"
                    >
                        Nanti Saja
                    </button>
                </div>
            </div>
        </Modal>
    </>
    );
};

export default Dashboard;