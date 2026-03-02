import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { transactions, categories } = useAppContext();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const { income, expense, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    currentMonthTransactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return { income: inc, expense: exp, balance: inc - exp };
  }, [currentMonthTransactions]);

  const categoryData = useMemo(() => {
    const data: Record<string, { name: string, value: number, color: string }> = {};
    currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      if (!cat) return;
      if (data[cat.id]) {
        data[cat.id].value += t.amount;
      } else {
        data[cat.id] = { name: cat.name, value: t.amount, color: cat.color };
      }
    });
    return Object.values(data).sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions, categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
        <div className="text-sm font-medium text-zinc-500 bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">Current Balance</h3>
            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900">{formatCurrency(balance)}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">Total Income</h3>
            <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900">{formatCurrency(income)}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">Total Expense</h3>
            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900">{formatCurrency(expense)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-500">
              No expenses recorded this month.
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">Recent Transactions</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map(t => {
                  const cat = categories.find(c => c.id === t.categoryId);
                  const isExpense = t.type === 'expense';
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm"
                          style={{ backgroundColor: cat?.color || '#9ca3af' }}
                        >
                          {cat?.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{cat?.name}</p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                            <span>{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
                            {t.description && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[150px]">{t.description}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "font-semibold",
                        isExpense ? "text-zinc-900" : "text-emerald-600"
                      )}>
                        {isExpense ? '-' : '+'}{formatCurrency(t.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                No transactions yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
