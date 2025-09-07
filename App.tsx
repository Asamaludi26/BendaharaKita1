import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Transaction, ArchivedMonthlyTarget, ArchivedActualReport, MonthlyTarget, AddTargetFormData, DebtItem, SavingsGoal } from './types';
import { mockTransactions, mockArchivedTargets, mockArchivedActuals, mockDebts, mockSavingsGoals } from './data/mockData';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import BottomNav from './components/BottomNav';
import Profile from './components/Profile';
import Report from './components/Report';
import AddTargetForm from './components/AddTargetForm';
import AddTransaction from './components/AddTransaction';
import TargetHistory from './components/history/TargetHistory';
import ActualsHistory from './components/history/ActualsHistory';
import Management from './components/Management';
import DebtDetail from './components/goals/DebtDetail';
import SavingsGoalDetail from './components/goals/SavingsGoalDetail';
import Toast from './components/Toast';
import AddDebtForm from './components/AddDebtForm';
import AddSavingsGoalForm from './components/AddSavingsGoalForm';
import DebtHistory from './components/history/DebtHistory';
import SavingsGoalHistory from './components/history/SavingsGoalHistory';
import OnboardingWizard from './components/goals/OnboardingWizard';
import Modal from './components/Modal';

const navOrder = [
    View.DASHBOARD,
    View.TRANSACTIONS,
    View.REPORT,
    View.MANAGEMENT,
    View.PROFILE,
];

