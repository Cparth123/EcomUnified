'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatINR } from '@/lib/utils';

interface RevenueProfitChartProps {
  data: {
    date: string;
    revenue: number;
    netProfit: number;
    fees: number;
    orders: number;
  }[];
}

export const RevenueProfitChart: React.FC<RevenueProfitChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'all' | 'revenue' | 'profit'>('all');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-4 shadow-xl backdrop-blur-md text-xs space-y-2">
          <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}:</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {entry.name === 'Orders' ? entry.value : formatINR(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 backdrop-blur-md shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Revenue vs Net Profit Trend</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Daily Aggregation)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare gross marketplace sales against real pocketed profit after fee deductions.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Streams
          </button>
          <button
            onClick={() => setViewMode('revenue')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'revenue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setViewMode('profit')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              viewMode === 'profit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Net Profit
          </button>
        </div>
      </div>

      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
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
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />

            {(viewMode === 'all' || viewMode === 'revenue') && (
              <Area
                type="monotone"
                dataKey="revenue"
                name="Gross Revenue"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            )}

            {(viewMode === 'all' || viewMode === 'profit') && (
              <Area
                type="monotone"
                dataKey="netProfit"
                name="Net Profit"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            )}

            {viewMode === 'all' && (
              <Area
                type="monotone"
                dataKey="fees"
                name="Platform Deductions"
                stroke="#f59e0b"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorFees)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

