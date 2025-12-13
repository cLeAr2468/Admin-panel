import React, { useContext, useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import moment from 'moment';
import { AuthContext } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

const getFirstDayOfYear = () => {
  const year = new Date().getFullYear();
  return `${year}-01-01`;
};

const getCurrentDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Reports = () => {
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'items' | 'transactions'
  const [fromDate, setFromDate] = useState(getFirstDayOfYear());
  const [toDate, setToDate] = useState(getCurrentDateString());
  const [itemRows, setItemRows] = useState([]);
  const [transactionRows, setransactionRows] = useState([]);
  const [saleRows, setSaleRows] = useState([])
  const { adminData } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = async () => {
    if (!adminData?.shop_id) return;
    try {
      setIsLoading(true);
      const res = await fetchApi(`/api/auth/get-items-report/${adminData.shop_id}`);
      if (!res || res.success === false) {
        throw new Error(res?.message || "Failed to fetch items for reports!");
      }

      const items = (res.data || []).map((i) => ({
        id: i.item_id,
        name: i.item_name,
        category: i.categories,
        quantity: i.item_quantity,
        price: parseFloat(i.item_uPrice),
        dateAdded: moment(i.date_added).format('YYYY-MM-DD'),
        lastUpdated: i.date_updated
          ? (moment(i.date_updated).format('YYYY-MM-DD'))
          : (<span className="text-gray-400 italic">N/A</span>)
      }));

      setItemRows(items);
    } catch (error) {
      console.error("Reports - loadItems error:", error);
      toast.error(error?.message || "Unable to load item records");
    } finally {
      setIsLoading(false);
    }
  }
  const transformStatus = (status) => {
    if (status === 'On Service') {
      return 'Pending';
    } else if (status === 'Ready to pick up') {
      return 'Pending';
    } else if (status === 'Laundry Done') {
      return 'Completed';
    } else {
      return 'Cancelled';
    }
  }
  const loadTransactions = async () => {
    if (!adminData?.shop_id) return;
    try {
      setIsLoading(true);
      const response = await fetchApi(`/api/auth/get-customer-records/${adminData.shop_id}`)
      if (!response || response.success === false) {
        throw new Error(response?.message || "Failed to fetch sales for report!");
      }

      const transactions = (response.data || []).map((i) => {
        const transStatus = transformStatus(i.status);
        return {
          date: moment(i.created_at).format('YYYY-MM-DD'),
          customer: i.cus_name,
          service: i.service,
          qty: parseFloat(i.num_items),
          total: parseFloat(i.total_amount),
          status: transStatus
        }
      });

      const filterdSales = response.data.filter(i => i.payment_status === "PAID");
      const sales = (filterdSales || []).map((i) => {
         return {
          date: moment(i.created_at).format('YYYY-MM-DD'),
          saleId: i.laundryId,
          service: i.service,
          cleaning_product: i.cleaning_products,
          qty: parseFloat(i.num_items),
          kl: i.kg,
          amount: parseFloat(i.total_amount),
          taxRate: 0.1
         }
      })

      setSaleRows(sales);
      setransactionRows(transactions);
    } catch (error) {
      console.error("Reports - loadTransactions error:", error);
      toast.error(error?.message || "Unable to load transaction records");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setSaleRows();
    loadItems();
    loadTransactions();
  }, [adminData]);
  // Mock data modeled on screenshots
  // const salesRows = [
  //   { date: '2025-05-30', saleId: 'L001', service: 'Wash', cleaning_product: 'Basic washing service', price: 150, qty: 20, kl: 15, amount: 150, taxRate: 0.1 },
  // ];

  // const itemRows = [
  //   { id: '001', name: 'Laundry Detergent', category: 'Consumable', quantity: 20, price: 5.0, dateAdded: '2025-05-01', lastUpdated: '2025-05-29' },
  //   { id: '002', name: 'Fabric Softener', category: 'Consumable', quantity: 15, price: 4.5, dateAdded: '2025-05-03', lastUpdated: '2025-05-29' },
  //   { id: '003', name: 'Laundry Bag', category: 'Equipment', quantity: 10, price: 2.0, dateAdded: '2025-04-25', lastUpdated: '2025-05-28' },
  // ];

  // const transactionRows = [
  //   { date: '2025-11-01', customer: 'John Dela Cruz', service: 'Wash & Fold', qty: '3 pcs', total: 300, status: 'Completed' },
  //   { date: '2025-11-01', customer: 'Maria Santos', service: 'Iron Only', qty: '5 pcs', total: 200, status: 'Pending' },
  //   { date: '2025-11-01', customer: 'John Dela Cruz', service: 'Wash & Fold', qty: '3 pcs', total: 300, status: 'Cancelled' },
  //   { date: '2025-10-31', customer: 'Ana Reyes', service: 'Dry Clean', qty: '2 pcs', total: 400, status: 'Cancelled' },
  // ];

  const inRange = (isoDate) => {
    if (!fromDate && !toDate) return true;
    const d = new Date(isoDate).getTime();
    const f = fromDate ? new Date(fromDate).getTime() : -Infinity;
    const t = toDate ? new Date(toDate).getTime() : Infinity;
    return d >= f && d <= t;
  };

  // const filteredSales = useMemo(() => salesRows.filter(r => inRange(r.date)), [fromDate, toDate]);
    const filteredSales = useMemo(() => {
    if (!Array.isArray(saleRows)) return [];
    return saleRows.filter(r => inRange(r.date));
  }, [saleRows, fromDate, toDate]);
  const filteredItems = useMemo(() => {
    if (!Array.isArray(itemRows)) return [];
    return itemRows.filter(r => inRange(r.dateAdded));
  }, [itemRows, fromDate, toDate]);
  const filteredTx = useMemo(() => {
    if (!Array.isArray(transactionRows)) return [];
    return transactionRows.filter(r => inRange(r.date));
  }, [transactionRows, fromDate, toDate]);

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
                  {['sales', 'items', 'transactions'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-semibold capitalize border ${activeTab === tab ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-600">From</div>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1 bg-white" />
                  <div className="text-sm text-slate-600">To</div>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1 bg-white" />
                  <button onClick={() => window.print()} className="ml-2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded shadow hover:bg-indigo-500 print:hidden">Print</button>
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
                        <th className="py-2 pr-4">Sales No</th>
                        <th className="py-2 pr-4">Service Name</th>
                        <th className="py-2 pr-4">Cleaning Items</th>
                        {/* <th className="py-2 pr-4">Price</th> */}
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
                            <td className="py-2 pr-4 font-medium">{r.saleId}</td>
                            <td className="py-2 pr-4">{r.service}</td>
                            <td className="py-2 pr-4">{r.cleaning_product}</td>
                            {/* <td className="py-2 pr-4">₱{r.price.toFixed(2)}</td> */}
                            <td className="py-2 pr-4">{r.qty}</td>
                            <td className="py-2 pr-4">{r.kl}</td>
                            <td className="py-2 pr-4">₱{r.amount.toFixed(2)}</td>
                            <td className="py-2 pr-4">{Math.round(r.taxRate * 100)}%</td>
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
                      {isLoading ? (<tr>
                        <td colSpan="8" className="py-8 text-center">
                          <p className="text-sm text-gray-500 mt-2">Fetching data...</p>
                        </td>
                      </tr>) : filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-gray-500">
                            No items found for the selected date range.
                          </td>
                        </tr>
                      ) : (

                        filteredItems.map((r) => (
                          <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="py-2 pr-4 font-medium">{r.id}</td>
                            <td className="py-2 pr-4">{r.name}</td>
                            <td className="py-2 pr-4">{r.category}</td>
                            <td className="py-2 pr-4">{r.quantity} <span className="text-gray-600 italic">pcs</span></td>
                            <td className="py-2 pr-4"><span className="text-gray-600 italic">₱</span>{r.price.toFixed(2)}</td>
                            <td className="py-2 pr-4">{r.dateAdded}</td>
                            <td className="py-2 pr-4">
                              {r.lastUpdated ? (
                                r.lastUpdated
                              ) : (
                                <span className="text-gray-400 italic">N/A</span>
                              )}
                            </td>
                            <td className="py-2 pr-4"><span className="text-gray-600 italic">₱</span>{(r.quantity * r.price).toFixed(2)}</td>
                          </tr>
                        ))

                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-right text-sm font-semibold text-slate-800">
                  Total Expenses: <span className="text-gray-600 italic">₱</span>{filteredItems.reduce((s, r) => s + r.quantity * r.price, 0).toFixed(2)}
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
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : r.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{r.status}</span>
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


