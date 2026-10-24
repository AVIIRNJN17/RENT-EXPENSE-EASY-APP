import { AppState, RentRecord, DailyExpense, RationItem, ElectricityLog } from '../types';

/**
 * Generates and downloads a CSV file with UTF-8 BOM so Excel opens it with proper Indian formatting and characters
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds unified Master CSV containing Rent, Electricity, Daily Expenses and Ration
 */
export function generateMasterCSV(data: AppState): string {
  let csv = '';

  // 1. Rent Records Section
  csv += '=== 1. RENT & ELECTRICITY RECEIPTS (मकान किराया व बिजली बिल) ===\r\n';
  csv += 'Month,Landlord,Tenant,Room / Flat,Base Rent (INR),Electricity Bill (INR),Electricity Units Breakdown,Maintenance (INR),Total Paid (INR),Status,Payment Mode,Txn ID,Date\r\n';
  data.rentRecords.forEach(r => {
    csv += `"${r.monthLabel}","${r.ownerName}","${r.tenantName}","${r.roomNo}",${r.baseRent},${r.electricityAmount},"${r.electricityUnits || ''}",${r.otherCharges},${r.totalAmount},"${r.status}","${r.paymentMode}","${r.txnId}","${r.date}"\r\n`;
  });

  csv += '\r\n';

  // 2. Electricity Meter Readings Section
  csv += '=== 2. ELECTRICITY SUBMETER READINGS (बिजली मीटर लॉग्स) ===\r\n';
  csv += 'Date,Previous Reading,Current Reading,Consumed Units,Rate Per Unit (INR),Fixed Charges (INR),Total Bill (INR)\r\n';
  data.electricityLogs.forEach(l => {
    csv += `"${l.date}",${l.prevReading},${l.currReading},${l.units},${l.rate},${l.fixed},${l.total}\r\n`;
  });

  csv += '\r\n';

  // 3. Daily Expenses Section
  csv += '=== 3. DAILY EXPENSES (दैनिक खर्च) ===\r\n';
  csv += 'Date,Item Description,Category,Payment Mode,Amount (INR)\r\n';
  data.dailyExpenses.forEach(e => {
    csv += `"${e.date}","${e.title}","${e.category}","${e.mode}",${e.amount}\r\n`;
  });

  csv += '\r\n';

  // 4. Monthly Ration Section
  csv += '=== 4. MONTHLY RATION CHECKLIST (राशन सामग्री) ===\r\n';
  csv += 'Item Name,Quantity,Category,Estimated Price (INR),Status\r\n';
  data.rationItems.forEach(i => {
    csv += `"${i.name}","${i.quantity}","${i.category}",${i.price},"${i.status.toUpperCase()}"\r\n`;
  });

  return csv;
}

/**
 * Builds Excel XML / HTML file that opens natively in Microsoft Excel with formatted tables, bold totals and colors
 */
export function downloadExcelSpreadsheet(filename: string, data: AppState) {
  const totalRentPaid = data.rentRecords.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalElecInRent = data.rentRecords.reduce((sum, r) => sum + r.electricityAmount, 0);
  const totalExpenses = data.dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRation = data.rationItems.reduce((sum, i) => sum + i.price, 0);

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Accounts & Bills</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        th { background-color: #1e1b4b; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 6px 10px; }
        td { border: 1px solid #e2e8f0; padding: 5px 8px; }
        .num { mso-number-format:"\\₹\\#,##0"; text-align: right; }
        .head-rent { background-color: #4338ca; color: #ffffff; }
        .head-elec { background-color: #b45309; color: #ffffff; }
        .head-daily { background-color: #047857; color: #ffffff; }
        .head-ration { background-color: #be123c; color: #ffffff; }
        .total-row { font-weight: bold; background-color: #f1f5f9; }
        .title { font-size: 16pt; font-weight: bold; color: #0f172a; }
        .subtitle { font-size: 10pt; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="title">AVHII DATABASE APP 1.0 - ALL BILLS & FINANCIAL STATEMENT</div>
      <div class="subtitle">Exported on: ${new Date().toLocaleString('en-IN')}</div>
      <br/>

      <!-- RENT & ELECTRICITY TABLE -->
      <table>
        <tr><th colspan="8" class="head-rent" style="font-size:12pt; text-align:left;">1. Rent Records with Electricity Bill Breakdown</th></tr>
        <tr>
          <th>Month</th>
          <th>Landlord (मालिक)</th>
          <th>Tenant (किरायेदार)</th>
          <th>Room / Flat</th>
          <th>Base Rent (₹)</th>
          <th>Electricity Bill (₹)</th>
          <th>Units Breakdown</th>
          <th>Total Paid (₹)</th>
        </tr>
        ${data.rentRecords.map(r => `
          <tr>
            <td>${r.monthLabel}</td>
            <td>${r.ownerName}</td>
            <td>${r.tenantName}</td>
            <td>${r.roomNo}</td>
            <td class="num">${r.baseRent}</td>
            <td class="num" style="color:#b45309; font-weight:bold;">${r.electricityAmount}</td>
            <td>${r.electricityUnits || ''}</td>
            <td class="num" style="color:#4338ca; font-weight:bold;">${r.totalAmount}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="4">Total Rent & Utility Paid</td>
          <td></td>
          <td class="num" style="color:#b45309;">₹${totalElecInRent}</td>
          <td></td>
          <td class="num" style="color:#4338ca;">₹${totalRentPaid}</td>
        </tr>
      </table>
      <br/>

      <!-- DAILY EXPENSES TABLE -->
      <table>
        <tr><th colspan="5" class="head-daily" style="font-size:12pt; text-align:left;">2. Daily Expenses Log</th></tr>
        <tr>
          <th>Date</th>
          <th>Item / Description</th>
          <th>Category</th>
          <th>Payment Mode</th>
          <th>Amount (₹)</th>
        </tr>
        ${data.dailyExpenses.map(e => `
          <tr>
            <td>${e.date}</td>
            <td>${e.title}</td>
            <td>${e.category}</td>
            <td>${e.mode}</td>
            <td class="num" style="color:#047857; font-weight:bold;">${e.amount}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="4">Total Daily Expenses</td>
          <td class="num" style="color:#047857;">₹${totalExpenses}</td>
        </tr>
      </table>
      <br/>

      <!-- RATION TABLE -->
      <table>
        <tr><th colspan="5" class="head-ration" style="font-size:12pt; text-align:left;">3. Monthly Ration Items</th></tr>
        <tr>
          <th>Item Name</th>
          <th>Quantity</th>
          <th>Category</th>
          <th>Est. Price (₹)</th>
          <th>Status</th>
        </tr>
        ${data.rationItems.map(i => `
          <tr>
            <td>${i.name}</td>
            <td>${i.quantity}</td>
            <td>${i.category}</td>
            <td class="num">${i.price}</td>
            <td>${i.status.toUpperCase()}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3">Total Ration Budget</td>
          <td class="num" style="color:#be123c;">₹${totalRation}</td>
          <td></td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
