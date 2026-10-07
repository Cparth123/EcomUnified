'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Send,
  ExternalLink,
  Sparkles,
  TrendingDown,
  Trash2,
  Package,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppNotification } from '@/types/supplierSearch';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking single read:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">
            <Bell className="h-3.5 w-3.5" />
            <span>Alerts & Real-time Feeds</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time notifications on Amazon order matches, Telegram supplier price drops, and margin opportunities.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <CheckCheck className="h-4 w-4 text-indigo-500" /> Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-w-4xl">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">Loading alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
            <Bell className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Notifications</h3>
            <p className="text-xs text-slate-500">You're all caught up! New order matches will appear here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkSingleRead(notif.id)}
              className={cn(
                'rounded-2xl border p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm cursor-pointer',
                notif.isRead
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50 ring-1 ring-indigo-500/20'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    notif.type === 'order_match'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                  )}
                >
                  {notif.type === 'order_match' ? <Sparkles className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-slate-400 block pt-0.5">
                    {new Date(notif.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {notif.telegramPostUrl && (
                <a
                  href={notif.telegramPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Open Telegram</span>
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
