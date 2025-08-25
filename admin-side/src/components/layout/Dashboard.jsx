import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import LaundryStatusChart from './LaundryStatusChart';
import Sidebar from './Sidebar';
import { Input } from '../ui/input';

const Dashboard = () => {
  return (
    <div className="flex h-screen">
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
            <Card className="bg-[#688ce4] shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-white">
                  TODAY'S HIGHLIGHT
                </CardTitle>
                <Input type="date" className="max-w-[180px] bg-white border-slate-300 text-slate-800" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  {/* First Pair */}
                  <div className="flex items-center gap-2 flex-col">
                    <span className="text-lg font-semibold text-white">ORDERS:</span>
                    <span className="text-2xl font-bold text-white">45</span>
                  </div>

                  {/* Second Pair */}
                  <div className="flex items-center gap-2 flex-col">
                    <span className="text-lg font-semibold text-white">ORDER AMOUNT:</span>
                    <span className="text-2xl font-bold text-white">₱4,080</span>
                  </div>
                </div>
              </CardContent>

            </Card>

            {/* Store Inventory */}
            <Card className="bg-[#688ce4] shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-white">
                  STORE INVENTORY
                </CardTitle>
                <Input type="date" className="max-w-[180px] bg-white border-slate-300 text-slate-800" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-x-6 px-2">
                  {/* Header row */}
                  <div />
                  <div className="text-sm font-semibold text-white tracking-wide">PROCESS</div>
                  <div className="text-sm font-semibold text-white tracking-wide">VOICE</div>

                  {/* GARMENT row */}
                  <div className="text-white">GARMENT</div>
                  <div className="text-white font-semibold">45</div>
                  <div className="text-white font-semibold">2,000</div>

                  {/* ORDER row */}
                  <div className="text-white">ORDER</div>
                  <div className="text-white font-semibold">45</div>
                  <div className="text-white font-semibold">645</div>
                </div>
              </CardContent>
            </Card>

            {/* Others Statistic */}
            <Card className="bg-[#688ce4] shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-white">
                  OTHERS STATISTIC
                </CardTitle>
                <Input type="date" className="max-w-[180px] bg-white border-slate-300 text-slate-800" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 text-center gap-y-2">
                  {/* Header row */}
                  <div className="text-sm font-semibold text-white tracking-wide">LAUNDRY</div>
                  <div className="text-sm font-semibold text-white tracking-wide">READY</div>
                  <div className="text-sm font-semibold text-white tracking-wide">PROCESS</div>
                  {/* Values row */}
                  <div className="text-2xl font-bold text-white">15</div>
                  <div className="text-2xl font-bold text-white">10</div>
                  <div className="text-2xl font-bold text-white">5</div>
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
