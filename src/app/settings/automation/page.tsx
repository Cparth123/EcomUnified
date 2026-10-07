'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Package,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Bell,
  Send,
  RefreshCw,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutomationSettings } from '@/types/supplierSearch';

export default function AutomationSettingsPage() {
  const [settings, setSettings] = useState<AutomationSettings>({
    isAmazonConnected: true,
    autoOrderMonitoring: true,
    autoSearchTelegram: true,
    minMatchScore: 80,
    onlyInStockSuppliers: false,
    maxTelegramResults: 50,
    useGeminiForMatching: true,
    syncIntervalMinutes: 15,
    inAppNotifications: true,
    emailNotifications: false,
    telegramNotifications: false,
    telegramAlertChatId: '',
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/automation/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedFeedback(false);
    try {
      const res = await fetch('/api/automation/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">
            <Zap className="h-3.5 w-3.5" />
            <span>Automation Engine Rules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Amazon Auto Mode & Sourcing Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure automated order detection, Telegram supplier query triggers, accuracy thresholds, and notification routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/integrations/amazon"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Package className="h-4 w-4 text-amber-500" /> Amazon SP-API Status
          </Link>
        </div>
      </div>

      {savedFeedback && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Automation settings updated successfully.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Section 1: Order Monitoring & Auto Search */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-500" />
            <span>Order Monitoring & Telegram Sourcing Pipeline</span>
          </h2>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-slate-900 dark:text-white">
                  Automatic Order Monitoring (Amazon Auto Mode)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Periodically synchronize unshipped Amazon orders via Selling Partner API.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoOrderMonitoring}
                onChange={(e) => setSettings({ ...settings, autoOrderMonitoring: e.target.checked })}
                className="h-5 w-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-slate-900 dark:text-white">
                  Automatically Search Telegram on New Order
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Trigger instant multimodal search across Surat & Delhi channels when an order arrives.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSearchTelegram}
                onChange={(e) => setSettings({ ...settings, autoSearchTelegram: e.target.checked })}
                className="h-5 w-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-slate-900 dark:text-white">
                  Only Show In-Stock Suppliers
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Exclude posts that mention sold out or finished stock status.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.onlyInStockSuppliers}
                onChange={(e) => setSettings({ ...settings, onlyInStockSuppliers: e.target.checked })}
                className="h-5 w-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-slate-900 dark:text-white">
                  Use Gemini AI for Complex Match Verification
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Use Gemini multimodal reasoning when post format is messy or unstructured.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.useGeminiForMatching}
                onChange={(e) => setSettings({ ...settings, useGeminiForMatching: e.target.checked })}
                className="h-5 w-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Thresholds & Parameters */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
            <span>Search Thresholds & Intervals</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Min Match Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Minimum Match Score Threshold
                </label>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                  {settings.minMatchScore}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                step={5}
                value={settings.minMatchScore}
                onChange={(e) => setSettings({ ...settings, minMatchScore: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Suppliers below this score will not be automatically assigned as top match.
              </p>
            </div>

            {/* Sync Interval */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Order Polling Sync Interval
              </label>
              <select
                value={settings.syncIntervalMinutes}
                onChange={(e) => setSettings({ ...settings, syncIntervalMinutes: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value={5}>Every 5 minutes (Real-time)</option>
                <option value={15}>Every 15 minutes (Recommended)</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 1 hour</option>
              </select>
            </div>

            {/* Max Results */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Maximum Telegram Results to Collect
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={settings.maxTelegramResults}
                onChange={(e) => setSettings({ ...settings, maxTelegramResults: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notification Alerts */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-500" />
            <span>Alert & Notification Channels</span>
          </h2>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-slate-900 dark:text-white">
                  In-App Notification Center
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Notify on dashboard when a cheaper wholesale supplier is discovered.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.inAppNotifications}
                onChange={(e) => setSettings({ ...settings, inAppNotifications: e.target.checked })}
                className="h-5 w-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-slate-900 dark:text-white">
                  Telegram Bot Broadcast Alert
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Forward supplier matches directly to your personal Telegram chat or channel.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.telegramNotifications}
                onChange={(e) => setSettings({ ...settings, telegramNotifications: e.target.checked })}
                className="h-5 w-5 rounded accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Automation Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
