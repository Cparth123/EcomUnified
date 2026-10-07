'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  RefreshCw,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutomationSettings } from '@/types/supplierSearch';

export default function AmazonIntegrationPage() {
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Form
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [marketplaceId, setMarketplaceId] = useState('A21TJRUUN4KGV'); // Amazon India

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/automation/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        if (data.settings.isAmazonConnected) {
          setSellerId('A2M9XXXXX94');
          setClientId('amzn1.application-oa2-client.xxxxxx');
          setRefreshToken('Atzr|IwEBIAxxxxxxx');
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/integrations/amazon/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          refreshToken,
          sellerId,
          marketplaceId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus({
          success: true,
          message: data.message || 'Amazon Selling Partner API (SP-API) connected successfully!',
        });
        fetchSettings();
      } else {
        setTestStatus({
          success: false,
          message: data.error || 'Connection failed.',
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || 'Failed to connect.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Amazon Seller Account?')) return;
    try {
      const res = await fetch('/api/integrations/amazon/disconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchSettings();
        setTestStatus({
          success: true,
          message: 'Amazon Seller Account disconnected.',
        });
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  };

  const isConnected = settings?.isAmazonConnected;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
            <Package className="h-3.5 w-3.5" />
            <span>Marketplace Integrations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Amazon Selling Partner (SP-API)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect your Amazon Seller Central account to unlock automatic order monitoring and instant Telegram supplier sourcing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings/automation"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Zap className="h-4 w-4 text-indigo-500" /> Automation Rules
          </Link>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-[#FF9900] shadow-sm">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Amazon Seller Central Status
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  )}
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isConnected ? 'Connected & Active (SP-API)' : 'Not Connected (Manual Mode Active)'}
                </span>
              </div>
            </div>
          </div>

          {isConnected && (
            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-colors"
              >
                <span>View Order Pipeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={handleDisconnect}
                className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {testStatus && (
          <div
            className={cn(
              'mt-6 flex items-center gap-3 rounded-2xl p-4 text-xs font-bold border',
              testStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300'
            )}
          >
            {testStatus.success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span>{testStatus.message}</span>
          </div>
        )}

        {/* SP-API Credentials Configuration Form */}
        <form onSubmit={handleConnect} className="mt-8 space-y-6 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-500" />
            <span>Selling Partner API Credentials (LWA OAuth)</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Marketplace
              </label>
              <select
                value={marketplaceId}
                onChange={(e) => setMarketplaceId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="A21TJRUUN4KGV">Amazon India (Amazon.in - A21TJRUUN4KGV)</option>
                <option value="ATVPDKIKX0DER">Amazon US (Amazon.com - ATVPDKIKX0DER)</option>
                <option value="A1F83G8C2ARO7P">Amazon UK (Amazon.co.uk - A1F83G8C2ARO7P)</option>
                <option value="A1PA6795UKMFR9">Amazon Germany (Amazon.de - A1PA6795UKMFR9)</option>
                <option value="A2VIGQ35RCS4UG">Amazon UAE (Amazon.ae - A2VIGQ35RCS4UG)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Merchant / Seller ID
              </label>
              <input
                type="text"
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                placeholder="e.g. A2M9XXXXX94"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                LWA Client ID (App Client ID)
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="amzn1.application-oa2-client.xxxxxxxxxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                LWA Client Secret
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                LWA Refresh Token
              </label>
              <input
                type="password"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                placeholder="Atzr|IwEBIAxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              <span>{isSaving ? 'Testing Connection...' : 'Save & Test SP-API Connection'}</span>
            </button>
          </div>
        </form>

        {/* Security & Data Retention Notice */}
        <div className="mt-8 rounded-2xl bg-slate-50 dark:bg-slate-950 p-5 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Lock className="h-4 w-4 text-indigo-500" />
            <span>Strict Security & Amazon SP-API Compliance</span>
          </div>
          <p>
            All Amazon tokens and credentials are securely encrypted with AES-256 before storage. Customer Personal Identifiable Information (PII) is not stored permanently in accordance with Amazon Selling Partner Data Protection Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
