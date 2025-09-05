import { Transaction, TransactionType, CashFlowData, DebtItem, SavingsGoal, MonthlyTarget, ArchivedMonthlyTarget, ArchivedActualReport, DebtCategory, SavingsGoalCategory, TargetFormField } from '../types';

// Helper function to create dates in different months
const createDate = (monthOffset: number, day: number): Date => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthOffset, day);
  return date;
};

// --- BASE TARGETS & ACTUALS ---
// These will be used to generate consistent historical data.

// FIX: Added missing 'cicilanUtang' property to satisfy the Omit<MonthlyTarget, ...> type.
const baseTargetTemplate: Omit<MonthlyTarget, 'pendapatan' | 'pengeluaranUtama' | 'kebutuhan' | 'penunjang' | 'tabungan' | 'pendidikan'> = {
    cicilanUtang: []
};

const generateTarget = (monthOffset: number, variations: Partial<MonthlyTarget> = {}): ArchivedMonthlyTarget => {
    const date = createDate(monthOffset, 1);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const baseTarget: MonthlyTarget = {
        pendapatan: [{ id: `pendapatan-${monthYear}-1`, name: 'Gaji', amount: '6000000' }],
        cicilanUtang: [
            { id: `cicilanUtang-${monthYear}-1`, name: 'Kredivo', amount: '350000' },
            { id: `cicilanUtang-${monthYear}-2`, name: 'Cicilan Laptop', amount: '800000' }
        ],
        pengeluaranUtama: [{ id: `pengeluaranUtama-${monthYear}-1`, name: 'Sewa Rumah', amount: '1200000' }],
        kebutuhan: [
            { id: `kebutuhan-${monthYear}-1`, name: 'Belanja Bulanan', amount: '800000' },
            { id: `kebutuhan-${monthYear}-2`, name: 'Makan Harian', amount: '700000' }
        ],
        penunjang: [
            { id: `penunjang-${monthYear}-1`, name: 'Transportasi', amount: '300000' },
            { id: `penunjang-${monthYear}-2`, name: 'Hiburan', amount: '250000' }
        ],
        pendidikan: [
            { id: `pendidikan-${monthYear}-1`, name: 'Kursus Online', amount: '200000' }
        ],
        tabungan: [
            { id: `tabungan-${monthYear}-1`, name: 'Dana Darurat', amount: '500000' },
            { id: `tabungan-${monthYear}-2`, name: 'Liburan ke Bali', amount: '300000' },
            { id: `tabungan-${monthYear}-3`, name: 'DP Rumah', amount: '1500000' },
        ],
        ...variations,
    };
    
    return { monthYear, target: baseTarget };
};

const generateActuals = (targetArchive: ArchivedMonthlyTarget): ArchivedActualReport => {
    const { monthYear, target } = targetArchive;
    const actuals: { [key: string]: string } = {};

    const varyAmount = (amountStr: string, variance = 0.1) => {
        const amount = parseInt(amountStr);
        const randomVariance = (Math.random() - 0.5) * 2 * variance; // -variance to +variance
        return Math.round(amount * (1 + randomVariance)).toString();
    };

    Object.keys(target).forEach(sectionKey => {
        const section = target[sectionKey as keyof MonthlyTarget];
        section.forEach(item => {
            actuals[item.id] = varyAmount(item.amount);
        });
    });
    
    // Make some more intentional variations
    actuals[target.kebutuhan[1].id] = varyAmount(target.kebutuhan[1].amount, 0.2); // Makan Harian varies more
    actuals[target.penunjang[1].id] = varyAmount(target.penunjang[1].amount, 0.3); // Hiburan varies more

    return { monthYear, actuals, target };
};


// --- GENERATE 24 MONTHS OF HISTORICAL DATA ---

const historicalTargets: ArchivedMonthlyTarget[] = [];
const historicalActuals: ArchivedActualReport[] = [];

// Generate data for the last 24 months, up to the previous month.
for (let i = 1; i <= 24; i++) {
    const target = generateTarget(i);
    const actuals = generateActuals(target);
    historicalTargets.push(target);
    historicalActuals.push(actuals);
}

