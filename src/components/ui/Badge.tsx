import React from 'react';
import { cn } from '@/lib/utils';
import { OrderStatus, PlatformType } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'delivered':
    case 'success':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Delivered
        </span>
      );
    case 'returned':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Returned
        </span>
      );
    case 'rto':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          RTO (Return to Origin)
        </span>
      );
    case 'cancelled':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Cancelled
        </span>
      );
    case 'in_transit':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30', className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          In Transit
        </span>
      );
    default:
      return (
        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700', className)}>
          {status}
        </span>
      );
  }
};

interface PlatformBadgeProps {
  platform: PlatformType | 'amazon' | 'flipkart' | 'meesho' | 'both';
  className?: string;
  showLogo?: boolean;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, className }) => {
  const p = platform.toLowerCase();

  if (p === 'amazon') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/40', className)}>
        <span className="font-extrabold">a</span> Amazon
      </span>
    );
  }

  if (p === 'flipkart') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#2874F0]/15 text-[#3b82f6] border border-[#2874F0]/40', className)}>
        <span className="font-extrabold italic text-[#FFE500]">fk</span> Flipkart
      </span>
    );
  }

  if (p === 'meesho') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-pink-500/15 text-pink-400 border border-pink-500/40', className)}>
        <span>🛍️</span> Meesho
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30', className)}>
      <span>⚡</span> Multi-Platform
    </span>
  );
};
