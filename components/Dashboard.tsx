import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { SummaryCardData, Transaction, ArchivedMonthlyTarget, ArchivedActualReport, View, Account } from '../types';
import SummaryCard from './SummaryCard';
import FinancialInsight from './FinancialInsight';
import Modal from './Modal';
// FIX: Import missing icon components.
import { IncomeIcon, ExpenseIcon, BalanceIcon, SavingsIcon, WalletIcon } from './icons';

interface DashboardProps {
    displayDate: Date;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    archivedTargets: ArchivedMonthlyTarget[];
    archivedActuals: ArchivedActualReport[];
    transactions: Transaction[]; // Still needed for Gemini
    setView: (view: View) => void;
    isTargetSet: boolean;
    accounts: Account[];
}

const ManagementCard: React.FC<{
    title: string;
    description: string;
    icon: string;
    gradientFrom: string;
    gradientTo: string;
    actionText: string;
    onClick: () => void;
    onHistoryClick: () => void;
}> = ({ title, description, icon, gradientFrom, gradientTo, actionText, onClick, onHistoryClick }) => (
    <div className="group relative bg-[var(--bg-secondary)] backdrop-blur-lg rounded-2xl shadow-lg border border-[var(--border-primary)] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-[var(--border-secondary)] flex flex-col">
        <div 
            className="absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
                boxShadow: `inset 0 0 20px 0 ${gradientFrom}80`,
                border: `1px solid ${gradientFrom}`
            }}
        ></div>
        <div className="relative p-6 flex-grow flex flex-col justify-between">
            <div className="flex items-start space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-interactive)] flex items-center justify-center border border-[var(--border-primary)] flex-shrink-0">
                    <i className={`fa-solid ${icon} text-4xl bg-clip-text text-transparent`} style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`}}></i>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
                    <p className="text-[var(--text-tertiary)] text-sm mt-1">{description}</p>
                </div>
            </div>
        </div>
         <div className="relative bg-[var(--bg-interactive)]/50 px-6 py-4 mt-auto border-t border-[var(--border-primary)] flex flex-col sm:flex-row gap-3">
            <button
                onClick={onClick}
                className="flex-1 text-white font-bold py-2.5 px-4 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all text-sm"
                style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}
            >
                {actionText}
            </button>
            <button
                onClick={onHistoryClick}
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] text-[var(--text-secondary)] font-semibold py-2.5 px-4 rounded-full hover:bg-[var(--bg-interactive-hover)] hover:text-[var(--text-primary)] transition-colors text-sm"
            >
                Lihat Riwayat
            </button>
        </div>
    </div>
);


const DashboardSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; rightContent?: React.ReactNode }> = ({ title, children, defaultOpen = true, rightContent }) => (
    <details className="group/card relative bg-[var(--bg-interactive)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl shadow-lg overflow-hidden transition-all duration-300" open={defaultOpen}>
        <summary className="relative list-none p-6 cursor-pointer flex justify-between items-center transition-colors group-hover/card:bg-[var(--bg-interactive-hover)]">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
            <div className="flex items-center space-x-4">
                {rightContent}
                <div className="w-8 h-8 flex items-center justify-center bg-[var(--bg-interactive)]/50 rounded-full">
                  <i className="fa-solid fa-chevron-down text-[var(--text-tertiary)] transition-transform duration-300 group-open/card:rotate-180"></i>
                </div>
            </div>
        </summary>
        <div className="relative border-t border-[var(--border-primary)] p-4 md:p-6">
            {children}
        </div>
    </details>
);


const getMetricsFromReport = (report: ArchivedActualReport | undefined) => {
    if (!report) return { income: 0, nonDebtExpenses: 0, debtInstallments: 0, totalExpenses: 0, savings: 0, netCashFlow: 0, composition: [], allOutflows: 0 };
    
    let income = 0, nonDebtExpenses = 0, debtInstallments = 0, savings = 0;
    const compositionAgg: { [key: string]: { value: number; category: 'expense' | 'debt' | 'savings' } } = {};

    const addToComposition = (name: string, value: number, category: 'expense' | 'debt' | 'savings') => {
        if (value > 0) {
            if (!compositionAgg[name]) {
                compositionAgg[name] = { value: 0, category };
            }
            compositionAgg[name].value += value;
        }
    };

    (report.target.pendapatan || []).forEach(item => {
        income += parseInt(report.actuals[item.id] || '0');
    });

    const nonDebtSections: (keyof typeof report.target)[] = ['pengeluaranUtama', 'kebutuhan', 'penunjang', 'pendidikan'];
    nonDebtSections.forEach(section => {
        (report.target[section] || []).forEach(item => {
            const actualAmount = parseInt(report.actuals[item.id] || '0');
            nonDebtExpenses += actualAmount;
            addToComposition(item.name, actualAmount, 'expense');
        });
    });
    
    (report.target.cicilanUtang || []).forEach(item => {
        const actualAmount = parseInt(report.actuals[item.id] || '0');
        debtInstallments += actualAmount;
        addToComposition(item.name, actualAmount, 'debt');
    });

    (report.target.tabungan || []).forEach(item => {
        const actualAmount = parseInt(report.actuals[item.id] || '0');
        savings += actualAmount;
        addToComposition(item.name, actualAmount, 'savings');
    });

    const composition = Object.entries(compositionAgg).map(([name, data]) => ({ name, ...data }));
    const totalExpenses = nonDebtExpenses + debtInstallments;
    const netCashFlow = income - totalExpenses;
    const allOutflows = totalExpenses + savings;

    return { income, nonDebtExpenses, debtInstallments, totalExpenses, savings, netCashFlow, composition, allOutflows };
};

const healthStatusDetails: { [key: string]: { icon: string; explanation: string; recommendation: string; } } = {
    "Sehat": {
        icon: "fa-shield-halved",
        explanation: "Kondisi keuangan Anda sangat baik! Arus kas positif, rasio utang terkendali, dan Anda rutin menabung. Pertahankan kebiasaan baik ini.",
        recommendation: "Tingkatkan alokasi untuk investasi agar uang Anda dapat bertumbuh dan mencapai tujuan jangka panjang lebih cepat."
    },
    "Cukup Sehat": {
        icon: "fa-balance-scale",
        explanation: "Keuangan Anda cukup stabil dengan arus kas positif. Namun, ada ruang untuk perbaikan, terutama pada porsi tabungan atau rasio utang.",
        recommendation: "Cobalah tingkatkan porsi tabungan Anda secara bertahap atau tinjau kembali pengeluaran yang tidak esensial untuk memperkuat posisi keuangan."
    },
    "Perlu Perhatian": {
        icon: "fa-triangle-exclamation",
        explanation: "Arus kas Anda negatif atau rasio utang terlalu tinggi. Kondisi ini berisiko dan perlu segera ditangani untuk menghindari masalah lebih lanjut.",
        recommendation: "Prioritaskan untuk mengurangi pengeluaran atau mencari sumber pendapatan tambahan. Buat daftar pengeluaran untuk menemukan area yang bisa dihemat."
    },
     "Data Tidak Cukup": {
        icon: "fa-question-circle",
        explanation: "Data pendapatan atau pengeluaran bulan ini tidak mencukupi untuk melakukan analisis kesehatan keuangan yang akurat.",
        recommendation: "Pastikan Anda telah mengisi laporan aktual untuk bulan ini agar kami dapat memberikan analisis yang lebih mendalam."
    }
};

const healthStatusStyles = {
    "Sehat": {
        glowColor: 'var(--color-income)',
        textColor: 'text-[var(--color-income)]',
    },
    "Cukup Sehat": {
        glowColor: 'var(--color-warning)',
        textColor: 'text-[var(--color-warning)]',
    },
    "Perlu Perhatian": {
        glowColor: 'var(--color-expense)',
        textColor: 'text-[var(--color-expense)]',
    },
    "Data Tidak Cukup": {
        glowColor: 'var(--text-tertiary)',
        textColor: 'text-[var(--text-tertiary)]',
    }
};

const HealthAnalysisItem: React.FC<{ icon: string; iconColor: string; text: React.ReactNode }> = ({ icon, iconColor, text }) => (
    <div className="flex items-start space-x-3">
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center pt-0.5">
            <i className={`fa-solid ${icon} ${iconColor} text-base`}></i>
        </div>
        <p className="text-sm text-[var(--text-secondary)] flex-1">{text}</p>
    </div>
);

// Active shape for the Allocation Donut - now simplified
const renderAllocationActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;

    return (
        <g>
            <text x={cx} y={cy - 8} textAnchor="middle" fill={'var(--text-secondary)'} className="font-bold text-sm" dominantBaseline="central">
                {payload.name}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={'var(--text-primary)'} className="font-semibold text-lg">
                {`Rp ${payload.value.toLocaleString('id-ID')}`}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke={fill}
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 8px ${fill})` }}
            />
        </g>
    );
};


