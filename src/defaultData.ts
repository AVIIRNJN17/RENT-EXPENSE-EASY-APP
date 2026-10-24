import { AppState } from './types';

export const defaultState: AppState = {
  rentRecords: [
    {
      id: 'rent-1',
      monthYear: '2026-10',
      monthLabel: 'October 2026',
      ownerName: 'Ramesh Kumar Sharma',
      ownerPhone: '9876543210',
      tenantName: 'Rahul Verma',
      roomNo: 'Flat 202, Gokul Heights',
      baseRent: 6500,
      electricityAmount: 920,
      electricityUnits: '115 Units (1420 → 1535 @ ₹8)',
      otherCharges: 200,
      totalAmount: 7620,
      status: 'Paid',
      paymentMode: 'UPI (GooglePay / PhonePe)',
      txnId: 'UPI-9823487192',
      date: '2026-10-05'
    },
    {
      id: 'rent-2',
      monthYear: '2026-09',
      monthLabel: 'September 2026',
      ownerName: 'Ramesh Kumar Sharma',
      ownerPhone: '9876543210',
      tenantName: 'Rahul Verma',
      roomNo: 'Flat 202, Gokul Heights',
      baseRent: 6500,
      electricityAmount: 880,
      electricityUnits: '110 Units (1310 → 1420 @ ₹8)',
      otherCharges: 200,
      totalAmount: 7580,
      status: 'Paid',
      paymentMode: 'UPI (PhonePe)',
      txnId: 'UPI-7718293911',
      date: '2026-09-04'
    }
  ],
  dailyExpenses: [
    // October 2026 (Current)
    { id: 'exp-1', title: 'Milk (1.5L) & Bread', amount: 98, date: '2026-10-25', category: 'Food', mode: 'UPI' },
    { id: 'exp-2', title: 'Auto fare to market', amount: 40, date: '2026-10-25', category: 'Transport', mode: 'Cash' },
    { id: 'exp-3', title: 'Evening Chai & Samosa', amount: 50, date: '2026-10-24', category: 'Food', mode: 'UPI' },
    { id: 'exp-4', title: 'Fresh Vegetables (Aloo, Pyaaz, Tamatar)', amount: 160, date: '2026-10-24', category: 'Vegetables', mode: 'Cash' },
    { id: 'exp-5', title: 'Home Cleaning Supplies & Broom', amount: 240, date: '2026-10-18', category: 'Household', mode: 'UPI' },
    { id: 'exp-6', title: 'Weekend Biryani & Drinks', amount: 420, date: '2026-10-12', category: 'Food', mode: 'UPI' },
    { id: 'exp-7', title: 'Metro Smart Card Recharge', amount: 300, date: '2026-10-06', category: 'Transport', mode: 'UPI' },
    { id: 'exp-8', title: 'Weekly Green Vegetables & Fruits', amount: 210, date: '2026-10-02', category: 'Vegetables', mode: 'Cash' },

    // September 2026
    { id: 'exp-9', title: 'Monthly Fruit Basket (Apple, Banana)', amount: 310, date: '2026-09-28', category: 'Vegetables', mode: 'Cash' },
    { id: 'exp-10', title: 'Dinner with Office Friends', amount: 650, date: '2026-09-21', category: 'Food', mode: 'UPI' },
    { id: 'exp-11', title: 'Cab to Railway Station', amount: 220, date: '2026-09-17', category: 'Transport', mode: 'UPI' },
    { id: 'exp-12', title: 'Bathroom Fixture Repair & Bulb', amount: 180, date: '2026-09-10', category: 'Household', mode: 'Cash' },
    { id: 'exp-13', title: 'Weekly Sabzi & Dairy Items', amount: 360, date: '2026-09-04', category: 'Vegetables', mode: 'UPI' },

    // August 2026
    { id: 'exp-14', title: 'Independence Day Sweets & Snacks', amount: 380, date: '2026-08-15', category: 'Food', mode: 'UPI' },
    { id: 'exp-15', title: 'Auto & Rickshaw Commute', amount: 190, date: '2026-08-22', category: 'Transport', mode: 'Cash' },
    { id: 'exp-16', title: 'Rainy Season Umbrella & Mat', amount: 350, date: '2026-08-08', category: 'Household', mode: 'UPI' },
    { id: 'exp-17', title: 'Dairy, Paneer & Vegetables', amount: 480, date: '2026-08-01', category: 'Food', mode: 'Cash' },

    // July 2026
    { id: 'exp-18', title: 'Kitchen Container Set & Mop', amount: 450, date: '2026-07-26', category: 'Household', mode: 'UPI' },
    { id: 'exp-19', title: 'Monthly Local Travel & Bus Pass', amount: 500, date: '2026-07-19', category: 'Transport', mode: 'UPI' },
    { id: 'exp-20', title: 'Weekend Family Dinner', amount: 780, date: '2026-07-11', category: 'Food', mode: 'UPI' },
    { id: 'exp-21', title: 'Mandi Sabzi & Seasonal Mangoes', amount: 390, date: '2026-07-03', category: 'Vegetables', mode: 'Cash' },

    // June 2026
    { id: 'exp-22', title: 'Summer Juices & Ice Cream Treats', amount: 260, date: '2026-06-25', category: 'Food', mode: 'UPI' },
    { id: 'exp-23', title: 'Home Fan Servicing & Capacitor', amount: 200, date: '2026-06-18', category: 'Household', mode: 'Cash' },
    { id: 'exp-24', title: 'Metro Recharge & Auto Rides', amount: 340, date: '2026-06-12', category: 'Transport', mode: 'UPI' },
    { id: 'exp-25', title: 'Fresh Summer Veggies (Bhindi, Lauki)', amount: 280, date: '2026-06-04', category: 'Vegetables', mode: 'Cash' },

    // May 2026
    { id: 'exp-26', title: 'Water Tanker / Bottled Water', amount: 350, date: '2026-05-27', category: 'Household', mode: 'UPI' },
    { id: 'exp-27', title: 'Weekend Restaurant Outing', amount: 620, date: '2026-05-18', category: 'Food', mode: 'UPI' },
    { id: 'exp-28', title: 'Office Commute Auto Fares', amount: 290, date: '2026-05-10', category: 'Transport', mode: 'Cash' },
    { id: 'exp-29', title: 'Weekly Mandi Sabzi & Herbs', amount: 240, date: '2026-05-02', category: 'Vegetables', mode: 'Cash' },
  ],
  rationItems: [
    { id: 'rat-1', name: 'Aashirvaad Shudh Chakki Aata', quantity: '10 kg', category: 'Grains & Flours', price: 420, status: 'bought' },
    { id: 'rat-2', name: 'India Gate Basmati Rice', quantity: '5 kg', category: 'Grains & Flours', price: 380, status: 'bought' },
    { id: 'rat-3', name: 'Mustard Oil (Kacchi Ghani)', quantity: '2 Litre', category: 'Oil & Ghee', price: 290, status: 'pending' },
    { id: 'rat-4', name: 'Toor / Arhar Dal', quantity: '2 kg', category: 'Pulses & Dal', price: 280, status: 'pending' },
    { id: 'rat-5', name: 'Tata Salt & Haldi Powder', quantity: '1 Pkt each', category: 'Spices & Salt', price: 65, status: 'bought' },
  ],
  electricityLogs: [
    { id: 'elec-1', prevReading: 1420, currReading: 1535, rate: 8, units: 115, fixed: 0, total: 920, date: '2026-10-01' },
    { id: 'elec-2', prevReading: 1310, currReading: 1420, rate: 8, units: 110, fixed: 0, total: 880, date: '2026-09-01' }
  ],
  monthlyBudget: 15000
};