// Reverse to have chronological order (oldest first)
export const mockArchivedTargets: ArchivedMonthlyTarget[] = historicalTargets.reverse();
export const mockArchivedActuals: ArchivedActualReport[] = historicalActuals.reverse();


// --- GENERATE TRANSACTIONS FROM HISTORICAL ACTUALS ---

let allTransactions: Transaction[] = [];
mockArchivedActuals.forEach(report => {
    const { monthYear, actuals, target } = report;
    const [year, month] = monthYear.split('-').map(Number);
    
    const findSection = (id: string): keyof MonthlyTarget | null => {
        for (const section of Object.keys(target) as (keyof MonthlyTarget)[]) {
            if (target[section].some(item => item.id === id)) {
                return section;
            }
        }
        return null;
    };

    Object.entries(actuals).forEach(([id, amountStr], index) => {
        const section = findSection(id);
        const item = section ? target[section].find(i => i.id === id) : null;
        if (!item || !amountStr) return;

        const amount = parseInt(amountStr);
        if (isNaN(amount) || amount === 0) return;

        const type = section === 'pendapatan' ? TransactionType.INCOME : TransactionType.EXPENSE;
        
        allTransactions.push({
            id: `tx-${monthYear}-${index}`,
            date: new Date(year, month - 1, Math.floor(Math.random() * 28) + 1).toISOString(),
            amount: amount,
            description: item.name,
            category: section === 'tabungan' ? 'Tabungan' : (section === 'cicilanUtang' ? 'Cicilan Utang' : (section === 'pengeluaranUtama' ? 'Utama' : (item.name.includes('Makan') ? 'Makanan' : item.name))),
            type: type,
        });
    });
});

export const mockTransactions: Transaction[] = allTransactions;


// --- CALCULATE DEBT & SAVINGS PROGRESS BASED ON TRANSACTIONS ---

let mockDebts: DebtItem[] = [
  { id: 'd1', name: 'Cicilan Laptop', totalAmount: 12000000, paidAmount: 3000000, category: 'Konsumtif' },
  { id: 'd2', name: 'Modal Usaha', totalAmount: 25000000, paidAmount: 5000000, category: 'Produktif' },
];

let mockSavingsGoals: SavingsGoal[] = [
  { id: 's1', name: 'Dana Darurat', targetAmount: 15000000, savedAmount: 0, category: 'Dana Darurat', icon: 'shield-halved' },
  { id: 's2', name: 'Liburan ke Bali', targetAmount: 8000000, savedAmount: 0, category: 'Jangka Pendek', icon: 'plane-departure' },
  { id: 's3', name: 'DP Rumah', targetAmount: 100000000, savedAmount: 0, category: 'Jangka Panjang', icon: 'house-chimney' },
  { id: 's4', name: 'Gadget Baru', targetAmount: 10000000, savedAmount: 9200000, category: 'Jangka Pendek', icon: 'mobile-screen-button' }, // Nearing completion
  { id: 's5', name: 'Kursus Online', targetAmount: 5000000, savedAmount: 5000000, category: 'Jangka Pendek', icon: 'graduation-cap' }, // Completed
];

// Simulate progress
const savingsTransactions = allTransactions.filter(t => t.category === 'Tabungan');
savingsTransactions.forEach(tx => {
    const goal = mockSavingsGoals.find(g => g.name === tx.description);
    if (goal) {
        goal.savedAmount += tx.amount;
    }
});
// Ensure saved amount doesn't exceed target for initial setup
mockSavingsGoals.forEach(g => {
    if (g.name !== 'Kursus Online') { // Allow completed goal to exceed
       g.savedAmount = Math.min(g.savedAmount, g.targetAmount);
    }
});


export { mockDebts, mockSavingsGoals };


// --- MISC MOCK DATA ---
export const mockMonthlyData: CashFlowData[] = [
    { month: 'Mar', income: 6000000, expense: 4800000 },
    { month: 'Apr', income: 6200000, expense: 5100000 },
    { month: 'Mei', income: 5800000, expense: 4900000 },
    { month: 'Jun', income: 6500000, expense: 5500000 },
    { month: 'Jul', income: 6000000, expense: 5200000 },
    { month: 'Agu', income: 7000000, expense: 5900000 },
];