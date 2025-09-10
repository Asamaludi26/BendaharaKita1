import { Transaction, TransactionType, ArchivedMonthlyTarget, ArchivedActualReport, MonthlyTarget, DebtItem, SavingsGoal, UserCategory, Account } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- CONFIGURATION ---
// Set a fixed "current date" for data generation to ensure consistency.
const NOW = new Date('2024-08-15T10:00:00Z');

// --- HELPER FUNCTIONS ---

/**
 * Creates a date relative to the NOW constant.
 * @param daysOffset - Number of days to offset from NOW.
 * @returns ISO string date.
 */
const relativeDate = (daysOffset: number): string => {
  const date = new Date(NOW);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

/**
 * Creates a "YYYY-MM" string for a past month relative to NOW.
 * @param monthsAgo - How many months in the past from NOW. 0 for the current month.
 * @returns "YYYY-MM" string.
 */
const pastMonthYear = (monthsAgo: number): string => {
  const date = new Date(NOW);
  date.setDate(1); // Set to the first to avoid month skipping issues on 31st etc.
  date.setMonth(date.getMonth() - monthsAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// --- STATIC DATA ---

export const mockAccounts: Account[] = [
    { id: 'acc-bca', name: 'Bank BCA', type: 'Bank', balance: 0 },
    { id: 'acc-gopay', name: 'GoPay', type: 'E-Wallet', balance: 0 },
    { id: 'acc-ovo', name: 'OVO', type: 'E-Wallet', balance: 0 },
];

export const mockUserCategories: UserCategory[] = [
    // Income
    { id: uuidv4(), name: 'Gaji', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Freelance', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Bonus', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Transfer Dana', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Isi Saldo', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Pencairan Tabungan', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Lainnya', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Saldo Awal', type: TransactionType.INCOME },
    // Expense
    { id: uuidv4(), name: 'Kebutuhan', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Jajan', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Transportasi', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Sewa', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Utang', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Tabungan', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Hiburan', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Langganan', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Kesehatan', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Pendidikan', type: TransactionType.EXPENSE },
    { id: uuidv4(), name: 'Transfer Dana', type: TransactionType.EXPENSE },
];

// --- GOALS (DEBTS & SAVINGS) ---

export const mockDebts: DebtItem[] = [
    // Active
    { 
        id: 'debt-kpr-1', name: 'KPR Rumah Impian', source: 'Bank BCA', 
        totalAmount: 500000000, monthlyInstallment: 4000000, tenor: 120, dueDate: 5, 
        payments: Array.from({ length: 24 }, (_, i) => ({ date: relativeDate(-30 * (24 - i)), amount: 4000000 }))
    },
    { 
        id: 'debt-iphone-1', name: 'Cicilan iPhone 15 Pro', source: 'Kredivo', 
        totalAmount: 21000000, monthlyInstallment: 1750000, tenor: 12, dueDate: 25, 
        payments: Array.from({ length: 6 }, (_, i) => ({ date: relativeDate(-30 * (6 - i)), amount: 1750000 }))
    },
    // Paid Off (for History)
    { 
        id: 'debt-paid-laptop', name: 'Cicilan Laptop Kerja', source: 'ShopeePay Later', 
        totalAmount: 12000000, monthlyInstallment: 1000000, tenor: 12, dueDate: 15, 
        payments: Array.from({ length: 12 }, (_, i) => ({ date: relativeDate(-30 * (15 - i)), amount: 1000000 })) // Paid off 3 months ago from NOW
    },
];

export const mockSavingsGoals: SavingsGoal[] = [
    // Active
    { 
        id: 'sg-dana-darurat', name: 'Dana Darurat', source: 'Bibit',
        targetAmount: 30000000, currentAmount: 12000000, 
        deadline: relativeDate(365 * 2), // 2 years from NOW
        contributions: Array.from({ length: 12 }, (_, i) => ({ date: relativeDate(-30 * (12 - i)), amount: 1000000 })),
        isEmergencyFund: true,
    },
    { 
        id: 'sg-jepang', name: 'Liburan ke Jepang', source: 'Bank BCA',
        targetAmount: 25000000, currentAmount: 22500000, 
        deadline: relativeDate(30 * 2), // 2 months from NOW (deadline is near)
        contributions: Array.from({ length: 9 }, (_, i) => ({ date: relativeDate(-30 * (9 - i)), amount: 2500000 }))
    },
    // Completed (for History)
    { 
        id: 'sg-completed-pc', name: 'Upgrade PC Gaming', source: 'Ajaib',
        targetAmount: 15000000, currentAmount: 15500000, // Over target
        deadline: relativeDate(-30 * 6), // Deadline was 6 months ago
        contributions: [
             { date: relativeDate(-30 * 9), amount: 7500000 },
             { date: relativeDate(-30 * 6), amount: 8000000 },
        ]
    },
];

// --- DYNAMIC HISTORICAL DATA GENERATION (1 year) ---

const generateHistoricalData = () => {
    const targets: ArchivedMonthlyTarget[] = [];
    const actuals: ArchivedActualReport[] = [];
    const historicalTransactions: Transaction[] = [];

    const baseTarget: MonthlyTarget = {
        pendapatan: [{ id: 'gaji-pokok', name: 'Gaji', amount: '12000000' }],
        cicilanUtang: [
            { id: 'utang-kpr', name: 'KPR Rumah Impian', amount: '4000000' },
            { id: 'utang-iphone', name: 'Cicilan iPhone 15 Pro', amount: '1750000' }
        ],
        pengeluaranUtama: [{ id: 'sewa-apartemen', name: 'Sewa', amount: '2000000' }],
        kebutuhan: [
            { id: 'belanja-dapur', name: 'Kebutuhan', amount: '1500000' },
        ],
        penunjang: [
            { id: 'transport', name: 'Transportasi', amount: '600000' },
            { id: 'hiburan', name: 'Hiburan', amount: '500000' }
        ],
        pendidikan: [],
        tabungan: [
            { id: 'tabungan-dd', name: 'Dana Darurat', amount: '1000000' },
            { id: 'tabungan-jepang', name: 'Liburan ke Jepang', amount: '2500000' }
        ],
    };

    const categoryMap: { [key in keyof MonthlyTarget]?: string } = {
        pendapatan: 'Gaji', cicilanUtang: 'Utang', pengeluaranUtama: 'Sewa',
        kebutuhan: 'Kebutuhan', penunjang: 'Hiburan', pendidikan: 'Pendidikan', tabungan: 'Tabungan'
    };

    // Generate data for the last 12 months, including the current one.
    for (let i = 11; i >= 1; i--) { // Start from 11 months ago up to last month
        const monthYear = pastMonthYear(i);
        const [year, month] = monthYear.split('-').map(Number);

        // All months have a target
        targets.push({ monthYear: monthYear, target: baseTarget });

        // September 2023 has a target but no actuals
        if (monthYear === '2023-09') {
            continue;
        }

        const currentActuals: { [key: string]: string } = {};
        
        // --- Simulate different scenarios for "Tercapai" status ---
        let overspendAmount = 0;
        let underspendAmount = 0;
        let incomeBonus = 0;
        
        // May 2024: Overspend on Hiburan -> Not Achieved
        if (monthYear === '2024-05') overspendAmount = 400000;
        
        // April 2024: Under-achieve savings -> Not Achieved
        if (monthYear === '2024-04') underspendAmount = 500000;
        
        // June 2024: Got a bonus, paid more debt, saved more -> Achieved
        if (monthYear === '2024-06') incomeBonus = 1000000;

        // Populate actuals based on target
        Object.values(baseTarget).flat().forEach((item: any) => {
            let actualAmount = parseInt(item.amount);
            
            if (item.id === 'hiburan') actualAmount += overspendAmount;
            if (item.id === 'tabungan-dd') actualAmount -= underspendAmount;
            if (item.id === 'gaji-pokok') actualAmount += incomeBonus;
            if (item.id === 'utang-kpr' && incomeBonus > 0) actualAmount += 500000; // Pay more debt with bonus
            
            // General random deviation
            const deviation = (Math.random() - 0.5) * 0.1; // +/- 5%
            currentActuals[item.id] = String(Math.round(actualAmount * (1 + deviation)));
        });

        actuals.push({ monthYear: monthYear, target: baseTarget, actuals: currentActuals });

        // Generate transactions from actuals
         Object.entries(baseTarget).forEach(([sectionKey, items]) => {
            const type = sectionKey === 'pendapatan' ? TransactionType.INCOME : TransactionType.EXPENSE;
            (items as any[]).forEach(item => {
                const amount = parseInt(currentActuals[item.id] || '0');
                if (amount > 0) {
                    const accountId = item.id.includes('gaji') || item.id.includes('utang') || item.id.includes('sewa') ? 'acc-bca' : (i % 2 === 0 ? 'acc-gopay' : 'acc-ovo');
                    historicalTransactions.push({
                        id: `hist-tx-${monthYear}-${item.id}`,
                        date: new Date(year, month - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
                        description: item.name, amount, type, 
                        category: categoryMap[sectionKey as keyof MonthlyTarget] || item.name,
                        accountId
                    });
                }
            });
        });
    }

    return { targets, actuals, historicalTransactions };
};

const { 
    targets: generatedTargets, 
    actuals: generatedActuals, 
    historicalTransactions 
} = generateHistoricalData();

export const mockArchivedTargets: ArchivedMonthlyTarget[] = generatedTargets;
export const mockArchivedActuals: ArchivedActualReport[] = generatedActuals;


// --- CURRENT MONTH (August 2024) DATA ---
// Create a target for the current month
const currentMonthTarget = {
    monthYear: pastMonthYear(0), // August 2024
    target: mockArchivedTargets[0]?.target || {}, // Use the latest target as a base
};
mockArchivedTargets.unshift(currentMonthTarget as ArchivedMonthlyTarget);


// Specific transactions for the current month (August 2024)
const currentMonthMockTransactions: Transaction[] = [
  { id: 'tx-aug-1', date: relativeDate(-14), description: 'Gaji', amount: 12000000, type: TransactionType.INCOME, category: 'Gaji', accountId: 'acc-bca' },
  { id: 'tx-aug-2', date: relativeDate(-10), description: 'KPR Rumah Impian', amount: 4000000, type: TransactionType.EXPENSE, category: 'Utang', accountId: 'acc-bca' },
  { id: 'tx-aug-3', date: relativeDate(-9), description: 'Sewa', amount: 2000000, type: TransactionType.EXPENSE, category: 'Sewa', accountId: 'acc-bca' },
  { id: 'tx-aug-4', date: relativeDate(-9), description: 'Belanja Mingguan', amount: 500000, type: TransactionType.EXPENSE, category: 'Kebutuhan', accountId: 'acc-ovo' },
  { id: 'tx-aug-5', date: relativeDate(-7), description: 'Makan di luar', amount: 150000, type: TransactionType.EXPENSE, category: 'Jajan', accountId: 'acc-gopay' },
  { id: 'tx-aug-6', date: relativeDate(-5), description: 'Isi Bensin', amount: 250000, type: TransactionType.EXPENSE, category: 'Transportasi', accountId: 'acc-gopay' },
  { id: 'tx-aug-7', date: relativeDate(-3), description: 'Nabung Dana Darurat', amount: 1000000, type: TransactionType.EXPENSE, category: 'Tabungan', accountId: 'acc-bca' },
  { id: 'tx-aug-8', date: relativeDate(-1), description: 'Nabung Liburan ke Jepang', amount: 2500000, type: TransactionType.EXPENSE, category: 'Tabungan', accountId: 'acc-bca' },
];

// --- COMBINE, SORT, and CALCULATE BALANCES ---
const allTransactions: Transaction[] = [
    ...historicalTransactions,
    ...currentMonthMockTransactions
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort oldest to newest for balance calculation

// Calculate initial balances based on all transactions
mockAccounts.forEach(acc => {
    const balance = allTransactions.reduce((sum, tx) => {
        if (tx.accountId === acc.id) {
            return tx.type === TransactionType.INCOME ? sum + tx.amount : sum - tx.amount;
        }
        return sum;
    }, 0);
    acc.balance = balance;
});

// Final export, sorted newest to oldest for display
export const mockTransactions: Transaction[] = [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());