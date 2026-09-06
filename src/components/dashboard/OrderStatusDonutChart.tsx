'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OrderStatusDonutChartProps {
  delivered: number;
  returned: number;
  rto: number;
  cancelled: number;
}

export const OrderStatusDonutChart: React.FC<OrderStatusDonutChartProps> = ({
  delivered,
  returned,
  rto,
  cancelled,
}) => {
  const total = delivered + returned + rto + cancelled;

  const data = [
    { name: 'Delivered', value: delivered, color: '#10b981', percent: total > 0 ? ((delivered / total) * 100).toFixed(1) : '0' },
    { name: 'Returned', value: returned, color: '#f43f5e', percent: total > 0 ? ((returned / total) * 100).toFixed(1) : '0' },
    { name: 'RTO (Refused)', value: rto, color: '#f59e0b', percent: total > 0 ? ((rto / total) * 100).toFixed(1) : '0' },
    { name: 'Cancelled', value: cancelled, color: '#94a3b8', percent: total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-300">
            Units: <span className="font-bold text-slate-900 dark:text-white">{item.value}</span> ({item.percent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between shadow-sm">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Status Breakdown</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Delivery success vs returns & RTO friction rate
        </p>
      </div>

      <div className="relative h-56 w-full my-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={total > 0 ? data : [{ name: 'No Orders', value: 1, color: '#cbd5e1', percent: '0' }]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={total > 0 ? 4 : 0}
              dataKey="value"
            >
              {(total > 0 ? data : [{ name: 'No Orders', value: 1, color: '#cbd5e1', percent: '0' }]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered Total Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 dark:text-white">{total}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Orders</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-900">
            <div className="flex items-center gap-1.5 truncate pr-1">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.name}</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white flex-shrink-0">
              {item.value} <span className="text-[10px] text-slate-400 font-normal">({item.percent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

