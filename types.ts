export enum View {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  REPORTS_DASHBOARD = 'REPORTS_DASHBOARD',
  WALLET = 'WALLET', // Renamed from ACCOUNTS for better user understanding
  ACCOUNT_DETAIL = 'ACCOUNT_DETAIL',
  ADD_TARGET = 'ADD_TARGET',
  ADD_ACTUAL = 'ADD_ACTUAL',
  TARGET_HISTORY = 'TARGET_HISTORY',
  ACTUALS_HISTORY = 'ACTUALS_HISTORY',
  MANAGEMENT = 'MANAGEMENT', // For goals
  PROFILE = 'PROFILE',
  DEBT_DETAIL = 'DEBT_DETAIL',
  SAVINGS_GOAL_DETAIL = 'SAVINGS_GOAL_DETAIL',
  ADD_DEBT = 'ADD_DEBT',
  ADD_SAVINGS_GOAL = 'ADD_SAVINGS_GOAL',
  DEBT_HISTORY = 'DEBT_HISTORY',
  SAVINGS_GOAL_HISTORY = 'SAVINGS_GOAL_HISTORY',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface UserCategory {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string; // Link transaction to an account
}

export interface Account {
  id: string;
  name: string;
  type: 'Bank' | 'E-Wallet';
  balance: number;
}

export interface FinancialInsight {
  title: string;
  description: string;
  icon: string;
}

export interface SummaryCardData {
  title: string;
  amount: number;
  previousAmount: number;
  target?: number;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: 'income' | 'expense' | 'balance' | 'savings';
  type: 'income' | 'expense' | 'balance' | 'savings';
}

export interface TargetFormField {
  id: string;
  name: string;
  amount: string;
}

export interface MonthlyTarget {
  pendapatan: TargetFormField[];
  cicilanUtang: TargetFormField[];
  pengeluaranUtama: TargetFormField[];
  kebutuhan: TargetFormField[];
  penunjang: TargetFormField[];
  pendidikan: TargetFormField[];
  tabungan: TargetFormField[];
}

export type AddTargetFormData = MonthlyTarget;

export interface ArchivedMonthlyTarget {
  monthYear: string; // "YYYY-MM"
  target: MonthlyTarget;
}

export interface ArchivedActualReport {
  monthYear: string; // "YYYY-MM"
  target: MonthlyTarget;
  actuals: { [key: string]: string }; // key is TargetFormField id
}

export interface DebtItem {
  id: string;
  name: string;
  source: string;
  totalAmount: number;
  monthlyInstallment: number;
  tenor: number; // in months
  dueDate: number; // Day of the month
  payments: { date: string; amount: number }[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  source: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date string
  contributions: { date: string; amount: number }[];
}