import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { View, Transaction, DebtItem, SavingsGoal, ArchivedMonthlyTarget, ArchivedActualReport, MonthlyTarget, UserCategory, Account, TransactionType } from './types';
import { mockTransactions, mockDebts, mockSavingsGoals, mockArchivedActuals, mockArchivedTargets, mockUserCategories, mockAccounts } from './data/cleanMockData';

import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Management from './components/Management';
import Profile from './components/Profile';
import DebtDetail from './components/goals/DebtDetail';
import SavingsGoalDetail from './components/goals/SavingsGoalDetail';
import AddTargetForm from './components/AddTargetForm';
import ActualsReportView from './components/AddTransaction';
import TargetHistory from './components/history/TargetHistory';
import ActualsHistory from './components/history/ActualsHistory';
import DebtHistory from './components/history/DebtHistory';
import SavingsGoalHistory from './components/history/SavingsGoalHistory';
import OnboardingWizard from './components/goals/OnboardingWizard';
import AddDebtForm from './components/AddDebtForm';
import AddSavingsGoalForm from './components/AddSavingsGoalForm';
import Toast from './components/Toast';
import Modal from './components/Modal';
import ReportsDashboard from './components/reports/ReportsDashboard';
import TransactionFormModal from './components/modals/TransactionFormModal';
import CategoryManagerModal from './components/modals/CategoryManagerModal';
import Accounts from './components/accounts/Accounts';
import AccountDetail from './components/accounts/AccountDetail';
import AccountFormModal from './components/modals/AccountFormModal';
import TransferModal from './components/modals/TransferModal';
import WelcomeTourModal from './components/modals/WelcomeTourModal';
import FormGuideModal from './components/modals/FormGuideModal';
import WalletOnboardingWizard from './components/accounts/WalletOnboardingWizard';
import TransactionDetailModal from './components/modals/TransactionDetailModal';
import TopUpModal from './components/modals/TopUpModal';

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
      // FIX: Added curly braces to the catch block to fix a critical syntax error.
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.DASHBOARD);
    const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [activeModal, setActiveModal] = useState<null | 'ADD_DEBT' | 'ADD_SAVINGS_GOAL' | 'ADD_ACCOUNT' | 'EDIT_ACCOUNT' | 'TRANSFER' | 'TOP_UP'>(null);
    
    // New states for enhanced features
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('app_theme', 'dark');
    const [editingTransaction, setEditingTransaction] = useState<Transaction | 'new' | null>(null);
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    // Data states
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions_data', mockTransactions);
    const [debts, setDebts] = useLocalStorage<DebtItem[]>('debts_data', mockDebts);
    const [savingsGoals, setSavingsGoals] = useLocalStorage<SavingsGoal[]>('savingsGoals_data', mockSavingsGoals);
    const [archivedTargets, setArchivedTargets] = useLocalStorage<ArchivedMonthlyTarget[]>('archivedTargets_data', mockArchivedTargets);
    const [archivedActuals, setArchivedActuals] = useLocalStorage<ArchivedActualReport[]>('archivedActuals_data', mockArchivedActuals);
    const [userCategories, setUserCategories] = useLocalStorage<UserCategory[]>('user_categories_data', mockUserCategories);
    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts_data', mockAccounts);
    
    // Onboarding states
    const [goalsOnboardingComplete, setGoalsOnboardingComplete] = useLocalStorage<boolean>('goalsOnboardingComplete_status', false);
    const [hasSkippedGoalsOnboarding, setHasSkippedGoalsOnboarding] = useState(false);
    const [walletOnboardingComplete, setWalletOnboardingComplete] = useLocalStorage<boolean>('walletOnboardingComplete_status', false);
    const [hasSkippedWalletOnboarding, setHasSkippedWalletOnboarding] = useState(false);

    const [isFirstVisit, setIsFirstVisit] = useLocalStorage<boolean>('is_first_visit', true);
    const [isTourModalOpen, setIsTourModalOpen] = useState(isFirstVisit);
    const [isFormGuideModalOpen, setIsFormGuideModalOpen] = useState(false);


    const [displayDate, setDisplayDate] = useState(new Date());

    // --- THEME ---
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // --- APP RESET ---
    const handleResetApp = () => {
        window.localStorage.clear();
        window.location.reload();
        setToast({ message: 'Aplikasi berhasil direset!', type: 'success' });
    }
    
    // --- GUIDES & TOURS ---
    const handleCloseWelcomeTour = () => {
        if (isFirstVisit) {
            setIsFirstVisit(false);
        }
        setIsTourModalOpen(false);
    };

    const handleOpenWelcomeTour = () => {
        setIsTourModalOpen(true);
    };
    
    const handleOpenFormGuide = () => {
        setIsFormGuideModalOpen(true);
    };

    // --- CORE HANDLERS ---
    const handlePrevMonth = () => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    
    const currentMonthYear = useMemo(() => {
        return `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;
    }, [displayDate]);

    const currentMonthlyTarget = useMemo(() => {
        let targetForMonth = archivedTargets.find(t => t.monthYear === currentMonthYear);
        if (!targetForMonth && archivedTargets.length > 0) {
            const lastTargetArchive = [...archivedTargets].sort((a, b) => b.monthYear.localeCompare(a.monthYear))[0];
            return lastTargetArchive.target;
        }
        return targetForMonth ? targetForMonth.target : null;
    }, [currentMonthYear, archivedTargets]);

    const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc.name])), [accounts]);

    // --- TRANSACTION & ACCOUNT BALANCE CRUD ---
    const handleSaveTransaction = (transaction: Transaction) => {
        const isNew = !transactions.some(t => t.id === transaction.id);
        const originalTransaction = isNew ? null : transactions.find(t => t.id === transaction.id);
    
        setAccounts(prevAccounts => {
            return prevAccounts.map(acc => {
                let newBalance = acc.balance;
    
                if (originalTransaction) {
                    if (originalTransaction.accountId === acc.id) {
                        newBalance += originalTransaction.type === TransactionType.INCOME ? -originalTransaction.amount : originalTransaction.amount;
                    }
                }
    
                if (transaction.accountId === acc.id) {
                    newBalance += transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount;
                }
    
                return { ...acc, balance: newBalance };
            });
        });
    
        if (isNew) {
            setTransactions(prev => [transaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setToast({ message: 'Transaksi berhasil ditambahkan!', type: 'success' });
        } else {
            setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
            setToast({ message: 'Transaksi berhasil diperbarui!', type: 'success' });
        }
        setEditingTransaction(null);
        setActiveModal(null); // Close top up modal as well
    };
    
    const handleDeleteTransaction = (transactionId: string) => {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) return;
    
        setAccounts(prevAccounts => {
            return prevAccounts.map(acc => {
                if (acc.id === transactionToDelete.accountId) {
                    const newBalance = acc.balance + (transactionToDelete.type === TransactionType.INCOME ? -transactionToDelete.amount : transactionToDelete.amount);
                    return { ...acc, balance: newBalance };
                }
                return acc;
            });
        });
    
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        setToast({ message: 'Transaksi berhasil dihapus!', type: 'error' });
        setEditingTransaction(null);
    };

    // --- ACCOUNT & WALLET MANAGEMENT ---
    const handleSaveAccount = (account: Account) => {
        const isNew = !accounts.some(a => a.id === account.id);
        if (isNew) {
            if (account.balance > 0) {
                const initialBalanceTransaction: Transaction = {
                    id: uuidv4(),
                    date: new Date().toISOString(),
                    description: `Saldo Awal ${account.name}`,
                    amount: account.balance,
                    type: TransactionType.INCOME,
                    category: 'Saldo Awal',
                    accountId: account.id,
                };
                setTransactions(prev => [initialBalanceTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
            setAccounts(prev => [...prev, account]);
            setToast({ message: 'Akun baru berhasil ditambahkan!', type: 'success' });
        } else {
            setAccounts(prev => prev.map(a => a.id === account.id ? account : a));
            setToast({ message: 'Akun berhasil diperbarui!', type: 'success' });
        }
        setActiveModal(null);
        setEditingAccount(null);
    };

    const handleDeleteAccount = (accountId: string) => {
        const hasTransactions = transactions.some(t => t.accountId === accountId);
        if (hasTransactions) {
            setToast({ message: 'Tidak dapat menghapus akun yang memiliki transaksi.', type: 'error'});
            return;
        }
        setAccounts(prev => prev.filter(a => a.id !== accountId));
        setToast({ message: 'Akun berhasil dihapus!', type: 'error' });
    };

    const handleTransfer = (fromAccountId: string, toAccountId: string, amount: number) => {
        const transferOut: Transaction = {
            id: uuidv4(), date: new Date().toISOString(), description: `Transfer ke ${accounts.find(a => a.id === toAccountId)?.name}`,
            amount, type: TransactionType.EXPENSE, category: 'Transfer Dana', accountId: fromAccountId,
        };
        const transferIn: Transaction = {
            id: uuidv4(), date: new Date().toISOString(), description: `Transfer dari ${accounts.find(a => a.id === fromAccountId)?.name}`,
            amount, type: TransactionType.INCOME, category: 'Transfer Dana', accountId: toAccountId,
        };

        setAccounts(prev => prev.map(acc => {
            if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
            if (acc.id === toAccountId) return { ...acc, balance: acc.balance + amount };
            return acc;
        }));
        setTransactions(prev => [transferIn, transferOut, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setToast({ message: 'Transfer dana berhasil!', type: 'success' });
        setActiveModal(null);
    };

    const handleOpenTopUpModal = () => {
        setActiveModal('TOP_UP');
    };

    const handleWalletOnboardingComplete = (newAccountsData: { name: string, type: 'Bank' | 'E-Wallet', balance: number }[]) => {
        const newAccounts: Account[] = newAccountsData.map(accData => ({
            id: uuidv4(),
            ...accData
        }));

        const initialBalanceTransactions: Transaction[] = newAccounts
            .filter(acc => acc.balance > 0)
            .map(acc => ({
                id: uuidv4(),
                date: new Date().toISOString(),
                description: `Saldo Awal ${acc.name}`,
                amount: acc.balance,
                type: TransactionType.INCOME,
                category: 'Saldo Awal',
                accountId: acc.id,
            }));
        
        setAccounts(newAccounts);
        setTransactions(initialBalanceTransactions);
        setWalletOnboardingComplete(true);
        setHasSkippedWalletOnboarding(false);
        setToast({ message: 'Pengaturan dompet berhasil!', type: 'success' });
    };
    
    const handleSkipWalletOnboarding = () => setHasSkippedWalletOnboarding(true);

    const resetWalletData = () => {
        setAccounts([]);
        setTransactions([]);
        setWalletOnboardingComplete(false);
        setHasSkippedWalletOnboarding(false);
        setView(View.WALLET);
        setToast({ message: 'Data dompet & transaksi telah direset.', type: 'success' });
    };

    // --- CATEGORY CRUD ---
    const handleSaveCategory = (category: UserCategory) => {
        const isNew = !userCategories.some(c => c.id === category.id);
        if(isNew) { setUserCategories(prev => [...prev, category]); setToast({ message: 'Kategori baru ditambahkan!', type: 'success' });
        } else { setUserCategories(prev => prev.map(c => c.id === category.id ? category : c)); setToast({ message: 'Kategori diperbarui!', type: 'success' }); }
    };
    
    const handleDeleteCategory = (categoryId: string) => {
        setUserCategories(prev => prev.filter(c => c.id !== categoryId));
        setToast({ message: 'Kategori dihapus!', type: 'error' });
    };


    // --- MONTHLY PLANNING HANDLERS ---
    const handleSaveTarget = (data: MonthlyTarget) => {
        setArchivedTargets(prev => {
            const existing = prev.find(p => p.monthYear === currentMonthYear);
            if (existing) { return prev.map(p => p.monthYear === currentMonthYear ? { ...p, target: data } : p); }
            return [...prev, { monthYear: currentMonthYear, target: data }];
        });
        setView(View.DASHBOARD);
        setToast({ message: 'Target berhasil disimpan!', type: 'success' });
    };
    
    // --- GOALS ONBOARDING & CRUD ---
    const handleGoalsOnboardingComplete = (data: { debts: DebtItem[], savingsGoals: SavingsGoal[] }) => {
        setDebts(data.debts); setSavingsGoals(data.savingsGoals); setGoalsOnboardingComplete(true); setHasSkippedGoalsOnboarding(false);
        setActiveModal(null); setToast({ message: 'Pengaturan awal berhasil!', type: 'success' });
    };

    const handleAddDebt = (debtData: Omit<DebtItem, 'id'>) => {
        const newDebt: DebtItem = { ...debtData, id: `debt-${Date.now()}` };
        setDebts(prev => [...prev, newDebt]); setActiveModal(null); setToast({ message: 'Pinjaman baru berhasil ditambahkan!', type: 'success' });
    };

    const handleAddSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
        const newGoal: SavingsGoal = { ...goalData, id: `sg-${Date.now()}` };
        setSavingsGoals(prev => [...prev, newGoal]); setActiveModal(null); setToast({ message: 'Tujuan baru berhasil ditambahkan!', type: 'success' });
    };

    const handleAddPayment = (debtId: string, amount: number, accountId: string) => {
        const debt = debts.find(d => d.id === debtId);
        if (!debt || !accountId) {
            setToast({ message: 'Gagal mencatat pembayaran: Akun tidak valid.', type: 'error' });
            return;
        };
    
        const newTransaction: Transaction = {
            id: uuidv4(),
            date: new Date().toISOString(),
            description: `Bayar Utang: ${debt.name}`,
            amount: amount,
            type: TransactionType.EXPENSE,
            category: 'Utang',
            accountId: accountId,
        };
    
        setAccounts(prevAccounts => prevAccounts.map(acc => 
            acc.id === accountId ? { ...acc, balance: acc.balance - amount } : acc
        ));
        
        setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        setDebts(prev => prev.map(d => d.id === debtId ? { ...d, payments: [...d.payments, { date: new Date().toISOString(), amount }] } : d));
    
        setToast({ message: 'Pembayaran berhasil dicatat & transaksi dibuat!', type: 'success' });
    };
    
    const handleAddContribution = (goalId: string, amount: number, accountId: string) => {
        const goal = savingsGoals.find(g => g.id === goalId);
        if (!goal || !accountId) {
            setToast({ message: 'Gagal menambah dana: Akun tidak valid.', type: 'error' });
            return;
        }
    
        const newTransaction: Transaction = {
            id: uuidv4(),
            date: new Date().toISOString(),
            description: `Tabungan: ${goal.name}`,
            amount: amount,
            type: TransactionType.EXPENSE,
            category: 'Tabungan',
            accountId: accountId,
        };
    
        setAccounts(prevAccounts => prevAccounts.map(acc => 
            acc.id === accountId ? { ...acc, balance: acc.balance - amount } : acc
        ));
    
        setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
        setSavingsGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount, contributions: [...g.contributions, { date: new Date().toISOString(), amount }] } : g));
        
        setToast({ message: 'Dana berhasil ditambah & transaksi dibuat!', type: 'success' });
    };

    const handleSkipGoalsOnboarding = () => { setHasSkippedGoalsOnboarding(true); };

    const resetGoals = () => {
        setDebts([]); setSavingsGoals([]); setGoalsOnboardingComplete(false); setHasSkippedGoalsOnboarding(false);
        setView(View.MANAGEMENT); setToast({ message: 'Data tujuan telah direset.', type: 'success' });
    }
    
    const activeDebts = useMemo(() => debts.filter(d => (d.totalAmount - d.payments.reduce((sum, p) => sum + p.amount, 0)) > 0), [debts]);
    const paidDebts = useMemo(() => debts.filter(d => (d.totalAmount - d.payments.reduce((sum, p) => sum + p.amount, 0)) <= 0), [debts]);
    const activeSavingsGoals = useMemo(() => savingsGoals.filter(g => g.currentAmount < g.targetAmount), [savingsGoals]);
    const completedSavingsGoals = useMemo(() => savingsGoals.filter(g => g.currentAmount >= g.targetAmount), [savingsGoals]);
    const totalAllTimeSavings = useMemo(() => savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0), [savingsGoals]);
    const totalAllTimeDebt = useMemo(() => debts.reduce((sum, d) => sum + d.totalAmount, 0), [debts]);
    const showGoalsOnboardingWizard = view === View.MANAGEMENT && !goalsOnboardingComplete && !hasSkippedGoalsOnboarding;
    const showWalletOnboardingWizard = view === View.WALLET && !walletOnboardingComplete && !hasSkippedWalletOnboarding;
    
    const allModalsClosed = !activeModal && !showGoalsOnboardingWizard && !editingTransaction && !isCategoryModalOpen && !editingAccount && !isTourModalOpen && !isFormGuideModalOpen && !showWalletOnboardingWizard && !viewingTransaction;

    const isTargetSet = !!currentMonthlyTarget;

    const renderView = () => {
        const pageContentClass = `transition-all duration-500 ${!allModalsClosed ? 'blur-md scale-95' : ''}`;
        
        let pageComponent: React.ReactNode;

        switch (view) {
            case View.DASHBOARD:
                pageComponent = <Dashboard 
                    displayDate={displayDate} 
                    handlePrevMonth={handlePrevMonth} 
                    handleNextMonth={handleNextMonth} 
                    archivedTargets={archivedTargets}
                    archivedActuals={archivedActuals}
                    transactions={transactions}
                    setView={setView} 
                    isTargetSet={isTargetSet} 
                    accounts={accounts} 
                />;
                break;
            case View.TRANSACTIONS:
                pageComponent = <Transactions transactions={transactions} userCategories={userCategories} onAdd={() => setEditingTransaction('new')} onSelect={(tx) => setViewingTransaction(tx)} accounts={accounts} />;
                break;
             case View.REPORTS_DASHBOARD:
                pageComponent = <ReportsDashboard transactions={transactions} userCategories={userCategories} />;
                break;
             case View.WALLET:
                pageComponent = <Accounts 
                    accounts={accounts} 
                    onAddAccount={() => setActiveModal('ADD_ACCOUNT')} 
                    onEditAccount={(acc) => { setEditingAccount(acc); setActiveModal('EDIT_ACCOUNT'); }} 
                    onDeleteAccount={handleDeleteAccount} 
                    onTransfer={() => setActiveModal('TRANSFER')} 
                    onReset={resetWalletData}
                    onSelectAccount={(accountId) => {
                        setActiveDetailId(accountId);
                        setView(View.ACCOUNT_DETAIL);
                    }}
                    onInitiateTopUp={handleOpenTopUpModal}
                />;
                break;
            case View.ACCOUNT_DETAIL:
                const account = accounts.find(a => a.id === activeDetailId);
                const accountTransactions = transactions.filter(t => t.accountId === activeDetailId);
                pageComponent = account ? <AccountDetail account={account} transactions={accountTransactions} setView={setView} /> : <div>Akun tidak ditemukan</div>;
                break;
            case View.ADD_TARGET:
                pageComponent = <AddTargetForm setView={setView} onSave={handleSaveTarget} initialData={currentMonthlyTarget} archivedTargets={archivedTargets} currentMonthYear={currentMonthYear} activeDebts={activeDebts} activeSavingsGoals={activeSavingsGoals} onAddDebt={() => setActiveModal('ADD_DEBT')} onAddSavingsGoal={() => setActiveModal('ADD_SAVINGS_GOAL')} />;
                break;
            case View.ADD_ACTUAL:
                pageComponent = <ActualsReportView setView={setView} monthlyTarget={currentMonthlyTarget} transactions={transactions} debts={debts} savingsGoals={savingsGoals} displayDate={displayDate} />;
                break;
            case View.TARGET_HISTORY:
                pageComponent = <TargetHistory archives={archivedTargets} setView={setView} />;
                break;
            case View.ACTUALS_HISTORY:
                pageComponent = <ActualsHistory archives={archivedActuals} setView={setView} />;
                break;
            case View.MANAGEMENT:
                pageComponent = <Management setView={setView} debts={activeDebts} savingsGoals={activeSavingsGoals} onSelectDebt={(id) => { setActiveDetailId(id); setView(View.DEBT_DETAIL); }} onSelectSavingsGoal={(id) => { setActiveDetailId(id); setView(View.SAVINGS_GOAL_DETAIL); }} onAddDebt={() => setActiveModal('ADD_DEBT')} onAddSavingsGoal={() => setActiveModal('ADD_SAVINGS_GOAL')} onViewHistory={() => setView(View.DEBT_HISTORY)} onViewSavingsHistory={() => setView(View.SAVINGS_GOAL_HISTORY)} totalAllTimeSavings={totalAllTimeSavings} totalAllTimeDebt={totalAllTimeDebt} onResetGoals={resetGoals} />;
                break;
            case View.DEBT_DETAIL:
                const debt = debts.find(d => d.id === activeDetailId);
                pageComponent = debt ? <DebtDetail debt={debt} setView={setView} onAddPayment={handleAddPayment} accounts={accounts} /> : <div>Debt not found</div>;
                break;
            case View.SAVINGS_GOAL_DETAIL:
                const goal = savingsGoals.find(g => g.id === activeDetailId);
                pageComponent = goal ? <SavingsGoalDetail goal={goal} setView={setView} onAddContribution={handleAddContribution} accounts={accounts} /> : <div>Goal not found</div>;
                break;
            case View.DEBT_HISTORY:
                pageComponent = <DebtHistory paidDebts={paidDebts} setView={setView} onSelectDebt={(id) => { setActiveDetailId(id); setView(View.DEBT_DETAIL); }} />;
                break;
            case View.SAVINGS_GOAL_HISTORY:
                pageComponent = <SavingsGoalHistory completedGoals={completedSavingsGoals} setView={setView} onSelectSavingsGoal={(id) => { setActiveDetailId(id); setView(View.SAVINGS_GOAL_DETAIL); }} />;
                break;
            case View.PROFILE:
                pageComponent = <Profile theme={theme} onToggleTheme={handleToggleTheme} onManageCategories={() => setIsCategoryModalOpen(true)} onResetApp={handleResetApp} onOpenTour={handleOpenWelcomeTour} onOpenFormGuide={handleOpenFormGuide} />;
                break;
            default:
                pageComponent = <Dashboard 
                    displayDate={displayDate} 
                    handlePrevMonth={handlePrevMonth} 
                    handleNextMonth={handleNextMonth} 
                    archivedTargets={archivedTargets}
                    archivedActuals={archivedActuals}
                    transactions={transactions}
                    setView={setView} 
                    isTargetSet={isTargetSet} 
                    accounts={accounts} 
                />;
        }
        
        return <div className={`pb-32 ${pageContentClass}`}>{pageComponent}</div>;
    };

    return (
        <div className="bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans min-h-screen">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <main>
                {renderView()}
            </main>

            <BottomNav activeView={view} setView={setView} />

            <Modal isOpen={!!viewingTransaction} onClose={() => setViewingTransaction(null)}>
               {viewingTransaction && (
                   <TransactionDetailModal
                       transaction={viewingTransaction}
                       accountName={accountMap.get(viewingTransaction.accountId) || 'N/A'}
                       onClose={() => setViewingTransaction(null)}
                   />
               )}
           </Modal>
            
            <Modal isOpen={isTourModalOpen} onClose={handleCloseWelcomeTour}>
                <WelcomeTourModal onClose={handleCloseWelcomeTour} isFirstTime={isFirstVisit} />
            </Modal>
            
            <Modal isOpen={isFormGuideModalOpen} onClose={() => setIsFormGuideModalOpen(false)}>
                <FormGuideModal onClose={() => setIsFormGuideModalOpen(false)} />
            </Modal>

            <Modal isOpen={showGoalsOnboardingWizard} onClose={handleSkipGoalsOnboarding}>
                <OnboardingWizard onComplete={handleGoalsOnboardingComplete} onSkip={handleSkipGoalsOnboarding} />
            </Modal>
            
            <Modal isOpen={showWalletOnboardingWizard} onClose={handleSkipWalletOnboarding}>
                <WalletOnboardingWizard onComplete={handleWalletOnboardingComplete} onSkip={handleSkipWalletOnboarding} />
            </Modal>

            <Modal isOpen={activeModal === 'ADD_DEBT'} onClose={() => setActiveModal(null)}>
                <AddDebtForm onSave={handleAddDebt} onClose={() => setActiveModal(null)} />
            </Modal>

            <Modal isOpen={activeModal === 'ADD_SAVINGS_GOAL'} onClose={() => setActiveModal(null)}>
                <AddSavingsGoalForm onSave={handleAddSavingsGoal} onClose={() => setActiveModal(null)} />
            </Modal>

            <Modal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)}>
                <TransactionFormModal
                    transactionToEdit={editingTransaction === 'new' ? null : editingTransaction}
                    onSave={handleSaveTransaction}
                    onDelete={handleDeleteTransaction}
                    onClose={() => setEditingTransaction(null)}
                    userCategories={userCategories}
                    accounts={accounts}
                />
            </Modal>
            
            <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)}>
                <CategoryManagerModal
                    categories={userCategories}
                    onSave={handleSaveCategory}
                    onDelete={handleDeleteCategory}
                    onClose={() => setIsCategoryModalOpen(false)}
                />
            </Modal>

            <Modal isOpen={activeModal === 'ADD_ACCOUNT' || activeModal === 'EDIT_ACCOUNT'} onClose={() => { setActiveModal(null); setEditingAccount(null); }}>
                <AccountFormModal
                    accountToEdit={editingAccount}
                    onSave={handleSaveAccount}
                    onClose={() => { setActiveModal(null); setEditingAccount(null); }}
                />
            </Modal>

            <Modal isOpen={activeModal === 'TRANSFER'} onClose={() => setActiveModal(null)}>
                <TransferModal
                    accounts={accounts}
                    onTransfer={handleTransfer}
                    onClose={() => setActiveModal(null)}
                />
            </Modal>

            <Modal isOpen={activeModal === 'TOP_UP'} onClose={() => setActiveModal(null)}>
                <TopUpModal
                    accounts={accounts}
                    onSave={handleSaveTransaction}
                    onClose={() => setActiveModal(null)}
                    userCategories={userCategories}
                />
            </Modal>
        </div>
    );
};

export default App;