import { Transaction, TransactionType, ArchivedMonthlyTarget, ArchivedActualReport, MonthlyTarget, DebtItem, SavingsGoal, UserCategory, Account } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- CONFIGURATION ---
const NOW = new Date('2024-08-15T10:00:00Z');

// --- HELPER FUNCTIONS ---
const getMonthYearKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// --- STATIC BASE DATA ---
export const mockAccounts: Account[] = [
    { id: 'acc-bca', name: 'Bank BCA', type: 'Bank', balance: 0 },
    { id: 'acc-gopay', name: 'GoPay', type: 'E-Wallet', balance: 0 },
    { id: 'acc-ovo', name: 'OVO', type: 'E-Wallet', balance: 0 },
    { id: 'acc-test', name: 'Akun Uji Coba', type: 'Bank', balance: 0 },
    { id: 'acc-mandiri', name: 'Bank Mandiri', type: 'Bank', balance: 0 },
];

export const mockUserCategories: UserCategory[] = [
    { id: 'cat-gaji', name: 'Gaji', type: TransactionType.INCOME, isActive: true },
    { id: 'cat-bonus', name: 'Bonus', type: TransactionType.INCOME, isActive: false },
    { id: 'cat-freelance', name: 'Freelance', type: TransactionType.INCOME, isActive: true },
    { id: 'cat-isi-saldo', name: 'Isi Saldo', type: TransactionType.INCOME, isActive: false },
    { id: 'cat-transfer-in', name: 'Transfer Dana', type: TransactionType.INCOME, isActive: false },
    { id: 'cat-pencairan', name: 'Pencairan Tabungan', type: TransactionType.INCOME, isActive: false },
    { id: 'cat-income-lain', name: 'Lainnya', type: TransactionType.INCOME, isActive: true },
    { id: 'cat-saldo-awal', name: 'Saldo Awal', type: TransactionType.INCOME, isActive: false },
    { id: 'cat-kebutuhan', name: 'Kebutuhan', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-jajan', name: 'Jajan', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-transport', name: 'Transportasi', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-sewa', name: 'Sewa', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-kpr', name: 'KPR Rumah Pertama', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-motor', name: 'Cicilan Motor Baru', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-laptop', name: 'Cicilan Laptop', type: TransactionType.EXPENSE, isActive: false },
    { id: 'cat-dd', name: 'Dana Darurat', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-nikah', name: 'Dana Pernikahan', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-liburan', name: 'Liburan Thailand', type: TransactionType.EXPENSE, isActive: false },
    { id: 'cat-tabungan-umum', name: 'Tabungan', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-hiburan', name: 'Hiburan', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-langganan', name: 'Langganan', type: TransactionType.EXPENSE, isActive: true },
    { id: 'cat-kesehatan', name: 'Kesehatan', type: TransactionType.EXPENSE, isActive: false },
    { id: 'cat-pendidikan', name: 'Pendidikan', type: TransactionType.EXPENSE, isActive: false },
    { id: 'cat-transfer-out', name: 'Transfer Dana', type: TransactionType.EXPENSE, isActive: false },
];

// --- SCENARIO-BASED GOALS (JAN 2024 - AUG 2025) ---
export const mockDebts: DebtItem[] = [
    { 
        id: 'debt-kpr', name: 'KPR Rumah Pertama', source: 'Bank BCA', 
        totalAmount: 450000000, monthlyInstallment: 3750000, tenor: 120, dueDate: 1, 
        // Payments from Jan 2024 to Aug 2025 = 20 months
        payments: Array.from({ length: 20 }, (_, i) => ({ date: new Date(2024, 0 + i, 1).toISOString(), amount: 3750000 }))
    },
    { 
        id: 'debt-motor', name: 'Cicilan Motor Baru', source: 'Adira Finance', 
        totalAmount: 18000000, monthlyInstallment: 1500000, tenor: 12, dueDate: 10, 
        // Payments from Sep 2024 to Aug 2025 = 12 months
        payments: Array.from({ length: 12 }, (_, i) => ({ date: new Date(2024, 8 + i, 10).toISOString(), amount: 1500000 }))
    },
    { 
        id: 'debt-paid-laptop', name: 'Cicilan Laptop', source: 'Kredivo', 
        totalAmount: 12000000, monthlyInstallment: 2000000, tenor: 6, dueDate: 20, 
        // Paid off in June 2024. 6 payments from Jan to June 2024.
        payments: Array.from({ length: 6 }, (_, i) => ({ date: new Date(2024, 0 + i, 20).toISOString(), amount: 2000000 }))
    },
];

