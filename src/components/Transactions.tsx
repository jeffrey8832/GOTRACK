import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Filter, Trash2, Edit2, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import TransactionModal from './TransactionModal';
import { Transaction } from '../types';

export default function Transactions() {
  const { transactions, categories, deleteTransaction } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        
        const cat = categories.find(c => c.id === t.categoryId);
        const searchLower = searchTerm.toLowerCase();
        
        return (
          (cat?.name.toLowerCase().includes(searchLower)) ||
          (t.description.toLowerCase().includes(searchLower)) ||
          (t.amount.toString().includes(searchLower))
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, searchTerm, categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        return [
          t.date,
          t.type,
          `"${cat?.name || ''}"`,
          `"${t.description || ''}"`,
          t.amount,
          `"${t.paymentMethod}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Transactions</h1>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow bg-white"
            />
          </div>
          
          <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                filterType === 'all' ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                filterType === 'expense' ? "bg-red-50 text-red-700" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Expense
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                filterType === 'income' ? "bg-emerald-50 text-emerald-700" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Income
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 py-2 px-3 rounded-xl font-medium hover:bg-zinc-50 transition-colors shadow-sm text-sm"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
              <Search className="w-8 h-8 text-zinc-300" />
            </div>
            <p className="text-lg font-medium text-zinc-900">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredTransactions.map(t => {
              const cat = categories.find(c => c.id === t.categoryId);
              const isExpense = t.type === 'expense';
              
              return (
                <div key={t.id} className="p-4 sm:px-6 hover:bg-zinc-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm flex-shrink-0"
                      style={{ backgroundColor: cat?.color || '#9ca3af' }}
                    >
                      {cat?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 truncate">{cat?.name}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[150px] sm:max-w-[300px]">{t.description || 'No description'}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-600 font-medium">
                          {t.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pl-4">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "font-bold text-lg flex items-center gap-1",
                        isExpense ? "text-zinc-900" : "text-emerald-600"
                      )}>
                        {isExpense ? <ArrowDownRight className="w-4 h-4 text-red-500" /> : <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(undefined);
          }}
          transactionToEdit={editingTransaction}
        />
      )}
    </div>
  );
}

