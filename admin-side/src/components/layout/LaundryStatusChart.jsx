import React from 'react';

const LaundryStatusChart = () => {
  const chartData = [
    { day: 'Mon', value: 5, color: 'bg-red-700' },
    { day: 'Tues', value: 25, color: 'bg-green-600' },
    { day: 'Wens', value: 35, color: 'bg-blue-400' },
    { day: 'Thurs', value: 45, color: 'bg-teal-700' },
    { day: 'Fri', value: 40, color: 'bg-green-400' },
    { day: 'Sat', value: 50, color: 'bg-blue-300' },
    { day: 'Sun', value: 60, color: 'bg-blue-800' },
  ];

  const maxValue = Math.max(...chartData.map(item => item.value));

  return (
    <div className="w-full">
      {/* Y-axis labels */}
      <div className="flex h-80">
        <div className="flex flex-col justify-between pr-4 text-sm text-slate-600 font-medium">
          {[100, 95, 85, 75, 65, 55, 45, 35, 25, 15, 10, 5, 0].map((value) => (
            <div key={value} className="h-6 flex items-center">
              {value}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[100, 95, 85, 75, 65, 55, 45, 35, 25, 15, 10, 5, 0].map((value) => (
              <div
                key={value}
                className="absolute w-full border-t border-slate-200"
                style={{ top: `${((100 - value) / 100) * 100}%` }}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between h-full px-4">
            {chartData.map((item, index) => (
              <div key={item.day} className="flex flex-col items-center">
                <div
                  className={`w-12 ${item.color} rounded-t-lg transition-all duration-300 hover:opacity-80 shadow-md`}
                  style={{
                    height: `${(item.value / maxValue) * 100}%`,
                    minHeight: '20px'
                  }}
                />
                <div className="mt-2 text-sm font-medium text-slate-700">
                  {item.day}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaundryStatusChart;
