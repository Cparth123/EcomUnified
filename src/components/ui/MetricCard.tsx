import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changePercent?: number;
  changePeriod?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'emerald' | 'amber' | 'rose' | 'amazon' | 'flipkart' | 'purple';
  className?: string;
  badgeText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  changePercent,
  changePeriod = 'vs last period',
  icon,
  variant = 'default',
  className,
  badgeText,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return 'border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-sm dark:shadow-[0_0_20px_-8px_rgba(16,185,129,0.25)]';
      case 'amber':
        return 'border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-sm dark:shadow-[0_0_20px_-8px_rgba(245,158,11,0.25)]';
      case 'rose':
        return 'border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500/60 shadow-sm dark:shadow-[0_0_20px_-8px_rgba(244,63,94,0.25)]';
      case 'amazon':
        return 'border-amber-300 dark:border-[#FF9900]/30 hover:border-amber-400 dark:hover:border-[#FF9900]/60 shadow-sm dark:shadow-[0_0_20px_-8px_rgba(255,153,0,0.25)]';
      case 'flipkart':
        return 'border-blue-200 dark:border-[#2874F0]/30 hover:border-blue-400 dark:hover:border-[#2874F0]/60 shadow-sm dark:shadow-[0_0_20px_-8px_rgba(40,116,240,0.25)]';
      case 'purple':
        return 'border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/60 shadow-sm dark:shadow-[0_0_20px_-8px_rgba(168,85,247,0.25)]';
      default:
        return 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm';
    }
  };

  const getIconBackground = () => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'amber':
        return 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'rose':
        return 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      case 'amazon':
        return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-[#FF9900]/10 dark:text-[#FF9900] dark:border-[#FF9900]/20';
      case 'flipkart':
        return 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-[#2874F0]/10 dark:text-[#3b82f6] dark:border-[#2874F0]/20';
      case 'purple':
        return 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 transition-all duration-300 border shadow-sm',
        getVariantStyles(),
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </span>
            {badgeText && (
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {badgeText}
              </span>
            )}
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {value}
          </div>
        </div>

        {icon && (
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-xs', getIconBackground())}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || changePercent !== undefined) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {changePercent !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md text-[11px]',
                changePercent > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-transparent'
                  : changePercent < 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-transparent'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {changePercent > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : changePercent < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {Math.abs(changePercent)}%
            </span>
          )}

          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
              {subtitle}
            </span>
          )}

          {changePercent !== undefined && !subtitle && (
            <span className="text-slate-500 dark:text-slate-400">{changePeriod}</span>
          )}
        </div>
      )}
    </div>
  );
};

