import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, DollarSign, Calendar, Tag, FileText, CreditCard, Camera, Loader2 } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from '@google/genai';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction;
}

export default function TransactionModal({ isOpen, onClose, transactionToEdit }: TransactionModalProps) {
  const { addTransaction, updateTransaction, categories } = useAppContext();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setDate(transactionToEdit.date);
      setCategoryId(transactionToEdit.categoryId);
      setDescription(transactionToEdit.description);
      setPaymentMethod(transactionToEdit.paymentMethod);
    } else {
      // Set default category based on type
      const defaultCat = categories.find(c => c.type === type);
      if (defaultCat) setCategoryId(defaultCat.id);
    }
  }, [transactionToEdit, type, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    const transactionData = {
      type,
      amount: Number(amount),
      date,
      categoryId,
      description,
      paymentMethod,
      currency: 'USD'
    };

    if (transactionToEdit) {
      updateTransaction({ ...transactionData, id: transactionToEdit.id });
    } else {
      addTransaction(transactionData);
    }
    onClose();
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64String = base64Data.split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64String
                }
              },
              {
                text: 'Extract the total amount, date, and a short description (store name or items) from this receipt. Return as JSON.'
              }
            ]
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER, description: 'The total amount on the receipt' },
                date: { type: Type.STRING, description: 'The date on the receipt in YYYY-MM-DD format' },
                description: { type: Type.STRING, description: 'Store name or brief description' }
              },
              required: ['amount', 'date', 'description']
            }
          }
        });

        if (response.text) {
          const data = JSON.parse(response.text);
          if (data.amount) setAmount(data.amount.toString());
          if (data.date) setDate(data.date);
          if (data.description) setDescription(data.description);
          setType('expense');
        }
        setIsScanning(false);
      };
    } catch (error) {
      console.error('Error scanning receipt:', error);
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-900">
            {transactionToEdit ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                type === 'expense' ? "bg-white text-red-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Income
            </button>
          </div>

          {/* Amount and Scanner */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-zinc-700">Amount</label>
              {!transactionToEdit && (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleScanReceipt}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                  >
                    {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                    {isScanning ? 'Scanning...' : 'Scan Receipt'}
                  </button>
                </>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium transition-shadow"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-4 w-4 text-zinc-400" />
                </div>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow appearance-none bg-white"
                >
                  <option value="" disabled>Select category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Payment Method</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-4 w-4 text-zinc-400" />
              </div>
              <select
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow appearance-none bg-white"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                placeholder="What was this for?"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-zinc-200 rounded-xl shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
