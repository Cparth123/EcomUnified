'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatINR } from '@/lib/utils';

interface PlatformComparisonBarChartProps {
  amazon: {
    orders: number;
    revenue: number;
    fees: number;
    netProfit: number;
    returns: number;
    rto: number;
  };
  flipkart: {
    orders: number;
    revenue: number;
    fees: number;
    netProfit: number;
    returns: number;
    rto: number;
  };
}

export const PlatformComparisonBarChart: React.FC<PlatformComparisonBarChartProps> = ({
  amazon,
  flipkart,
}) => {
  const financialData = [
    {
      metric: 'Gross Revenue',
      Amazon: amazon.revenue,
      Flipkart: flipkart.revenue,
    },
    {
      metric: 'Platform Fees',
      Amazon: amazon.fees,
      Flipkart: flipkart.fees,
    },
    {
      metric: 'Net Profit',
      Amazon: amazon.netProfit,
      Flipkart: flipkart.netProfit,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-4 shadow-xl backdrop-blur-md text-xs space-y-2">
          <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}:</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{formatINR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const amazonMargin = amazon.revenue > 0 ? ((amazon.netProfit / amazon.revenue) * 100).toFixed(1) : '0';
  const flipkartMargin = flipkart.revenue > 0 ? ((flipkart.netProfit / flipkart.revenue) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform-wise Comparison</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Amazon India vs Flipkart Seller revenue & fee capture
          </p>
        </div>

        {/* Quick margin badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-[#FF9900]/15 dark:text-[#FF9900] dark:border-[#FF9900]/30">
            AMZ: {amazonMargin}% Margin
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 dark:bg-[#2874F0]/15 dark:text-[#3b82f6] dark:border-[#2874F0]/30">
            FK: {flipkartMargin}% Margin
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financialData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
            <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            <Bar dataKey="Amazon" fill="#FF9900" radius={[6, 6, 0, 0]} maxBarSize={45} />
            <Bar dataKey="Flipkart" fill="#2874F0" radius={[6, 6, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Micro Stats Footer */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between font-bold text-amber-700 dark:text-[#FF9900] mb-1">
            <span>Amazon</span>
            <span>{amazon.orders} Orders</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Returns / RTO:</span>
            <span className="text-slate-900 dark:text-white font-semibold">{amazon.returns} / {amazon.rto}</span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between font-bold text-blue-700 dark:text-[#3b82f6] mb-1">
            <span>Flipkart</span>
            <span>{flipkart.orders} Orders</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Returns / RTO:</span>
            <span className="text-slate-900 dark:text-white font-semibold">{flipkart.returns} / {flipkart.rto}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

