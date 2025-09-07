import React, { useState, useMemo } from 'react';
import { ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, PieChart, Pie, Sector } from 'recharts';
import { SummaryCardData, Transaction, ArchivedMonthlyTarget, ArchivedActualReport } from '../types';
import SummaryCard from './SummaryCard';
import FinancialInsight from './FinancialInsight';
// FIX: Import missing icon components.
import { IncomeIcon, ExpenseIcon, BalanceIcon, SavingsIcon } from './icons';

interface DashboardProps {
    displayDate: Date;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    archivedTargets: ArchivedMonthlyTarget[];
    archivedActuals: ArchivedActualReport[];
    transactions: Transaction[]; // Still needed for Gemini
}

interface CompositionData {
  name: string;
  value: number;
  category: 'expense' | 'debt' | 'savings';
}

const DashboardSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; rightContent?: React.ReactNode }> = ({ title, children, defaultOpen = true, rightContent }) => (
    <details className="group/card relative bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg overflow-hidden transition-all duration-300" open={defaultOpen}>
        <summary className="relative list-none p-6 cursor-pointer flex justify-between items-center transition-colors group-hover/card:bg-white/5">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="flex items-center space-x-4">
                {rightContent}
                <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full">
                  <i className="fa-solid fa-chevron-down text-gray-400 transition-transform duration-300 group-open/card:rotate-180"></i>
                </div>
            </div>
        </summary>
        <div className="relative border-t border-white/10 p-4 md:p-6">
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
        glowColor: '#facc15', // yellow-400
        textColor: 'text-yellow-400',
    },
    "Perlu Perhatian": {
        glowColor: 'var(--color-expense)',
        textColor: 'text-[var(--color-expense)]',
    },
    "Data Tidak Cukup": {
        glowColor: '#6b7280', // gray-500
        textColor: 'text-gray-400',
    }
};

const HealthAnalysisItem: React.FC<{ icon: string; iconColor: string; text: React.ReactNode }> = ({ icon, iconColor, text }) => (
    <div className="flex items-start space-x-3">
        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center pt-0.5">
            <i className={`fa-solid ${icon} ${iconColor} text-base`}></i>
        </div>
        <p className="text-sm text-gray-300 flex-1">{text}</p>
    </div>
);


