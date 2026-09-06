'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { OrderItem } from '@/types';
import { PlatformBadge } from '@/components/ui/Badge';
import { formatINR, formatDate } from '@/lib/utils';

interface RecentAlertsListProps {
  orders: OrderItem[];
  onResolve?: (orderId: string) => void;
}

export const RecentAlertsList: React.FC<RecentAlertsListProps> = ({ orders }) => {
  // Filter for returned or RTO orders
  const alertOrders = orders
    .filter((o) => o.status === 'returned' || o.status === 'rto')
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Urgent Return & RTO Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Claims & courier dispute window active</p>
          </div>
        </div>

        <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400 px-2.5 py-0.5 text-xs font-bold">
          {alertOrders.length} Pending
        </span>
      </div>

      <div className="space-y-3">
        {alertOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center space-y-2">
            <CheckCircle2 className="h-7 w-7 text-emerald-500 mx-auto" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No Pending Disputes or Return Losses
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              All processed orders are currently delivered without any active courier RTOs or claim disputes.
            </p>
          </div>
        ) : (
          alertOrders.map((order) => {
            const isRTO = order.status === 'rto';

            return (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${
                      isRTO
                        ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400'
                        : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400'
                    }`}
                  >
                    {isRTO ? <AlertTriangle className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{order.orderId}</span>
                      <PlatformBadge platform={order.platform} />
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isRTO
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                        }`}
                      >
                        {isRTO ? 'RTO Refused' : 'Buyer Return'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                      {order.productName} ({order.buyerCity}, {order.buyerState})
                    </p>

                    {order.returnReason && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        Reason: &ldquo;{order.returnReason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-200 dark:border-slate-800/80 sm:border-0 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{formatINR(order.sellingPrice)}</div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                      Fee Loss: {formatINR(Math.abs(order.netProfit))}
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Opening Claim Window for ${order.orderId} on ${order.platform === 'amazon' ? 'Amazon SAFE-T' : 'Flipkart SPF'}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs active:scale-95"
                  >
                    <span>File Claim</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

