export interface RentRecord {
  id: string;
  monthYear: string;
  monthLabel: string;
  ownerName: string;
  ownerPhone: string;
  tenantName: string;
  roomNo: string;
  baseRent: number;
  electricityAmount: number;
  electricityUnits?: string;
  otherCharges: number;
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Partial';
  paymentMode: string;
  txnId: string;
  date: string;
}

export interface ElectricityLog {
  id: string;
  prevReading: number;
  currReading: number;
  rate: number;
  units: number;
  fixed: number;
  total: number;
  date: string;
}

export interface DailyExpense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: 'Food' | 'Vegetables' | 'Transport' | 'Household' | 'Other';
  mode: 'UPI' | 'Cash';
}

export interface RationItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  price: number;
  status: 'bought' | 'pending';
}

export interface AppState {
  rentRecords: RentRecord[];
  dailyExpenses: DailyExpense[];
  rationItems: RationItem[];
  electricityLogs: ElectricityLog[];
  monthlyBudget: number;
}