const DONUT_COLORS = {
    pengeluaran: 'var(--color-expense)',
    tabungan: 'var(--color-savings)',
    sisa: 'var(--color-income)',
};
type AllocationItem = { name: string; value: number; color: string };

const Dashboard: React.FC<DashboardProps> = ({ displayDate, handlePrevMonth, handleNextMonth, archivedTargets, archivedActuals, transactions, setView, isTargetSet, accounts }) => {
    const [isTargetMode, setIsTargetMode] = useState(false);
    const [activeAllocationIndex, setActiveAllocationIndex] = useState<number>(-1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const monthYearFormatter = useMemo(() => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }), []);

    const { 
        summaryData, 
        currentMonthTransactions, 
        currentIncome, 
        financialSummary 
    } = useMemo(() => {
        const currentMonthYear = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;
        
        const prevMonthDate = new Date(displayDate);
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const prevMonthYear = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

        const currentActualReport = archivedActuals.find(a => a.monthYear === currentMonthYear);
        const prevActualReport = archivedActuals.find(a => a.monthYear === prevMonthYear);
        const currentTargetReport = archivedTargets.find(a => a.monthYear === currentMonthYear);

        const currentMetrics = getMetricsFromReport(currentActualReport);
        const prevMetrics = getMetricsFromReport(prevActualReport);

        let targetIncome = 0, targetTotalExpenses = 0, targetSavings = 0;
        if (currentTargetReport) {
             targetIncome = currentTargetReport.target.pendapatan.reduce((sum, item) => sum + parseInt(item.amount), 0);
             const expenseSections: (keyof typeof currentTargetReport.target)[] = ['pengeluaranUtama', 'kebutuhan', 'penunjang', 'cicilanUtang', 'pendidikan'];
             expenseSections.forEach(section => {
                targetTotalExpenses += currentTargetReport.target[section].reduce((sum, item) => sum + parseInt(item.amount), 0);
             });
             targetSavings = currentTargetReport.target.tabungan.reduce((sum, item) => sum + parseInt(item.amount), 0);
        }

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        const data: SummaryCardData[] = [
            { title: 'Pemasukan', amount: currentMetrics.income, previousAmount: prevMetrics.income, target: targetIncome, icon: IncomeIcon, color: 'income', type: 'income' },
            { title: 'Pengeluaran', amount: currentMetrics.totalExpenses, previousAmount: prevMetrics.totalExpenses, target: targetTotalExpenses, icon: ExpenseIcon, color: 'expense', type: 'expense' },
            { title: 'Total Saldo', amount: totalBalance, previousAmount: 0, target: undefined, icon: WalletIcon, color: 'balance', type: 'balance' },
            { title: 'Tabungan Bulan Ini', amount: currentMetrics.savings, previousAmount: prevMetrics.savings, target: targetSavings, icon: SavingsIcon, color: 'savings', type: 'savings' },
        ];
        
        const currentTxs = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === displayDate.getFullYear() && txDate.getMonth() === displayDate.getMonth();
        });

        // Financial Summary Calculations
        const { income, debtInstallments, totalExpenses, savings } = currentMetrics;
        const rasioHutang = income > 0 ? (debtInstallments / income) * 100 : 0;
        const rasioTabungan = income > 0 ? (savings / income) * 100 : 0;
        const netCashFlow = income - totalExpenses;
        const rasioSisaUang = income > 0 ? (netCashFlow / income) * 100 : 0;
        
        let status = "Data Tidak Cukup";
        if (income > 0) {
            if (rasioHutang < 35 && rasioTabungan >= 10 && netCashFlow > 0) {
                status = "Sehat";
            } else if (netCashFlow > 0) {
                status = "Cukup Sehat";
            } else {
                status = "Perlu Perhatian";
            }
        }
        
        const sisa = income - totalExpenses - savings;

        const totalAllocation = totalExpenses + savings;
        const isOverspent = income > 0 && totalAllocation > income;
        const overspendingAmount = isOverspent ? totalAllocation - income : 0;

        return { 
            summaryData: data, 
            currentMonthTransactions: currentTxs,
            currentIncome: currentMetrics.income,
            financialSummary: {
                totalPendapatan: income,
                totalSemuaPengeluaran: totalExpenses,
                totalTabungan: savings,
                sisaUang: sisa,
                rasioHutang,
                rasioTabungan,
                rasioSisaUang,
                status,
                styles: healthStatusStyles[status as keyof typeof healthStatusStyles],
                isOverspent,
                overspendingAmount,
            }
        };

    }, [displayDate, archivedActuals, archivedTargets, transactions, accounts]);
    
    const isNextMonthDisabled = useMemo(() => {
        const now = new Date();
        return displayDate.getFullYear() > now.getFullYear() || (displayDate.getFullYear() === now.getFullYear() && displayDate.getMonth() >= now.getMonth());
    }, [displayDate]);

    const healthDetails = healthStatusDetails[financialSummary.status];
    const { totalPendapatan, totalSemuaPengeluaran, totalTabungan, sisaUang, isOverspent } = financialSummary;
    const isDataAvailable = financialSummary.totalPendapatan > 0;
    
    const donutAllocationData = useMemo(() => {
        if (!isDataAvailable) return [];
        
        const itemsRaw: Omit<AllocationItem, 'pct'>[] = [
            { value: totalSemuaPengeluaran, name: 'Pengeluaran', color: DONUT_COLORS.pengeluaran },
            { value: totalTabungan, name: 'Tabungan', color: DONUT_COLORS.tabungan },
        ];
        
        if (!isOverspent && sisaUang > 0) {
            itemsRaw.push({ value: sisaUang, name: 'Sisa Uang', color: DONUT_COLORS.sisa });
        }
    
        return itemsRaw.filter(item => item.value > 0);
    }, [isDataAvailable, totalSemuaPengeluaran, totalTabungan, sisaUang, isOverspent]);
    
    const totalDonutValue = useMemo(() => {
        return donutAllocationData.reduce((sum, item) => sum + item.value, 0);
    }, [donutAllocationData]);
    
    const isSavingsRatioIdeal = isDataAvailable && financialSummary.rasioTabungan >= 10;
    
    const handleActualReportClick = () => {
        if (isTargetSet) {
            setView(View.ADD_ACTUAL);
        } else {
            setIsModalOpen(true);
        }
    };

    return (
    <>
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                    <p className="text-[var(--text-tertiary)]">{monthYearFormatter.format(displayDate)}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full bg-[var(--bg-interactive)] text-[var(--text-secondary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]">
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button onClick={handleNextMonth} disabled={isNextMonthDisabled} className="w-10 h-10 rounded-full bg-[var(--bg-interactive)] text-[var(--text-secondary)] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)]">
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                     <button onClick={() => setView(View.PROFILE)} className="w-10 h-10 rounded-full bg-[var(--bg-interactive)] text-[var(--text-secondary)] flex items-center justify-center transition-colors shadow-sm hover:bg-[var(--bg-interactive-hover)] border border-[var(--border-primary)] ml-2" aria-label="Buka Profil">
                        <img src="https://i.pravatar.cc/150?u=budihartono" alt="Profil" className="w-full h-full rounded-full object-cover"/>
                    </button>
                </div>
            </header>

            <div className="flex items-center justify-center space-x-2 p-1 bg-[var(--bg-interactive)] backdrop-blur-sm border border-[var(--border-primary)] rounded-full w-full max-w-xs mx-auto">
                <button onClick={() => setIsTargetMode(false)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${!isTargetMode ? 'bg-[var(--primary-600)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>
                    Aktual
                </button>
                <button onClick={() => setIsTargetMode(true)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${isTargetMode ? 'bg-[var(--primary-600)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>
                    Target
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryData.map(data => (
                    <SummaryCard key={data.title} data={data} isComparisonMode={isTargetMode} />
                ))}
            </div>
            
            <DashboardSection title="Perencanaan & Analitik">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ManagementCard 
                        title="Buat/Ubah Target"
                        description="Rencanakan alokasi pendapatan Anda untuk bulan ini."
                        icon="fa-bullseye"
                        gradientFrom="var(--color-expense)"
                        gradientTo="var(--color-debt)"
                        actionText="Mulai Merencanakan"
                        onClick={() => setView(View.ADD_TARGET)}
                        onHistoryClick={() => setView(View.TARGET_HISTORY)}
                    />
                    <ManagementCard 
                        title="Laporan Aktual"
                        description="Lihat realisasi keuangan Anda sesuai target yang dibuat."
                        icon="fa-file-invoice-dollar"
                        gradientFrom="var(--primary-glow)"
                        gradientTo="var(--secondary-glow)"
                        actionText="Lihat Laporan"
                        onClick={handleActualReportClick}
                        onHistoryClick={() => setView(View.ACTUALS_HISTORY)}
                    />
                     <div 
                        onClick={() => setView(View.REPORTS_DASHBOARD)}
                        className="group relative bg-[var(--bg-secondary)] backdrop-blur-lg rounded-2xl shadow-lg border border-[var(--border-primary)] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-[var(--border-secondary)] flex flex-col p-6 items-center justify-center text-center cursor-pointer min-h-[260px]"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-[var(--bg-interactive)] flex items-center justify-center border border-[var(--border-primary)] mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                             <i className="fa-solid fa-chart-pie text-4xl text-[var(--primary-glow)]"></i>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">Pusat Analitik</h3>
                        <p className="text-[var(--text-tertiary)] text-sm mt-1">Selami data finansial Anda dengan grafik interaktif.</p>
                     </div>
                </div>
            </DashboardSection>

             <DashboardSection title="Analisis & Kesehatan Keuangan" rightContent={
                <span className={`hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--bg-interactive)] ${financialSummary.styles.textColor}`}>
                    {financialSummary.status}
                </span>
             }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="animate-fade-in-up" style={{animationDelay: '100ms'}}>
                           <h4 className="font-bold text-lg text-[var(--text-secondary)] mb-3">Alokasi Dana dari Pendapatan</h4>
                           {isDataAvailable ? (
                            <div className="flex flex-col gap-6 items-center">
                                {/* Donut Chart */}
                                <div className="relative w-full h-56 flex-shrink-0">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutAllocationData}
                                                cx="50%"
                                                cy="50%"
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={2}
                                                // @ts-ignore
                                                activeIndex={activeAllocationIndex}
                                                activeShape={renderAllocationActiveShape}
                                                onMouseEnter={(_, index) => setActiveAllocationIndex(index)}
                                                onMouseLeave={() => setActiveAllocationIndex(-1)}
                                                // @ts-ignore
                                                background={{ fill: 'var(--bg-interactive)' }}
                                            >
                                                {donutAllocationData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={entry.color} 
                                                        className="stroke-transparent focus:outline-none"
                                                        style={{ filter: `drop-shadow(0 0 6px ${entry.color})` }}
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                     </ResponsiveContainer>
                                    {activeAllocationIndex === -1 && (
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none transition-opacity duration-300 ${isOverspent ? 'animate-pulse-glow-red' : ''}`}>
                                         <p className="text-sm font-medium text-[var(--text-tertiary)]">{isOverspent ? 'Dana Terlampaui' : 'Sisa Uang'}</p>
                                         <p className={`font-bold text-2xl ${isOverspent ? 'text-[var(--color-expense)]' : 'text-[var(--text-primary)]'}`}>
                                            Rp {(isOverspent ? -financialSummary.overspendingAmount : financialSummary.sisaUang).toLocaleString('id-ID')}
                                         </p>
                                    </div>
                                    )}
                                </div>
                                {/* Legend */}
                                <div className="space-y-2 w-full max-w-xs">
                                    {donutAllocationData.map((segment, index) => {
                                        const percentage = totalDonutValue > 0 ? (segment.value / totalDonutValue) * 100 : 0;
                                        return(
                                            <div 
                                                key={segment.name} 
                                                className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 cursor-pointer ${activeAllocationIndex === index ? 'bg-[var(--bg-interactive-hover)]' : 'bg-transparent'}`}
                                                onMouseEnter={() => setActiveAllocationIndex(index)} 
                                                onMouseLeave={() => setActiveAllocationIndex(-1)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: segment.color, boxShadow: `0 0 5px ${segment.color}` }}></span>
                                                    <span className="text-sm text-[var(--text-secondary)]">{segment.name}</span>
                                                    <span className="text-xs text-[var(--text-tertiary)]">({percentage.toFixed(1)}%)</span>
                                                </div>
                                                <span className="text-sm font-semibold text-[var(--text-primary)]">Rp {segment.value.toLocaleString('id-ID')}</span>
                                            </div>
                                        )
                                    })}
                                    {isOverspent && (
                                        <p className="text-xs text-red-400 font-semibold text-center animate-pulse pt-2">
                                            <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                                            Alokasi melebihi pendapatan.
                                        </p>
                                   )}
                                </div>
                            </div>
                           ) : (
                            <div className="w-full h-10 flex items-center justify-center bg-[var(--bg-interactive)] rounded-full px-4 border border-[var(--border-primary)]">
                                <p className="text-sm text-[var(--text-tertiary)] font-medium">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    Data pendapatan bulan ini belum diisi.
                                </p>
                            </div>
                           )}
                        </div>
                        <div className="space-y-3 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                           <HealthAnalysisItem 
                                icon={isDataAvailable ? (isSavingsRatioIdeal ? "fa-circle-check" : "fa-circle-exclamation") : "fa-question-circle"}
                                iconColor={isDataAvailable ? (isSavingsRatioIdeal ? "text-[var(--color-income)]" : "text-[var(--color-warning)]") : "text-[var(--text-tertiary)]"}
                                text={isDataAvailable ? 
                                    <>Rasio Tabungan Anda saat ini <strong>{financialSummary.rasioTabungan.toFixed(1)}%</strong>, {isSavingsRatioIdeal ? 'berada di atas ideal (> 10%)' : 'berada di bawah ideal (> 10%)'}.</> :
                                    <>Rasio Tabungan Anda saat ini <strong>--%</strong>.</>
                                } 
                           />
                           <HealthAnalysisItem 
                                icon={isDataAvailable ? (financialSummary.rasioHutang < 35 ? "fa-circle-check" : "fa-circle-exclamation") : "fa-question-circle"} 
                                iconColor={isDataAvailable ? (financialSummary.rasioHutang < 35 ? "text-[var(--color-income)]" : "text-[var(--color-warning)]") : "text-[var(--text-tertiary)]"} 
                                text={isDataAvailable ? 
                                    <>Rasio Utang Anda <strong>{financialSummary.rasioHutang.toFixed(1)}%</strong>, {financialSummary.rasioHutang < 35 ? 'berada dalam batas aman' : 'mendekati batas'} ({'<'} 35%).</> :
                                    <>Rasio Utang Anda <strong>--%</strong>.</>
                                } 
                           />
                           <HealthAnalysisItem 
                                icon={isDataAvailable ? (financialSummary.rasioSisaUang > 0 ? "fa-circle-check" : "fa-circle-xmark") : "fa-question-circle"} 
                                iconColor={isDataAvailable ? (financialSummary.rasioSisaUang > 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]") : "text-[var(--text-tertiary)]"} 
                                text={isDataAvailable ? 
                                    <>Arus kas bersih (Sisa Uang) Anda <strong>{financialSummary.rasioSisaUang > 0 ? 'positif' : 'negatif'}</strong> sebesar <strong>{financialSummary.rasioSisaUang.toFixed(1)}%</strong> dari pendapatan.</> :
                                    <>Arus kas bersih (Sisa Uang) Anda <strong>--%</strong> dari pendapatan.</>
                                }
                           />
                        </div>
                    </div>
                    <div className="relative rounded-xl p-6 flex flex-col justify-center bg-[var(--bg-interactive)] border border-[var(--border-primary)] animate-fade-in-up" style={{animationDelay: '300ms'}}>
                        <div className="absolute inset-0 rounded-xl" style={{boxShadow: `inset 0 0 40px 0 ${financialSummary.styles.glowColor}40`, border: `1px solid ${financialSummary.styles.glowColor}80`}}></div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3">
                               <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{backgroundColor: financialSummary.styles.glowColor, boxShadow: `0 0 15px ${financialSummary.styles.glowColor}`}}>
                                    <i className={`fa-solid ${healthDetails.icon} text-xl`}></i>
                               </div>
                               <div>
                                <p className={`text-sm font-semibold ${financialSummary.styles.textColor}`}>Status Anda:</p>
                                <h4 className="font-bold text-2xl text-[var(--text-primary)]">{financialSummary.status}</h4>
                               </div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mt-4">
                               {healthDetails.explanation}
                            </p>
                            <div className="text-sm font-semibold text-[var(--text-secondary)] mt-4 p-4 bg-[var(--bg-interactive)]/50 rounded-lg">
                               <p className={`font-bold mb-1 ${financialSummary.styles.textColor}`}>Rekomendasi:</p>
                               <p className="font-normal">{healthDetails.recommendation}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardSection>

            <FinancialInsight transactions={currentMonthTransactions} income={currentIncome} expense={financialSummary.totalSemuaPengeluaran} />
        </div>

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="relative bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] rounded-2xl shadow-xl text-center p-6 pt-16">
                <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute top-4 right-4 w-10 h-10 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-interactive-hover)] flex items-center justify-center transition-colors z-10"
                    aria-label="Close modal"
                >
                    <i className="fa-solid fa-times text-xl"></i>
                </button>

                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-orange-500 shadow-lg shadow-orange-500/40">
                    <i className="fa-solid fa-bullseye text-5xl text-white"></i>
                </div>
                
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Oops, Tunggu Dulu!
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                    Anda harus membuat <strong>Target Bulanan</strong> sebelum bisa mengisi Laporan Aktual.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setIsModalOpen(false);
                            setView(View.ADD_TARGET);
                        }}
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