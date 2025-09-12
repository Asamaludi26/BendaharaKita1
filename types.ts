import React from 'react';

// FIX: Replaced the incorrect component code with actual type definitions to resolve module resolution errors across the project.
export enum View {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  MANAGEMENT = 'MANAGEMENT',
  PROFILE = 'PROFILE',
  DEBT_DETAIL = 'DEBT_DETAIL',
  SAVINGS_GOAL_DETAIL = 'SAVINGS_GOAL_DETAIL',
  ADD_TARGET = 'ADD_TARGET',
  ADD_ACTUAL = 'ADD_ACTUAL',
  TARGET_HISTORY = 'TARGET_HISTORY',
  ACTUALS_HISTORY = 'ACTUALS_HISTORY',
  DEBT_HISTORY = 'DEBT_HISTORY',
  SAVINGS_GOAL_HISTORY = 'SAVINGS_GOAL_HISTORY',
  WALLET = 'WALLET',
  ACCOUNT_DETAIL = 'ACCOUNT_DETAIL',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'Bank' | 'E-Wallet';
  balance: number;
}

export interface DebtPayment {
  date: string; // ISO string
  amount: number;
}

export interface DebtItem {
  id: string;
  name: string;
  source: string;
  totalAmount: number;
  monthlyInstallment: number;
  tenor: number; // in months
  dueDate: number; // day of the month
  payments: DebtPayment[];
}

export interface SavingsContribution {
  date: string; // ISO string
  amount: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  source: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO string
  contributions: SavingsContribution[];
  isEmergencyFund?: boolean;
}

export interface TargetFormField {
  id: string;
  name: string;
  amount: string;
}

export interface MonthlyTarget {
  // key is the UserCategory id
  [categoryId: string]: TargetFormField[];
}

export interface ArchivedMonthlyTarget {
  monthYear: string; // "YYYY-MM"
  target: MonthlyTarget;
}

export interface ArchivedActualReport {
  monthYear: string; // "YYYY-MM"
  target: MonthlyTarget;
  actuals: { [key: string]: string }; // key is TargetFormField id
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
  color: 'income' | 'expense' | 'balance' | 'savings' | 'debt';
  type: 'income' | 'expense' | 'balance' | 'savings';
}

export interface UserCategory {
    id: string;
    name: string;
    type: TransactionType;
    isActive: boolean;
}