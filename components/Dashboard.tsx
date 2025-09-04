
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { SummaryCardData, Transaction, ArchivedMonthlyTarget, ArchivedActualReport } from '../types';
import { BalanceIcon, ExpenseIcon, IncomeIcon, SavingsIcon } from './icons';
import SummaryCard from './SummaryCard';
import FinancialInsight from './FinancialInsight';

interface DashboardProps {
    displayDate: Date;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    archivedTargets: ArchivedMonthlyTarget[];
    archivedActuals: ArchivedActualReport[];
    transactions: Transaction[]; // Still needed for Gemini
}

const COLORS = ['#EF4444', '#F97316', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#6366F1'];

const getMetricsFromReport = (report: ArchivedActualReport | undefined) => {
    if (!report) return { income: 0, nonDebtExpenses: 0, debtInstallments: 0, totalExpenses: 0, savings: 0, netCashFlow: 0, composition: {}, allOutflows: 0 };
    
    let income = 0, nonDebtExpenses = 0, debtInstallments = 0, savings = 0;
    const composition: { [key: string]: number } = {};

    (report.target.pendapatan || []).forEach(item => {
        income += parseInt(report.actuals[item.id] || '0');
    });

    const nonDebtSections: (keyof typeof report.target)[] = ['pengeluaranUtama', 'kebutuhan', 'penunjang'];
    nonDebtSections.forEach(section => {
        (report.target[section] || []).forEach(item => {
            const actualAmount = parseInt(report.actuals[item.id] || '0');
            nonDebtExpenses += actualAmount;
            if (actualAmount > 0) composition[item.name] = (composition[item.name] || 0) + actualAmount;
        });
    });
    
    (report.target.cicilanUtang || []).forEach(item => {
        const actualAmount = parseInt(report.actuals[item.id] || '0');
        debtInstallments += actualAmount;
        if (actualAmount > 0) composition[item.name] = (composition[item.name] || 0) + actualAmount;
    });

    (report.target.tabungan || []).forEach(item => {
        const actualAmount = parseInt(report.actuals[item.id] || '0');
        savings += actualAmount;
        if (actualAmount > 0) composition[item.name] = (composition[item.name] || 0) + actualAmount;
    });

    const totalExpenses = nonDebtExpenses + debtInstallments;
    const netCashFlow = income - totalExpenses;
    const allOutflows = totalExpenses + savings;

    return { income, nonDebtExpenses, debtInstallments, totalExpenses, savings, netCashFlow, composition, allOutflows };
};

const FinancialSummaryRow: React.FC<{ label: string; value: string | React.ReactNode; isHighlighted?: boolean }> = ({ label, value, isHighlighted }) => (
    <div className={`flex justify-between items-center py-2 ${isHighlighted ? 'font-bold' : ''}`}>
        <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
        {typeof value === 'string' ? <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p> : value}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ displayDate, handlePrevMonth, handleNextMonth, archivedTargets, archivedActuals, transactions }) => {
    const [isTargetMode, setIsTargetMode] = useState(false);
    const [chartYear, setChartYear] = useState(new Date().getFullYear());

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
             const expenseSections: (keyof typeof currentTargetReport.target)[] = ['pengeluaranUtama', 'kebutuhan', 'penunjang', 'cicilanUtang'];
             expenseSections.forEach(section => {
                targetTotalExpenses += currentTargetReport.target[section].reduce((sum, item) => sum + parseInt(item.amount), 0);
             });
             targetSavings = currentTargetReport.target.tabungan.reduce((sum, item) => sum + parseInt(item.amount), 0);
             targetNetCashFlow = targetIncome - targetTotalExpenses;
        }

        const data: SummaryCardData[] = [
            { title: 'Pemasukan', amount: currentMetrics.income, previousAmount: prevMetrics.income, target: targetIncome, icon: IncomeIcon, color: '#10B981', type: 'income' },
            { title: 'Pengeluaran', amount: currentMetrics.totalExpenses, previousAmount: prevMetrics.totalExpenses, target: targetTotalExpenses, icon: ExpenseIcon, color: '#EF4444', type: 'expense' },
            { title: 'Sisa Uang', amount: currentMetrics.netCashFlow, previousAmount: prevMetrics.netCashFlow, target: targetNetCashFlow, icon: BalanceIcon, color: '#3B82F6', type: 'balance' },
            { title: 'Tabungan', amount: currentMetrics.savings, previousAmount: prevMetrics.savings, target: targetSavings, icon: SavingsIcon, color: '#F97316', type: 'savings' },
        ];
        
        const pieData = Object.entries(currentMetrics.composition).map(([name, value]) => ({ name, value }));
        
        const currentTxs = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getFullYear() === displayDate.getFullYear() && txDate.getMonth() === displayDate.getMonth();
        });

        // Financial Summary Calculations
        const { income, debtInstallments, nonDebtExpenses, totalExpenses, netCashFlow, savings } = currentMetrics;
        const rasioTotalPengeluaran = income > 0 ? (totalExpenses / income) * 100 : 0;
        const rasioSisaUang = income > 0 ? (netCashFlow / income) * 100 : 0;
        const rasioHutang = income > 0 ? (debtInstallments / income) * 100 : 0;
        
        let status = "Data Tidak Cukup";
        let statusColor = "bg-gray-100 text-gray-800";
        if (income > 0) {
            if (rasioHutang < 35 && (savings / income) > 0.1) {
                status = "Sehat";
                statusColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            } else if (netCashFlow > 0) {
                status = "Cukup Sehat";
                statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            } else {
                status = "Perlu Perhatian";
                statusColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            }
        }

        return { 
            summaryData: data, 
            pieChartData: pieData, 
            currentMonthTransactions: currentTxs,
            currentIncome: currentMetrics.income,
            totalOutflowsForPie: currentMetrics.allOutflows,
            financialSummary: {
                totalPendapatan: income,
                totalCicilanUtang: debtInstallments,
                totalPengeluaranNonUtang: nonDebtExpenses,
                totalSemuaPengeluaran: totalExpenses,
                arusKasBersih: netCashFlow,
                rasioTotalPengeluaran,
                rasioSisaUang,
                rasioPengeluaranNonUtang: income > 0 ? (nonDebtExpenses / income) * 100 : 0,
                rasioHutang,
                status,
                statusColor
            }
        };

    }, [displayDate, archivedActuals, archivedTargets, transactions]);
    
    const sortedPieData = useMemo(() => 
        [...pieChartData].sort((a,b) => b.value - a.value), 
    [pieChartData]);

    const cashFlowData = useMemo(() => {
        const flowData = [];
        const monthYearShortFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' });

        for (let i = 0; i < 12; i++) {
            const date = new Date(chartYear, i, 1);
            const monthShort = monthYearShortFormatter.format(date).replace('.', '');
            const report = archivedActuals.find(a => a.monthYear === `${chartYear}-${String(i + 1).padStart(2, '0')}`);
            const metrics = getMetricsFromReport(report);
            
            const hasData = metrics.income > 0 || metrics.totalExpenses > 0;

            flowData.push({ 
                month: monthShort, 
                income: hasData ? metrics.income : null, 
                expense: hasData ? metrics.totalExpenses : null
            });
        }
        return flowData;
    }, [chartYear, archivedActuals]);

    const isNextMonthDisabled = useMemo(() => {
        const now = new Date();
        return displayDate.getFullYear() > now.getFullYear() || (displayDate.getFullYear() === now.getFullYear() && displayDate.getMonth() >= now.getMonth());
    }, [displayDate]);
    
    const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">{monthYearFormatter.format(displayDate)}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button onClick={handleNextMonth} disabled={isNextMonthDisabled} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </header>

            <div className="flex items-center justify-center space-x-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-full w-full max-w-xs mx-auto">
                <button onClick={() => setIsTargetMode(false)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${!isTargetMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300'}`}>
                    Aktual
                </button>
                <button onClick={() => setIsTargetMode(true)} className={`px-4 py-2 rounded-full w-1/2 text-sm font-semibold transition-all ${isTargetMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300'}`}>
                    Target
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryData.map(data => (
                    <SummaryCard key={data.title} data={data} isComparisonMode={isTargetMode} />
                ))}
            </div>
            
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Ringkasan Keuangan Bulanan</h3>
                <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
                    <FinancialSummaryRow label="Total Pendapatan" value={formatCurrency(financialSummary.totalPendapatan)} />
                    <FinancialSummaryRow label="Total Cicilan Utang" value={formatCurrency(financialSummary.totalCicilanUtang)} />
                    <FinancialSummaryRow label="Total Pengeluaran Non-Utang" value={formatCurrency(financialSummary.totalPengeluaranNonUtang)} />
                    <FinancialSummaryRow label="Total Semua Pengeluaran" value={formatCurrency(financialSummary.totalSemuaPengeluaran)} />
                    <FinancialSummaryRow label="Arus Kas Bersih (Sisa Uang)" value={formatCurrency(financialSummary.arusKasBersih)} isHighlighted />
                    <FinancialSummaryRow label="Rasio Total Pengeluaran" value={`${financialSummary.rasioTotalPengeluaran.toFixed(2)}%`} />
                    <FinancialSummaryRow label="Rasio Sisa Uang" value={`${financialSummary.rasioSisaUang.toFixed(2)}%`} />
                    <FinancialSummaryRow label="Rasio Pengeluaran Non-Utang" value={`${financialSummary.rasioPengeluaranNonUtang.toFixed(2)}%`} />
                    <FinancialSummaryRow label="Rasio Hutang" value={`${financialSummary.rasioHutang.toFixed(2)}%`} />
                    <FinancialSummaryRow 
                        label="Status Kesehatan Keuangan" 
                        value={
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${financialSummary.statusColor}`}>
                                {financialSummary.status}
                            </span>
                        }
                        isHighlighted
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 px-2">Arus Kas Tahunan</h3>
                    <div className="flex-grow h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cashFlowData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
                                <YAxis tickFormatter={(value) => `${value/1000000} Jt`} tick={{ fill: '#9CA3AF' }} />
                                <RechartsTooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                                <Legend />
                                <Bar dataKey="income" fill="#10B981" name="Pemasukan" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#EF4444" name="Pengeluaran" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center mt-4">
                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/50 rounded-full px-2 py-1 shadow-sm">
                            <button onClick={() => setChartYear(y => y - 1)} className="w-8 h-8 rounded-full text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span className="font-semibold text-sm w-16 text-center text-gray-700 dark:text-gray-200">{chartYear}</span>
                            <button onClick={() => setChartYear(y => y + 1)} className="w-8 h-8 rounded-full text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Komposisi Pengeluaran</h3>
                    {pieChartData.length > 0 ? (
                        <div className="grid grid-cols-1 items-center">
                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={pieChartData} 
                                            cx="50%" 
                                            cy="50%" 
                                            labelLine={false} 
                                            innerRadius={45} 
                                            outerRadius={80} 
                                            fill="#8884d8" 
                                            dataKey="value" 
                                            nameKey="name"
                                            paddingAngle={2}
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 overflow-y-auto max-h-52 pr-2 mt-4">
                                {sortedPieData.map((entry) => {
                                    const originalIndex = pieChartData.findIndex(p => p.name === entry.name);
                                    const percentage = totalOutflowsForPie > 0 ? (entry.value / totalOutflowsForPie) * 100 : 0;
                                    return (
                                        <div key={entry.name} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-3 truncate">
                                                <span 
                                                    className="w-3 h-3 rounded-sm flex-shrink-0" 
                                                    style={{ backgroundColor: COLORS[originalIndex % COLORS.length] }}
                                                ></span>
                                                <span className="text-gray-600 dark:text-gray-300 truncate" title={entry.name}>{entry.name}</span>
                                            </div>
                                            <div className="text-right flex-shrink-0 pl-2">
                                                <p className="font-semibold text-gray-800 dark:text-white">
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
                        <div className="h-full flex flex-col items-center justify-center">
                            <i className="fa-solid fa-chart-pie text-4xl text-gray-400 mb-4"></i>
                            <p className="text-center text-gray-500">Data pengeluaran tidak tersedia untuk bulan ini.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <FinancialInsight transactions={currentMonthTransactions} income={currentIncome} expense={financialSummary.totalSemuaPengeluaran} />
        </div>
    );
};

export default Dashboard;
