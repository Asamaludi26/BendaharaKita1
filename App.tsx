// This is the main application component. It manages all state, views, and data persistence.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Transaction, DebtItem, SavingsGoal, ArchivedMonthlyTarget, ArchivedActualReport, MonthlyTarget } from './types';
import { mockTransactions, mockDebts, mockSavingsGoals, mockArchivedActuals, mockArchivedTargets } from './data/mockData';

import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Report from './components/Report';
import Management from './components/Management';
import Profile from './components/Profile';
import DebtDetail from './components/goals/DebtDetail';
import SavingsGoalDetail from './components/goals/SavingsGoalDetail';
import AddTargetForm from './components/AddTargetForm';
import AddTransaction from './components/AddTransaction';
import TargetHistory from './components/history/TargetHistory';
import ActualsHistory from './components/history/ActualsHistory';
import DebtHistory from './components/history/DebtHistory';
import SavingsGoalHistory from './components/history/SavingsGoalHistory';
import OnboardingWizard from './components/goals/OnboardingWizard';
import AddDebtForm from './components/AddDebtForm';
import AddSavingsGoalForm from './components/AddSavingsGoalForm';
import Toast from './components/Toast';
import Modal from './components/Modal';

// A simple hook to persist state to localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.DASHBOARD);
    const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [activeModal, setActiveModal] = useState<null | 'ADD_DEBT' | 'ADD_SAVINGS_GOAL'>(null);

    // Data states
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions_data', mockTransactions);
    const [debts, setDebts] = useLocalStorage<DebtItem[]>('debts_data', mockDebts);
    const [savingsGoals, setSavingsGoals] = useLocalStorage<SavingsGoal[]>('savingsGoals_data', mockSavingsGoals);
    const [archivedTargets, setArchivedTargets] = useLocalStorage<ArchivedMonthlyTarget[]>('archivedTargets_data', mockArchivedTargets);
    const [archivedActuals, setArchivedActuals] = useLocalStorage<ArchivedActualReport[]>('archivedActuals_data', mockArchivedActuals);
    
    // Onboarding state
    const [onboardingComplete, setOnboardingComplete] = useLocalStorage<boolean>('onboardingComplete_status', false);

    const [displayDate, setDisplayDate] = useState(new Date());

    const handlePrevMonth = () => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    
    const currentMonthYear = useMemo(() => {
        return `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;
    }, [displayDate]);

    // DERIVED STATE: The single source of truth for the current month's target.
    // This is the core fix for the "empty form" bug.
    const currentMonthlyTarget = useMemo(() => {
        let targetForMonth = archivedTargets.find(t => t.monthYear === currentMonthYear);
        
        // If no target exists for the current month, smartly grab the most recent one as a template.
        if (!targetForMonth && archivedTargets.length > 0) {
            const lastTargetArchive = [...archivedTargets].sort((a, b) => b.monthYear.localeCompare(a.monthYear))[0];
            // We return the target data, but NOT the monthYear, so the app knows it's a template.
            return lastTargetArchive.target;
        }

        return targetForMonth ? targetForMonth.target : null;
    }, [currentMonthYear, archivedTargets]);

    const handleSaveTarget = (data: MonthlyTarget) => {
        setArchivedTargets(prev => {
            const existing = prev.find(p => p.monthYear === currentMonthYear);
            if (existing) {
                return prev.map(p => p.monthYear === currentMonthYear ? { ...p, target: data } : p);
            }
            return [...prev, { monthYear: currentMonthYear, target: data }];
        });
        setView(View.REPORT);
        setToast({ message: 'Target berhasil disimpan!', type: 'success' });
    };
    
    const handleSaveActuals = (data: { [key: string]: string }) => {
        if (!currentMonthlyTarget) return;

        setArchivedActuals(prev => {
            const existing = prev.find(p => p.monthYear === currentMonthYear);
            if (existing) {
                return prev.map(p => p.monthYear === currentMonthYear ? { ...p, actuals: data } : p);
            }
            return [...prev, { monthYear: currentMonthYear, target: currentMonthlyTarget, actuals: data }];
        });

        // --- Data Integration Logic ---
        const syncDate = new Date().toISOString();
        const monthIdentifier = `auto-sync-${currentMonthYear}`;

        // Sync Savings
        const newSavingsGoals = [...savingsGoals];
        currentMonthlyTarget.tabungan.forEach(item => {
            const actualAmount = Number(data[item.id] || '0');
            if(actualAmount <= 0) return;

            const goal = newSavingsGoals.find(g => g.name === item.name);
            if (goal && !goal.contributions.some(c => c.date.startsWith(monthIdentifier))) {
                goal.currentAmount += actualAmount;
                goal.contributions.push({ date: `${monthIdentifier}-${item.id}`, amount: actualAmount });
            }
        });
        setSavingsGoals(newSavingsGoals);

        // Sync Debts
        const newDebts = [...debts];
        currentMonthlyTarget.cicilanUtang.forEach(item => {
            const actualAmount = Number(data[item.id] || '0');
            if (actualAmount <= 0) return;
            
            const debt = newDebts.find(d => d.name === item.name);
            if (debt && !debt.payments.some(p => p.date.startsWith(monthIdentifier))) {
                debt.payments.push({ date: `${monthIdentifier}-${item.id}`, amount: actualAmount });
            }
        });
        setDebts(newDebts);

        setView(View.REPORT);
        setToast({ message: 'Laporan aktual berhasil disimpan & disinkronkan!', type: 'success' });
    };

    const handleOnboardingComplete = (data: { debts: DebtItem[], savingsGoals: SavingsGoal[] }) => {
        setDebts(data.debts);
        setSavingsGoals(data.savingsGoals);
        setOnboardingComplete(true);
        setActiveModal(null);
        setToast({ message: 'Pengaturan awal berhasil!', type: 'success' });
    };

    const handleAddDebt = (debtData: Omit<DebtItem, 'id'>) => {
        const newDebt: DebtItem = { ...debtData, id: `debt-${Date.now()}` };
        setDebts(prev => [...prev, newDebt]);
        setActiveModal(null);
        setToast({ message: 'Pinjaman baru berhasil ditambahkan!', type: 'success' });
    };

    const handleAddSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
        const newGoal: SavingsGoal = { ...goalData, id: `sg-${Date.now()}` };
        setSavingsGoals(prev => [...prev, newGoal]);
        setActiveModal(null);
        setToast({ message: 'Tujuan baru berhasil ditambahkan!', type: 'success' });
    };

    const handleAddPayment = (debtId: string, amount: number) => {
        setDebts(prev => prev.map(d => d.id === debtId ? { ...d, payments: [...d.payments, { date: new Date().toISOString(), amount }] } : d));
        setToast({ message: 'Pembayaran berhasil dicatat!', type: 'success' });
    };
    
    const handleAddContribution = (goalId: string, amount: number) => {
        setSavingsGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount, contributions: [...g.contributions, { date: new Date().toISOString(), amount }] } : g));
        setToast({ message: 'Dana berhasil ditambahkan!', type: 'success' });
    };

    const handleClearAllData = () => {
        localStorage.clear();
        window.location.reload();
    };

    const resetGoals = () => {
        setDebts([]);
        setSavingsGoals([]);
        setOnboardingComplete(false);
        setView(View.MANAGEMENT);
        setToast({ message: 'Data tujuan telah direset.', type: 'success' });
    }
    
    // Auto-close modals if view changes
    useEffect(() => {
        if(activeModal) setActiveModal(null);
    }, [view]);

    // Show onboarding wizard contextually
    useEffect(() => {
        if(view === View.MANAGEMENT && !onboardingComplete) {
            setActiveModal(null); // Ensure other modals are closed
        }
    }, [view, onboardingComplete]);


    const activeDebts = useMemo(() => debts.filter(d => (d.totalAmount - d.payments.reduce((sum, p) => sum + p.amount, 0)) > 0), [debts]);
    const paidDebts = useMemo(() => debts.filter(d => (d.totalAmount - d.payments.reduce((sum, p) => sum + p.amount, 0)) <= 0), [debts]);
    const activeSavingsGoals = useMemo(() => savingsGoals.filter(g => g.currentAmount < g.targetAmount), [savingsGoals]);
    const completedSavingsGoals = useMemo(() => savingsGoals.filter(g => g.currentAmount >= g.targetAmount), [savingsGoals]);
    const totalAllTimeSavings = useMemo(() => savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0), [savingsGoals]);
    const totalAllTimeDebt = useMemo(() => debts.reduce((sum, d) => sum + d.totalAmount, 0), [debts]);

    const renderView = () => {
        const pageContentClass = `transition-all duration-500 ${activeModal ? 'blur-md scale-95' : ''}`;
        
        let pageComponent: React.ReactNode;

        switch (view) {
            case View.DASHBOARD:
                pageComponent = <Dashboard displayDate={displayDate} handlePrevMonth={handlePrevMonth} handleNextMonth={handleNextMonth} archivedTargets={archivedTargets} archivedActuals={archivedActuals} transactions={transactions} />;
                break;
            case View.TRANSACTIONS:
                pageComponent = <Transactions transactions={transactions} />;
                break;
            case View.REPORT:
                pageComponent = <Report setView={setView} isTargetSet={!!currentMonthlyTarget} />;
                break;
            case View.ADD_TARGET:
                pageComponent = <AddTargetForm 
                                    setView={setView} 
                                    onSave={handleSaveTarget} 
                                    initialData={currentMonthlyTarget}
                                    archivedTargets={archivedTargets}
                                    currentMonthYear={currentMonthYear}
                                    activeDebts={activeDebts}
                                    activeSavingsGoals={activeSavingsGoals}
                                    onAddDebt={() => setActiveModal('ADD_DEBT')}
                                    onAddSavingsGoal={() => setActiveModal('ADD_SAVINGS_GOAL')}
                                />;
                break;
            case View.ADD_ACTUAL:
                pageComponent = <AddTransaction setView={setView} onSave={handleSaveActuals} monthlyTarget={currentMonthlyTarget} />;
                break;
            case View.TARGET_HISTORY:
                pageComponent = <TargetHistory archives={archivedTargets} setView={setView} />;
                break;
            case View.ACTUALS_HISTORY:
                pageComponent = <ActualsHistory archives={archivedActuals} setView={setView} />;
                break;
            case View.MANAGEMENT:
                pageComponent = <Management 
                    setView={setView} 
                    debts={activeDebts} 
                    savingsGoals={activeSavingsGoals}
                    onSelectDebt={(id) => { setActiveDetailId(id); setView(View.DEBT_DETAIL); }}
                    onSelectSavingsGoal={(id) => { setActiveDetailId(id); setView(View.SAVINGS_GOAL_DETAIL); }}
                    onAddDebt={() => setActiveModal('ADD_DEBT')}
                    onAddSavingsGoal={() => setActiveModal('ADD_SAVINGS_GOAL')}
                    onViewHistory={() => setView(View.DEBT_HISTORY)}
                    onViewSavingsHistory={() => setView(View.SAVINGS_GOAL_HISTORY)}
                    totalAllTimeSavings={totalAllTimeSavings}
                    totalAllTimeDebt={totalAllTimeDebt}
                    onResetGoals={resetGoals}
                />;
                break;
            case View.DEBT_DETAIL:
                const debt = debts.find(d => d.id === activeDetailId);
                pageComponent = debt ? <DebtDetail debt={debt} setView={setView} onAddPayment={handleAddPayment} /> : <div>Debt not found</div>;
                break;
            case View.SAVINGS_GOAL_DETAIL:
                const goal = savingsGoals.find(g => g.id === activeDetailId);
                pageComponent = goal ? <SavingsGoalDetail goal={goal} setView={setView} onAddContribution={handleAddContribution} /> : <div>Goal not found</div>;
                break;
            case View.DEBT_HISTORY:
                pageComponent = <DebtHistory paidDebts={paidDebts} setView={setView} onSelectDebt={(id) => { setActiveDetailId(id); setView(View.DEBT_DETAIL); }} />;
                break;
            case View.SAVINGS_GOAL_HISTORY:
                pageComponent = <SavingsGoalHistory completedGoals={completedSavingsGoals} setView={setView} onSelectSavingsGoal={(id) => { setActiveDetailId(id); setView(View.SAVINGS_GOAL_DETAIL); }} />;
                break;
            case View.PROFILE:
                pageComponent = <Profile onClearAllData={handleClearAllData} />;
                break;
            default:
                pageComponent = <Dashboard displayDate={displayDate} handlePrevMonth={handlePrevMonth} handleNextMonth={handleNextMonth} archivedTargets={archivedTargets} archivedActuals={archivedActuals} transactions={transactions} />;
        }
        
        return <div className={pageContentClass}>{pageComponent}</div>;
    };
    
    // Contextual Onboarding Wizard
    const showOnboardingWizard = view === View.MANAGEMENT && !onboardingComplete;

    return (
        <div className="bg-gray-900 text-white font-sans min-h-screen">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <main className="pb-24">
                {renderView()}
            </main>

            <BottomNav activeView={view} setView={setView} />
            
            {/* --- MODAL AREA --- */}
            <Modal isOpen={showOnboardingWizard} onClose={() => {}}>
                <OnboardingWizard onComplete={handleOnboardingComplete} />
            </Modal>

            <Modal isOpen={activeModal === 'ADD_DEBT'} onClose={() => setActiveModal(null)}>
                <AddDebtForm onSave={handleAddDebt} onClose={() => setActiveModal(null)} />
            </Modal>

            <Modal isOpen={activeModal === 'ADD_SAVINGS_GOAL'} onClose={() => setActiveModal(null)}>
                <AddSavingsGoalForm onSave={handleAddSavingsGoal} onClose={() => setActiveModal(null)} />
            </Modal>
        </div>
    );
};

export default App;