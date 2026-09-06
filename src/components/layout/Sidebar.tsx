'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Sparkles, 
  Settings, 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import globalStore from '@/lib/store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  channel?: 'amazon' | 'flipkart' | 'ai';
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Amazon Portal',
    href: '/amazon',
    icon: Package,
    badge: 'SP-API',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-[#FF9900]/20 dark:text-[#FF9900] dark:border-[#FF9900]/30',
    channel: 'amazon',
  },
  {
    name: 'Flipkart Portal',
    href: '/flipkart',
    icon: ShoppingBag,
    badge: 'Seller API',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-[#2874F0]/20 dark:text-[#3b82f6] dark:border-[#2874F0]/30',
    channel: 'flipkart',
  },
  {
    name: 'AI Product Analyst',
    href: '/analyst',
    icon: Sparkles,
    badge: 'Gemini 1.5',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
    channel: 'ai',
  },
  {
    name: 'Settings & Integrations',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const [credentials, setCredentials] = useState(globalStore.getCredentials());

  useEffect(() => {
    // Refresh credentials status
    const updateCreds = () => {
      setCredentials(globalStore.getCredentials());
    };
    updateCreds();
    window.addEventListener('storage', updateCreds);
    return () => window.removeEventListener('storage', updateCreds);
  }, []);

  const isAmazonConnected = Boolean(credentials.amazon?.isConnected || credentials.amazon?.clientId);
  const isFlipkartConnected = Boolean(credentials.flipkart?.isConnected || credentials.flipkart?.appId);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm dark:shadow-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-slate-950">
                <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">EcomUnified</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-blue-500/20 text-indigo-700 dark:text-blue-400 border border-indigo-200 dark:border-blue-500/30">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Amazon • Flipkart • AI Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-indigo-600/10 text-indigo-700 dark:text-white border border-indigo-200 dark:border-blue-500/30 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? item.channel === 'amazon'
                          ? 'bg-amber-100 text-amber-700 dark:bg-[#FF9900]/20 dark:text-[#FF9900]'
                          : item.channel === 'flipkart'
                          ? 'bg-blue-100 text-blue-700 dark:bg-[#2874F0]/20 dark:text-[#3b82f6]'
                          : item.channel === 'ai'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-blue-500/20 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn(isActive && 'font-bold text-slate-900 dark:text-white')}>{item.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold border',
                        item.badgeColor
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 text-indigo-600 dark:text-blue-400" />}
                </div>

                {/* Active side indicator */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Channel Health Status Pill */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-400">
              <span>Channel Integration</span>
              <ShieldCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>

            <div className="space-y-2">
              <Link href="/settings" className="flex items-center justify-between text-xs group hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    isAmazonConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
                  )} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Amazon SP-API</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  isAmazonConnected 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {isAmazonConnected ? 'Connected' : 'Key Required'}
                </span>
              </Link>

              <Link href="/settings" className="flex items-center justify-between text-xs group hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    isFlipkartConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
                  )} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Flipkart Seller API</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  isFlipkartConnected 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {isFlipkartConnected ? 'Connected' : 'Key Required'}
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium">
            <span>Unified Store v1.2</span>
            <span>Currency: INR (₹)</span>
          </div>
        </div>
      </aside>
    </>
  );
};