// Custom Tooltip for Cash Flow Chart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const income = payload.find((p: any) => p.dataKey === 'income')?.value;
        const expense = payload.find((p: any) => p.dataKey === 'expense')?.value;
        const net = payload.find((p: any) => p.dataKey === 'netCashFlow')?.value;

        return (
            <div className="bg-black/40 backdrop-blur-xl text-white p-4 rounded-xl shadow-2xl border border-white/20 animate-fade-in">
                <p className="font-bold text-lg mb-2 border-b border-white/10 pb-2">{label}</p>
                {income !== undefined && <p className="text-[var(--color-income)]" style={{filter: 'drop-shadow(0 0 5px var(--color-income))'}}>Pemasukan: Rp {income.toLocaleString('id-ID')}</p>}
                {expense !== undefined && <p className="text-[var(--color-expense)]" style={{filter: 'drop-shadow(0 0 5px var(--color-expense))'}}>Pengeluaran: Rp {expense.toLocaleString('id-ID')}</p>}
                {net !== undefined && (
                    <p className={`font-semibold mt-2 pt-2 border-t border-white/10 ${net >= 0 ? 'text-[var(--color-net-positive)]' : 'text-[var(--color-net-negative)]'}`} style={{filter: `drop-shadow(0 0 5px ${net >= 0 ? 'var(--color-net-positive)' : 'var(--color-net-negative)'})`}}>
                        Arus Kas Bersih: Rp {net.toLocaleString('id-ID')}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

// Pie chart custom active shape
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

    return (
        <g style={{ filter: 'drop-shadow(0 0 8px #000)' }}>
            <text x={cx} y={cy - 8} textAnchor="middle" fill={'#FFF'} className="font-bold text-sm" dominantBaseline="central">
                {payload.name}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={'#CCC'} className="text-xs">
                {`(${(percent * 100).toFixed(1)}%)`}
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
            />
        </g>
    );
};

// Active shape for the Allocation Donut - now simplified
const renderAllocationActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;

    return (
        <g>
            <text x={cx} y={cy - 8} textAnchor="middle" fill={'#E5E7EB'} className="font-bold text-sm" dominantBaseline="central">
                {payload.name}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={'#FFF'} className="font-semibold text-lg">
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

const Dashboard: React.FC<DashboardProps> = ({ displayDate, handlePrevMonth, handleNextMonth, archivedTargets, archivedActuals, transactions }) => {
    const [isTargetMode, setIsTargetMode] = useState(false);
    const [chartYear, setChartYear] = useState(new Date().getFullYear());
    const [activeCashFlowIndex, setActiveCashFlowIndex] = useState<number | null>(null);
    const [activePieIndex, setActivePieIndex] = useState<number>(-1);
    const [activeAllocationIndex, setActiveAllocationIndex] = useState<number>(-1);

    const monthYearFormatter = useMemo(() => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }), []);

    const { 
        summaryData, 
        pieChartData, 
        currentMonthTransactions, 
        currentIncome, 
        totalOutflowsForPie,
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

        let targetIncome = 0, targetTotalExpenses = 0, targetNetCashFlow = 0, targetSavings = 0;
        if (currentTargetReport) {
             targetIncome = currentTargetReport.target.pendapatan.reduce((sum, item) => sum + parseInt(item.amount), 0);
             const expenseSections: (keyof typeof currentTargetReport.target)[] = ['pengeluaranUtama', 'kebutuhan', 'penunjang', 'cicilanUtang', 'pendidikan'];
             expenseSections.forEach(section => {
                targetTotalExpenses += currentTargetReport.target[section].reduce((sum, item) => sum + parseInt(item.amount), 0);
             });
             targetSavings = currentTargetReport.target.tabungan.reduce((sum, item) => sum + parseInt(item.amount), 0);
             targetNetCashFlow = targetIncome - targetTotalExpenses;
        }

        const data: SummaryCardData[] = [
            { title: 'Pemasukan', amount: currentMetrics.income, previousAmount: prevMetrics.income, target: targetIncome, icon: IncomeIcon, color: 'income', type: 'income' },
            { title: 'Pengeluaran', amount: currentMetrics.totalExpenses, previousAmount: prevMetrics.totalExpenses, target: targetTotalExpenses, icon: ExpenseIcon, color: 'expense', type: 'expense' },
            { title: 'Sisa Uang', amount: currentMetrics.netCashFlow, previousAmount: prevMetrics.netCashFlow, target: targetNetCashFlow, icon: BalanceIcon, color: 'balance', type: 'balance' },
            { title: 'Tabungan Bulan Ini', amount: currentMetrics.savings, previousAmount: prevMetrics.savings, target: targetSavings, icon: SavingsIcon, color: 'savings', type: 'savings' },
        ];
        
        const pieData: CompositionData[] = currentMetrics.composition;
        
        const currentTxs = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === displayDate.getFullYear() && txDate.getMonth() === displayDate.getMonth();
        });

        // Financial Summary Calculations
        const { income, debtInstallments, totalExpenses, netCashFlow, savings } = currentMetrics;
        const rasioHutang = income > 0 ? (debtInstallments / income) * 100 : 0;
        const rasioTabungan = income > 0 ? (savings / income) * 100 : 0;
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
            pieChartData: pieData, 
            currentMonthTransactions: currentTxs,
            currentIncome: currentMetrics.income,
            totalOutflowsForPie: currentMetrics.allOutflows,
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

    }, [displayDate, archivedActuals, archivedTargets, transactions]);
    
    const sortedPieData = useMemo(() => 
        [...pieChartData].sort((a,b) => b.value - a.value), 
    [pieChartData]);

    const cashFlowData = useMemo(() => {
        const flowData = [];
        const monthYearShortFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

        for (let i = 0; i < 12; i++) {
            const date = new Date(chartYear, i, 1);
            const monthShort = monthYearShortFormatter.format(date);
            const report = archivedActuals.find(a => a.monthYear === `${chartYear}-${String(i + 1).padStart(2, '0')}`);
            const metrics = getMetricsFromReport(report);
            
            const hasData = metrics.income > 0 || metrics.totalExpenses > 0;

            flowData.push({ 
                month: monthShort, 
                income: hasData ? metrics.income : null, 
                expense: hasData ? metrics.totalExpenses : null,
                netCashFlow: hasData ? metrics.income - metrics.totalExpenses : null,
            });
        }
        return flowData;
    }, [chartYear, archivedActuals]);

    const isNextMonthDisabled = useMemo(() => {
        const now = new Date();
        return displayDate.getFullYear() > now.getFullYear() || (displayDate.getFullYear() === now.getFullYear() && displayDate.getMonth() >= now.getMonth());
    }, [displayDate]);

    const isNextYearDisabled = useMemo(() => chartYear >= new Date().getFullYear(), [chartYear]);
    const isPrevYearDisabled = useMemo(() => !archivedActuals.some(report => report.monthYear.startsWith(`${chartYear - 1}`)), [chartYear, archivedActuals]);

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

    const PIE_CHART_COLORS: { [key in CompositionData['category']]: string } = {
      expense: 'var(--color-expense)',
      debt: 'var(--color-debt)',
      savings: 'var(--color-savings)',
    };
    
    const isSavingsRatioIdeal = isDataAvailable && financialSummary.rasioTabungan >= 10;

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400">{monthYearFormatter.format(displayDate)}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full bg-black/20 text-gray-300 flex items-center justify-center transition-colors shadow-sm hover:bg-white/10 border border-white/10">
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button onClick={handleNextMonth} disabled={isNextMonthDisabled} className="w-10 h-10 rounded-full bg-black/20 text-gray-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-white/10 border border-white/10">
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </header>

            <div className="flex items-center justify-center space-x-2 p-1 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full w-full max-w-xs mx-auto">
                <button onClick={() => setIsTargetMode(false)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${!isTargetMode ? 'bg-[var(--primary-600)] text-white shadow-md' : 'text-gray-300'}`}>
                    Aktual
                </button>
                <button onClick={() => setIsTargetMode(true)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${isTargetMode ? 'bg-[var(--primary-600)] text-white shadow-md' : 'text-gray-300'}`}>
                    Target
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryData.map(data => (
                    <SummaryCard key={data.title} data={data} isComparisonMode={isTargetMode} />
                ))}
            </div>
            
             <DashboardSection title="Analisis & Kesehatan Keuangan" rightContent={
                <span className={`hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-black/20 ${financialSummary.styles.textColor}`}>
                    {financialSummary.status}
                </span>
             }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="animate-fade-in-up" style={{animationDelay: '100ms'}}>
                           <h4 className="font-bold text-lg text-gray-200 mb-3">Alokasi Dana dari Pendapatan</h4>
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
                                                background={{ fill: 'rgba(255,255,255,0.05)' }}
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
                                         <p className="text-sm font-medium text-gray-400">{isOverspent ? 'Dana Terlampaui' : 'Sisa Uang'}</p>
                                         <p className={`font-bold text-2xl ${isOverspent ? 'text-[var(--color-expense)]' : 'text-white'}`}>
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
                                                className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 cursor-pointer ${activeAllocationIndex === index ? 'bg-white/5' : 'bg-transparent'}`}
                                                onMouseEnter={() => setActiveAllocationIndex(index)} 
                                                onMouseLeave={() => setActiveAllocationIndex(-1)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: segment.color, boxShadow: `0 0 5px ${segment.color}` }}></span>
                                                    <span className="text-sm text-gray-300">{segment.name}</span>
                                                    <span className="text-xs text-gray-400">({percentage.toFixed(1)}%)</span>
                                                </div>
                                                <span className="text-sm font-semibold text-white">Rp {segment.value.toLocaleString('id-ID')}</span>
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
                            <div className="w-full h-10 flex items-center justify-center bg-black/20 rounded-full px-4 border border-white/10">
                                <p className="text-sm text-gray-400 font-medium">
                                    <i className="fa-solid fa-info-circle mr-2"></i>
                                    Data pendapatan bulan ini belum diisi.
                                </p>
                            </div>
                           )}
                        </div>
                        <div className="space-y-3 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                           <HealthAnalysisItem 
                                icon={isDataAvailable ? (isSavingsRatioIdeal ? "fa-circle-check" : "fa-circle-exclamation") : "fa-question-circle"}
                                iconColor={isDataAvailable ? (isSavingsRatioIdeal ? "text-[var(--color-income)]" : "text-yellow-400") : "text-gray-500"}
                                text={isDataAvailable ? 
                                    <>Rasio Tabungan Anda saat ini <strong>{financialSummary.rasioTabungan.toFixed(1)}%</strong>, {isSavingsRatioIdeal ? 'berada di atas ideal (> 10%)' : 'berada di bawah ideal (> 10%)'}.</> :
                                    <>Rasio Tabungan Anda saat ini <strong>--%</strong>.</>
                                } 
                           />
                           <HealthAnalysisItem 
                                icon={isDataAvailable ? (financialSummary.rasioHutang < 35 ? "fa-circle-check" : "fa-circle-exclamation") : "fa-question-circle"} 
                                iconColor={isDataAvailable ? (financialSummary.rasioHutang < 35 ? "text-[var(--color-income)]" : "text-yellow-400") : "text-gray-500"} 
                                text={isDataAvailable ? 
                                    <>Rasio Utang Anda <strong>{financialSummary.rasioHutang.toFixed(1)}%</strong>, {financialSummary.rasioHutang < 35 ? 'berada dalam batas aman' : 'mendekati batas'} ({'<'} 35%).</> :
                                    <>Rasio Utang Anda <strong>--%</strong>.</>
                                } 
                           />
                           <HealthAnalysisItem 
                                icon={isDataAvailable ? (financialSummary.rasioSisaUang > 0 ? "fa-circle-check" : "fa-circle-xmark") : "fa-question-circle"} 
                                iconColor={isDataAvailable ? (financialSummary.rasioSisaUang > 0 ? "text-[var(--color-income)]" : "text-[var(--color-expense)]") : "text-gray-500"} 
                                text={isDataAvailable ? 
                                    <>Arus kas bersih (Sisa Uang) Anda <strong>{financialSummary.rasioSisaUang > 0 ? 'positif' : 'negatif'}</strong> sebesar <strong>{financialSummary.rasioSisaUang.toFixed(1)}%</strong> dari pendapatan.</> :
                                    <>Arus kas bersih (Sisa Uang) Anda <strong>--%</strong> dari pendapatan.</>
                                }
                           />
                        </div>
                    </div>
                    <div className="relative rounded-xl p-6 flex flex-col justify-center bg-black/20 border border-white/10 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                        <div className="absolute inset-0 rounded-xl" style={{boxShadow: `inset 0 0 40px 0 ${financialSummary.styles.glowColor}40`, border: `1px solid ${financialSummary.styles.glowColor}80`}}></div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3">
                               <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{backgroundColor: financialSummary.styles.glowColor, boxShadow: `0 0 15px ${financialSummary.styles.glowColor}`}}>
                                    <i className={`fa-solid ${healthDetails.icon} text-xl`}></i>
                               </div>
                               <div>
                                <p className={`text-sm font-semibold ${financialSummary.styles.textColor}`}>Status Anda:</p>
                                <h4 className="font-bold text-2xl text-white">{financialSummary.status}</h4>
                               </div>
                            </div>
                            <p className="text-sm text-gray-300 mt-4">
                               {healthDetails.explanation}
                            </p>
                            <div className="text-sm font-semibold text-gray-200 mt-4 p-4 bg-black/30 rounded-lg">
                               <p className={`font-bold mb-1 ${financialSummary.styles.textColor}`}>Rekomendasi:</p>
                               <p className="font-normal">{healthDetails.recommendation}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardSection>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <DashboardSection title="Arus Kas Tahunan" rightContent={
                        <div className="flex items-center space-x-2 bg-black/20 rounded-full px-2 py-1 shadow-sm border border-white/10">
                            <button 
                                onClick={() => setChartYear(y => y - 1)} 
                                disabled={isPrevYearDisabled}
                                className="w-8 h-8 rounded-full text-gray-300 flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span className="font-semibold text-sm w-16 text-center text-gray-200">{chartYear}</span>
                            <button 
                                onClick={() => setChartYear(y => y + 1)} 
                                disabled={isNextYearDisabled}
                                className="w-8 h-8 rounded-full text-gray-300 flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    }>
                        <div className="h-80 animate-fade-in">
                             <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart 
                                    data={cashFlowData} 
                                    margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                                    onMouseMove={(state) => {
                                        if (state.isTooltipActive && state.activeTooltipIndex != null) {
                                            const numericIndex = Number(state.activeTooltipIndex);
                                            setActiveCashFlowIndex(isNaN(numericIndex) ? null : numericIndex);
                                        } else {
                                            setActiveCashFlowIndex(null);
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setActiveCashFlowIndex(null);
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                    <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <YAxis tickFormatter={(value) => `${value/1000000} Jt`} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: '#E5E7EB' }}/>
                                    <Area type="monotone" dataKey="income" name="Pemasukan" stroke="var(--color-income)" fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="var(--color-expense)" fillOpacity={1} fill="url(#colorExpense)" />
                                    <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} legendType="none" style={{ filter: 'drop-shadow(0 0 5px var(--color-income))' }} />
                                    <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} dot={false} legendType="none" style={{ filter: 'drop-shadow(0 0 5px var(--color-expense))' }} />
                                    <Bar dataKey="netCashFlow" name="Arus Kas Bersih" barSize={20} >
                                        {cashFlowData.map((entry, index) => {
                                            const isCurrentDisplayMonth = displayDate.getFullYear() === chartYear && index === displayDate.getMonth();
                                            const opacity = activeCashFlowIndex === null || activeCashFlowIndex === index ? 1 : 0.5;
                                            return (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.netCashFlow && entry.netCashFlow >= 0 ? 'var(--color-net-positive)' : 'var(--color-net-negative)'} 
                                                    fillOpacity={opacity}
                                                    stroke={isCurrentDisplayMonth ? 'var(--primary-glow)' : 'none'}
                                                    strokeWidth={isCurrentDisplayMonth ? 3 : 0}
                                                />
                                            );
                                        })}
                                    </Bar>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </DashboardSection>
                </div>
                <div className="lg:col-span-2">
                    <DashboardSection title="Komposisi Pengeluaran & Tabungan">
                        {pieChartData.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 items-center">
                                <div className="h-60 md:h-full lg:h-60 animate-fade-in">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                // @ts-ignore
                                                activeIndex={activePieIndex}
                                                activeShape={renderActiveShape}
                                                onMouseEnter={(_, index) => setActivePieIndex(index)}
                                                onMouseLeave={() => setActivePieIndex(-1)}
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={PIE_CHART_COLORS[entry.category]} 
                                                        className="stroke-transparent focus:outline-none"
                                                        style={{ filter: `drop-shadow(0 0 8px ${PIE_CHART_COLORS[entry.category]})` }}
                                                    />
                                                ))}
                                            </Pie>
                                             <RechartsTooltip formatter={(value: number, name: string) => [`Rp ${value.toLocaleString('id-ID')}`, name]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 overflow-y-auto max-h-60 pr-2">
                                    {sortedPieData.map((entry, index) => {
                                        const originalIndex = pieChartData.findIndex(p => p.name === entry.name);
                                        const color = PIE_CHART_COLORS[entry.category];
                                        const percentage = totalOutflowsForPie > 0 ? (entry.value / totalOutflowsForPie) * 100 : 0;
                                        return (
                                            <div 
                                                key={entry.name} 
                                                className={`p-2 rounded-lg flex items-center justify-between text-sm transition-all duration-200 cursor-pointer ${activePieIndex === originalIndex ? 'bg-white/10' : 'bg-transparent'}`}
                                                onMouseEnter={() => setActivePieIndex(originalIndex)}
                                                onMouseLeave={() => setActivePieIndex(-1)}
                                            >
                                                <div className="flex items-center space-x-3 truncate">
                                                    <span 
                                                        className="w-3 h-3 rounded-sm flex-shrink-0" 
                                                        style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}
                                                    ></span>
                                                    <span className="text-gray-300 truncate" title={entry.name}>{entry.name}</span>
                                                </div>
                                                <div className="text-right flex-shrink-0 pl-2">
                                                    <p className="font-semibold text-white">
                                                        Rp {entry.value.toLocaleString('id-ID')}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {percentage.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[20rem]">
                                <i className="fa-solid fa-chart-pie text-4xl text-gray-500 mb-4"></i>
                                <p className="text-center text-gray-400">Data pengeluaran tidak tersedia untuk bulan ini.</p>
                            </div>
                        )}
                    </DashboardSection>
                </div>
            </div>
            
            <FinancialInsight transactions={currentMonthTransactions} income={currentIncome} expense={financialSummary.totalSemuaPengeluaran} />
        </div>
    );
};

export default Dashboard;