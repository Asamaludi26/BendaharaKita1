import React from 'react';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
}

export interface FinancialInsight {
  title: string;
  description: string;
  icon: string;
}

export interface CashFlowData {
  month: string;
  income: number;
  expense: number;
}

export type DebtCategory = 'Konsumtif' | 'Produktif';

export interface DebtItem {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  category: DebtCategory;
}

export type SavingsGoalCategory = 'Jangka Pendek' | 'Jangka Panjang' | 'Dana Darurat';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  category: SavingsGoalCategory;
  icon: string;
}

export interface SummaryCardData {
  title: string;
  amount: number;
  previousAmount: number;
  target?: number;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  type: 'income' | 'expense' | 'balance' | 'savings';
}

export enum View {
  DASHBOARD,
  TRANSACTIONS,
  REPORT,
  MANAGEMENT,
  PROFILE,
  SAVINGS_GOALS,
  SAVINGS_GOAL_DETAIL,
  DEBT_MANAGEMENT,
  DEBT_DETAIL,
  TARGET_HISTORY,
  ACTUALS_HISTORY,
}

export interface TargetFormField {
  id: string;
  name: string;
  amount: string;
}

export type AddTargetFormData = {
  pendapatan: TargetFormField[];
  cicilanUtang: TargetFormField[];
  pengeluaranUtama: TargetFormField[];
  kebutuhan: TargetFormField[];
  penunjang: TargetFormField[];
  tabungan: TargetFormField[];
};

export type MonthlyTarget = AddTargetFormData;

export interface ArchivedMonthlyTarget {
  monthYear: string; // "YYYY-MM"
  target: MonthlyTarget;
}

export interface ArchivedActualReport {
  monthYear: string; // "YYYY-MM"
  actuals: { [key: string]: string };
  target: MonthlyTarget;
}