import React, { useState, useMemo, useCallback } from 'react';
import { View, Transaction, TransactionType, DebtItem, SavingsGoal, MonthlyTarget, ArchivedMonthlyTarget, ArchivedActualReport } from './types';
// FIX: Removed mockMonthlyData as it's no longer used.
import { mockTransactions, mockDebts, mockSavingsGoals, mockArchivedTargets, mockArchivedActuals } from './data/mockData';

// Import components
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Profile from './components/Profile';
import Management from './components/Management';
import SavingsGoals from './components/goals/SavingsGoals';
import SavingsGoalDetail from './components/goals/SavingsGoalDetail';
import DebtManagement from './components/goals/DebtManagement';
import DebtDetail from './components/goals/DebtDetail';
import TargetHistory from './components/history/TargetHistory';
import ActualsHistory from './components/history/ActualsHistory';
import AddChoice from './components/AddChoice';
import AddTransaction from './components/AddTransaction';
import AddTargetForm from './components/AddTargetForm';
import AddEditSavingsGoalModal from './components/modals/AddEditSavingsGoalModal';
import AddEditDebtModal from './components/modals/AddEditDebtModal';

const App: React.FC = () => {
    // State management
    const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
    const [selectedItem, setSelectedItem] = useState<DebtItem | SavingsGoal | null>(null);
    const [displayDate, setDisplayDate] = useState(new Date()); // State for Dashboard month

    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [debts, setDebts] = useState<DebtItem[]>(mockDebts);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(mockSavingsGoals);

    const [monthlyTarget, setMonthlyTarget] = useState<MonthlyTarget | null>(null);
    const [archivedTargets, setArchivedTargets] = useState<ArchivedMonthlyTarget[]>(mockArchivedTargets);
    const [archivedActuals, setArchivedActuals] = useState<ArchivedActualReport[]>(mockArchivedActuals);

    // Modal states
    const [isChoosingAdd, setIsChoosingAdd] = useState(false);
    const [isAddingActuals, setIsAddingActuals] = useState(false);
    const [isAddingTarget, setIsAddingTarget] = useState(false);
    
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
    const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);
    
    // Handlers
    const setView = useCallback((view: View, item?: DebtItem | SavingsGoal) => {
        if (view === View.ADD) {
            setIsChoosingAdd(true);
        } else {
            setActiveView(view);
            if (item) {
                setSelectedItem(item);
            } else {
                setSelectedItem(null);
            }
        }
    }, []);

    const handlePrevMonth = () => setDisplayDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; });
    const handleNextMonth = () => setDisplayDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; });

    const handleSaveTarget = (data: MonthlyTarget) => {
        const now = new Date();
        const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setMonthlyTarget(data);
        const newArchive: ArchivedMonthlyTarget = { monthYear, target: data };
        setArchivedTargets(prev => [...prev.filter(a => a.monthYear !== monthYear), newArchive]);
        setIsAddingTarget(false);
    };

    const handleSaveActuals = (data: { [key: string]: string }) => {
        if (!monthlyTarget) return;

        const now = new Date();
        const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // 1. Archive the actual report
        const newArchivedActual: ArchivedActualReport = { monthYear, actuals: data, target: monthlyTarget };
        setArchivedActuals(prev => [...prev.filter(a => a.monthYear !== monthYear), newArchivedActual]);

        // 2. Generate transactions from the report
        const newTransactions: Transaction[] = Object.entries(data).flatMap(([id, amountStr]) => {
            const amount = parseInt(amountStr);
            if (!amountStr || isNaN(amount) || amount === 0) return [];

            let item: { name: string; } | undefined;
            // FIX: Corrected the type of sectionType from a string literal to the TransactionType enum to match the Transaction interface.
            let sectionType: TransactionType = TransactionType.EXPENSE;
            
            for (const section of Object.keys(monthlyTarget) as (keyof MonthlyTarget)[]) {
                const foundItem = monthlyTarget[section].find(i => i.id === id);
                if (foundItem) {
                    item = foundItem;
                    if (section === 'pendapatan') sectionType = TransactionType.INCOME;
                    break;
                }
            }
            
            if (!item) return [];

            return [{
                id: `tx-${id}-${Date.now()}`,
                date: now.toISOString(),
                amount: amount,
                description: item.name,
                category: item.name,
                type: sectionType
            }];
        });

        setTransactions(prev => [...prev, ...newTransactions]);
        setIsAddingActuals(false);
    };

    const handleSaveGoal = (goal: SavingsGoal) => {
        setSavingsGoals(prev => {
            const index = prev.findIndex(g => g.id === goal.id);
            if (index > -1) {
                const newGoals = [...prev];
                newGoals[index] = goal;
                return newGoals;
            }
            return [...prev, { ...goal, id: `goal-${Date.now()}` }];
        });
        setEditingGoal(null);
    };

    const handleDeleteGoal = (id: string) => {
        setSavingsGoals(prev => prev.filter(g => g.id !== id));
        setView(View.SAVINGS_GOALS);
    };
    
    const handleSaveDebt = (debt: DebtItem) => {
        setDebts(prev => {
            const index = prev.findIndex(d => d.id === debt.id);
            if (index > -1) {
                const newDebts = [...prev];
                newDebts[index] = debt;
                return newDebts;
            }
            return [...prev, { ...debt, id: `debt-${Date.now()}` }];
        });
        setEditingDebt(null);
    };

    const handleDeleteDebt = (id: string) => {
        setDebts(prev => prev.filter(d => d.id !== id));
        setView(View.DEBT_MANAGEMENT);
    };

    const renderView = () => {
        switch (activeView) {
            case View.DASHBOARD:
                return <Dashboard 
                    displayDate={displayDate}
                    handlePrevMonth={handlePrevMonth}
                    handleNextMonth={handleNextMonth}
                    archivedTargets={archivedTargets}
                    archivedActuals={archivedActuals}
                    transactions={transactions} // For Gemini insight
                />;
            case View.TRANSACTIONS:
                return <Transactions transactions={transactions} />;
            case View.MANAGEMENT:
                return <Management setView={setView} />;
            case View.PROFILE:
                return <Profile />;
            case View.SAVINGS_GOALS:
                return <SavingsGoals goals={savingsGoals} setView={setView} onAdd={() => setEditingGoal({} as SavingsGoal)} />;
            case View.SAVINGS_GOAL_DETAIL:
                if (!selectedItem || !('targetAmount' in selectedItem)) return null;
                return <SavingsGoalDetail goal={selectedItem as SavingsGoal} setView={setView} onEdit={setEditingGoal} onDelete={handleDeleteGoal}/>;
            case View.DEBT_MANAGEMENT:
                return <DebtManagement debts={debts} setView={setView} onAdd={() => setEditingDebt({} as DebtItem)} />;
            case View.DEBT_DETAIL:
                 if (!selectedItem || !('totalAmount' in selectedItem)) return null;
                return <DebtDetail debt={selectedItem as DebtItem} setView={setView} onEdit={setEditingDebt} onDelete={handleDeleteDebt}/>;
            case View.TARGET_HISTORY:
                 return <TargetHistory archives={archivedTargets} setView={setView} />;
            case View.ACTUALS_HISTORY:
                return <ActualsHistory archives={archivedActuals} setView={setView} />;
            default:
                return <Dashboard 
                    displayDate={new Date()}
                    handlePrevMonth={() => {}}
                    handleNextMonth={() => {}}
                    archivedTargets={[]}
                    archivedActuals={[]}
                    transactions={[]} 
                />;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen font-sans">
            <main className="pb-24">
                {renderView()}
            </main>
            
            {isChoosingAdd && <AddChoice 
                onClose={() => setIsChoosingAdd(false)}
                onSelectActual={() => { setIsChoosingAdd(false); setIsAddingActuals(true); }}
                onSelectTarget={() => { setIsChoosingAdd(false); setIsAddingTarget(true); }}
            />}
            {isAddingActuals && <AddTransaction 
                onClose={() => setIsAddingActuals(false)}
                onSave={handleSaveActuals}
                monthlyTarget={monthlyTarget}
            />}
            {isAddingTarget && <AddTargetForm 
                onClose={() => setIsAddingTarget(false)}
                onSave={handleSaveTarget}
            />}
            
            {editingGoal && <AddEditSavingsGoalModal 
                goal={editingGoal.id ? editingGoal : null}
                onClose={() => setEditingGoal(null)}
                onSave={handleSaveGoal}
            />}
            {editingDebt && <AddEditDebtModal 
                debt={editingDebt.id ? editingDebt : null}
                onClose={() => setEditingDebt(null)}
                onSave={handleSaveDebt}
            />}

            <BottomNav activeView={activeView} setView={setView} />
        </div>
    );
};

export default App;