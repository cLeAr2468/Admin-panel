import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import LaundryStatusChart from './LaundryStatusChart';
import Sidebar from './Sidebar';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto bg-slate-50 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #126280 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="space-y-6 relative z-10">
          {/* Top Statistics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Highlight */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  TODAY'S HIGHLIGHT
                </CardTitle>
                <p className="text-sm text-slate-600">APRIL 7, 2025</p>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-4">45</div>
                  <div className="text-lg font-medium text-slate-700 mb-4">ORDERS</div>
                  <div className="bg-slate-800 text-white p-3 rounded-lg">
                    <div className="text-xs mb-2 text-slate-300">MM DAY YY</div>
                    <div className="flex justify-between text-sm">
                      <span className="cursor-pointer hover:text-blue-300 transition-colors">Weekly</span>
                      <span className="cursor-pointer hover:text-blue-300 transition-colors">Monthly</span>
                      <span className="cursor-pointer hover:text-blue-300 transition-colors">Yearly</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Store Inventory */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  STORE INVENTORY
                </CardTitle>
                <p className="text-sm text-slate-600">APRIL 7, 2025</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">ORDER AMOUNT:</span>
                    <span className="font-semibold text-slate-800">₱4,080</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">GARMENT:</span>
                    <span className="font-semibold text-slate-800">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ORDER:</span>
                    <span className="font-semibold text-slate-800">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">PROCESS:</span>
                    <span className="font-semibold text-slate-800">2,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">VOICE:</span>
                    <span className="font-semibold text-slate-800">645</span>
                  </div>
                  <div className="bg-slate-800 text-white p-3 rounded-lg mt-4">
                    <div className="text-xs mb-2 text-slate-300">MM DAY YY</div>
                    <div className="flex justify-between text-sm">
                      <span className="cursor-pointer hover:text-blue-300 transition-colors">Weekly</span>
                      <span className="cursor-pointer hover:text-blue-300 transition-colors">Monthly</span>
                      <span className="cursor-pointer hover:text-blue-300 transition-colors">Yearly</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Others Statistic */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  OTHERS STATISTIC
                </CardTitle>
                <p className="text-sm text-slate-600">APRIL 7, 2025</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-sm text-slate-600">LAUNDRY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">10</div>
                    <div className="text-sm text-slate-600">READY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">5</div>
                    <div className="text-sm text-slate-600">PROCESS</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Laundry Status Chart */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">
                LAUNDRY STATUS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LaundryStatusChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
