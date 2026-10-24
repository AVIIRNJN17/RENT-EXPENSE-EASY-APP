import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Building2,
  Zap,
  Wallet,
  ShoppingCart,
  Download,
  Calendar,
  Plus,
  FileText,
  Printer,
  Copy,
  Trash2,
  Check,
  Hourglass,
  Sparkles,
  X,
  Share2,
  Database,
  ArrowDownToLine,
  Smartphone,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { AppState, RentRecord, DailyExpense, RationItem, ElectricityLog } from './types';
import { defaultState } from './defaultData';
import PrinterExportHubModal from './components/PrinterExportHubModal';
import FloatingCatGift from './components/FloatingCatGift';
import BudgetModal from './components/BudgetModal';

const LOCAL_STORAGE_KEY = 'avhii_database_app_v1';

// Custom rich tooltip for recharts 6-month trend visualization
const ExpenseTrendTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl text-xs border border-slate-700 space-y-1.5 min-w-[190px]">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 gap-3">
          <span className="font-bold text-slate-100">{d.monthName}</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-medium">
            {d.count} items
          </span>
        </div>
        <div className="text-emerald-400 font-black text-sm">
          Total: ₹{d.total.toLocaleString('en-IN')}
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span> Food: ₹{d.Food.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span> Veggies: ₹{d.Vegetables.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span> Travel: ₹{d.Transport.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span> House: ₹{d.Household.toLocaleString('en-IN')}
          </div>
          {d.Other > 0 && (
            <div className="flex items-center gap-1 col-span-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span> Other: ₹{d.Other.toLocaleString('en-IN')}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Keyword recognition helper to auto-detect category from item title
export function detectCategoryFromTitle(title: string): DailyExpense['category'] | null {
  const t = title.toLowerCase().trim();
  if (!t) return null;

  // Split into individual clean words
  const words = t.split(/[\s,+/&.\-_]+/);

  const containsWordOrPhrase = (keywords: string[]) => {
    return keywords.some(k => {
      if (k.includes(' ')) return t.includes(k);
      return words.some(w => w === k || w.startsWith(k));
    });
  };

  // 1. Vegetables & Fruits keywords
  const vegKeywords = [
    'sabzi', 'sabji', 'vegetable', 'veggie', 'veggies', 'aloo', 'potato', 'potatoes',
    'pyaaz', 'onion', 'onions', 'tamatar', 'tomato', 'tomatoes', 'bhindi', 'okra',
    'gobhi', 'cauliflower', 'cabbage', 'matar', 'peas', 'palak', 'spinach', 'mirchi',
    'chilli', 'lahsun', 'garlic', 'adrak', 'ginger', 'fruit', 'fruits', 'apple',
    'banana', 'kela', 'seb', 'orange', 'anar', 'lemon', 'nimbu', 'dhaniya',
    'coriander', 'pudina', 'mandi', 'mango', 'mangoes', 'gajar', 'carrot', 'radish', 'mooli'
  ];

  // 2. Transport & Travel keywords
  const transportKeywords = [
    'auto', 'rickshaw', 'rikshaw', 'cab', 'taxi', 'ola', 'uber', 'rapido', 'bus',
    'metro', 'train', 'ticket', 'fare', 'bhada', 'petrol', 'diesel', 'fuel', 'cng',
    'parking', 'toll', 'travel', 'commute', 'flight', 'scooter', 'bike', 'car', 'ride'
  ];

  // 3. Household & Home Utilities keywords
  const householdKeywords = [
    'broom', 'jhadu', 'pocha', 'mop', 'detergent', 'surf', 'soap', 'sabun', 'shampoo',
    'bucket', 'bulb', 'led', 'tube', 'fan', 'repair', 'plumber', 'electrician',
    'cylinder', 'gas', 'lpg', 'tanker', 'water tanker', 'phenyl', 'harpic', 'vim',
    'dishwash', 'utensil', 'utensils', 'bedsheet', 'towel', 'curtain', 'cord', 'wire',
    'clean', 'cleaner', 'room rent', 'fixture', 'battery', 'switch'
  ];

  // 4. Food, Dairy & Snacks keywords
  const foodKeywords = [
    'milk', 'dudh', 'doodh', 'chai', 'tea', 'coffee', 'snack', 'snacks', 'nashta',
    'samosa', 'bread', 'butter', 'egg', 'eggs', 'anda', 'andey', 'paneer', 'dahi',
    'curd', 'biscuit', 'biscuits', 'cookie', 'cookies', 'maggi', 'noodle', 'noodles',
    'biryani', 'chicken', 'mutton', 'fish', 'lunch', 'dinner', 'breakfast', 'roti',
    'paratha', 'sweet', 'sweets', 'mithai', 'cake', 'pizza', 'burger', 'ice cream',
    'juice', 'drink', 'pepsi', 'coke', 'chocolate', 'hotel', 'restaurant', 'swiggy',
    'zomato', 'treat', 'mess', 'dosa', 'idli', 'kachori', 'pakoda', 'dal', 'chawal',
    'rice', 'flour', 'aata', 'oil', 'sugar', 'cheeni', 'namkeen', 'chips', 'pasta'
  ];

  if (containsWordOrPhrase(vegKeywords)) return 'Vegetables';
  if (containsWordOrPhrase(transportKeywords)) return 'Transport';
  if (containsWordOrPhrase(householdKeywords)) return 'Household';
  if (containsWordOrPhrase(foodKeywords)) return 'Food';

  return null;
}

export default function App() {
  // Load initial state from LocalStorage or fall back to defaultState
  const [data, setData] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.rentRecords)) {
          // If stored state has only initial 4 items, merge with rich 6-month historical expenses
          if (parsed.dailyExpenses && parsed.dailyExpenses.length <= 4) {
            return {
              ...parsed,
              dailyExpenses: defaultState.dailyExpenses
            };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
    return defaultState;
  });

  // Trend chart display mode: 'area' (gradient curve) vs 'bar' (category stacked)
  const [trendChartType, setTrendChartType] = useState<'area' | 'bar'>('area');

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'rent' | 'electricity' | 'daily' | 'ration'>('rent');

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Modals state
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isRationModalOpen, setIsRationModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPrinterHubOpen, setIsPrinterHubOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Selected receipt index
  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState<number>(0);

  // Electricity meter inputs
  const [meterPrev, setMeterPrev] = useState<number>(1420);
  const [meterCurr, setMeterCurr] = useState<number>(1535);
  const [meterRate, setMeterRate] = useState<number>(8);
  const [meterFixed, setMeterFixed] = useState<number>(0);

  // Calculate live electricity units and total
  const calculatedUnits = useMemo(() => Math.max(0, meterCurr - meterPrev), [meterCurr, meterPrev]);
  const calculatedBill = useMemo(() => (calculatedUnits * meterRate) + meterFixed, [calculatedUnits, meterRate, meterFixed]);

  // Rent Form State
  const [rentForm, setRentForm] = useState<{
    id?: string;
    monthYear: string;
    ownerName: string;
    ownerPhone: string;
    tenantName: string;
    roomNo: string;
    baseRent: number;
    electricityAmount: number;
    otherCharges: number;
    status: 'Paid' | 'Pending' | 'Partial';
    paymentMode: string;
    txnId: string;
  }>({
    monthYear: new Date().toISOString().slice(0, 7),
    ownerName: 'Ramesh Kumar Sharma',
    ownerPhone: '9876543210',
    tenantName: 'Rahul Verma',
    roomNo: 'Flat 202, Gokul Heights',
    baseRent: 6500,
    electricityAmount: 920,
    otherCharges: 200,
    status: 'Paid',
    paymentMode: 'UPI (GooglePay / PhonePe)',
    txnId: ''
  });

  // Daily Expense Filters & Form
  const [expenseFilterCategory, setExpenseFilterCategory] = useState<string>('All');
  const [expenseSearch, setExpenseSearch] = useState<string>('');
  const [expenseForm, setExpenseForm] = useState<{
    title: string;
    amount: string;
    date: string;
    category: DailyExpense['category'];
    mode: DailyExpense['mode'];
  }>({
    title: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Food',
    mode: 'UPI'
  });

  // Category auto-detection from Item/Description keywords
  const autoDetectedExpenseCategory = useMemo(() => {
    return detectCategoryFromTitle(expenseForm.title);
  }, [expenseForm.title]);

  const handleExpenseTitleChange = (val: string) => {
    const detected = detectCategoryFromTitle(val);
    setExpenseForm(prev => ({
      ...prev,
      title: val,
      category: detected || prev.category
    }));
  };

  // Ration Form
  const [rationForm, setRationForm] = useState<{
    name: string;
    quantity: string;
    price: string;
    category: string;
    status: 'bought' | 'pending';
  }>({
    name: '',
    quantity: '',
    price: '',
    category: 'Grains & Flours',
    status: 'pending'
  });

  // Calculated Stats
  const latestRent = data.rentRecords[0] || null;

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayExpenseTotal = useMemo(() => {
    return data.dailyExpenses
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [data.dailyExpenses, todayStr]);

  const allExpensesTotal = useMemo(() => {
    return data.dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [data.dailyExpenses]);

  // Current Month Expenses & Monthly Budget Calculations
  const currentMonthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const thisMonthExpensesTotal = useMemo(() => {
    return data.dailyExpenses
      .filter(e => e.date.startsWith(currentMonthKey))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [data.dailyExpenses, currentMonthKey]);

  const monthlyBudget = data.monthlyBudget || 15000;
  const budgetSpentPercent = Math.min(100, Math.round((thisMonthExpensesTotal / monthlyBudget) * 100));
  const budgetRemaining = Math.max(0, monthlyBudget - thisMonthExpensesTotal);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  const dailySafeAllowance = Math.round(budgetRemaining / daysRemaining);

  const handleSaveBudget = (newBudget: number) => {
    setData(prev => ({
      ...prev,
      monthlyBudget: newBudget
    }));
    showToast(`Monthly budget updated to ₹${newBudget.toLocaleString('en-IN')}!`);
  };

  const filteredExpenses = useMemo(() => {
    return data.dailyExpenses.filter(e => {
      const matchCat = expenseFilterCategory === 'All' || e.category === expenseFilterCategory;
      const matchSearch = !expenseSearch || e.title.toLowerCase().includes(expenseSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [data.dailyExpenses, expenseFilterCategory, expenseSearch]);

  const filteredExpenseTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const rationSummary = useMemo(() => {
    let est = 0;
    let bought = 0;
    let pending = 0;
    let pendingCount = 0;

    data.rationItems.forEach(item => {
      est += item.price;
      if (item.status === 'bought') {
        bought += item.price;
      } else {
        pending += item.price;
        pendingCount += 1;
      }
    });

    return { est, bought, pending, pendingCount };
  }, [data.rationItems]);

  // 6-Month Monthly Expense Trend Data calculation for recharts
  const monthlyTrendData = useMemo(() => {
    const months: {
      key: string;
      label: string;
      monthName: string;
      total: number;
      Food: number;
      Vegetables: number;
      Transport: number;
      Household: number;
      Other: number;
      count: number;
    }[] = [];

    const now = new Date();
    // Build 6 months ending at current month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      const monthName = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      months.push({
        key,
        label,
        monthName,
        total: 0,
        Food: 0,
        Vegetables: 0,
        Transport: 0,
        Household: 0,
        Other: 0,
        count: 0
      });
    }

    // Aggregate daily expenses into the corresponding month bucket
    data.dailyExpenses.forEach(exp => {
      const expMonth = exp.date.slice(0, 7);
      const target = months.find(m => m.key === expMonth);
      if (target) {
        target.total += exp.amount;
        target.count += 1;
        if (exp.category === 'Food') target.Food += exp.amount;
        else if (exp.category === 'Vegetables') target.Vegetables += exp.amount;
        else if (exp.category === 'Transport') target.Transport += exp.amount;
        else if (exp.category === 'Household') target.Household += exp.amount;
        else target.Other += exp.amount;
      }
    });

    return months;
  }, [data.dailyExpenses]);

  // Key performance indicators for 6-month spending
  const trendStats = useMemo(() => {
    const total6Months = monthlyTrendData.reduce((acc, m) => acc + m.total, 0);
    const avgMonthly = Math.round(total6Months / (monthlyTrendData.length || 1));
    const highestMonth = monthlyTrendData.reduce(
      (max, m) => (m.total > max.total ? m : max),
      monthlyTrendData[0] || { monthName: '-', total: 0 }
    );
    const currentMonth = monthlyTrendData[monthlyTrendData.length - 1];
    const prevMonth = monthlyTrendData[monthlyTrendData.length - 2];
    let monthChangePercent = 0;
    if (prevMonth && prevMonth.total > 0 && currentMonth) {
      monthChangePercent = Math.round(((currentMonth.total - prevMonth.total) / prevMonth.total) * 100);
    }

    return {
      total6Months,
      avgMonthly,
      highestMonth,
      currentMonth,
      monthChangePercent
    };
  }, [monthlyTrendData]);

  // Current Date display string
  const currentDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // ----------------------------------------------------
  // ACTION HANDLERS: RENT
  // ----------------------------------------------------
  const handleOpenRentModal = (record?: RentRecord) => {
    if (record) {
      setRentForm({
        id: record.id,
        monthYear: record.monthYear,
        ownerName: record.ownerName,
        ownerPhone: record.ownerPhone,
        tenantName: record.tenantName,
        roomNo: record.roomNo,
        baseRent: record.baseRent,
        electricityAmount: record.electricityAmount,
        otherCharges: record.otherCharges,
        status: record.status,
        paymentMode: record.paymentMode,
        txnId: record.txnId
      });
    } else {
      // Use latest record values as template
      const prev = data.rentRecords[0];
      setRentForm({
        monthYear: new Date().toISOString().slice(0, 7),
        ownerName: prev?.ownerName || 'Ramesh Kumar Sharma',
        ownerPhone: prev?.ownerPhone || '9876543210',
        tenantName: prev?.tenantName || 'Rahul Verma',
        roomNo: prev?.roomNo || 'Flat 202, Gokul Heights',
        baseRent: prev?.baseRent || 6500,
        electricityAmount: calculatedBill > 0 ? calculatedBill : (prev?.electricityAmount || 0),
        otherCharges: prev?.otherCharges || 200,
        status: 'Paid',
        paymentMode: 'UPI (GooglePay / PhonePe)',
        txnId: ''
      });
    }
    setIsRentModalOpen(true);
  };

  const handleSaveRent = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(rentForm.monthYear + '-01');
    const monthLabel = dateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const totalAmount = Number(rentForm.baseRent) + Number(rentForm.electricityAmount) + Number(rentForm.otherCharges);

    if (rentForm.id) {
      // Update
      setData(prev => ({
        ...prev,
        rentRecords: prev.rentRecords.map(r => r.id === rentForm.id ? {
          ...r,
          monthYear: rentForm.monthYear,
          monthLabel,
          ownerName: rentForm.ownerName.trim(),
          ownerPhone: rentForm.ownerPhone.trim(),
          tenantName: rentForm.tenantName.trim(),
          roomNo: rentForm.roomNo.trim(),
          baseRent: Number(rentForm.baseRent),
          electricityAmount: Number(rentForm.electricityAmount),
          electricityUnits: Number(rentForm.electricityAmount) > 0 ? `Bijli: ₹${rentForm.electricityAmount}` : 'N/A',
          otherCharges: Number(rentForm.otherCharges),
          totalAmount,
          status: rentForm.status,
          paymentMode: rentForm.paymentMode,
          txnId: rentForm.txnId.trim() || `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`
        } : r)
      }));
      showToast(`Rent record for ${monthLabel} updated!`);
    } else {
      // Create
      const newRec: RentRecord = {
        id: 'rent-' + Date.now(),
        monthYear: rentForm.monthYear,
        monthLabel,
        ownerName: rentForm.ownerName.trim(),
        ownerPhone: rentForm.ownerPhone.trim() || '9876543210',
        tenantName: rentForm.tenantName.trim(),
        roomNo: rentForm.roomNo.trim(),
        baseRent: Number(rentForm.baseRent),
        electricityAmount: Number(rentForm.electricityAmount),
        electricityUnits: Number(rentForm.electricityAmount) > 0 ? `Bijli: ₹${rentForm.electricityAmount}` : 'N/A',
        otherCharges: Number(rentForm.otherCharges),
        totalAmount,
        status: rentForm.status,
        paymentMode: rentForm.paymentMode,
        txnId: rentForm.txnId.trim() || `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        date: new Date().toISOString().slice(0, 10)
      };

      setData(prev => ({
        ...prev,
        rentRecords: [newRec, ...prev.rentRecords]
      }));
      showToast(`Rent record for ${monthLabel} created!`);
    }

    setIsRentModalOpen(false);
  };

  const handleDeleteRent = (id: string) => {
    if (confirm('Delete this rent record?')) {
      setData(prev => ({
        ...prev,
        rentRecords: prev.rentRecords.filter(r => r.id !== id)
      }));
      showToast('Rent record deleted', 'info');
    }
  };

  const handleOpenReceipt = (index: number) => {
    setSelectedReceiptIndex(index);
    setIsReceiptModalOpen(true);
  };

  // WhatsApp formatted receipt text generator with explicit electricity bill prominence
  const getReceiptWhatsAppText = (record: RentRecord) => {
    return `🏠 *HOUSE RENT & UTILITY RECEIPT (किराया व बिजली पावती)* 🏠
━━━━━━━━━━━━━━━━━━━━
📅 *Period (महीना):* ${record.monthLabel}
👤 *Tenant (किरायेदार):* ${record.tenantName}
📍 *Room / Flat:* ${record.roomNo}
👤 *Landlord (मालिक):* ${record.ownerName}
━━━━━━━━━━━━━━━━━━━━
💵 *ITEMIZED BILL BREAKDOWN:*
• Base Room Rent (कमरा किराया): ₹${record.baseRent.toLocaleString('en-IN')}
⚡ *ELECTRICITY SUBMETER BILL (बिजली बिल):* ₹${record.electricityAmount.toLocaleString('en-IN')}
   ⤷ Units Breakdown: ${record.electricityUnits || 'Submeter Units Billed'}
• Water & Maintenance (मेंटेनेंस): ₹${record.otherCharges.toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
💰 *GRAND TOTAL PAID (किराया + बिजली बिल): ₹${record.totalAmount.toLocaleString('en-IN')}*
✅ *Payment Status:* ${record.status.toUpperCase()} (दे दिया)
💳 *Payment Mode:* ${record.paymentMode}
🔢 *Txn Ref / UPI ID:* ${record.txnId}
🗓️ *Payment Date:* ${record.date}
━━━━━━━━━━━━━━━━━━━━
_Generated via AVHII DATABASE APP 1.0 🐾_`;
  };

  const handleShareWhatsApp = (record: RentRecord) => {
    const text = getReceiptWhatsAppText(record);
    const phone = record.ownerPhone.replace(/[^0-9]/g, '');
    const url = phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyReceiptText = (record: RentRecord) => {
    const text = getReceiptWhatsAppText(record);
    navigator.clipboard.writeText(text).then(() => {
      showToast('Receipt slip text copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy text', 'warning');
    });
  };

  // ----------------------------------------------------
  // ACTION HANDLERS: ELECTRICITY
  // ----------------------------------------------------
  const handleSaveElectricityReading = () => {
    const newLog: ElectricityLog = {
      id: 'elec-' + Date.now(),
      prevReading: meterPrev,
      currReading: meterCurr,
      rate: meterRate,
      units: calculatedUnits,
      fixed: meterFixed,
      total: calculatedBill,
      date: new Date().toISOString().slice(0, 10)
    };

    setData(prev => ({
      ...prev,
      electricityLogs: [newLog, ...prev.electricityLogs]
    }));
    showToast(`Saved! ${calculatedUnits} Units bill: ₹${calculatedBill}`);
  };

  const handleDeleteElectricityLog = (id: string) => {
    setData(prev => ({
      ...prev,
      electricityLogs: prev.electricityLogs.filter(l => l.id !== id)
    }));
    showToast('Reading log removed', 'info');
  };

  const handleAddElectricityToLatestRent = () => {
    if (data.rentRecords.length === 0) {
      showToast('Please create a rent record first!', 'warning');
      setActiveTab('rent');
      return;
    }

    const latest = { ...data.rentRecords[0] };
    latest.electricityAmount = calculatedBill;
    latest.electricityUnits = `${calculatedUnits} Units (${meterPrev} → ${meterCurr} @ ₹${meterRate}/u)`;
    latest.totalAmount = latest.baseRent + calculatedBill + latest.otherCharges;

    setData(prev => ({
      ...prev,
      rentRecords: [latest, ...prev.rentRecords.slice(1)]
    }));

    showToast(`₹${calculatedBill} Bijli Bill added to ${latest.monthLabel} rent!`);
    setActiveTab('rent');
  };

  // ----------------------------------------------------
  // ACTION HANDLERS: DAILY EXPENSES
  // ----------------------------------------------------
  const handleQuickAddExpense = (title: string, amount: number, category: DailyExpense['category']) => {
    const newExp: DailyExpense = {
      id: 'exp-' + Date.now(),
      title,
      amount,
      date: todayStr,
      category,
      mode: 'UPI'
    };

    setData(prev => ({
      ...prev,
      dailyExpenses: [newExp, ...prev.dailyExpenses]
    }));
    showToast(`Added: ${title} - ₹${amount}`);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(expenseForm.amount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    const newExp: DailyExpense = {
      id: 'exp-' + Date.now(),
      title: expenseForm.title.trim(),
      amount: amt,
      date: expenseForm.date,
      category: expenseForm.category,
      mode: expenseForm.mode
    };

    setData(prev => ({
      ...prev,
      dailyExpenses: [newExp, ...prev.dailyExpenses]
    }));

    setExpenseForm({
      title: '',
      amount: '',
      date: todayStr,
      category: 'Food',
      mode: 'UPI'
    });
    setIsExpenseModalOpen(false);
    showToast(`Expense of ₹${amt} logged!`);
  };

  const handleDeleteExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      dailyExpenses: prev.dailyExpenses.filter(e => e.id !== id)
    }));
    showToast('Expense removed', 'info');
  };

  // ----------------------------------------------------
  // ACTION HANDLERS: RATION
  // ----------------------------------------------------
  const handleToggleRationStatus = (id: string) => {
    setData(prev => ({
      ...prev,
      rationItems: prev.rationItems.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'bought' ? 'pending' : 'bought' }
          : item
      )
    }));
  };

  const handleDeleteRation = (id: string) => {
    setData(prev => ({
      ...prev,
      rationItems: prev.rationItems.filter(item => item.id !== id)
    }));
    showToast('Item removed from ration list', 'info');
  };

  const handleSaveRation = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(rationForm.price) || 0;
    const newItem: RationItem = {
      id: 'rat-' + Date.now(),
      name: rationForm.name.trim(),
      quantity: rationForm.quantity.trim(),
      category: rationForm.category,
      price,
      status: rationForm.status
    };

    setData(prev => ({
      ...prev,
      rationItems: [...prev.rationItems, newItem]
    }));

    setRationForm({
      name: '',
      quantity: '',
      price: '',
      category: 'Grains & Flours',
      status: 'pending'
    });
    setIsRationModalOpen(false);
    showToast(`${newItem.name} added to ration list!`);
  };

  const handleAddStandardRation = () => {
    const presets: Omit<RationItem, 'id'>[] = [
      { name: 'Fortune Soyabean Oil', quantity: '1 Litre', category: 'Oil & Ghee', price: 140, status: 'pending' },
      { name: 'Moong Dal (Yellow)', quantity: '1 kg', category: 'Pulses & Dal', price: 130, status: 'pending' },
      { name: 'Chana / Besan', quantity: '1 kg', category: 'Grains & Flours', price: 90, status: 'pending' },
      { name: 'Sugar / Cheeni', quantity: '2 kg', category: 'Spices & Salt', price: 95, status: 'bought' },
      { name: 'Detergent & Bath Soaps', quantity: '1 Pack', category: 'Cleaning & Soap', price: 180, status: 'pending' }
    ];

    const newItems: RationItem[] = presets.map((p, idx) => ({
      ...p,
      id: 'rat-preset-' + Date.now() + '-' + idx
    }));

    setData(prev => ({
      ...prev,
      rationItems: [...prev.rationItems, ...newItems]
    }));
    showToast('Standard grocery items added!');
  };

  // ----------------------------------------------------
  // BACKUP & RESTORE & EXPORT
  // ----------------------------------------------------
  const handleExportJSON = () => {
    try {
      const exportData = {
        app: 'AVHII DATABASE APP 1.0',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        ...data
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `AVHII_DATABASE_BACKUP_${todayStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Database backup downloaded successfully!');
    } catch (e) {
      showToast('Failed to export data', 'warning');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.rentRecords) && Array.isArray(parsed.dailyExpenses)) {
          setData({
            rentRecords: parsed.rentRecords,
            dailyExpenses: parsed.dailyExpenses,
            rationItems: parsed.rationItems || [],
            electricityLogs: parsed.electricityLogs || [],
            monthlyBudget: parsed.monthlyBudget || 15000
          });
          setIsDownloadModalOpen(false);
          showToast('Database restored successfully from backup!');
        } else {
          showToast('Invalid backup file structure', 'warning');
        }
      } catch (err) {
        showToast('Error reading backup file', 'warning');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    if (confirm('Reset database to demo data? Your current edits will be replaced.')) {
      setData(defaultState);
      showToast('Reset to default demo data');
      setIsDownloadModalOpen(false);
    }
  };

  // Standalone file download
  const handleDownloadAppFile = () => {
    try {
      const pageHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      const blob = new Blob([pageHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AVHII_DATABASE_APP_1.0.html';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
      showToast('Downloading App file...');
    } catch (e) {
      navigator.clipboard.writeText(document.documentElement.outerHTML);
      showToast('App code copied to clipboard instead!');
    }
  };

  const activeReceiptRecord = data.rentRecords[selectedReceiptIndex] || data.rentRecords[0] || null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col pb-24 md:pb-10 selection:bg-indigo-500 selection:text-white">
      {/* ============================================================== */}
      {/* TOP HEADER */}
      {/* ============================================================== */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Cute Pussy Cat Mascot / Icon */}
            <div
              className="relative group cursor-pointer"
              onClick={() => showToast('Meow! Welcome to AVHII DATABASE APP 1.0 🐾', 'info')}
              title="Click me for a Meow!"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-400 to-indigo-500 p-0.5 shadow-lg transform transition-transform active:scale-95 group-hover:scale-105">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
                  {/* SVG Cat Mascot */}
                  <svg viewBox="0 0 100 100" className="w-9 h-9 fill-current" xmlns="http://www.w3.org/2000/svg">
                    {/* Cat Ears */}
                    <polygon points="20,40 30,10 46,32" fill="#FB7185" stroke="#FEF3C7" strokeWidth="2" strokeLinejoin="round" />
                    <polygon points="26,36 32,20 42,32" fill="#F43F5E" />
                    <polygon points="80,40 70,10 54,32" fill="#FB7185" stroke="#FEF3C7" strokeWidth="2" strokeLinejoin="round" />
                    <polygon points="74,36 68,20 58,32" fill="#F43F5E" />
                    {/* Cat Head Base */}
                    <ellipse cx="50" cy="56" rx="36" ry="32" fill="#FEF3C7" stroke="#334155" strokeWidth="2" />
                    {/* Cheeks Blush */}
                    <circle cx="28" cy="62" r="6" fill="#FDA4AF" opacity="0.8" />
                    <circle cx="72" cy="62" r="6" fill="#FDA4AF" opacity="0.8" />
                    {/* Big Anime Eyes */}
                    <ellipse cx="36" cy="50" rx="6" ry="8" fill="#0F172A" />
                    <ellipse cx="64" cy="50" rx="6" ry="8" fill="#0F172A" />
                    <circle cx="34" cy="47" r="2.5" fill="#FFFFFF" />
                    <circle cx="38" cy="53" r="1.2" fill="#FFFFFF" />
                    <circle cx="62" cy="47" r="2.5" fill="#FFFFFF" />
                    <circle cx="66" cy="53" r="1.2" fill="#FFFFFF" />
                    {/* Cute Nose */}
                    <polygon points="50,58 46,54 54,54" fill="#E11D48" />
                    {/* Cat Smile */}
                    <path d="M46,60 Q50,65 50,60 Q50,65 54,60" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                    {/* Whiskers */}
                    <line x1="15" y1="53" x2="27" y2="55" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                    <line x1="14" y1="62" x2="26" y2="61" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                    <line x1="85" y1="53" x2="73" y2="55" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                    <line x1="86" y1="62" x2="74" y2="61" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black border border-slate-900 shadow">
                🐾
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-rose-200 to-indigo-200 bg-clip-text text-transparent uppercase">
                  AVHII DATABASE APP 1.0
                </h1>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black tracking-wider shadow">
                  PRO
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
                रेंट, राशन, बिजली और दैनिक ख़र्चों का डेटाबेस
              </p>
            </div>
          </div>

          {/* Right Header Buttons */}
          <div className="flex items-center space-x-2">
            {/* Bills & Printer Hub Button */}
            <button
              onClick={() => setIsPrinterHubOpen(true)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md transition-all active:scale-95 border border-amber-300/30"
              title="Open Universal Bills & Printer Hub (CSV, Excel, PDF)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bills Hub (प्रिंटर)</span>
              <span className="sm:hidden">Print</span>
            </button>

            {/* Monthly Budget Pill Button */}
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-2.5 py-2 rounded-xl border border-white/15 backdrop-blur transition-all active:scale-95"
              title="Set / Edit Monthly Budget Target"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline text-[11px] text-slate-300">Budget:</span>
              <span className="font-extrabold text-emerald-300 text-xs">
                ₹{monthlyBudget.toLocaleString('en-IN')}
              </span>
            </button>

            {/* Download App & Backup Button */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md transition-all active:scale-95 border border-emerald-300/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>

            <div className="hidden lg:flex items-center space-x-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span className="font-medium text-slate-200">{currentDateString}</span>
            </div>
          </div>
        </div>

        {/* Desktop Nav Bar */}
        <div className="hidden md:block border-t border-white/10 bg-slate-950/40">
          <div className="max-w-6xl mx-auto px-4 flex space-x-2">
            <button
              onClick={() => setActiveTab('rent')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'rent'
                  ? 'border-indigo-400 text-white'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              1. Rent & Receipt (किराया)
            </button>

            <button
              onClick={() => setActiveTab('electricity')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'electricity'
                  ? 'border-amber-400 text-white'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              2. Electricity (बिजली बिल)
            </button>

            <button
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'daily'
                  ? 'border-emerald-400 text-white'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              3. Daily Expenses (दैनिक खर्च)
            </button>

            <button
              onClick={() => setActiveTab('ration')}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'ration'
                  ? 'border-rose-400 text-white'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-rose-400" />
              4. Ration List (राशन सामग्री)
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* QUICK STATS DASHBOARD WIDGETS */}
      {/* ============================================================== */}
      <div className="max-w-6xl mx-auto px-4 pt-4 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Rent Status Card */}
          <div
            onClick={() => setActiveTab('rent')}
            className={`cursor-pointer bg-white p-3.5 rounded-2xl border shadow-sm flex items-center justify-between transition-all hover:border-indigo-400 hover:shadow-md ${
              activeTab === 'rent' ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-slate-200'
            }`}
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">This Month Rent</p>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mt-0.5">
                {latestRent ? `₹${latestRent.totalAmount.toLocaleString('en-IN')}` : '₹0'}
              </h3>
              <span
                className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                  latestRent?.status === 'Paid'
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-amber-700 bg-amber-100'
                }`}
              >
                {latestRent?.status || 'No Record'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Electricity Card */}
          <div
            onClick={() => setActiveTab('electricity')}
            className={`cursor-pointer bg-white p-3.5 rounded-2xl border shadow-sm flex items-center justify-between transition-all hover:border-amber-400 hover:shadow-md ${
              activeTab === 'electricity' ? 'border-amber-400 ring-2 ring-amber-500/10' : 'border-slate-200'
            }`}
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Electricity Bill</p>
              <h3 className="text-base sm:text-lg font-extrabold text-amber-600 mt-0.5">
                ₹{calculatedBill.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">{calculatedUnits} Units consumed</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          {/* Daily Expense Card */}
          <div
            onClick={() => setActiveTab('daily')}
            className={`cursor-pointer bg-white p-3.5 rounded-2xl border shadow-sm flex items-center justify-between transition-all hover:border-emerald-400 hover:shadow-md ${
              activeTab === 'daily' ? 'border-emerald-400 ring-2 ring-emerald-500/10' : 'border-slate-200'
            }`}
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Today's Expense</p>
              <h3 className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
                ₹{todayExpenseTotal.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">All: ₹{allExpensesTotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Ration Budget Card */}
          <div
            onClick={() => setActiveTab('ration')}
            className={`cursor-pointer bg-white p-3.5 rounded-2xl border shadow-sm flex items-center justify-between transition-all hover:border-rose-400 hover:shadow-md ${
              activeTab === 'ration' ? 'border-rose-400 ring-2 ring-rose-500/10' : 'border-slate-200'
            }`}
          >
            <div>
              <p className="text-xs text-slate-500 font-medium">Ration Budget</p>
              <h3 className="text-base sm:text-lg font-extrabold text-rose-600 mt-0.5">
                ₹{rationSummary.est.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">{rationSummary.pendingCount} items pending</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* MONTHLY BUDGET & SPENDING PROGRESS TRACKER */}
        <div className="mt-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    Monthly Budget (मासिक बजट सीमा)
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Spent <b className="text-slate-800">₹{thisMonthExpensesTotal.toLocaleString('en-IN')}</b> of <b className="text-slate-800">₹{monthlyBudget.toLocaleString('en-IN')}</b> daily budget target
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-block font-extrabold text-xs px-2.5 py-1 rounded-full ${
                  budgetSpentPercent < 70
                    ? 'bg-emerald-100 text-emerald-800'
                    : budgetSpentPercent < 90
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {budgetSpentPercent}% Spent ({budgetRemaining > 0 ? `₹${budgetRemaining.toLocaleString('en-IN')} left` : 'Budget Exceeded!'})
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetSpentPercent < 70
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : budgetSpentPercent < 90
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-rose-500 to-red-600'
                }`}
                style={{ width: `${Math.min(100, budgetSpentPercent)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-2.5 md:pt-0 md:pl-4 shrink-0 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Safe Daily Burn Rate</span>
              <span className="font-extrabold text-slate-800 text-sm">
                ₹{dailySafeAllowance.toLocaleString('en-IN')}<span className="text-[10px] text-slate-400 font-normal"> /day ({daysRemaining}d remaining)</span>
              </span>
            </div>
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95 border border-slate-200 shadow-xs"
            >
              Set Budget
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================== */}
      <main className="max-w-6xl mx-auto px-4 py-4 w-full flex-1">
        {/* ========================================================== */}
        {/* TAB 1: RENT & RECEIPT */}
        {/* ========================================================== */}
        {activeTab === 'rent' && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-indigo-600 rounded-full inline-block"></span>
                  1. Rent Management & Owner Receipt (मकान किराया)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Makaan maalik ko rent dene ka hisaab aur official digital receipt WhatsApp par bhejein
                </p>
              </div>
              <button
                onClick={() => handleOpenRentModal()}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Rent Record
              </button>
            </div>

            {/* Latest Highlight Banner Card */}
            {latestRent && (
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden border border-indigo-900/40">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur">
                        {latestRent.monthLabel}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          latestRent.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        }`}
                      >
                        {latestRent.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-indigo-200">Total Payable (Room Rent + Bijli + Maintenance)</p>
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-white">
                        ₹{latestRent.totalAmount.toLocaleString('en-IN')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-200 pt-1">
                      <div>
                        <p className="text-slate-400">Landlord (मालिक):</p>
                        <p className="font-semibold text-white">{latestRent.ownerName}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Base Room Rent:</p>
                        <p className="font-semibold text-white">₹{latestRent.baseRent.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Added Bijli Bill:</p>
                        <p className="font-semibold text-amber-300">
                          ₹{latestRent.electricityAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
                    <button
                      onClick={() => handleOpenReceipt(0)}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95"
                    >
                      <FileText className="w-4 h-4" /> View / Print Receipt Slip
                    </button>
                    <button
                      onClick={() => handleShareWhatsApp(latestRent)}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/40 text-emerald-200 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      <Share2 className="w-4 h-4 text-emerald-400" /> Send to Owner on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Records Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Past Rent Records (पिछला रिकॉर्ड)
                </h3>
                <span className="text-xs text-slate-400 font-medium">{data.rentRecords.length} records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Owner Name</th>
                      <th className="py-3 px-4">Base Rent</th>
                      <th className="py-3 px-4">Electricity</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Receipt & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.rentRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No rent records found. Click "+ New Rent Record" above to start!
                        </td>
                      </tr>
                    ) : (
                      data.rentRecords.map((rec, idx) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">{rec.monthLabel}</td>
                          <td className="py-3 px-4">{rec.ownerName}</td>
                          <td className="py-3 px-4">₹{rec.baseRent.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-amber-600 font-medium">
                            ₹{rec.electricityAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 font-bold text-indigo-700">
                            ₹{rec.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                rec.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : rec.status === 'Partial'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenReceipt(idx)}
                                title="View Digital Receipt"
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" /> Slip
                              </button>
                              <button
                                onClick={() => handleShareWhatsApp(rec)}
                                title="Share to WhatsApp"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                              >
                                <Share2 className="w-3.5 h-3.5" /> Send
                              </button>
                              <button
                                onClick={() => handleOpenRentModal(rec)}
                                title="Edit Record"
                                className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-all text-xs"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRent(rec.id)}
                                title="Delete"
                                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* TAB 2: ELECTRICITY (BIJLI BILL) */}
        {/* ========================================================== */}
        {activeTab === 'electricity' && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-amber-500 rounded-full inline-block"></span>
                  2. Electricity Meter Calculator (बिजली बिल मीटर)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Meter reading dalo, units calculate karo aur sidhe rent me add karo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Calculator Box */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Calculate Current Month Units
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Previous Reading (पिछली मीटर रीडिंग)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={meterPrev}
                        onChange={e => setMeterPrev(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">Units</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Current Reading (वर्तमान मीटर रीडिंग)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={meterCurr}
                        onChange={e => setMeterCurr(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">Units</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Rate Per Unit (₹ प्रति यूनिट)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={meterRate}
                        onChange={e => setMeterRate(Number(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">/unit</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Fixed / Other Charges (यदि कोई हो)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={meterFixed}
                        onChange={e => setMeterFixed(Number(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Result Preview Box */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-amber-800 font-medium">
                      Total Consumed Units:{' '}
                      <span className="font-extrabold text-amber-950 text-sm">{calculatedUnits}</span> Units
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Formula: ({meterCurr} - {meterPrev}) × ₹{meterRate}
                      {meterFixed > 0 ? ` + ₹${meterFixed}` : ''}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-amber-800 font-medium">Total Bijli Bill:</span>
                    <h4 className="text-2xl font-black text-amber-950">₹{calculatedBill.toLocaleString('en-IN')}</h4>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={handleSaveElectricityReading}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" /> Save Reading Log
                  </button>
                  <button
                    onClick={handleAddElectricityToLatestRent}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    <Building2 className="w-4 h-4" /> Add to This Month's Rent
                  </button>
                </div>
              </div>

              {/* Saved Readings History */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" /> Saved Readings
                  </h3>
                  <span className="text-[11px] text-slate-400">{data.electricityLogs.length} logs</span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {data.electricityLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No meter readings saved yet.</p>
                  ) : (
                    data.electricityLogs.map(item => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs hover:border-amber-200 transition-all"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">
                            {item.units} Units{' '}
                            <span className="text-[11px] text-slate-400 font-normal">
                              ({item.prevReading} → {item.currReading})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {item.date} @ ₹{item.rate}/unit
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-700">₹{item.total.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => handleDeleteElectricityLog(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* TAB 3: DAILY EXPENSES */}
        {/* ========================================================== */}
        {activeTab === 'daily' && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
                  3. Daily Expenses Tracker (रोज़ाना ख़र्चे)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chai-nashta, travel, auto, dudh, sabzi aur rozana ke hisaab
                </p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Daily Expense
              </button>
            </div>

            {/* Quick Add Preset Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Quick Add:</span>
              <button
                onClick={() => handleQuickAddExpense('Chai & Snacks', 40, 'Food')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl text-xs text-slate-700 font-medium shrink-0 shadow-sm hover:bg-emerald-50 transition-all active:scale-95"
              >
                ☕ Chai/Snacks (₹40)
              </button>
              <button
                onClick={() => handleQuickAddExpense('Auto / Travel Fare', 50, 'Transport')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl text-xs text-slate-700 font-medium shrink-0 shadow-sm hover:bg-emerald-50 transition-all active:scale-95"
              >
                🛺 Auto / Travel (₹50)
              </button>
              <button
                onClick={() => handleQuickAddExpense('Milk / Dudh', 66, 'Food')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl text-xs text-slate-700 font-medium shrink-0 shadow-sm hover:bg-emerald-50 transition-all active:scale-95"
              >
                🥛 Milk (₹66)
              </button>
              <button
                onClick={() => handleQuickAddExpense('Fresh Vegetables / Sabzi', 120, 'Vegetables')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl text-xs text-slate-700 font-medium shrink-0 shadow-sm hover:bg-emerald-50 transition-all active:scale-95"
              >
                🥦 Sabzi (₹120)
              </button>
              <button
                onClick={() => handleQuickAddExpense('Bread & Eggs / Nashta', 85, 'Food')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl text-xs text-slate-700 font-medium shrink-0 shadow-sm hover:bg-emerald-50 transition-all active:scale-95"
              >
                🥖 Nashta (₹85)
              </button>
            </div>

            {/* 6-Month Monthly Expense Trend Chart (Recharts) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      6-Month Expense Trend (मासिक ख़र्च रुझान)
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Last 6 Months
                      </span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Visual spending patterns, monthly totals & category distributions over the last six months
                    </p>
                  </div>
                </div>

                {/* View toggles: Area vs Category Bar */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setTrendChartType('area')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      trendChartType === 'area'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LineChart className="w-3.5 h-3.5" /> Trend Curve
                  </button>
                  <button
                    onClick={() => setTrendChartType('bar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      trendChartType === 'bar'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Categories
                  </button>
                </div>
              </div>

              {/* Trend Statistics Highlights */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">6-Month Total Spending</span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    ₹{trendStats.total6Months.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">Monthly Average</span>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                    ₹{trendStats.avgMonthly.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">Highest Spending Month</span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5 truncate">
                    {trendStats.highestMonth.monthName}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    ₹{trendStats.highestMonth.total.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">Month-on-Month Pace</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {trendStats.monthChangePercent <= 0 ? (
                      <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 text-sm">
                        <TrendingDown className="w-4 h-4" /> {Math.abs(trendStats.monthChangePercent)}% lower
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 font-bold text-amber-600 text-sm">
                        <TrendingUp className="w-4 h-4" /> +{trendStats.monthChangePercent}% vs last mo
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {trendStats.currentMonth?.label || 'This Mo'}: ₹{(trendStats.currentMonth?.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Chart Visualizer */}
              <div className="w-full pt-1">
                <ResponsiveContainer width="100%" height={260}>
                  {trendChartType === 'area' ? (
                    <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="expenseTrendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip content={<ExpenseTrendTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Expense"
                        stroke="#059669"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#expenseTrendGradient)"
                        dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="label"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip content={<ExpenseTrendTooltip />} />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      />
                      <Bar dataKey="Food" name="Food / Nashta" stackId="exp" fill="#10b981" />
                      <Bar dataKey="Vegetables" name="Vegetables" stackId="exp" fill="#34d399" />
                      <Bar dataKey="Transport" name="Travel / Auto" stackId="exp" fill="#6366f1" />
                      <Bar dataKey="Household" name="Household" stackId="exp" fill="#f59e0b" />
                      <Bar dataKey="Other" name="Other" stackId="exp" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filters & Expense List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-600">Category:</span>
                    <select
                      value={expenseFilterCategory}
                      onChange={e => setExpenseFilterCategory(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    >
                      <option value="All">All Categories</option>
                      <option value="Food">Food & Snacks</option>
                      <option value="Vegetables">Vegetables & Fruits</option>
                      <option value="Transport">Travel / Auto</option>
                      <option value="Household">Household / Ghar</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      value={expenseSearch}
                      onChange={e => setExpenseSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 sm:w-48"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Total Filtered:{' '}
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{filteredExpenseTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Item / Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Payment Mode</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No expenses recorded matching the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">{item.date}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{item.title}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{item.mode}</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteExpense(item.id)}
                              title="Delete"
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* TAB 4: RATION (GROCERY CHECKLIST) */}
        {/* ========================================================== */}
        {activeTab === 'ration' && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-rose-500 rounded-full inline-block"></span>
                  4. Monthly Ration Checklist (राशन सामग्री)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aata, chawal, tel, daal aur baki grocery ka hisaab aur buying status
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddStandardRation}
                  className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" /> + Add Standard Items
                </button>
                <button
                  onClick={() => setIsRationModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>

            {/* Ration Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-sm">
                <span className="text-[11px] text-slate-500 font-medium">Estimated Total</span>
                <h4 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
                  ₹{rationSummary.est.toLocaleString('en-IN')}
                </h4>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-center shadow-sm">
                <span className="text-[11px] text-emerald-700 font-medium">Bought (खरीद लिया)</span>
                <h4 className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
                  ₹{rationSummary.bought.toLocaleString('en-IN')}
                </h4>
              </div>
              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-center shadow-sm">
                <span className="text-[11px] text-rose-700 font-medium">Remaining (बाकी है)</span>
                <h4 className="text-base sm:text-lg font-black text-rose-700 mt-0.5">
                  ₹{rationSummary.pending.toLocaleString('en-IN')}
                </h4>
              </div>
            </div>

            {/* Checklist Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Est. Price (₹)</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.rationItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Ration list is empty. Click "+ Add Standard Items" or "+ Add Item".
                        </td>
                      </tr>
                    ) : (
                      data.rationItems.map(item => {
                        const isBought = item.status === 'bought';
                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleRationStatus(item.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                                  isBought
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                              >
                                {isBought ? <Check className="w-3.5 h-3.5" /> : <Hourglass className="w-3 h-3" />}
                                {isBought ? 'Bought' : 'To Buy'}
                              </button>
                            </td>
                            <td
                              className={`py-3 px-4 font-semibold ${
                                isBought ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {item.name}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-600">{item.quantity}</td>
                            <td className="py-3 px-4 text-slate-500 text-xs">{item.category}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800">
                              ₹{item.price.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteRation(item.id)}
                                title="Delete"
                                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION KEYS */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('rent')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all flex-1 ${
            activeTab === 'rent' ? 'text-indigo-600 bg-indigo-50/80 font-bold' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">1. Rent</span>
        </button>

        <button
          onClick={() => setActiveTab('electricity')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all flex-1 ${
            activeTab === 'electricity' ? 'text-amber-600 bg-amber-50/80 font-bold' : 'text-slate-400'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">2. Bijli</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all flex-1 ${
            activeTab === 'daily' ? 'text-emerald-600 bg-emerald-50/80 font-bold' : 'text-slate-400'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">3. Kharcha</span>
        </button>

        <button
          onClick={() => setActiveTab('ration')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all flex-1 ${
            activeTab === 'ration' ? 'text-rose-600 bg-rose-50/80 font-bold' : 'text-slate-400'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">4. Ration</span>
        </button>

        <button
          onClick={() => setIsPrinterHubOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-amber-600 hover:text-amber-700 transition-all flex-1"
          title="Open Bills & Printer Hub"
        >
          <Printer className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">5. Print</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* MODAL 1: ADD / EDIT RENT RECORD */}
      {/* ============================================================== */}
      {isRentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 my-auto">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5" /> {rentForm.id ? 'Edit Rent Record' : 'Add Rent Record (किराया)'}
              </h3>
              <button
                onClick={() => setIsRentModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRent} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Month & Year (महीना)</label>
                  <input
                    type="month"
                    value={rentForm.monthYear}
                    onChange={e => setRentForm({ ...rentForm, monthYear: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Owner Name (मालिक का नाम)</label>
                  <input
                    type="text"
                    value={rentForm.ownerName}
                    onChange={e => setRentForm({ ...rentForm, ownerName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar Sharma"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tenant Name (किरायेदार)</label>
                  <input
                    type="text"
                    value={rentForm.tenantName}
                    onChange={e => setRentForm({ ...rentForm, tenantName: e.target.value })}
                    placeholder="Rahul Verma"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Room / Flat No. & Address</label>
                  <input
                    type="text"
                    value={rentForm.roomNo}
                    onChange={e => setRentForm({ ...rentForm, roomNo: e.target.value })}
                    placeholder="Flat 202, Gokul Heights"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Base Rent (₹)</label>
                  <input
                    type="number"
                    value={rentForm.baseRent}
                    onChange={e => setRentForm({ ...rentForm, baseRent: Number(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bijli Bill (₹)</label>
                  <input
                    type="number"
                    value={rentForm.electricityAmount}
                    onChange={e => setRentForm({ ...rentForm, electricityAmount: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Other / Maint (₹)</label>
                  <input
                    type="number"
                    value={rentForm.otherCharges}
                    onChange={e => setRentForm({ ...rentForm, otherCharges: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Status</label>
                  <select
                    value={rentForm.status}
                    onChange={e => setRentForm({ ...rentForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
                  >
                    <option value="Paid">Paid (दे दिया)</option>
                    <option value="Pending">Pending (बाक़ी है)</option>
                    <option value="Partial">Partial (आधा दिया)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Mode</label>
                  <select
                    value={rentForm.paymentMode}
                    onChange={e => setRentForm({ ...rentForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
                  >
                    <option value="UPI (GooglePay / PhonePe / Paytm)">UPI (GooglePay / PhonePe / Paytm)</option>
                    <option value="Cash (नकद)">Cash (नकद)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">UPI Txn Ref (Optional)</label>
                  <input
                    type="text"
                    value={rentForm.txnId}
                    onChange={e => setRentForm({ ...rentForm, txnId: e.target.value })}
                    placeholder="UPI-1234567890"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Owner WhatsApp Phone</label>
                  <input
                    type="tel"
                    value={rentForm.ownerPhone}
                    onChange={e => setRentForm({ ...rentForm, ownerPhone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 p-3 rounded-2xl flex items-center justify-between border border-indigo-100">
                <span className="text-xs font-semibold text-indigo-900">Total Payable Amount:</span>
                <span className="text-base font-black text-indigo-700">
                  ₹{(Number(rentForm.baseRent) + Number(rentForm.electricityAmount) + Number(rentForm.otherCharges)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md active:scale-95"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD DAILY EXPENSE */}
      {/* ============================================================== */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Add Daily Expense (दैनिक खर्च)
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    Item / Description (खर्च का नाम)
                  </label>
                  {autoDetectedExpenseCategory && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1 animate-in fade-in">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      Auto-detected: {autoDetectedExpenseCategory}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={expenseForm.title}
                  onChange={e => handleExpenseTitleChange(e.target.value)}
                  placeholder="e.g. Milk, Chai, Auto, Dahi, Sabzi, Petrol"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹ रुपये)</label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="50"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date (तारीख़)</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-600">Category</label>
                    {autoDetectedExpenseCategory && (
                      <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">
                        Auto
                      </span>
                    )}
                  </div>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white transition-all ${
                      autoDetectedExpenseCategory
                        ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <option value="Food">Food / Snacks</option>
                    <option value="Vegetables">Vegetables / Fruits</option>
                    <option value="Transport">Travel / Auto</option>
                    <option value="Household">Household / Misc</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paid Via</label>
                  <select
                    value={expenseForm.mode}
                    onChange={e => setExpenseForm({ ...expenseForm, mode: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md active:scale-95"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ADD RATION ITEM */}
      {/* ============================================================== */}
      {isRationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-rose-600 to-pink-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Add Ration Item (राशन सामान)
              </h3>
              <button
                onClick={() => setIsRationModalOpen(false)}
                className="text-rose-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item Name (सामग्री का नाम)</label>
                <input
                  type="text"
                  value={rationForm.name}
                  onChange={e => setRationForm({ ...rationForm, name: e.target.value })}
                  placeholder="e.g. Aata, Chawal, Mustard Oil, Toor Dal"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity (मात्रा)</label>
                  <input
                    type="text"
                    value={rationForm.quantity}
                    onChange={e => setRationForm({ ...rationForm, quantity: e.target.value })}
                    placeholder="e.g. 5 kg, 2 Litre, 1 Pkt"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Est. Price (₹)</label>
                  <input
                    type="number"
                    value={rationForm.price}
                    onChange={e => setRationForm({ ...rationForm, price: e.target.value })}
                    placeholder="250"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={rationForm.category}
                    onChange={e => setRationForm({ ...rationForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 bg-white"
                  >
                    <option value="Grains & Flours">Grains & Aata</option>
                    <option value="Pulses & Dal">Dals & Pulses</option>
                    <option value="Oil & Ghee">Oil & Ghee</option>
                    <option value="Spices & Salt">Spices & Salt</option>
                    <option value="Cleaning & Soap">Cleaning & Soap</option>
                    <option value="Other">Other Grocery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={rationForm.status}
                    onChange={e => setRationForm({ ...rationForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 bg-white"
                  >
                    <option value="pending">To Buy (ख़रीदना है)</option>
                    <option value="bought">Bought (ख़रीद लिया)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRationModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md active:scale-95"
                >
                  Add to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: OFFICIAL DIGITAL HOUSE RENT RECEIPT SLIP */}
      {/* ============================================================== */}
      {isReceiptModalOpen && activeReceiptRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto border border-slate-100">
            {/* Modal Controls (No Print) */}
            <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                OFFICIAL RENT RECEIPT SLIP
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => handleShareWhatsApp(activeReceiptRecord)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 text-base ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="printableReceiptArea" className="p-6 sm:p-8 bg-white text-slate-800">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">HOUSE RENT RECEIPT</h2>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">किराया भुगतान पावती / Digital Slip</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-400">RECEIPT NO.</p>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    HRR-{activeReceiptRecord.monthYear.replace('-', '')}-{selectedReceiptIndex + 1}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Date: {activeReceiptRecord.date}</p>
                </div>
              </div>

              {/* Parties Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs mb-5">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tenant (किरायेदार):</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{activeReceiptRecord.tenantName}</p>
                  <p className="text-slate-600 mt-0.5">{activeReceiptRecord.roomNo}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Landlord / Owner (मालिक):
                  </p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{activeReceiptRecord.ownerName}</p>
                  <p className="text-slate-600 mt-0.5">Ph: {activeReceiptRecord.ownerPhone}</p>
                </div>
              </div>

              <div className="mb-5 text-xs text-slate-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                Received with thanks a sum towards house rent and utilities for the period of:{' '}
                <span className="font-bold text-indigo-900">{activeReceiptRecord.monthLabel}</span>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-xs text-left mb-5">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-2.5 text-slate-800 font-medium">Base Room / House Rent (कमरा किराया)</td>
                    <td className="py-2.5 text-right font-semibold">
                      ₹{activeReceiptRecord.baseRent.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-amber-50/80 border-y-2 border-amber-300">
                    <td className="py-2.5 px-2 text-amber-950 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-600 font-black text-sm">⚡</span>
                        <span>Electricity Bill / बिजली बिल (सबमीटर यूनिट्स)</span>
                      </div>
                      <span className="block text-[11px] text-amber-800 font-semibold mt-0.5">
                        {activeReceiptRecord.electricityUnits || 'Submeter Units consumed & billed'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-amber-800 text-sm">
                      ₹{activeReceiptRecord.electricityAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-800 font-medium">Water / Maintenance Charges (मेंटेनेंस)</td>
                    <td className="py-2.5 text-right font-semibold">
                      ₹{activeReceiptRecord.otherCharges.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-900 text-sm font-bold text-slate-900 bg-slate-50">
                    <td className="py-2.5 px-2">Total Amount Paid (कुल भुगतान - किराया + बिजली)</td>
                    <td className="py-2.5 px-2 text-right font-black text-indigo-700 text-base">
                      ₹{activeReceiptRecord.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Explicit Bill Reconciliation Formula */}
              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-950 mb-4 flex flex-wrap items-center justify-between gap-1.5 font-medium">
                <span><b>Reconciliation:</b> Room Rent ₹{activeReceiptRecord.baseRent.toLocaleString('en-IN')} + ⚡ Bijli Bill ₹{activeReceiptRecord.electricityAmount.toLocaleString('en-IN')} + Maint ₹{activeReceiptRecord.otherCharges.toLocaleString('en-IN')}</span>
                <span className="font-extrabold text-indigo-700">= ₹{activeReceiptRecord.totalAmount.toLocaleString('en-IN')} Paid</span>
              </div>

              {/* Payment Details & Signature */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-200">
                <div>
                  <p className="text-slate-500 font-medium">
                    Payment Mode: <span className="font-bold text-slate-800">{activeReceiptRecord.paymentMode}</span>
                  </p>
                  <p className="text-slate-500 font-medium">
                    Txn Ref ID: <span className="font-mono text-slate-800">{activeReceiptRecord.txnId}</span>
                  </p>
                  <p className="text-slate-500 font-medium">
                    Status:{' '}
                    <span
                      className={`font-bold ${
                        activeReceiptRecord.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {activeReceiptRecord.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="border-t border-dashed border-slate-400 w-36 ml-auto mt-6 pt-1 text-[11px] text-slate-500 font-medium text-center">
                    Landlord Signature / Acknowledgement
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center mt-6">
                * This is a computer generated rent receipt for record keeping & verification.
              </div>
            </div>

            {/* Bottom Bar (No-Print) */}
            <div className="no-print p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleCopyReceiptText(activeReceiptRecord)}
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Text Slip
              </button>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-xs font-semibold px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: DOWNLOAD & BACKUP APP */}
      {/* ============================================================== */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300 text-base">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">Download & Install App</h3>
                  <p className="text-[11px] text-emerald-200">AVHII DATABASE APP 1.0</p>
                </div>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Direct HTML Download */}
              <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/60 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 text-lg shadow-sm">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Direct Download (.html App File)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Download karke Chrome ya phone ke kisi bhi browser me direct bina internet ke open karein.
                  </p>
                  <button
                    onClick={handleDownloadAppFile}
                    className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download App File Now
                  </button>
                </div>
              </div>

              {/* Add to Home Screen Info */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-lg shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1 text-xs">
                  <h4 className="font-bold text-slate-900">Phone Me App Icon Kaise Lagayein:</h4>
                  <ol className="list-decimal list-inside text-slate-600 mt-1 space-y-1 text-[11px] leading-relaxed">
                    <li>Chrome browser me sabse upar <b>3 Dots (⋮)</b> dabayein.</li>
                    <li>Menu me <b>"Add to Home screen"</b> (होम स्क्रीन पर जोड़ें) chunein.</li>
                    <li>Aapke mobile screen par <b>AVHII DATABASE APP 1.0</b> ka cute cat icon ban jayega!</li>
                  </ol>
                </div>
              </div>

              {/* Backup & Restore Data */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-lg shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Backup & Restore Data</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Apna rent, ration aur daily expense data JSON file me save ya restore karein.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={handleExportJSON}
                      className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                    >
                      <Download className="w-3 h-3" /> Backup (Export)
                    </button>
                    <label className="cursor-pointer inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                      <ArrowDownToLine className="w-3 h-3" /> Restore (Import)
                      <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Reset to Demo */}
              <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                <span>Want to reload sample template?</span>
                <button
                  onClick={handleResetToDemo}
                  className="text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: UNIVERSAL BILLS PRINTER & EXPORT HUB */}
      {/* ============================================================== */}
      <PrinterExportHubModal
        isOpen={isPrinterHubOpen}
        onClose={() => setIsPrinterHubOpen(false)}
        data={data}
        showToast={showToast}
      />

      {/* ============================================================== */}
      {/* MODAL 7: MONTHLY BUDGET TARGET SETTINGS */}
      {/* ============================================================== */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={data.monthlyBudget || 15000}
        onSaveBudget={handleSaveBudget}
        thisMonthSpent={thisMonthExpensesTotal}
      />

      {/* ============================================================== */}
      {/* 3D FLOATING ANIMATED MASCOT CAT WITH LUCKY GIFT BOX */}
      {/* ============================================================== */}
      <FloatingCatGift
        onOpenPrinterHub={() => setIsPrinterHubOpen(true)}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        showToast={showToast}
      />

      {/* ============================================================== */}
      {/* FLOATING TOAST NOTIFICATION */}
      {/* ============================================================== */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
