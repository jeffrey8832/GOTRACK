import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Target, Plus, Trash2, Edit2, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Budget } from '../types';

export default function Budgets() {
  const { budgets, transactions, categories, addBudget, updateBudget, deleteBudget } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);
  
  const [categoryId, setCategoryId] = useState('all');
  const [amount, setAmount] = useState('');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthExpenses = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const budgetProgress = useMemo(() => {
    return budgets.map(budget => {
      let spent = 0;
      if (budget.categoryId === 'all') {
        spent = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
      } else {
        spent = currentMonthExpenses
          .filter(t => t.categoryId === budget.categoryId)
          .reduce((sum, t) => sum + t.amount, 0);
      }
      
      const percentage = Math.min((spent / budget.amount) * 100, 100);
      const isOverBudget = spent > budget.amount;
      const remaining = budget.amount - spent;
      
      return {
        ...budget,
        spent,
        percentage,
        isOverBudget,
        remaining
      };
    });
  }, [budgets, currentMonthExpenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleOpenModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setCategoryId(budget.categoryId);
      setAmount(budget.amount.toString());
    } else {
      setEditingBudget(undefined);
      setCategoryId('all');
      setAmount('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    if (editingBudget) {
      updateBudget({ ...editingBudget, categoryId, amount: Number(amount) });
    } else {
      addBudget({ categoryId, amount: Number(amount), period: 'monthly' });
    }
    setIsModalOpen(false);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Budgets</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          New Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetProgress.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-zinc-200 shadow-sm text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
              <Target className="w-8 h-8 text-zinc-300" />
            </div>
            <p className="text-lg font-medium text-zinc-900">No budgets set</p>
            <p className="text-sm text-zinc-500 mt-1">Create a budget to track your spending limits.</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-6 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              Create your first budget
            </button>
          </div>
        ) : (
          budgetProgress.map(bp => {
            const cat = bp.categoryId === 'all' ? { name: 'Total Spending', color: '#6366f1' } : categories.find(c => c.id === bp.categoryId);
            
            return (
              <div key={bp.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative group">
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(bp)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBudget(bp.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm"
                    style={{ backgroundColor: cat?.color || '#9ca3af' }}
                  >
                    {bp.categoryId === 'all' ? <Target className="w-5 h-5" /> : cat?.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{cat?.name}</h3>
                    <p className="text-xs text-zinc-500">Monthly Budget</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-zinc-700">{formatCurrency(bp.spent)}</span>
                    <span className="text-zinc-500">of {formatCurrency(bp.amount)}</span>
                  </div>
                  
                  <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        bp.isOverBudget ? "bg-red-500" : bp.percentage > 85 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${bp.percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs pt-1">
                    <span className={cn(
                      "font-medium flex items-center gap-1",
                      bp.isOverBudget ? "text-red-600" : "text-zinc-500"
                    )}>
                      {bp.isOverBudget && <AlertCircle className="w-3 h-3" />}
                      {bp.isOverBudget ? 'Over budget' : `${bp.percentage.toFixed(0)}% used`}
                    </span>
                    <span className={cn(
                      "font-medium",
                      bp.isOverBudget ? "text-red-600" : "text-emerald-600"
                    )}>
                      {bp.isOverBudget ? `-${formatCurrency(Math.abs(bp.remaining))}` : `${formatCurrency(bp.remaining)} left`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="text-lg font-semibold text-zinc-900">
                {editingBudget ? 'Edit Budget' : 'New Budget'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow bg-white"
                >
                  <option value="all">Overall Total Spending</option>
                  <optgroup label="Specific Categories">
                    {expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Monthly Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-zinc-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-7 pr-3 py-2.5 flex-1 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-zinc-200 rounded-xl shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
