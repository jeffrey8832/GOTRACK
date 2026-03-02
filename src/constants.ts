import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', color: '#EF4444', type: 'expense' },
  { id: 'cat-transport', name: 'Transportation', color: '#F59E0B', type: 'expense' },
  { id: 'cat-housing', name: 'Housing & Rent', color: '#10B981', type: 'expense' },
  { id: 'cat-utilities', name: 'Utilities', color: '#3B82F6', type: 'expense' },
  { id: 'cat-entertainment', name: 'Entertainment', color: '#8B5CF6', type: 'expense' },
  { id: 'cat-shopping', name: 'Shopping', color: '#EC4899', type: 'expense' },
  { id: 'cat-health', name: 'Health & Fitness', color: '#14B8A6', type: 'expense' },
  { id: 'cat-salary', name: 'Salary', color: '#10B981', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance', color: '#3B82F6', type: 'income' },
  { id: 'cat-investments', name: 'Investments', color: '#8B5CF6', type: 'income' },
  { id: 'cat-other-income', name: 'Other Income', color: '#F59E0B', type: 'income' },
  { id: 'cat-other-expense', name: 'Other Expense', color: '#6B7280', type: 'expense' },
];

export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Bank Transfer', 'E-Wallet'];
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD'];
