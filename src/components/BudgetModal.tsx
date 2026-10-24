import React, { useState } from 'react';
import { Target, X, Check, TrendingUp } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSaveBudget: (newBudget: number) => void;
  thisMonthSpent: number;
}

export default function BudgetModal({
  isOpen,
  onClose,
  currentBudget,
  onSaveBudget,
  thisMonthSpent
}: BudgetModalProps) {
  const [budgetVal, setBudgetVal] = useState(currentBudget || 15000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (budgetVal <= 0) return;
    onSaveBudget(budgetVal);
    onClose();
  };

  const presetValues = [8000, 10000, 12000, 15000, 20000, 25000];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Monthly Budget Settings (मासिक बजट)
              </h3>
              <p className="text-[11px] text-emerald-200">
                Set monthly spending allowance
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Monthly Budget Target (₹ मासिक बजट लक्ष्य)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={budgetVal}
                onChange={e => setBudgetVal(Number(e.target.value) || 0)}
                placeholder="15000"
                required
                className="w-full pl-8 pr-3 py-2 text-sm sm:text-base font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetValues.map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setBudgetVal(amt)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    budgetVal === amt
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Spending Snapshot */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Month Spent:</span>
              <span className="font-bold text-slate-900">₹{thisMonthSpent.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining Buffer:</span>
              <span className={`font-bold ${budgetVal >= thisMonthSpent ? 'text-emerald-600' : 'text-rose-600'}`}>
                ₹{Math.max(0, budgetVal - thisMonthSpent).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md active:scale-95"
            >
              Save Budget Limit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
