import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ComposedChart, Area, Line, Sector } from 'recharts';
import { Transaction, UserCategory, TransactionType } from '../../types';


interface ReportsDashboardProps {
    transactions: Transaction[];
    userCategories: UserCategory[];
}

// Custom Tooltip for Cash Flow Chart
const CustomTooltipAnnual = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const income = payload.find((p: any) => p.dataKey === 'income')?.value;
        const expense = payload.find((p: any) => p.dataKey === 'expense')?.value;
        const net = payload.find((p: any) => p.dataKey === 'netCashFlow')?.value;

        return (
            <div className="bg-[var(--bg-secondary-translucent)] backdrop-blur-xl text-[var(--text-primary)] p-4 rounded-xl shadow-2xl border border-[var(--border-secondary)] animate-fade-in">
                <p className="font-bold text-lg mb-2 border-b border-[var(--border-primary)] pb-2">{label}</p>
                {income !== undefined && <p className="text-[var(--color-income)]" style={{filter: 'drop-shadow(0 0 5px var(--color-income))'}}>Pemasukan: Rp {income.toLocaleString('id-ID')}</p>}
                {expense !== undefined && <p className="text-[var(--color-expense)]" style={{filter: 'drop-shadow(0 0 5px var(--color-expense))'}}>Pengeluaran: Rp {expense.toLocaleString('id-ID')}</p>}
                {net !== undefined && (
                    <p className={`font-semibold mt-2 pt-2 border-t border-[var(--border-primary)] ${net >= 0 ? 'text-[var(--color-net-positive)]' : 'text-[var(--color-net-negative)]'}`} style={{filter: `drop-shadow(0 0 5px ${net >= 0 ? 'var(--color-net-positive)' : 'var(--color-net-negative)'})`}}>
                        Arus Kas Bersih: Rp {net.toLocaleString('id-ID')}
                    </p>
                )}
            </div>
        );
    }
    return null;
};


