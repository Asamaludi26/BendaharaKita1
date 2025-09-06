import { Transaction, TransactionType, ArchivedMonthlyTarget, ArchivedActualReport, MonthlyTarget, DebtItem, SavingsGoal } from '../types';

export const mockTransactions: Transaction[] = [
  { id: 'tx1', date: new Date(new Date().setDate(1)).toISOString(), description: 'Gaji Bulanan', amount: 8000000, type: TransactionType.INCOME, category: 'Gaji' },
  { id: 'tx2', date: new Date(new Date().setDate(2)).toISOString(), description: 'Bayar Kos', amount: 1500000, type: TransactionType.EXPENSE, category: 'Sewa' },
  { id: 'tx3', date: new Date(new Date().setDate(5)).toISOString(), description: 'Belanja Bulanan', amount: 1000000, type: TransactionType.EXPENSE, category: 'Kebutuhan' },
  { id: 'tx4', date: new Date(new Date().setDate(10)).toISOString(), description: 'Cicilan Motor', amount: 800000, type: TransactionType.EXPENSE, category: 'Utang' },
  { id: 'tx5', date: new Date(new Date().setDate(15)).toISOString(), description: 'Makan di Luar', amount: 250000, type: TransactionType.EXPENSE, category: 'Jajan' },
  { id: 'tx6', date: new Date(new Date().setDate(20)).toISOString(), description: 'Freelance Project', amount: 1200000, type: TransactionType.INCOME, category: 'Pendapatan Lain' },
];

const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);
const lastMonthYear = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

const baseTarget: MonthlyTarget = {
  pendapatan: [{ id: 'pendapatan-1', name: 'Gaji', amount: '8000000' }],
  cicilanUtang: [{ id: 'cicilanUtang-1', name: 'Cicilan Motor', amount: '800000' }],
  pengeluaranUtama: [{ id: 'pengeluaranUtama-1', name: 'Sewa Kos', amount: '1500000' }],
  kebutuhan: [{ id: 'kebutuhan-1', name: 'Belanja Dapur', amount: '1200000' }],
  penunjang: [{ id: 'penunjang-1', name: 'Transportasi', amount: '400000' }],
  pendidikan: [{ id: 'pendidikan-1', name: 'Kursus Online', amount: '250000' }],
  tabungan: [{ id: 'tabungan-1', name: 'Dana Darurat', amount: '1000000' }],
};

export const mockArchivedTargets: ArchivedMonthlyTarget[] = [
  {
    monthYear: lastMonthYear,
    target: baseTarget,
  },
];

export const mockArchivedActuals: ArchivedActualReport[] = [
  {
    monthYear: lastMonthYear,
    target: baseTarget,
    actuals: {
      'pendapatan-1': '8000000',
      'cicilanUtang-1': '800000',
      'pengeluaranUtama-1': '1500000',
      'kebutuhan-1': '1350000',
      'penunjang-1': '450000',
      'pendidikan-1': '250000',
      'tabungan-1': '1000000',
    },
  },
];

// --- GOALS DUMMY DATA ---

const today = new Date();

// Helper to create past dates for payments
const pastDate = (monthsAgo: number, dayOfMonth: number = 15): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(dayOfMonth);
  return date.toISOString();
};

// 1. Debt that is due soon
const dueSoonDate = new Date(today);
dueSoonDate.setDate(today.getDate() + 3);
const dueSoonDay = dueSoonDate.getDate();

export const mockDebts: DebtItem[] = [
    // --- ACTIVE DEBTS ---
    { 
        id: 'debt-1', 
        name: 'Cicilan iPhone 15 Pro', 
        source: 'Kredivo', 
        totalAmount: 21000000, 
        monthlyInstallment: 1750000, 
        tenor: 12, 
        dueDate: dueSoonDay, // Dynamically set to be due soon to trigger warning
        payments: Array.from({ length: 4 }, (_, i) => ({
            date: pastDate(4 - i),
            amount: 1750000
        }))
    },
    { 
        id: 'debt-2', 
        name: 'DP Rumah KPR', 
        source: 'Bank BCA', 
        totalAmount: 50000000, 
        monthlyInstallment: 4166667, 
        tenor: 12, 
        dueDate: 1, 
        payments: [] // A brand new debt with 0% progress
    },
    { 
        id: 'debt-3', 
        name: 'Pinjaman Renovasi Dapur', 
        source: 'Bank Mandiri', 
        totalAmount: 10000000, 
        monthlyInstallment: 1000000, 
        tenor: 10, 
        dueDate: 10, 
        payments: Array.from({ length: 9 }, (_, i) => ({ // Almost paid off (9 of 10)
            date: pastDate(9 - i),
            amount: 1000000
        }))
    },

    // --- PAID OFF DEBTS (FOR HISTORY) ---
    { 
        id: 'debt-4', 
        name: 'Cicilan Kursi Gaming', 
        source: 'ShopeePay Later', 
        totalAmount: 3000000, 
        monthlyInstallment: 500000, 
        tenor: 6, 
        dueDate: 15, 
        payments: Array.from({ length: 6 }, (_, i) => ({ // Fully paid off. Last payment was ~1 month ago.
            date: pastDate(6 - i),
            amount: 500000
        }))
    },
    { 
        id: 'debt-5', 
        name: 'Pinjaman Pendidikan', 
        source: 'Lainnya', // Custom source example
        totalAmount: 5000000, 
        monthlyInstallment: 1250000, 
        tenor: 4, 
        dueDate: 20, 
        payments: Array.from({ length: 4 }, (_, i) => ({ // Fully paid off. Last payment was ~3 months ago for grouping.
            date: pastDate(6 - i),
            amount: 1250000
        }))
    },
];


// Helper to create future/past dates for deadlines
const deadlineDate = (monthsFromNow: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    return date.toISOString();
}

export const mockSavingsGoals: SavingsGoal[] = [
    // --- ACTIVE GOALS ---
    { 
        id: 'sg-1', 
        name: 'Dana Darurat', 
        targetAmount: 25000000, 
        currentAmount: 3500000, // Just starting
        deadline: deadlineDate(24) // Far future
    },
    { 
        id: 'sg-2', 
        name: 'Liburan ke Jepang', 
        targetAmount: 30000000, 
        currentAmount: 18500000, // Well underway
        deadline: deadlineDate(8) // Relatively soon
    },

    // --- COMPLETED GOALS (FOR HISTORY) ---
    { 
        id: 'sg-3', 
        name: 'Upgrade PC Gaming', 
        targetAmount: 15000000, 
        currentAmount: 15500000, // Achieved (can be > target)
        deadline: deadlineDate(-2) // Deadline was 2 months ago
    },
    { 
        id: 'sg-4', 
        name: 'Membeli Motor Baru', 
        targetAmount: 20000000, 
        currentAmount: 20000000, // Achieved (exactly at target)
        deadline: deadlineDate(-5) // Deadline was 5 months ago for grouping
    },
];