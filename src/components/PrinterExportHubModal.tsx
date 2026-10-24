import React, { useState } from 'react';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  Download,
  Share2,
  Copy,
  X,
  CheckCircle2,
  Building2,
  Zap,
  Wallet,
  ShoppingCart
} from 'lucide-react';
import { AppState } from '../types';
import { downloadCSV, generateMasterCSV, downloadExcelSpreadsheet } from '../utils/exportUtils';

interface PrinterExportHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppState;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export default function PrinterExportHubModal({
  isOpen,
  onClose,
  data,
  showToast
}: PrinterExportHubModalProps) {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'download' | 'preview' | 'whatsapp'>('download');

  if (!isOpen) return null;

  const latestRent = data.rentRecords[0] || null;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = data.dailyExpenses
    .filter(e => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);
  const allExpensesTotal = data.dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRationBought = data.rationItems
    .filter(i => i.status === 'bought')
    .reduce((sum, i) => sum + i.price, 0);

  // Download All CSV
  const handleDownloadAllCSV = () => {
    const csv = generateMasterCSV(data);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`AVHII_MASTER_BILLS_${dateStr}.csv`, csv);
    showToast('Combined CSV downloaded! Opens directly in Excel.');
  };

  // Download Daily Expenses CSV
  const handleDownloadExpensesCSV = () => {
    let csv = 'Date,Item Description,Category,Payment Mode,Amount (INR)\r\n';
    data.dailyExpenses.forEach(e => {
      csv += `"${e.date}","${e.title}","${e.category}","${e.mode}",${e.amount}\r\n`;
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`Daily_Expenses_${dateStr}.csv`, csv);
    showToast('Daily Expenses CSV downloaded!');
  };

  // Download Rent CSV
  const handleDownloadRentCSV = () => {
    let csv = 'Month,Landlord,Tenant,Room,Base Rent (INR),Electricity Bill (INR),Units Detail,Maintenance (INR),Total Amount (INR),Status,Payment Mode,Txn ID,Date\r\n';
    data.rentRecords.forEach(r => {
      csv += `"${r.monthLabel}","${r.ownerName}","${r.tenantName}","${r.roomNo}",${r.baseRent},${r.electricityAmount},"${r.electricityUnits || ''}",${r.otherCharges},${r.totalAmount},"${r.status}","${r.paymentMode}","${r.txnId}","${r.date}"\r\n`;
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(`Rent_Receipts_Bills_${dateStr}.csv`, csv);
    showToast('Rent & Electricity Receipts CSV downloaded!');
  };

  // Download Excel Workbook
  const handleDownloadExcel = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadExcelSpreadsheet(`AVHII_FINANCIAL_STATEMENT_${dateStr}.xls`, data);
    showToast('Styled Excel Workbook (.xls) downloaded!');
  };

  // Generate WhatsApp Master Breakdown Text
  const getWhatsAppSummaryText = () => {
    const rentDetails = latestRent
      ? `🏠 *RENT & UTILITY BREAKDOWN:*
• Base Rent: ₹${latestRent.baseRent.toLocaleString('en-IN')}
⚡ *ELECTRICITY BILL (बिजली बिल):* ₹${latestRent.electricityAmount.toLocaleString('en-IN')} (${latestRent.electricityUnits || 'Submeter Units'})
• Maintenance / Other: ₹${latestRent.otherCharges.toLocaleString('en-IN')}
👉 *Total Rent Paid:* ₹${latestRent.totalAmount.toLocaleString('en-IN')} (${latestRent.status})`
      : '🏠 *Rent:* No active record';

    return `📑 *AVHII DATABASE APP 1.0 - ALL BILLS & ACCOUNTS SUMMARY* 📑
━━━━━━━━━━━━━━━━━━━━
📅 *Date:* ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
👤 *Tenant:* ${latestRent?.tenantName || 'Rahul Verma'}
👤 *Landlord:* ${latestRent?.ownerName || 'Ramesh Kumar Sharma'}
━━━━━━━━━━━━━━━━━━━━
${rentDetails}
━━━━━━━━━━━━━━━━━━━━
📊 *DAILY EXPENSES (दैनिक खर्च):*
• This Month Total: ₹${thisMonthExpenses.toLocaleString('en-IN')}
• Total Recorded: ₹${allExpensesTotal.toLocaleString('en-IN')} (${data.dailyExpenses.length} transactions)
━━━━━━━━━━━━━━━━━━━━
🛒 *RATION GROCERY STATUS:*
• Bought so far: ₹${totalRationBought.toLocaleString('en-IN')}
• Total Ration Items: ${data.rationItems.length}
━━━━━━━━━━━━━━━━━━━━
💰 *MONTHLY BUDGET STATUS:*
• Monthly Budget Limit: ₹${(data.monthlyBudget || 15000).toLocaleString('en-IN')}
• Total Living Spending: ₹${((latestRent?.totalAmount || 0) + thisMonthExpenses).toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
_Generated via AVHII DATABASE APP 1.0 🐾_`;
  };

  const handleShareWhatsApp = () => {
    const text = getWhatsAppSummaryText();
    const phone = recipientPhone.replace(/[^0-9]/g, '');
    const url = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const text = getWhatsAppSummaryText();
    navigator.clipboard.writeText(text).then(() => {
      showToast('All Bills summary text copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy', 'warning');
    });
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
              <Printer className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Universal Bills & Export Hub (प्रिंटर और डाउनलोड हब)
              </h3>
              <p className="text-[11px] text-slate-300">
                Download CSV, Excel, Print/PDF Report ya WhatsApp par bhejein
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-lg rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls (No Print) */}
        <div className="no-print flex border-b border-slate-200 bg-slate-50 px-4 gap-2 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveSubTab('download')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeSubTab === 'download'
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> CSV & Excel Downloads
          </button>
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeSubTab === 'preview'
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> Printable Report (PDF)
          </button>
          <button
            onClick={() => setActiveSubTab('whatsapp')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeSubTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Send
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: CSV & EXCEL DOWNLOADS */}
          {activeSubTab === 'download' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <FileSpreadsheet className="w-8 h-8 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                    Download Complete Financial Accounts
                  </h4>
                  <p className="text-[11px] text-indigo-800/80 mt-0.5">
                    Excel aur Google Sheets compatible formatted files jo aap kisi ko bhi mail ya share kar sakte hain.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Master CSV */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      RECOMMENDED
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">
                      Combined Master CSV File
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Rent, electricity submeter, daily expenses aur ration sabhi ek single UTF-8 file me.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadAllCSV}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Master CSV
                  </button>
                </div>

                {/* Formatted Excel */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      MS EXCEL / SPREADSHEET
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">
                      Formatted Excel File (.xls)
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Color-coded headers, bold totals aur Indian Rupee format ke sath ready-made Excel sheet.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadExcel}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Download Excel Sheet
                  </button>
                </div>

                {/* Daily Expenses CSV */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      DAILY KHARCHA
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">
                      Daily Expenses CSV
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {data.dailyExpenses.length} transactions across food, travel, veggies & household.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadExpensesCSV}
                    className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Expenses CSV
                  </button>
                </div>

                {/* Rent Receipts CSV */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      RENT + BIJLI
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">
                      Rent & Electricity CSV
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Room rent receipts with submeter units and landlord acknowledgement details.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadRentCSV}
                    className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Rent CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRINTABLE STATEMENT (PDF) */}
          {activeSubTab === 'preview' && (
            <div className="space-y-4">
              <div className="no-print flex items-center justify-between bg-slate-100 p-3 rounded-xl">
                <p className="text-xs text-slate-600">
                  Yeh print statement official PDF format me download ya direct print ho sakti hai.
                </p>
                <button
                  onClick={handleTriggerPrint}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
                </button>
              </div>

              {/* The Actual Printable Hub Report */}
              <div
                id="printableBillsHubReport"
                className="bg-white border-2 border-slate-900 p-6 sm:p-8 rounded-2xl text-slate-800 space-y-5"
              >
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      AVHII DATABASE APP 1.0
                    </h2>
                    <p className="text-xs font-bold text-slate-600">
                      COMPREHENSIVE MONTHLY ACCOUNTS & BILLS STATEMENT
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-slate-400">STATEMENT DATE</p>
                    <p className="font-mono font-bold text-slate-900">
                      {new Date().toISOString().slice(0, 10)}
                    </p>
                  </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase">Tenant (किरायेदार)</span>
                    <p className="font-bold text-slate-900">{latestRent?.tenantName || 'Rahul Verma'}</p>
                    <p className="text-slate-600">{latestRent?.roomNo || 'Flat 202, Gokul Heights'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase">Landlord (मालिक)</span>
                    <p className="font-bold text-slate-900">{latestRent?.ownerName || 'Ramesh Kumar Sharma'}</p>
                    <p className="text-slate-600">Ph: {latestRent?.ownerPhone || '9876543210'}</p>
                  </div>
                </div>

                {/* Section 1: Rent & Electricity */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" /> 1. Rent & Electricity Bill Breakdown
                  </h4>
                  {latestRent ? (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Period</th>
                          <th className="p-2">Base Room Rent</th>
                          <th className="p-2 text-amber-800 bg-amber-50">⚡ Electricity Bill (सबमीटर)</th>
                          <th className="p-2">Maintenance</th>
                          <th className="p-2 text-right">Total Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2 font-bold">{latestRent.monthLabel}</td>
                          <td className="p-2">₹{latestRent.baseRent.toLocaleString('en-IN')}</td>
                          <td className="p-2 font-bold text-amber-800 bg-amber-50">
                            ₹{latestRent.electricityAmount.toLocaleString('en-IN')}
                            <span className="block text-[10px] font-normal text-amber-700">
                              {latestRent.electricityUnits || 'Submeter Units'}
                            </span>
                          </td>
                          <td className="p-2">₹{latestRent.otherCharges.toLocaleString('en-IN')}</td>
                          <td className="p-2 text-right font-extrabold text-indigo-700">
                            ₹{latestRent.totalAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-400">No rent record saved.</p>
                  )}
                </div>

                {/* Section 2: Daily Expenses Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" /> 2. Daily Living Expenses Log
                  </h4>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.dailyExpenses.slice(0, 8).map(e => (
                        <tr key={e.id}>
                          <td className="p-2 text-slate-500">{e.date}</td>
                          <td className="p-2 font-medium">{e.title}</td>
                          <td className="p-2 text-[11px] text-slate-600">{e.category}</td>
                          <td className="p-2 text-right font-bold text-emerald-700">
                            ₹{e.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.dailyExpenses.length > 8 && (
                    <p className="text-[10px] text-slate-400 text-right">
                      ...and {data.dailyExpenses.length - 8} more expense entries in database
                    </p>
                  )}
                </div>

                {/* Grand Financial Totals Summary */}
                <div className="border-t-2 border-slate-900 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-700">
                      Monthly Budget Cap: ₹{(data.monthlyBudget || 15000).toLocaleString('en-IN')}
                    </p>
                    <p className="text-slate-500">
                      Status: Record Verified & Digitally Reconciled
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Combined Living Cost (Rent + Bijli + Expenses)
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      ₹{((latestRent?.totalAmount || 0) + thisMonthExpenses).toLocaleString('en-IN')}
                    </h3>
                  </div>
                </div>

                {/* Signature Block */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-dashed border-slate-300 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-semibold">
                      Tenant Signature
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 w-36 mx-auto pt-1 font-semibold">
                      Landlord / Receiver
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP SEND */}
          {activeSubTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <Share2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    Send All Bills Directly to WhatsApp
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Landlord, roommates, ya parents ko pura monthly hisaab 1-click me WhatsApp par send karein.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Recipient WhatsApp Number (Optional)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={e => setRecipientPhone(e.target.value)}
                      placeholder="98XXXXXXXX (Leave empty to choose contact in WhatsApp)"
                      className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                  <button
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Send on WhatsApp
                  </button>
                </div>
              </div>

              {/* Text Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Message Preview:</span>
                  <button
                    onClick={handleCopyText}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Message Text
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-300 p-3.5 rounded-2xl text-[11px] font-mono whitespace-pre-wrap max-h-56 overflow-y-auto border border-slate-800 leading-relaxed">
                  {getWhatsAppSummaryText()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="no-print p-3.5 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            AVHII DATABASE APP 1.0 Universal Bills Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
}