export const mockSavingsGoals: SavingsGoal[] = [
    { 
        id: 'sg-dana-darurat', name: 'Dana Darurat', source: 'Bibit',
        targetAmount: 30000000, 
        currentAmount: 20000000, // Reflects 20 contributions of 1M
        deadline: new Date(2026, 7, 15).toISOString(),
        // Contributions from Jan 2024 to Aug 2025 = 20 months
        contributions: Array.from({ length: 20 }, (_, i) => ({ date: new Date(2024, 0 + i, 25).toISOString(), amount: 1000000 })),
        isEmergencyFund: true,
    },
    { 
        id: 'sg-wedding', name: 'Dana Pernikahan', source: 'Bank BCA',
        targetAmount: 50000000, 
        currentAmount: 24000000, // 12 contributions of 2M
        deadline: new Date(2026, 1, 15).toISOString(),
        // Contributions from Sep 2024 to Aug 2025 = 12 months
        contributions: Array.from({ length: 12 }, (_, i) => ({ date: new Date(2024, 8 + i, 25).toISOString(), amount: 2000000 }))
    },
    { 
        id: 'sg-completed-vacation', name: 'Liburan Thailand', source: 'GoPay Tabungan',
        targetAmount: 10000000, currentAmount: 10000000,
        deadline: new Date(2024, 4, 15).toISOString(), // Completed in May 2024
        contributions: [
             { date: new Date(2024, 0, 25).toISOString(), amount: 5000000 },
             { date: new Date(2024, 4, 10).toISOString(), amount: 5000000 },
        ]
    },
];

// --- DYNAMIC DATA GENERATION ---

