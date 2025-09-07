import { Transaction, TransactionType, ArchivedMonthlyTarget, ArchivedActualReport, MonthlyTarget, DebtItem, SavingsGoal } from '../types';

// --- HELPER FUNCTIONS ---

/**
 * Creates a date relative to the current date.
 * @param daysOffset - Number of days to offset from today. Positive for future, negative for past.
 * @returns ISO string date.
 */
const relativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

/**
 * Creates a "YYYY-MM" string for a past month.
 * @param monthsAgo - How many months in the past. 0 for current month.
 * @returns "YYYY-MM" string.
 */
const pastMonthYear = (monthsAgo: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// --- GOALS (DEBTS & SAVINGS) ---

// 1. Debt that is due soon to trigger the warning
const dueSoonDay = new Date(relativeDate(3)).getDate();

export const mockDebts: DebtItem[] = [
    // --- ACTIVE DEBTS ---
    { 
        id: 'debt-1', name: 'Cicilan iPhone 15 Pro', source: 'Kredivo', 
        totalAmount: 21000000, monthlyInstallment: 1750000, tenor: 12, dueDate: dueSoonDay, 
        payments: Array.from({ length: 4 }, (_, i) => ({ date: relativeDate(-30 * (4 - i)), amount: 1750000 }))
    },
    { 
        id: 'debt-2', name: 'DP Rumah KPR', source: 'Bank BCA', 
        totalAmount: 50000000, monthlyInstallment: 4166667, tenor: 12, dueDate: 1, 
        payments: [] // Brand new debt
    },
    { 
        id: 'debt-3', name: 'Pinjaman Renovasi Dapur', source: 'Bank Mandiri', 
        totalAmount: 10000000, monthlyInstallment: 1000000, tenor: 10, dueDate: 10, 
        payments: Array.from({ length: 9 }, (_, i) => ({ date: relativeDate(-30 * (9 - i)), amount: 1000000 })) // Almost paid off
    },

    // --- PAID OFF DEBTS (FOR HISTORY) ---
    { 
        id: 'debt-4', name: 'Cicilan Kursi Gaming', source: 'ShopeePay Later', 
        totalAmount: 3000000, monthlyInstallment: 500000, tenor: 6, dueDate: 15, 
        payments: Array.from({ length: 6 }, (_, i) => ({ date: relativeDate(-30 * (6 - i)), amount: 500000 })) // Paid off last month
    },
    { 
        id: 'debt-5', name: 'Pinjaman Pendidikan', source: 'Lainnya',
        totalAmount: 5000000, monthlyInstallment: 1250000, tenor: 4, dueDate: 20, 
        payments: Array.from({ length: 4 }, (_, i) => ({ date: relativeDate(-90 * (4 - i)), amount: 1250000 })) // Paid off 3 months ago
    },
];

export const mockSavingsGoals: SavingsGoal[] = [
    // --- ACTIVE GOALS ---
    { 
        id: 'sg-1', name: 'Dana Darurat', source: 'Bank BCA',
        targetAmount: 25000000, currentAmount: 3500000, 
        deadline: relativeDate(365 * 2) // 2 years from now
    },
    { 
        id: 'sg-2', name: 'Liburan ke Jepang', source: 'Bibit',
        targetAmount: 30000000, currentAmount: 18500000, 
        deadline: relativeDate(30 * 8) // 8 months from now
    },

    // --- COMPLETED GOALS (FOR HISTORY) ---
    { 
        id: 'sg-3', name: 'Upgrade PC Gaming', source: 'Lainnya',
        targetAmount: 15000000, currentAmount: 15500000, // Achieved (over target)
        deadline: relativeDate(-30 * 2) // Deadline was 2 months ago
    },
    { 
        id: 'sg-4', name: 'Membeli Motor Baru', source: 'Bank Mandiri',
        targetAmount: 20000000, currentAmount: 20000000, // Achieved (at target)
        deadline: relativeDate(-30 * 5) // Deadline was 5 months ago
    },
];


// --- MANAGEMENT HISTORY & TRANSACTIONS ---
// Generates dynamic data for the last 12 months for charts, reports, and transaction history.

const generateArchivedData = () => {
    const targets: ArchivedMonthlyTarget[] = [];
    const actuals: ArchivedActualReport[] = [];
    const historicalTransactions: Transaction[] = [];

    // BASE TARGET for reuse
    const baseTarget: MonthlyTarget = {
      pendapatan: [{ id: 'p1', name: 'Gaji', amount: '8000000' }],
      cicilanUtang: [{ id: 'cu1', name: 'Cicilan Motor', amount: '800000' }],
      pengeluaranUtama: [{ id: 'pu1', name: 'Sewa Kos', amount: '1500000' }],
      kebutuhan: [{ id: 'k1', name: 'Belanja Dapur', amount: '1200000' }],
      penunjang: [{ id: 'pn1', name: 'Transportasi', amount: '400000' }],
      pendidikan: [],
      tabungan: [{ id: 't1', name: 'Dana Darurat', amount: '1000000' }],
    };
    
    // Scenarios for variety
    const achievedActuals = { 'p1': '8200000', 'cu1': '800000', 'pu1': '1500000', 'k1': '1150000', 'pn1': '400000', 't1': '1100000' };
    const failedActuals = { 'p1': '7800000', 'cu1': '800000', 'pu1': '1600000', 'k1': '1400000', 'pn1': '500000', 't1': '800000' };
    const randomActuals = { 'p1': '8000000', 'cu1': '800000', 'pu1': '1500000', 'k1': '1200000', 'pn1': '400000', 't1': '1000000' };

    const categoryMap: { [key in keyof MonthlyTarget]?: string } = {
        pendapatan: 'Pendapatan',
        cicilanUtang: 'Utang',
        pengeluaranUtama: 'Sewa',
        kebutuhan: 'Kebutuhan',
        penunjang: 'Hiburan',
        pendidikan: 'Pendidikan',
        tabungan: 'Tabungan'
    };

    for (let i = 1; i <= 12; i++) {
        const monthYear = pastMonthYear(i);
        const [year, month] = monthYear.split('-').map(Number);
        targets.push({ monthYear: monthYear, target: baseTarget });

        let currentActuals;
        if (i % 3 === 1) currentActuals = achievedActuals;
        else if (i % 3 === 2) currentActuals = failedActuals;
        else currentActuals = randomActuals;
        
        actuals.push({ monthYear: monthYear, target: baseTarget, actuals: currentActuals });

        // Generate detailed transactions from this month's actuals
        Object.entries(baseTarget).forEach(([sectionKey, items]) => {
            const type = sectionKey === 'pendapatan' ? TransactionType.INCOME : TransactionType.EXPENSE;
            const category = categoryMap[sectionKey as keyof MonthlyTarget] || 'Lainnya';
            items.forEach(item => {
                const amount = parseInt(currentActuals[item.id] || '0');
                if (amount > 0) {
                    historicalTransactions.push({
                        id: `hist-tx-${monthYear}-${item.id}`,
                        date: new Date(year, month - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
                        description: item.name,
                        amount: amount,
                        type: type,
                        category: category
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
} = generateArchivedData();

export const mockArchivedTargets: ArchivedMonthlyTarget[] = generatedTargets;
export const mockArchivedActuals: ArchivedActualReport[] = generatedActuals;

// --- CURRENT MONTH TRANSACTIONS ---
const currentMonthMockTransactions: Transaction[] = [
  { id: 'tx1', date: relativeDate(0), description: 'Gaji Bulanan', amount: 8500000, type: TransactionType.INCOME, category: 'Gaji' },
  { id: 'tx2', date: relativeDate(-1), description: 'Bayar Kos', amount: 1500000, type: TransactionType.EXPENSE, category: 'Sewa' },
  { id: 'tx3', date: relativeDate(-3), description: 'Belanja Bulanan', amount: 1200000, type: TransactionType.EXPENSE, category: 'Kebutuhan' },
  { id: 'tx4', date: relativeDate(-5), description: 'Cicilan iPhone', amount: 1750000, type: TransactionType.EXPENSE, category: 'Utang' },
  { id: 'tx5', date: relativeDate(-10), description: 'Nonton Bioskop', amount: 150000, type: TransactionType.EXPENSE, category: 'Hiburan' },
  { id: 'tx6', date: relativeDate(-12), description: 'Proyek Desain Freelance', amount: 1250000, type: TransactionType.INCOME, category: 'Pendapatan Lain' },
  { id: 'tx7', date: relativeDate(-15), description: 'Makan Siang & Kopi', amount: 450000, type: TransactionType.EXPENSE, category: 'Jajan' },
];

// --- COMBINED TRANSACTIONS FOR THE APP ---
export const mockTransactions: Transaction[] = [
    ...historicalTransactions,
    ...currentMonthMockTransactions
];