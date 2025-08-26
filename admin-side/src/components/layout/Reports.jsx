import React, { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const Reports = () => {
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'items' | 'transactions'
  const [fromDate, setFromDate] = useState('2025-05-01');
  const [toDate, setToDate] = useState('2025-05-30');

  // Mock data modeled on screenshots
  const salesRows = [
    { date: '2025-05-30', itemNo: 'L001', service: 'Wash', description: 'Basic washing service', price: 150, qty: 20, kl: 15, amount: 150, taxRate: 0.1 },
  ];

  const itemRows = [
    { id: '001', name: 'Laundry Detergent', category: 'Consumable', quantity: 20, price: 5.0, dateAdded: '2025-05-01', lastUpdated: '2025-05-29' },
    { id: '002', name: 'Fabric Softener', category: 'Consumable', quantity: 15, price: 4.5, dateAdded: '2025-05-03', lastUpdated: '2025-05-29' },
    { id: '003', name: 'Laundry Bag', category: 'Equipment', quantity: 10, price: 2.0, dateAdded: '2025-04-25', lastUpdated: '2025-05-28' },
  ];

  const transactionRows = [
    { date: '2025-11-01', customer: 'John Dela Cruz', service: 'Wash & Fold', qty: '3 pcs', total: 300, status: 'Completed' },
    { date: '2025-11-01', customer: 'Maria Santos', service: 'Iron Only', qty: '5 pcs', total: 200, status: 'Pending' },
    { date: '2025-11-01', customer: 'John Dela Cruz', service: 'Wash & Fold', qty: '3 pcs', total: 300, status: 'Cancelled' },
    { date: '2025-10-31', customer: 'Ana Reyes', service: 'Dry Clean', qty: '2 pcs', total: 400, status: 'Cancelled' },
  ];

  const inRange = (isoDate) => {
    if (!fromDate && !toDate) return true;
    const d = new Date(isoDate).getTime();
    const f = fromDate ? new Date(fromDate).getTime() : -Infinity;
    const t = toDate ? new Date(toDate).getTime() : Infinity;
    return d >= f && d <= t;
  };

  const filteredSales = useMemo(() => salesRows.filter(r => inRange(r.date)), [fromDate, toDate]);
  const filteredItems = useMemo(() => itemRows.filter(r => inRange(r.dateAdded)), [fromDate, toDate]);
  const filteredTx = useMemo(() => transactionRows.filter(r => inRange(r.date)), [fromDate, toDate]);

  const salesTotals = useMemo(() => {
    const amount = filteredSales.reduce((s, r) => s + r.amount, 0);
    const tax = filteredSales.reduce((s, r) => s + r.amount * r.taxRate, 0);
    const total = amount + tax;
    return { amount, tax, total };
  }, [filteredSales]);

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto bg-transparent relative">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-wide text-slate-800">Reports</h1>
            <div className="text-sm md:text-base text-slate-700">Date: {today}</div>
          </div>

          {/* Controls */}
          <Card className="bg-white/90 shadow-md border-0 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="inline-flex rounded-md overflow-hidden shadow">
                  {['sales','items','transactions'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-semibold capitalize border ${activeTab===tab? 'bg-sky-600 text-white border-sky-600':'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-600">From</div>
                  <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1 bg-white" />
                  <div className="text-sm text-slate-600">To</div>
                  <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1 bg-white" />
                  <button onClick={()=>window.print()} className="ml-2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded shadow hover:bg-indigo-500 print:hidden">Print</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tables */}
          {activeTab === 'sales' && (
            <Card className="bg-white/95 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Daily Sales Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-600">
                      <tr className="border-b border-slate-200">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Item No</th>
                        <th className="py-2 pr-4">Service Name</th>
                        <th className="py-2 pr-4">Description</th>
                        <th className="py-2 pr-4">Price</th>
                        <th className="py-2 pr-4">Qty</th>
                        <th className="py-2 pr-4">KL</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Tax Rate</th>
                        <th className="py-2 pr-4">Tax</th>
                        <th className="py-2 pr-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((r, idx) => {
                        const tax = r.amount * r.taxRate;
                        const total = r.amount + tax;
                        return (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="py-2 pr-4">{r.date}</td>
                            <td className="py-2 pr-4 font-medium">{r.itemNo}</td>
                            <td className="py-2 pr-4">{r.service}</td>
                            <td className="py-2 pr-4">{r.description}</td>
                            <td className="py-2 pr-4">₱{r.price.toFixed(2)}</td>
                            <td className="py-2 pr-4">{r.qty}</td>
                            <td className="py-2 pr-4">{r.kl}</td>
                            <td className="py-2 pr-4">₱{r.amount.toFixed(2)}</td>
                            <td className="py-2 pr-4">{Math.round(r.taxRate*100)}%</td>
                            <td className="py-2 pr-4">₱{tax.toFixed(2)}</td>
                            <td className="py-2 pr-4">₱{total.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-col items-end text-sm text-slate-800 gap-1">
                  <div>Sales Amount: ₱{salesTotals.amount.toFixed(2)}</div>
                  <div>Sales Tax: ₱{salesTotals.tax.toFixed(2)}</div>
                  <div className="font-semibold">Total Sales: ₱{salesTotals.total.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'items' && (
            <Card className="bg-white/95 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Items Report - Laundry Shop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-600">
                      <tr className="border-b border-slate-200">
                        <th className="py-2 pr-4">Item ID</th>
                        <th className="py-2 pr-4">Item Name</th>
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Quantity</th>
                        <th className="py-2 pr-4">Price per Unit (₱)</th>
                        <th className="py-2 pr-4">Date Added</th>
                        <th className="py-2 pr-4">Last Updated</th>
                        <th className="py-2 pr-4">Amount (₱)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((r) => (
                        <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-2 pr-4 font-medium">{r.id}</td>
                          <td className="py-2 pr-4">{r.name}</td>
                          <td className="py-2 pr-4">{r.category}</td>
                          <td className="py-2 pr-4">{r.quantity}</td>
                          <td className="py-2 pr-4">₱{r.price.toFixed(2)}</td>
                          <td className="py-2 pr-4">{r.dateAdded}</td>
                          <td className="py-2 pr-4">{r.lastUpdated}</td>
                          <td className="py-2 pr-4">₱{(r.quantity * r.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-right text-sm font-semibold text-slate-800">
                  Total Expenses: ₱{filteredItems.reduce((s, r) => s + r.quantity*r.price, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'transactions' && (
            <Card className="bg-white/95 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-600">
                      <tr className="border-b border-slate-200">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Customer Name</th>
                        <th className="py-2 pr-4">Service</th>
                        <th className="py-2 pr-4">Quantity</th>
                        <th className="py-2 pr-4">Total (PHP)</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTx.map((r, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-2 pr-4">{r.date}</td>
                          <td className="py-2 pr-4">{r.customer}</td>
                          <td className="py-2 pr-4">{r.service}</td>
                          <td className="py-2 pr-4">{r.qty}</td>
                          <td className="py-2 pr-4">₱{r.total.toFixed(2)}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status==='Completed'?'bg-green-100 text-green-700':r.status==='Pending'?'bg-amber-100 text-amber-700':'bg-rose-100 text-rose-700'}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;