const generateData = () => {
    const targets: ArchivedMonthlyTarget[] = [];
    const actuals: ArchivedActualReport[] = [];
    let allTransactions: Transaction[] = [];
    
    const categoryNameToIdMap = new Map(mockUserCategories.map(c => [c.name, c.id]));

    const getBaseTarget = (date: Date): MonthlyTarget => {
        // Salary increase in July 2024 for more dynamic data.
        const salary = date < new Date(2024, 6, 1) ? '12000000' : '12500000';
        
        let target: MonthlyTarget = {
            [categoryNameToIdMap.get('Gaji')!]: [{ id: 'gaji-pokok', name: 'Gaji', amount: salary }],
            [categoryNameToIdMap.get('KPR Rumah Pertama')!]: [{ id: 'debt-kpr', name: 'KPR Rumah Pertama', amount: '3750000' }],
            [categoryNameToIdMap.get('Sewa')!]: [{ id: 'sewa-apartemen', name: 'Sewa', amount: '2000000' }],
            [categoryNameToIdMap.get('Kebutuhan')!]: [{ id: 'belanja-dapur', name: 'Kebutuhan', amount: '1500000' }],
            [categoryNameToIdMap.get('Transportasi')!]: [{ id: 'transport', name: 'Transportasi', amount: '500000' }],
            [categoryNameToIdMap.get('Hiburan')!]: [{ id: 'hiburan', name: 'Hiburan', amount: '400000' }],
            [categoryNameToIdMap.get('Jajan')!]: [{ id: 'jajan', name: 'Jajan', amount: '400000' }],
            [categoryNameToIdMap.get('Dana Darurat')!]: [{ id: 'sg-dana-darurat', name: 'Dana Darurat', amount: '1000000' }],
        };

        if (date < new Date(2024, 6, 1)) {
            target[categoryNameToIdMap.get('Cicilan Laptop')!] = [{ id: 'debt-paid-laptop', name: 'Cicilan Laptop', amount: '2000000' }];
        }
        if (date >= new Date(2024, 0, 1) && date < new Date(2024, 5, 1)) {
            target[categoryNameToIdMap.get('Liburan Thailand')!] = [{ id: 'sg-completed-vacation', name: 'Liburan Thailand', amount: '2000000'}];
        }
        if (date >= new Date(2024, 8, 1)) { // From Sep 2024
            target[categoryNameToIdMap.get('Cicilan Motor Baru')!] = [{ id: 'debt-motor', name: 'Cicilan Motor Baru', amount: '1500000' }];
            target[categoryNameToIdMap.get('Dana Pernikahan')!] = [{ id: 'sg-wedding', name: 'Dana Pernikahan', amount: '2000000' }];
        }
        return target;
    };

    for (let i = -7; i <= 12; i++) {
        const date = new Date(NOW.getFullYear(), NOW.getMonth() + i, 15);
        const monthYear = getMonthYearKey(date);
        const target = getBaseTarget(date);
        
        targets.push({ monthYear, target });

        const currentActuals: { [key: string]: string } = {};
        Object.values(target).flat().forEach(item => {
            const deviation = (Math.random() - 0.5) * 0.2; // +/- 10%
            const actualAmount = Math.round(parseInt(item.amount) * (1 + deviation));
            currentActuals[item.id] = String(actualAmount);
        });
        
        actuals.push({ monthYear, target, actuals: currentActuals });
        
        const categoryIdToTypeMap = new Map(mockUserCategories.map(c => [c.id, c.type]));
        Object.entries(target).forEach(([categoryId, items]) => {
            items.forEach(item => {
                const amount = parseInt(currentActuals[item.id] || '0');
                if (amount > 0) {
                    allTransactions.push({
                        id: `tx-${monthYear}-${item.id}`,
                        date: new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString(),
                        description: `${item.name}`, amount,
                        type: categoryIdToTypeMap.get(categoryId)!,
                        category: item.name,
                        accountId: (Math.random() < 0.6) ? 'acc-bca' : (Math.random() < 0.8) ? 'acc-gopay' : 'acc-ovo'
                    });
                }
            });
        });
    }
    
    const currentMonthTransactions = [
      { id: 'tx-aug-override-1', date: new Date(2024, 7, 1).toISOString(), description: 'Gaji Bulanan', amount: 12500000, type: TransactionType.INCOME, category: 'Gaji', accountId: 'acc-bca' },
      { id: 'tx-aug-override-2', date: new Date(2024, 7, 1).toISOString(), description: 'Bayar KPR', amount: 3750000, type: TransactionType.EXPENSE, category: 'KPR Rumah Pertama', accountId: 'acc-bca' },
      { id: 'tx-aug-override-3', date: new Date(2024, 7, 2).toISOString(), description: 'Sewa Apartemen', amount: 2000000, type: TransactionType.EXPENSE, category: 'Sewa', accountId: 'acc-bca' },
      { id: 'tx-aug-override-4', date: new Date(2024, 7, 5).toISOString(), description: 'Belanja Dapur Mingguan', amount: 450000, type: TransactionType.EXPENSE, category: 'Kebutuhan', accountId: 'acc-ovo' },
      { id: 'tx-aug-override-5', date: new Date(2024, 7, 7).toISOString(), description: 'Proyek Freelance', amount: 1500000, type: TransactionType.INCOME, category: 'Freelance', accountId: 'acc-bca' },
      { id: 'tx-aug-override-6', date: new Date(2024, 7, 10).toISOString(), description: 'Bensin & Parkir', amount: 300000, type: TransactionType.EXPENSE, category: 'Transportasi', accountId: 'acc-gopay' },
      { id: 'tx-aug-override-7', date: new Date(2024, 7, 12).toISOString(), description: 'Nabung Dana Darurat', amount: 1000000, type: TransactionType.EXPENSE, category: 'Dana Darurat', accountId: 'acc-bca' },
      { id: 'tx-aug-override-8', date: new Date(2024, 7, 14).toISOString(), description: 'Nonton Bioskop', amount: 150000, type: TransactionType.EXPENSE, category: 'Hiburan', accountId: 'acc-gopay' },
      { id: 'tx-aug-override-9', date: new Date(2024, 7, 15).toISOString(), description: 'Pembelian Gadget Mahal', amount: 5000000, type: TransactionType.EXPENSE, category: 'Hiburan', accountId: 'acc-gopay' },
    ];
    
    const currentMonthKey = getMonthYearKey(NOW);
    allTransactions = allTransactions.filter(tx => !tx.id.startsWith(`tx-${currentMonthKey}`));
    allTransactions.push(...currentMonthTransactions);

    const dummyAccountTransactions = [
        { id: 'tx-test-1', date: new Date(2024, 7, 1).toISOString(), description: 'Saldo Awal Akun Uji Coba', amount: 500000, type: TransactionType.INCOME, category: 'Saldo Awal', accountId: 'acc-test' },
        { id: 'tx-test-2', date: new Date(2024, 7, 16).toISOString(), description: 'Makan di Restoran', amount: 150000, type: TransactionType.EXPENSE, category: 'Jajan', accountId: 'acc-test' },
        { id: 'tx-test-3', date: new Date(2024, 7, 18).toISOString(), description: 'Beli Game Baru', amount: 250000, type: TransactionType.EXPENSE, category: 'Hiburan', accountId: 'acc-test' },
        { id: 'tx-mandiri-1', date: new Date(2024, 7, 1).toISOString(), description: 'Saldo Awal Bank Mandiri', amount: 1250000, type: TransactionType.INCOME, category: 'Saldo Awal', accountId: 'acc-mandiri' },
        { id: 'tx-mandiri-2', date: new Date(2024, 7, 20).toISOString(), description: 'Pembayaran Listrik', amount: 200000, type: TransactionType.EXPENSE, category: 'Kebutuhan', accountId: 'acc-mandiri' },
    ];
    allTransactions.push(...dummyAccountTransactions);
    
    return { targets, actuals, allTransactions };
};

const { 
    targets: generatedTargets, 
    actuals: generatedActuals, 
    allTransactions 
} = generateData();

export const mockArchivedTargets: ArchivedMonthlyTarget[] = generatedTargets;
export const mockArchivedActuals: ArchivedActualReport[] = generatedActuals;

allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

mockAccounts.forEach(acc => {
    acc.balance = allTransactions.reduce((sum, tx) => {
        if (tx.accountId === acc.id) {
            return tx.type === TransactionType.INCOME ? sum + tx.amount : sum - tx.amount;
        }
        return sum;
    }, 0);
});

export const mockTransactions: Transaction[] = [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());