'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  Key,
  X
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showGoogleInfo, setShowGoogleInfo] = useState(false);
  const [googleConfig, setGoogleConfig] = useState<{ isConfigured: boolean; redirectUri: string } | null>(null);

  useEffect(() => {
    // Check Google OAuth configuration status
    fetch('/api/auth/google/url')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGoogleConfig({
            isConfigured: data.isConfigured,
            redirectUri: data.redirectUri,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccess(`Welcome back, ${data.user.name}! Redirecting...`);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      // 1. Check if Google OAuth 2.0 URL is live and configured
      const urlRes = await fetch('/api/auth/google/url?state=seller_login');
      const urlData = await urlRes.json();

      if (urlData.success && urlData.url) {
        // Redirect to Google's official OAuth consent screen
        setSuccess('Connecting to Google OAuth...');
        window.location.href = urlData.url;
        return;
      }

      // 2. Fallback to Direct Google Seller Account Sign-In / Demo
      const promptEmail = email && email.includes('@') ? email : 'google.seller@gmail.com';
      const promptName = promptEmail.split('@')[0].replace('.', ' ').toUpperCase();

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: promptEmail,
          name: promptName,
          googleId: `goog_${Date.now()}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(promptEmail)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google Sign-In failed');
      }

      setSuccess(`Signed in with Google as ${data.user.name}! Redirecting...`);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('seller@omnitrade.in');
    setPassword('demo123456');
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'seller@omnitrade.in', password: 'demo123456' }),
      });

      const data = await res.json();
      setSuccess('Logged in as Demo Seller! Redirecting...');
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Multi-Platform Seller Security</span>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight">
          Seller Account Login
        </h2>
        <p className="text-xs text-slate-400">
          Access your unified orders, dynamic MongoDB data, and margin analytics
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm text-xs group"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting Google...' : 'Sign in with Google'}</span>
            </button>

            {/* Google OAuth Config Helper Indicator */}
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${googleConfig?.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {googleConfig?.isConfigured ? 'Google OAuth Active' : 'Google Demo Mode'}
              </span>
              <button
                type="button"
                onClick={() => setShowGoogleInfo(!showGoogleInfo)}
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <Info className="h-3 w-3" />
                <span>Google Setup Keys</span>
              </button>
            </div>
          </div>

          {/* Google Keys Setup Instructions Popup */}
          {showGoogleInfo && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 text-xs space-y-2.5 animate-in fade-in-50">
              <div className="flex items-center justify-between text-white font-bold">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Key className="h-4 w-4" />
                  <span>Google OAuth 2.0 Configuration</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleInfo(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                To connect your official Google Cloud Project keys, add the following variables to your <code className="text-amber-300 font-mono">.env.local</code> file:
              </p>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                <div>GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com</div>
                <div>GOOGLE_CLIENT_SECRET=your_secret</div>
                <div>GOOGLE_REDIRECT_URI={googleConfig?.redirectUri || 'http://localhost:3000/api/auth/callback/google'}</div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>Authorized Redirect URI:</span>
                <code className="text-blue-300 select-all font-mono">/api/auth/callback/google</code>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Or email login
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Seller Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="seller@yourstore.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-10 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:opacity-90 text-white font-extrabold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full h-10 rounded-xl bg-slate-950 hover:bg-slate-850 text-purple-300 font-bold border border-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>1-Click Demo Seller Login (Instant Access)</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold">
              Register New Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
