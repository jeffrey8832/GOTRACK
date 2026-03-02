import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Category, Budget, User } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

interface AppContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  categories: Category[];
  addCategory: (c: Omit<Category, 'id'>) => void;
  
  budgets: Budget[];
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('et_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('et_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('et_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('et_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) localStorage.setItem('et_user', JSON.stringify(user));
    else localStorage.removeItem('et_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('et_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('et_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('et_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const login = (email: string, name: string) => {
    setUser({ id: crypto.randomUUID(), email, name, baseCurrency: 'USD' });
  };

  const logout = () => {
    setUser(null);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...t, id: crypto.randomUUID() }]);
  };

  const updateTransaction = (t: Transaction) => {
    setTransactions(prev => prev.map(tr => tr.id === t.id ? t : tr));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tr => tr.id !== id));
  };

  const addCategory = (c: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...c, id: `cat-custom-${crypto.randomUUID()}` }]);
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    setBudgets(prev => [...prev, { ...b, id: crypto.randomUUID() }]);
  };

  const updateBudget = (b: Budget) => {
    setBudgets(prev => prev.map(bg => bg.id === b.id ? b : bg));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(bg => bg.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      categories, addCategory,
      budgets, addBudget, updateBudget, deleteBudget
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