type ActiveSheet = 'ONBOARDING' | View.ADD_DEBT | View.ADD_SAVINGS_GOAL | null;

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.DASHBOARD);
    const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
    const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
    const [animationClass, setAnimationClass] = useState('animate-fade-in-up');
    const currentViewRef = useRef(view);
    const [onboardingComplete, setOnboardingComplete] = useState(() => localStorage.getItem('onboardingComplete') === 'true');

    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [archivedTargets, setArchivedTargets] = useState<ArchivedMonthlyTarget[]>(mockArchivedTargets);
    const [archivedActuals, setArchivedActuals] = useState<ArchivedActualReport[]>(mockArchivedActuals);
    const [debts, setDebts] = useState<DebtItem[]>(mockDebts);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(mockSavingsGoals);

    const [displayDate, setDisplayDate] = useState(new Date());
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        document.title = "BendaharaKita";
    }, []);
    
    useEffect(() => {
        if (view === View.MANAGEMENT && !onboardingComplete) {
            setActiveSheet('ONBOARDING');
        }
    }, [view, onboardingComplete]);
    
    // This effect ensures the wizard closes if the user navigates away from the goals page.
    useEffect(() => {
        if (view !== View.MANAGEMENT && activeSheet !== null) {
            setActiveSheet(null);
        }
    }, [view, activeSheet]);

    useEffect(() => {
        currentViewRef.current = view;
    }, [view]);

    const handleSetView = (newView: View) => {
        const oldIndex = navOrder.indexOf(currentViewRef.current);
        const newIndex = navOrder.indexOf(newView);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            if (newIndex > oldIndex) {
                setAnimationClass('animate-slide-in-from-right');
            } else {
                setAnimationClass('animate-slide-in-from-left');
            }
        } else {
            setAnimationClass('animate-fade-in-up');
        }
        setView(newView);
    };

    const handlePrevMonth = () => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

    const currentMonthYear = useMemo(() => `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`, [displayDate]);
    
    const { currentMonthlyTarget, isPreFilled } = useMemo(() => {
        const targetForCurrentMonth = archivedTargets.find(t => t.monthYear === currentMonthYear);
        if (targetForCurrentMonth) {
            return { currentMonthlyTarget: targetForCurrentMonth.target, isPreFilled: false };
        }
        const pastArchives = archivedTargets.filter(t => t.monthYear < currentMonthYear);
        if (pastArchives.length > 0) {
            const sortedPastArchives = pastArchives.sort((a, b) => b.monthYear.localeCompare(a.monthYear));
            const mostRecentArchive = sortedPastArchives[0];
            if (mostRecentArchive) {
                return { currentMonthlyTarget: mostRecentArchive.target, isPreFilled: true };
            }
        }
        return { currentMonthlyTarget: null, isPreFilled: false };
    }, [archivedTargets, currentMonthYear]);

    const isTargetForCurrentMonthSet = !!archivedTargets.find(t => t.monthYear === currentMonthYear);

    const { activeDebts, paidDebts } = useMemo(() => {
        const active: DebtItem[] = [];
        const paid: DebtItem[] = [];
        debts.forEach(debt => {
            const paidAmount = debt.payments.reduce((sum, p) => sum + p.amount, 0);
            if ((debt.totalAmount - paidAmount) <= 0) {
                paid.push(debt);
            } else {
                active.push(debt);
            }
        });
        return { activeDebts: active, paidDebts: paid };
    }, [debts]);
    
    const { activeSavingsGoals, completedSavingsGoals } = useMemo(() => {
        const active: SavingsGoal[] = [];
        const completed: SavingsGoal[] = [];
        savingsGoals.forEach(goal => {
            if (goal.currentAmount >= goal.targetAmount) {
                completed.push(goal);
            } else {
                active.push(goal);
            }
        });
        return { activeSavingsGoals: active, completedSavingsGoals: completed };
    }, [savingsGoals]);

    const totalAllTimeSavings = useMemo(() => savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0), [savingsGoals]);
    const totalAllTimeDebt = useMemo(() => debts.reduce((sum, debt) => sum + debt.totalAmount, 0), [debts]);

    const handleOnboardingComplete = (initialData: { debts: DebtItem[], savingsGoals: SavingsGoal[] }) => {
        setDebts(initialData.debts);
        setSavingsGoals(initialData.savingsGoals);
        localStorage.setItem('onboardingComplete', 'true');
        setOnboardingComplete(true);
        setActiveSheet(null);
        setToast({ message: 'Pengaturan awal berhasil!', type: 'success' });
    };

    const handleSaveTarget = (data: AddTargetFormData) => {
        setArchivedTargets(prev => {
            const existingIndex = prev.findIndex(t => t.monthYear === currentMonthYear);
            const newTarget: ArchivedMonthlyTarget = { monthYear: currentMonthYear, target: data };
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = newTarget;
                return updated;
            }
            return [...prev, newTarget];
        });
        setToast({ message: 'Target bulanan berhasil disimpan!', type: 'success' });
        handleSetView(View.REPORT);
    };
    
    const handleSaveActuals = (data: { [key: string]: string }) => {
        const targetForActuals = archivedTargets.find(t => t.monthYear === currentMonthYear)?.target;
        if (targetForActuals) {
            setArchivedActuals(prev => {
                const existingIndex = prev.findIndex(a => a.monthYear === currentMonthYear);
                const newActualReport: ArchivedActualReport = { monthYear: currentMonthYear, target: targetForActuals, actuals: data };
                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = newActualReport;
                    return updated;
                }
                return [...prev, newActualReport];
            });
            setToast({ message: 'Laporan aktual berhasil disimpan!', type: 'success' });
            handleSetView(View.REPORT);
        } else {
            setToast({ message: 'Target bulanan tidak ditemukan!', type: 'error' });
        }
    };
    
    const handleSaveDebt = (newDebtData: Omit<DebtItem, 'id' | 'payments'> & { payments: { date: string; amount: number }[] }) => {
        const newDebt: DebtItem = { ...newDebtData, id: `debt-${Date.now()}` };
        setDebts(prev => [...prev, newDebt]);
        setToast({ message: 'Pinjaman baru berhasil dicatat!', type: 'success' });
        setActiveSheet(null);
    };

    const handleSaveSavingsGoal = (newGoalData: Omit<SavingsGoal, 'id'>) => {
        const newGoal: SavingsGoal = { ...newGoalData, id: `sg-${Date.now()}` };
        setSavingsGoals(prev => [...prev, newGoal]);
        setToast({ message: 'Tujuan tabungan baru berhasil dibuat!', type: 'success' });
        setActiveSheet(null);
    };

    const handleResetGoalsData = () => {
        setDebts([]);
        setSavingsGoals([]);
        localStorage.removeItem('onboardingComplete');
        setOnboardingComplete(false);
        setActiveSheet('ONBOARDING');
        setToast({ message: 'Data berhasil diatur ulang. Silakan masukkan data baru.', type: 'success' });
    };

    const handleSelectDebt = (id: string) => {
      setActiveGoalId(id);
      handleSetView(View.DEBT_DETAIL);
    };

    const handleSelectSavingsGoal = (id: string) => {
      setActiveGoalId(id);
      handleSetView(View.SAVINGS_GOAL_DETAIL);
    };
    
    const isSheetVisible = activeSheet !== null;

    const renderView = () => {
        switch (view) {
            case View.DASHBOARD:
                return <Dashboard displayDate={displayDate} handlePrevMonth={handlePrevMonth} handleNextMonth={handleNextMonth} archivedTargets={archivedTargets} archivedActuals={archivedActuals} transactions={transactions} />;
            case View.TRANSACTIONS:
                return <Transactions transactions={transactions} />;
            case View.REPORT:
                return <Report setView={handleSetView} isTargetSet={isTargetForCurrentMonthSet} />;
            case View.ADD_TARGET:
                return <AddTargetForm setView={handleSetView} onSave={handleSaveTarget} savedTarget={currentMonthlyTarget} debts={debts} savingsGoals={savingsGoals} isPreFilled={isPreFilled} />;
            case View.ADD_ACTUAL:
                const targetForActuals = archivedTargets.find(t => t.monthYear === currentMonthYear)?.target || null;
                return <AddTransaction setView={handleSetView} onSave={handleSaveActuals} monthlyTarget={targetForActuals} />;
            case View.TARGET_HISTORY:
                return <TargetHistory archives={archivedTargets} setView={handleSetView} />;
            case View.ACTUALS_HISTORY:
                return <ActualsHistory archives={archivedActuals} setView={handleSetView} />;
            case View.MANAGEMENT:
                return <Management 
                    setView={handleSetView} 
                    debts={activeDebts} 
                    savingsGoals={activeSavingsGoals} 
                    onSelectDebt={handleSelectDebt} 
                    onSelectSavingsGoal={handleSelectSavingsGoal} 
                    onAddDebt={() => setActiveSheet(View.ADD_DEBT)} 
                    onAddSavingsGoal={() => setActiveSheet(View.ADD_SAVINGS_GOAL)} 
                    onViewHistory={() => handleSetView(View.DEBT_HISTORY)} 
                    onViewSavingsHistory={() => handleSetView(View.SAVINGS_GOAL_HISTORY)}
                    totalAllTimeSavings={totalAllTimeSavings}
                    totalAllTimeDebt={totalAllTimeDebt}
                    onResetGoals={handleResetGoalsData}
                />;
            case View.DEBT_HISTORY:
                return <DebtHistory paidDebts={paidDebts} setView={handleSetView} onSelectDebt={handleSelectDebt} />;
             case View.SAVINGS_GOAL_HISTORY:
                return <SavingsGoalHistory completedGoals={completedSavingsGoals} setView={handleSetView} onSelectSavingsGoal={handleSelectSavingsGoal} />;
            case View.DEBT_DETAIL:
                const debt = debts.find(d => d.id === activeGoalId);
                return debt ? <DebtDetail debt={debt} setView={handleSetView} /> : <p>Debt not found</p>;
            case View.SAVINGS_GOAL_DETAIL:
                const goal = savingsGoals.find(g => g.id === activeGoalId);
                return goal ? <SavingsGoalDetail goal={goal} setView={handleSetView} /> : <p>Goal not found</p>;
            case View.PROFILE:
                return <Profile />;
            default:
                return <Dashboard displayDate={displayDate} handlePrevMonth={handlePrevMonth} handleNextMonth={handleNextMonth} archivedTargets={archivedTargets} archivedActuals={archivedActuals} transactions={transactions} />;
        }
    };

    return (
        <div className={`min-h-screen`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <main className={`pb-24 ${animationClass} transition-all duration-300 ${isSheetVisible ? 'blur-md' : ''}`} key={view}>
                {renderView()}
            </main>
            
            <BottomNav activeView={view} setView={handleSetView} />

            <Modal isOpen={activeSheet === 'ONBOARDING'} onClose={() => { /* Onboarding cannot be closed */ }}>
                <OnboardingWizard
                    onComplete={handleOnboardingComplete}
                />
            </Modal>
            
            <Modal isOpen={activeSheet === View.ADD_DEBT} onClose={() => setActiveSheet(null)}>
                <AddDebtForm
                    onSave={handleSaveDebt}
                    onClose={() => setActiveSheet(null)}
                />
            </Modal>
            
            <Modal isOpen={activeSheet === View.ADD_SAVINGS_GOAL} onClose={() => setActiveSheet(null)}>
                <AddSavingsGoalForm
                    onSave={handleSaveSavingsGoal}
                    onClose={() => setActiveSheet(null)}
                />
            </Modal>
        </div>
    );
};

export default App;