// Pie chart custom active shape
// FIX: Destructured props directly in the function signature to resolve duplicate identifier error.
const renderActiveShape = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent }: any) => {
    return (
        <g style={{ filter: 'drop-shadow(0 0 8px #000)' }}>
            <text x={cx} y={cy - 8} textAnchor="middle" fill={'var(--text-primary)'} className="font-bold text-sm" dominantBaseline="central">
                {payload.name}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={'var(--text-secondary)'} className="text-xs">
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

const DashboardSection: React.FC<{ title: string; children: React.ReactNode; rightContent?: React.ReactNode }> = ({ title, children, rightContent }) => (
    <div className="bg-[var(--bg-secondary)] backdrop-blur-lg border border-[var(--border-primary)] rounded-2xl shadow-lg">
        <div className="p-6 flex justify-between items-center">
             <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
             {rightContent}
        </div>
        <div className="relative p-4 md:p-6 border-t border-[var(--border-primary)]">
            {children}
        </div>
    </div>
);

type CompositionData = {
    name: string;
    value: number;
    type: 'expense' | 'debt' | 'savings';
};


const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ transactions, userCategories }) => {
    const [dateFilter, setDateFilter] = useState<'this_month' | 'last_month' | 'this_year'>('this_month');
    const [activePieIndex, setActivePieIndex] = useState<number>(-1);
    const [chartYear, setChartYear] = useState(new Date().getFullYear());
    const [activeCashFlowIndex, setActiveCashFlowIndex] = useState<number | null>(null);

    const { filteredTransactions, title } = useMemo(() => {
        const now = new Date();
        let startDate: Date;
        let endDate = new Date();
        let title = '';

        switch (dateFilter) {
            case 'last_month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                title = `Laporan Bulan Lalu (${startDate.toLocaleString('id-ID', { month: 'long' })})`;
                break;
            case 'this_year':
                startDate = new Date(now.getFullYear(), 0, 1);
                title = `Laporan Tahun Ini (${now.getFullYear()})`;
                break;
            case 'this_month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                title = `Laporan Bulan Ini (${now.toLocaleString('id-ID', { month: 'long' })})`;
                break;
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const filtered = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= startDate && txDate <= endDate;
        });

        return { filteredTransactions: filtered, title };
    }, [transactions, dateFilter]);
    
    const compositionData = useMemo(() => {
        const dataByCategory = filteredTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => {
                let type: CompositionData['type'] = 'expense';
                if (t.category.toLowerCase().includes('utang') || t.category.toLowerCase().includes('cicilan')) {
                    type = 'debt';
                } else if (t.category.toLowerCase().includes('tabungan')) {
                    type = 'savings';
                }

                if (!acc[t.category]) {
                    acc[t.category] = { name: t.category, value: 0, type: type };
                }
                acc[t.category].value += t.amount;
                return acc;
            }, {} as { [key: string]: CompositionData });

        return Object.values(dataByCategory).sort((a,b) => b.value - a.value);

    }, [filteredTransactions]);
    
    const totalOutflows = useMemo(() => compositionData.reduce((sum, item) => sum + item.value, 0), [compositionData]);

    const processTransactionsByYear = (year: number) => {
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(year, i).toLocaleString('id-ID', { month: 'short' }),
            income: 0,
            expense: 0,
        }));

        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (txDate.getFullYear() === year) {
                const monthIndex = txDate.getMonth();
                if (tx.type === TransactionType.INCOME) {
                    monthlyData[monthIndex].income += tx.amount;
                } else {
                    monthlyData[monthIndex].expense += tx.amount;
                }
            }
        });
        
        return monthlyData.map(data => ({
            ...data,
            netCashFlow: data.income - data.expense
        }));
    };
    
    const cashFlowData = useMemo(() => processTransactionsByYear(chartYear), [chartYear, transactions]);
    const yearlyIncomeExpenseData = useMemo(() => processTransactionsByYear(new Date().getFullYear()), [transactions]);
    
    const isNextYearDisabled = useMemo(() => chartYear >= new Date().getFullYear(), [chartYear]);
    const isPrevYearDisabled = useMemo(() => !transactions.some(tx => new Date(tx.date).getFullYear() === chartYear - 1), [chartYear, transactions]);
    
    const PIE_CHART_COLORS: { [key in CompositionData['type']]: string } = {
      expense: 'var(--color-expense)',
      debt: 'var(--color-debt)',
      savings: 'var(--color-savings)',
    };
    
    const FilterChip: React.FC<{ type: typeof dateFilter, label: string }> = ({ type, label }) => (
        <button 
            onClick={() => setDateFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${dateFilter === type ? 'bg-[var(--primary-600)] text-white shadow-md' : 'bg-[var(--bg-secondary)] backdrop-blur-sm border border-[var(--border-primary)] text-[var(--text-tertiary)]'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Pusat Analitik</h1>
                <p className="text-[var(--text-tertiary)]">{title}</p>
            </header>

            <div className="flex space-x-2 p-1 bg-[var(--bg-secondary)] backdrop-blur-sm border border-[var(--border-primary)] rounded-full w-full md:w-auto self-start">
                <FilterChip type="this_month" label="Bulan Ini" />
                <FilterChip type="last_month" label="Bulan Lalu" />
                <FilterChip type="this_year" label="Tahun Ini" />
            </div>
            
            {dateFilter === 'this_year' && (
                <div className="grid grid-cols-1 gap-6 animate-fade-in">
                    <DashboardSection title="Arus Kas Tahunan" rightContent={
                            <div className="flex items-center space-x-2 bg-[var(--bg-interactive)] rounded-full px-2 py-1 shadow-sm border border-[var(--border-primary)]">
                                <button 
                                    onClick={() => setChartYear(y => y - 1)} 
                                    disabled={isPrevYearDisabled}
                                    className="w-8 h-8 rounded-full text-[var(--text-secondary)] flex items-center justify-center transition-colors hover:bg-[var(--bg-interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <span className="font-semibold text-sm w-16 text-center text-[var(--text-secondary)]">{chartYear}</span>
                                <button 
                                    onClick={() => setChartYear(y => y + 1)} 
                                    disabled={isNextYearDisabled}
                                    className="w-8 h-8 rounded-full text-[var(--text-secondary)] flex items-center justify-center transition-colors hover:bg-[var(--bg-interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
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
                                        <CartesianGrid stroke="var(--border-primary)" strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                                        <YAxis tickFormatter={(value) => `${value/1000000} Jt`} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                                        <RechartsTooltip content={<CustomTooltipAnnual />} />
                                        <Legend wrapperStyle={{ color: 'var(--text-secondary)' }}/>
                                        <Area type="monotone" dataKey="income" name="Pemasukan" stroke="var(--color-income)" fillOpacity={1} fill="url(#colorIncome)" />
                                        <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="var(--color-expense)" fillOpacity={1} fill="url(#colorExpense)" />
                                        <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} legendType="none" style={{ filter: 'drop-shadow(0 0 5px var(--color-income))' }} />
                                        <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} dot={false} legendType="none" style={{ filter: 'drop-shadow(0 0 5px var(--color-expense))' }} />
                                        <Bar dataKey="netCashFlow" name="Arus Kas Bersih" barSize={20} >
                                            {cashFlowData.map((entry, index) => {
                                                const opacity = activeCashFlowIndex === null || activeCashFlowIndex === index ? 1 : 0.5;
                                                return (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={entry.netCashFlow && entry.netCashFlow >= 0 ? 'var(--color-net-positive)' : 'var(--color-net-negative)'} 
                                                        fillOpacity={opacity}
                                                    />
                                                );
                                            })}
                                        </Bar>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                    </DashboardSection>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className={`transition-all duration-300 ${dateFilter === 'this_year' ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
                    <DashboardSection title="Alokasi Dana Keluar">
                        {compositionData.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-center">
                                <div className="h-60 md:h-full lg:h-60 animate-fade-in">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={compositionData}
                                                cx="50%"
                                                cy="50%"
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                activeShape={renderActiveShape}
                                                onMouseEnter={(_, index) => setActivePieIndex(index)}
                                                onMouseLeave={() => setActivePieIndex(-1)}
                                                // FIX: Replaced @ts-ignore with a spread to safely pass the activeIndex prop,
                                                // which seems to be missing from the currently used @types/recharts version.
                                                {...{ activeIndex: activePieIndex }}
                                            >
                                                {compositionData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={PIE_CHART_COLORS[entry.type]} 
                                                        className="stroke-transparent focus:outline-none"
                                                        style={{ filter: `drop-shadow(0 0 8px ${PIE_CHART_COLORS[entry.type]})` }}
                                                    />
                                                ))}
                                            </Pie>
                                             <RechartsTooltip formatter={(value: number, name: string) => [`Rp ${value.toLocaleString('id-ID')}`, name]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 overflow-y-auto max-h-60 pr-2">
                                    {compositionData.map((entry, index) => {
                                        const color = PIE_CHART_COLORS[entry.type];
                                        const percentage = totalOutflows > 0 ? (entry.value / totalOutflows) * 100 : 0;
                                        return (
                                            <div 
                                                key={entry.name} 
                                                className={`p-2 rounded-lg flex items-center justify-between text-sm transition-all duration-200 cursor-pointer ${activePieIndex === index ? 'bg-[var(--bg-interactive-hover)]' : 'bg-transparent'}`}
                                                onMouseEnter={() => setActivePieIndex(index)}
                                                onMouseLeave={() => setActivePieIndex(-1)}
                                            >
                                                <div className="flex items-center space-x-3 truncate">
                                                    <span 
                                                        className="w-3 h-3 rounded-sm flex-shrink-0" 
                                                        style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}
                                                    ></span>
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
                        ) : (
                             <div className="flex flex-col items-center justify-center min-h-[15rem]">
                                <i className="fa-solid fa-folder-open text-4xl text-[var(--text-tertiary)] mb-4"></i>
                                <p className="text-center text-[var(--text-tertiary)]">Tidak ada data pengeluaran pada periode ini.</p>
                            </div>
                        )}
                    </DashboardSection>
                </div>

                {dateFilter === 'this_year' && (
                    <div className="lg:col-span-2 animate-fade-in">
                        <DashboardSection title="Pendapatan vs Pengeluaran (Tahun Ini)">
                            <div className="h-64">
                            {yearlyIncomeExpenseData.some(d => d.income > 0 || d.expense > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={yearlyIncomeExpenseData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                        <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                                        <YAxis tickFormatter={(value: number) => `${value/1000000} Jt`} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} />
                                        <RechartsTooltip 
                                            formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                                            cursor={{fill: 'var(--bg-interactive-hover)'}}
                                            contentStyle={{
                                                backgroundColor: 'var(--bg-secondary-translucent)',
                                                border: '1px solid var(--border-secondary)',
                                                borderRadius: '0.75rem',
                                            }}
                                        />
                                        <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.8rem', paddingTop: '1rem' }} />
                                        <Bar dataKey="income" name="Pendapatan" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Pengeluaran" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                ) : (
                                 <div className="flex flex-col items-center justify-center min-h-[15rem]">
                                    <i className="fa-solid fa-chart-bar text-4xl text-[var(--text-tertiary)] mb-4"></i>
                                    <p className="text-center text-[var(--text-tertiary)]">Tidak ada data untuk ditampilkan.</p>
                                </div>
                            )}
                            </div>
                        </DashboardSection>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsDashboard;