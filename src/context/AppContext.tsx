import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Category, Budget, User } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

interface AppContextType {
  user: User | null;
  login: (email: string, name: string) => Promise<void>;
  logout: () => void;
  
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  categories: Category[];
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  
  budgets: Budget[];
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (b: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('et_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('et_user', JSON.stringify(user));
      fetchData(user.id);
    } else {
      localStorage.removeItem('et_user');
      setTransactions([]);
      setCategories(DEFAULT_CATEGORIES);
      setBudgets([]);
    }
  }, [user]);

  const fetchData = async (userId: string) => {
    try {
      const res = await fetch('/api/data', {
        headers: { 'user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setCategories([...DEFAULT_CATEGORIES, ...data.categories]);
        setBudgets(data.budgets);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const login = async (email: string, name: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    const newTx = { ...t, id: crypto.randomUUID() };
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-id': user.id },
        body: JSON.stringify(newTx)
      });
      if (res.ok) {
        setTransactions(prev => [...prev, newTx]);
      }
    } catch (error) {
      console.error('Failed to add transaction', error);
    }
  };

  const updateTransaction = async (t: Transaction) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/transactions/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'user-id': user.id },
        body: JSON.stringify(t)
      });
      if (res.ok) {
        setTransactions(prev => prev.map(tr => tr.id === t.id ? t : tr));
      }
    } catch (error) {
      console.error('Failed to update transaction', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'user-id': user.id }
      });
      if (res.ok) {
        setTransactions(prev => prev.filter(tr => tr.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  const addCategory = async (c: Omit<Category, 'id'>) => {
    if (!user) return;
    const newCat = { ...c, id: `cat-custom-${crypto.randomUUID()}` };
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-id': user.id },
        body: JSON.stringify(newCat)
      });
      if (res.ok) {
        setCategories(prev => [...prev, newCat]);
      }
    } catch (error) {
      console.error('Failed to add category', error);
    }
  };

  const addBudget = async (b: Omit<Budget, 'id'>) => {
    if (!user) return;
    const newBudget = { ...b, id: crypto.randomUUID() };
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'user-id': user.id },
        body: JSON.stringify(newBudget)
      });
      if (res.ok) {
        setBudgets(prev => [...prev, newBudget]);
      }
    } catch (error) {
      console.error('Failed to add budget', error);
    }
  };

  const updateBudget = async (b: Budget) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/budgets/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'user-id': user.id },
        body: JSON.stringify(b)
      });
      if (res.ok) {
        setBudgets(prev => prev.map(bg => bg.id === b.id ? b : bg));
      }
    } catch (error) {
      console.error('Failed to update budget', error);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
        headers: { 'user-id': user.id }
      });
      if (res.ok) {
        setBudgets(prev => prev.filter(bg => bg.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete budget', error);
    }
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
