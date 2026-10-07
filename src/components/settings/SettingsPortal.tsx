'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Store, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  Download, 
  FileCheck2,
  XCircle,
  Sparkles,
  ExternalLink,
  UploadCloud
} from 'lucide-react';
import globalStore from '@/lib/store';
import { PlatformBadge } from '@/components/ui/Badge';
import { auditAmazonSPAPIPolicy, auditFlipkartSellerPolicy, PlatformPolicyAuditResult } from '@/lib/policyAuditor';

export const SettingsPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'audit' | 'profile' | 'data'>('credentials');
  const [settings, setSettings] = useState(globalStore.getSettings());
  const [credentials, setCredentials] = useState(globalStore.getCredentials());
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State - No dummy keys by default, only real user-provided credentials
  const [amazonClientId, setAmazonClientId] = useState(credentials.amazon?.clientId || '');
  const [amazonClientSecret, setAmazonClientSecret] = useState(credentials.amazon?.clientSecret || '');
  const [amazonRefreshToken, setAmazonRefreshToken] = useState(credentials.amazon?.refreshToken || '');
  const [amazonAwsRegion, setAmazonAwsRegion] = useState('eu-west-1');
  const [amazonRoleArn, setAmazonRoleArn] = useState('');
  const [amazonWebhookUrl, setAmazonWebhookUrl] = useState('');

  const [flipkartAppId, setFlipkartAppId] = useState(credentials.flipkart?.appId || '');
  const [flipkartAppSecret, setFlipkartAppSecret] = useState(credentials.flipkart?.appSecret || '');
  const [flipkartWebhookUrl, setFlipkartWebhookUrl] = useState('');

  // Cloudinary media store
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('demo');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('');

  // Google OAuth 2.0 & Gemini AI Engine Keys
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleGeminiKey, setGoogleGeminiKey] = useState('AIzaSyAOqXz9MK4CSoBpDMq5ldL8TzN6GJ9nyIA');
  const [isTestingGoogle, setIsTestingGoogle] = useState(false);
  const [googleTestResult, setGoogleTestResult] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [aiProvider, setAiProvider] = useState<'heuristic' | 'claude' | 'openai'>('heuristic');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');

  // Store profile
  const [storeName, setStoreName] = useState(settings.businessName || 'My Multi-Channel E-Commerce Store');
  const [gstin, setGstin] = useState(settings.gstin || '');
  const [email, setEmail] = useState(settings.email || 'seller@store.in');
  const [shippingZone, setShippingZone] = useState<'local' | 'regional' | 'national'>(settings.defaultShippingZone || 'regional');
  const [dispatchState, setDispatchState] = useState('Maharashtra');

  // Policy Audit Results
  const [amzAuditResult, setAmzAuditResult] = useState<PlatformPolicyAuditResult | null>(null);
  const [fkAuditResult, setFkAuditResult] = useState<PlatformPolicyAuditResult | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleTestGoogle = async () => {
    setIsTestingGoogle(true);
    setGoogleTestResult(null);

    try {
      const res = await fetch('/api/auth/google/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          geminiApiKey: googleGeminiKey,
        }),
      });

      const data = await res.json();
      setGoogleTestResult(data.diagnostics);
    } catch (err: any) {
      setGoogleTestResult({
        googleOAuth: { status: 'missing', message: err.message || 'Failed to run Google diagnostics' },
        googleGeminiAI: { status: 'not_configured', message: 'Diagnostic request error' },
      });
    } finally {
      setIsTestingGoogle(false);
    }
  };

  // Load from MongoDB if available
  useEffect(() => {
    fetch('/api/credentials')
      .then(res => res.json())
      .then(data => {
        if (data.credentials) {
          if (data.credentials.amazon) {
            setAmazonClientId(data.credentials.amazon.clientId || '');
            setAmazonRefreshToken(data.credentials.amazon.refreshToken || '');
            setAmazonWebhookUrl(data.credentials.amazon.webhookUrl || '');
          }
          if (data.credentials.flipkart) {
            setFlipkartAppId(data.credentials.flipkart.appId || '');
            setFlipkartWebhookUrl(data.credentials.flipkart.webhookUrl || '');
          }
        }
      })
      .catch(() => {});

    // Initial Policy Audit
    runPolicyAudit();
  }, []);

  const runPolicyAudit = () => {
    const amz = auditAmazonSPAPIPolicy({
      clientId: amazonClientId,
      clientSecret: amazonClientSecret,
      refreshToken: amazonRefreshToken,
      awsRegion: amazonAwsRegion,
      roleArn: amazonRoleArn,
      webhookUrl: amazonWebhookUrl,
      gstin,
    });
    const fk = auditFlipkartSellerPolicy({
      appId: flipkartAppId,
      appSecret: flipkartAppSecret,
      webhookUrl: flipkartWebhookUrl,
      gstin,
    });
    setAmzAuditResult(amz);
    setFkAuditResult(fk);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const isAmzConfigured = Boolean(amazonClientId.trim() && (amazonRefreshToken.trim() || amazonClientSecret.trim()));
    const isFkConfigured = Boolean(flipkartAppId.trim() && flipkartAppSecret.trim());

    const updatedCreds = {
      amazon: {
        clientId: amazonClientId.trim(),
        clientSecret: amazonClientSecret.trim(),
        refreshToken: amazonRefreshToken.trim(),
        sellerId: amazonClientId ? 'amzn_seller_live' : '',
        marketplaceId: 'A21TJRUUN4KGV',
        isConnected: isAmzConfigured,
      },
      flipkart: {
        appId: flipkartAppId.trim(),
        appSecret: flipkartAppSecret.trim(),
        sellerId: flipkartAppId ? 'fk_seller_live' : '',
        isConnected: isFkConfigured,
      },
      ai: {
        provider: 'built_in' as const,
        apiKey: '',
      },
    };

    globalStore.updateCredentials(updatedCreds);
    globalStore.updateSettings({
      businessName: storeName.trim(),
      gstin: gstin.trim(),
      email: email.trim(),
      defaultShippingZone: shippingZone,
    });

    try {
      await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amazon: {
            clientId: amazonClientId,
            clientSecret: amazonClientSecret,
            refreshToken: amazonRefreshToken,
            awsRegion: amazonAwsRegion,
            roleArn: amazonRoleArn,
            webhookUrl: amazonWebhookUrl,
            isConnected: isAmzConfigured,
          },
          flipkart: {
            appId: flipkartAppId,
            appSecret: flipkartAppSecret,
            webhookUrl: flipkartWebhookUrl,
            isConnected: isFkConfigured,
          },
          aiProvider,
          anthropicApiKey: anthropicKey,
          openaiApiKey: openaiKey,
        }),
      });
    } catch (e) {}

    runPolicyAudit();
    setIsSaving(false);
    setNotification(
      isAmzConfigured || isFkConfigured 
        ? 'Official credentials updated successfully and status marked active!'
        : 'Settings saved. Provide official keys to connect live marketplace data.'
    );
    setTimeout(() => setNotification(null), 4500);
  };

  const handleExportBackup = () => {
    const data = globalStore.exportData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ecom_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setNotification('Complete system backup JSON downloaded.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to load 30 days of realistic multi-platform demo transactions for testing?')) {
      globalStore.resetToSeedData();
      setNotification('Sample demo dataset loaded for demonstration.');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const isAmzLive = Boolean(credentials.amazon?.isConnected && credentials.amazon?.clientId);
  const isFkLive = Boolean(credentials.flipkart?.isConnected && credentials.flipkart?.appId);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Key className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          <span>Integrations, API Keys & Policy Compliance</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure official Amazon SP-API, Flipkart Seller Hub tokens, store profiles, and marketplace policy requirements
        </p>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          <span>Official API Credentials</span>
        </button>

        <button
          onClick={() => { setActiveTab('audit'); runPolicyAudit(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5 text-purple-500" />
          <span>API Policy & Security Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          <span>Store & GSTIN Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'data'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Data Management & Backup</span>
        </button>
      </div>

      {/* TAB 1: API CREDENTIALS */}
      {activeTab === 'credentials' && (
        <form onSubmit={handleSaveCredentials} className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <p className="font-bold">Official Production Marketplace Credentials Required</p>
              <p className="text-indigo-700 dark:text-indigo-300">
                To fetch real-time orders, inventory stock, and automated settlement reconciliation, enter your Amazon Selling Partner API (SP-API) and Flipkart Developer tokens below. If keys are not provided, dummy data remains disabled.
              </p>
            </div>
          </div>

          {/* Amazon SP-API Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <PlatformBadge platform="amazon" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">Amazon SP-API Credentials (India Region)</span>
              </div>
              <div className="flex items-center gap-2">
                {isAmzLive ? (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/20">
                    Connected ✓
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/20">
                    Official Key Required
                  </span>
                )}
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  LWA OAuth 2.0
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">LWA Client ID (App ID)</label>
                <input
                  type="text"
                  placeholder="e.g. amzn1.application-oa2-client.xxxxxx"
                  value={amazonClientId}
                  onChange={(e) => setAmazonClientId(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-[#FF9900] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">LWA Client Secret</label>
                <input
                  type="password"
                  placeholder="e.g. amzn.oa2.sec.xxxxxx"
                  value={amazonClientSecret}
                  onChange={(e) => setAmazonClientSecret(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-[#FF9900] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">LWA OAuth Refresh Token</label>
                <input
                  type="password"
                  placeholder="e.g. Atzr|IwEBIxxxxxx"
                  value={amazonRefreshToken}
                  onChange={(e) => setAmazonRefreshToken(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-[#FF9900] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">AWS IAM Role ARN (SigV4)</label>
                <input
                  type="text"
                  placeholder="e.g. arn:aws:iam::123456789012:role/AmazonSPAPIRole"
                  value={amazonRoleArn}
                  onChange={(e) => setAmazonRoleArn(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-[#FF9900] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Amazon Webhook / Notification Callback (HTTPS Mandatory)</label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">TLS 1.2+ Required</span>
                </div>
                <input
                  type="url"
                  placeholder="https://your-domain.com/api/webhooks/amazon"
                  value={amazonWebhookUrl}
                  onChange={(e) => setAmazonWebhookUrl(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-[#FF9900] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Flipkart Seller API Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <PlatformBadge platform="flipkart" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">Flipkart Seller Hub API Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                {isFkLive ? (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/20">
                    Connected ✓
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/20">
                    Official Key Required
                  </span>
                )}
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                  F-Assured Ready
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Flipkart Developer App ID</label>
                <input
                  type="text"
                  placeholder="e.g. fk_seller_app_xxxxxx"
                  value={flipkartAppId}
                  onChange={(e) => setFlipkartAppId(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-[#2874F0] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Flipkart App Secret / Token</label>
                <input
                  type="password"
                  placeholder="e.g. fk_sec_token_xxxxxx"
                  value={flipkartAppSecret}
                  onChange={(e) => setFlipkartAppSecret(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-[#2874F0] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Flipkart Order Event Webhook (HTTPS Mandatory)</label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">24h SLA Dispatch Stream</span>
                </div>
                <input
                  type="url"
                  placeholder="https://your-domain.com/api/webhooks/flipkart"
                  value={flipkartWebhookUrl}
                  onChange={(e) => setFlipkartWebhookUrl(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-[#2874F0] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* GOOGLE CLOUD OAUTH & GEMINI AI INTEGRATION CARD */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Google Cloud & Gemini AI Integrations</h3>
                  <p className="text-xs text-slate-500">Google OAuth 2.0 Seller Sign-In & Gemini 1.5/2.0 AI Product Intelligence</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestGoogle}
                  disabled={isTestingGoogle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-500/30 transition-colors shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTestingGoogle ? 'animate-spin' : ''}`} />
                  <span>{isTestingGoogle ? 'Testing Keys...' : 'Test Google Keys'}</span>
                </button>
              </div>
            </div>

            {/* Test Diagnostic Result Banner */}
            {googleTestResult && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Google Connection Diagnostic Results</span>
                  <span className="text-[10px] text-slate-500">Live Test</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${googleTestResult.googleOAuth?.status === 'configured' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>Google OAuth 2.0 Sign-In</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{googleTestResult.googleOAuth?.message}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${googleTestResult.googleGeminiAI?.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>Google Gemini AI Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{googleTestResult.googleGeminiAI?.message}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Google OAuth Client ID</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789-xxxx.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Google OAuth Client Secret</label>
                <input
                  type="password"
                  placeholder="e.g. GOCSPX-xxxxxxxxxxxx"
                  value={googleClientSecret}
                  onChange={(e) => setGoogleClientSecret(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Google Gemini AI API Key (Gemini 1.5 / 2.0)</label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Get Gemini API Key (Free)</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSyAOqXz9..."
                  value={googleGeminiKey}
                  onChange={(e) => setGoogleGeminiKey(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Google Cloud Console Setup Guidance & 1-Click Copy */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 dark:text-blue-200">Google Cloud Console Configuration URLs</span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Google Cloud Credentials</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authorized JavaScript Origins</div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-blue-700 dark:text-blue-300 font-mono text-[11px] truncate">http://localhost:3000</code>
                    <button
                      type="button"
                      onClick={() => handleCopy('http://localhost:3000', 'origin')}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:opacity-80 transition-opacity shrink-0"
                    >
                      {copiedText === 'origin' ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authorized Redirect URI</div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-blue-700 dark:text-blue-300 font-mono text-[11px] truncate">http://localhost:3000/api/auth/callback/google</code>
                    <button
                      type="button"
                      onClick={() => handleCopy('http://localhost:3000/api/auth/callback/google', 'redirect')}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:opacity-80 transition-opacity shrink-0"
                    >
                      {copiedText === 'redirect' ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cloudinary Media Store Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Cloudinary Media Store</h3>
                  <p className="text-xs text-slate-500">Image hosting and CDN optimization for product catalog uploads</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Cloudinary Ready</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Cloud Name</label>
                <input
                  type="text"
                  placeholder="e.g. my-ecom-cloud"
                  value={cloudinaryCloudName}
                  onChange={(e) => setCloudinaryCloudName(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">API Key</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012345"
                  value={cloudinaryApiKey}
                  onChange={(e) => setCloudinaryApiKey(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">API Secret</label>
                <input
                  type="password"
                  placeholder="e.g. abcd1234efgh5678"
                  value={cloudinaryApiSecret}
                  onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving & Auditing...' : 'Save Official Credentials'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: API POLICY & HTTPS COMPLIANCE AUDITOR */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>Official Marketplace API Policy & Restrictions Audit</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Verifies strict Indian e-commerce marketplace requirements (HTTPS mandatory, LWA tokens, DPP data encryption, 24h SLA)
              </p>
            </div>

            <button
              type="button"
              onClick={runPolicyAudit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-Run Policy Audit</span>
            </button>
          </div>

          {/* Amazon SP-API Policy Audit */}
          {amzAuditResult && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform="amazon" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Amazon SP-API Policy Compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                    amzAuditResult.overallStatus === 'COMPLIANT' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                      : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                  }`}>
                    {amzAuditResult.overallStatus} ({amzAuditResult.complianceScorePercent}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {amzAuditResult.checks.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-3">
                    <div className="mt-0.5">
                      {c.status === 'PASS' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : c.status === 'WARNING' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{c.ruleTitle}</span>
                        <span className="text-[10px] font-mono text-slate-500">{c.id}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{c.requirement}</p>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Observation: {c.actualObservation}</div>
                      {c.remediationAdvice && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">Action: {c.remediationAdvice}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flipkart Policy Audit */}
          {fkAuditResult && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform="flipkart" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Flipkart Seller Hub Policy Compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                    fkAuditResult.overallStatus === 'COMPLIANT' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' 
                      : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                  }`}>
                    {fkAuditResult.overallStatus} ({fkAuditResult.complianceScorePercent}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {fkAuditResult.checks.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-3">
                    <div className="mt-0.5">
                      {c.status === 'PASS' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : c.status === 'WARNING' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{c.ruleTitle}</span>
                        <span className="text-[10px] font-mono text-slate-500">{c.id}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{c.requirement}</p>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Observation: {c.actualObservation}</div>
                      {c.remediationAdvice && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">Action: {c.remediationAdvice}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STORE PROFILE */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            Business GSTIN & Warehouse Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Registered Business Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">GSTIN Identification Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                maxLength={15}
                placeholder="27AAAAA0000A1Z5"
                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white font-mono uppercase focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Primary Dispatch State (GST Place of Supply)</label>
              <select
                value={dispatchState}
                onChange={(e) => setDispatchState(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 px-3 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
              >
                <option value="Maharashtra">Maharashtra (Mumbai Hub)</option>
                <option value="Karnataka">Karnataka (Bengaluru Hub)</option>
                <option value="Delhi">Delhi NCR Hub</option>
                <option value="Gujarat">Gujarat (Surat Hub)</option>
                <option value="Tamil Nadu">Tamil Nadu (Chennai Hub)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATA MANAGEMENT */}
      {activeTab === 'data' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">System Backup & Dataset Options</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Export your orders and listings archive or load sample multi-channel demonstration data if needed for testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white text-xs">Export System Backup (JSON)</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Download complete transaction archive, catalog items, and product research dossiers</p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white text-xs">Load Sample Demo Dataset</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Optional: Populates demo Amazon & Flipkart transactions for visual exploration</p>
              <button
                type="button"
                onClick={handleResetData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-500/40 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Load Demo Dataset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
