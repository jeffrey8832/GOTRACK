export type TransactionType = 'expense' | 'income';

export type Category = {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
};

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Bank Transfer' | 'E-Wallet' | string;

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string YYYY-MM-DD
  categoryId: string;
  paymentMethod: PaymentMethod;
  description: string;
  currency: string;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
};

export type Budget = {
  id: string;
  categoryId: string; // 'all' for total budget, or specific category id
  amount: number;
  period: 'monthly';
};

export type User = {
  id: string;
  email: string;
  name: string;
  baseCurrency: string;
};
