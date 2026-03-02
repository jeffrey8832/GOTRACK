import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings as SettingsIcon, Plus, Trash2, Tag } from 'lucide-react';
import { cn } from '../lib/utils';
import { TransactionType } from '../types';

export default function Settings() {
  const { categories, addCategory } = useAppContext();
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType>('expense');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor
    });
    
    setNewCatName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Categories */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-zinc-900">Custom Categories</h3>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4 mb-8 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <h4 className="text-sm font-medium text-zinc-700 mb-2">Add New Category</h4>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewCatType('expense')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all border",
                  newCatType === 'expense' ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-zinc-500 border-zinc-200"
                )}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setNewCatType('income')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all border",
                  newCatType === 'income' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-zinc-500 border-zinc-200"
                )}
              >
                Income
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name"
                className="flex-1 px-3 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow bg-white"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">Expense Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c.type === 'expense').map(cat => (
                  <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-zinc-700 font-medium">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">Income Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c.type === 'income').map(cat => (
                  <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-zinc-700 font-medium">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
