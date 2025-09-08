import { Transaction, TransactionType, ArchivedMonthlyTarget, ArchivedActualReport, MonthlyTarget, DebtItem, SavingsGoal, UserCategory, Account } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- HELPER FUNCTIONS ---

const relativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

const pastMonthYear = (monthsAgo: number): string => {
  const date = new Date();
  date.setDate(1); // Set to the first of the month to avoid month skipping issues
  date.setMonth(date.getMonth() - monthsAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// --- ACCOUNTS ---
export const mockAccounts: Account[] = [
    { id: 'acc-bca', name: 'Bank BCA', type: 'Bank', balance: 0 },
    { id: 'acc-gopay', name: 'GoPay', type: 'E-Wallet', balance: 0 },
    { id: 'acc-ovo', name: 'OVO', type: 'E-Wallet', balance: 0 },
];

// --- USER CATEGORIES ---
export const mockUserCategories: UserCategory[] = [
    // Income
    { id: uuidv4(), name: 'Gaji', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Freelance', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Bonus', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Transfer Dana', type: TransactionType.INCOME },
    { id: uuidv4(), name: 'Lainnya', type: TransactionType.INCOME },
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

// --- GOALS (DEBTS & SAVINGS) - Enriched with active and historical data ---
const dueSoonDay = new Date(relativeDate(4)).getDate();

export const mockDebts: DebtItem[] = [
    // --- ACTIVE DEBTS (Used in monthly targets) ---
    { 
        id: 'debt-main-1', name: 'Cicilan iPhone 15 Pro', source: 'Kredivo', 
        totalAmount: 21000000, monthlyInstallment: 1750000, tenor: 12, dueDate: dueSoonDay, 
        payments: Array.from({ length: 4 }, (_, i) => ({ date: relativeDate(-30 * (4 - i)), amount: 1750000 }))
    },
    { 
        id: 'debt-main-kpr', name: 'KPR Rumah Pertama', source: 'Bank BCA', 
        totalAmount: 450000000, monthlyInstallment: 3750000, tenor: 120, dueDate: 1, 
        payments: Array.from({ length: 14 }, (_, i) => ({ date: relativeDate(-30 * (14 - i)), amount: 3750000 }))
    },
    // --- Another active debt for variety ---
    { 
        id: 'debt-active-3', name: 'Pinjaman Renovasi Dapur', source: 'Bank Mandiri', 
        totalAmount: 10000000, monthlyInstallment: 1000000, tenor: 10, dueDate: 10, 
        payments: Array.from({ length: 9 }, (_, i) => ({ date: relativeDate(-30 * (9 - i)), amount: 1000000 })) // Almost paid off
    },
    // --- PAID OFF DEBTS (FOR HISTORY VIEW) ---
    { 
        id: 'debt-paid-1', name: 'Cicilan Kursi Gaming', source: 'ShopeePay Later', 
        totalAmount: 3000000, monthlyInstallment: 500000, tenor: 6, dueDate: 15, 
        payments: Array.from({ length: 6 }, (_, i) => ({ date: relativeDate(-30 * (8 - i)), amount: 500000 })) // Paid off 2 months ago
    },
    { 
        id: 'debt-paid-2', name: 'Pinjaman Pendidikan', source: 'Lainnya',
        totalAmount: 5000000, monthlyInstallment: 1250000, tenor: 4, dueDate: 20, 
        payments: Array.from({ length: 4 }, (_, i) => ({ date: relativeDate(-90 * (4 - i)), amount: 1250000 })) // Paid off a while ago
    },
];

export const mockSavingsGoals: SavingsGoal[] = [
    // --- ACTIVE GOALS (Used in monthly targets) ---
    { 
        id: 'sg-main-1', name: 'Dana Darurat', source: 'Bank BCA',
        targetAmount: 30000000, currentAmount: 14500000, 
        deadline: relativeDate(365 * 2),
        contributions: Array.from({ length: 12 }, (_, i) => ({ date: relativeDate(-30 * (12 - i)), amount: 1000000 + (Math.random() - 0.5) * 200000 })).concat([{date: relativeDate(-365), amount: 2500000}])
    },
    { 
        id: 'sg-main-2', name: 'Liburan ke Jepang', source: 'Bibit',
        targetAmount: 30000000, currentAmount: 18500000, 
        deadline: relativeDate(30 * 8),
        contributions: [
            { date: relativeDate(-150), amount: 5000000 },
            { date: relativeDate(-120), amount: 5000000 },
            { date: relativeDate(-90), amount: 5000000 },
            { date: relativeDate(-60), amount: 2500000 },
            { date: relativeDate(-30), amount: 1000000 },
        ]
    },
    // --- Another active goal for variety ---
    { 
        id: 'sg-active-3', name: 'DP Motor Baru', source: 'OVO',
        targetAmount: 5000000, currentAmount: 4800000, // Almost complete
        deadline: relativeDate(25), // 25 days left
        contributions: [
            { date: relativeDate(-60), amount: 3000000 },
            { date: relativeDate(-30), amount: 1800000 },
        ]
    },
    // --- COMPLETED GOALS (FOR HISTORY VIEW) ---
    { 
        id: 'sg-completed-1', name: 'Upgrade PC Gaming', source: 'Lainnya',
        targetAmount: 15000000, currentAmount: 15500000, // Achieved (over target)
        deadline: relativeDate(-30 * 4), // Deadline was 4 months ago
        contributions: [
             { date: relativeDate(-180), amount: 10000000 },
             { date: relativeDate(-150), amount: 5500000 },
        ]
    },
    { 
        id: 'sg-completed-2', name: 'Membeli Sepatu Lari', source: 'GoPay Tabungan',
        targetAmount: 2000000, currentAmount: 2000000, // Achieved (at target)
        deadline: relativeDate(-30 * 7), // Deadline was 7 months ago
        contributions: [
            { date: relativeDate(-300), amount: 1000000 },
            { date: relativeDate(-240), amount: 1000000 },
        ]
    },
];


// --- DYNAMIC DATA GENERATION FOR THE LAST 12 MONTHS ---

const generateHistoricalData = () => {
    const targets: ArchivedMonthlyTarget[] = [];
    const actuals: ArchivedActualReport[] = [];
    const historicalTransactions: Transaction[] = [];

    // BASE TARGET for reuse, reflecting the goals above
    const baseTarget: MonthlyTarget = {
        pendapatan: [{ id: 'p1', name: 'Gaji Bulanan', amount: '12000000' }],
        cicilanUtang: [
            { id: 'cu1', name: 'Cicilan iPhone 15 Pro', amount: '1750000' },
            { id: 'cu2', name: 'KPR Rumah Pertama', amount: '3750000' }
        ],
        pengeluaranUtama: [{ id: 'pu1', name: 'Sewa Apartemen', amount: '2000000' }],
        kebutuhan: [
            { id: 'k1', name: 'Belanja Dapur', amount: '1500000' },
            { id: 'k2', name: 'Listrik & Internet', amount: '500000' }
        ],
        penunjang: [
            { id: 'pn1', name: 'Transportasi', amount: '600000' },
            { id: 'pn2', name: 'Langganan Digital', amount: '250000' }
        ],
        pendidikan: [],
        tabungan: [
            { id: 't1', name: 'Dana Darurat', amount: '1000000' },
            { id: 't2', name: 'Liburan ke Jepang', amount: '1000000' }
        ],
    };

    const generateRandomActual = (targetAmount: number, isIncome: boolean = false) => {
        // Income can vary slightly more positively
        const deviation = isIncome ? (Math.random() * 0.15) : (Math.random() - 0.5) * 0.2; // -10% to +10% for expenses
        return Math.round(targetAmount * (1 + deviation));
    };
    
    const categoryMap: { [key in keyof MonthlyTarget]?: string } = {
        pendapatan: 'Pendapatan', cicilanUtang: 'Utang', pengeluaranUtama: 'Sewa',
        kebutuhan: 'Kebutuhan', penunjang: 'Hiburan', pendidikan: 'Pendidikan', tabungan: 'Tabungan'
    };
    
    const septemberDate = new Date();
    septemberDate.setMonth(8); // September is month 8 (0-indexed)
    const septemberMonthYear = `${septemberDate.getFullYear()}-09`;

    for (let i = 0; i < 12; i++) { // From current month (0) to 11 months ago
        const monthYear = pastMonthYear(i);
        const [year, month] = monthYear.split('-').map(Number);
        
        // Create a slightly varied target for each month for realism
        const variedTarget = JSON.parse(JSON.stringify(baseTarget));
        variedTarget.pendapatan[0].amount = String(parseInt(baseTarget.pendapatan[0].amount) + (i % 3 === 0 ? 500000 : 0)); // Bonus every 3 months
        targets.push({ monthYear: monthYear, target: variedTarget });
        
        // ** USER REQUIREMENT: Skip creating an actuals report for September **
        if (monthYear === septemberMonthYear) {
            continue;
        }

        // Generate actuals and transactions for other months
        const currentActuals: { [key: string]: string } = {};
        Object.values(variedTarget).flat().forEach((item: any) => {
            currentActuals[item.id] = String(generateRandomActual(parseInt(item.amount), item.id.startsWith('p')));
        });

        actuals.push({ monthYear: monthYear, target: variedTarget, actuals: currentActuals });
        
        // Generate detailed transactions from this month's actuals
        Object.entries(variedTarget).forEach(([sectionKey, items]) => {
            const type = sectionKey === 'pendapatan' ? TransactionType.INCOME : TransactionType.EXPENSE;
            const category = categoryMap[sectionKey as keyof MonthlyTarget] || 'Lainnya';
            (items as any[]).forEach(item => {
                const amount = parseInt(currentActuals[item.id] || '0');
                if (amount > 0) {
                    historicalTransactions.push({
                        id: `hist-tx-${monthYear}-${item.id}`,
                        date: new Date(year, month - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
                        description: item.name, amount, type, category, accountId: 'acc-bca' // Default to BCA for historical data
                    });
                }
            });
        });
    }

    // Sort targets to ensure they're in descending chronological order
    targets.sort((a, b) => b.monthYear.localeCompare(a.monthYear));

    return { targets, actuals, historicalTransactions };
};

const { 
    targets: generatedTargets, 
    actuals: generatedActuals, 
    historicalTransactions 
} = generateHistoricalData();

export const mockArchivedTargets: ArchivedMonthlyTarget[] = generatedTargets;
export const mockArchivedActuals: ArchivedActualReport[] = generatedActuals;

// --- CURRENT MONTH TRANSACTIONS (Specific transactions for demonstration) ---
const currentMonthMockTransactions: Transaction[] = [
  { id: 'tx-curr-1', date: relativeDate(-28), description: 'Gaji Bulanan', amount: 12000000, type: TransactionType.INCOME, category: 'Gaji', accountId: 'acc-bca' },
  { id: 'tx-curr-2', date: relativeDate(-27), description: 'Bayar Apartemen', amount: 2000000, type: TransactionType.EXPENSE, category: 'Sewa', accountId: 'acc-bca' },
  { id: 'tx-curr-3', date: relativeDate(-26), description: 'Belanja Bulanan', amount: 1450000, type: TransactionType.EXPENSE, category: 'Kebutuhan', accountId: 'acc-ovo' },
  { id: 'tx-curr-4', date: relativeDate(-20), description: 'KPR Rumah Pertama', amount: 3750000, type: TransactionType.EXPENSE, category: 'Utang', accountId: 'acc-bca' },
  { id: 'tx-curr-5', date: relativeDate(-15), description: 'Makan Malam & Nonton', amount: 350000, type: TransactionType.EXPENSE, category: 'Hiburan', accountId: 'acc-gopay' },
  { id: 'tx-curr-6', date: relativeDate(-10), description: 'Cicilan iPhone 15 Pro', amount: 1750000, type: TransactionType.EXPENSE, category: 'Utang', accountId: 'acc-bca' },
  { id: 'tx-curr-7', date: relativeDate(-5), description: 'Isi Bensin & Transportasi', amount: 550000, type: TransactionType.EXPENSE, category: 'Transportasi', accountId: 'acc-gopay' },
  { id: 'tx-curr-8', date: relativeDate(-2), description: 'Setor Dana Darurat', amount: 1000000, type: TransactionType.EXPENSE, category: 'Tabungan', accountId: 'acc-bca' },
];

// --- COMBINED TRANSACTIONS FOR THE APP ---
const allTransactions: Transaction[] = [
    ...historicalTransactions,
    ...currentMonthMockTransactions
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const mockTransactions: Transaction[] = allTransactions;

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