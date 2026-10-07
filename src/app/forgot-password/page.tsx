'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  KeyRound, 
  Mail, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ArrowLeft,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetData, setResetData] = useState<{ token: string; link: string } | null>(null);

  // Reset form states (Step 2)
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Step 1: Request Reset Token
  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate reset request');
      }

      setResetData({
        token: data.resetToken,
        link: data.resetLink,
      });
      setTokenInput(data.resetToken);
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenInput,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setResetSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          <KeyRound className="h-3.5 w-3.5" />
          <span>Account Recovery & Security</span>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight">
          Forgot Password
        </h2>
        <p className="text-xs text-slate-400">
          Recover access to your unified seller store and MongoDB workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Password Reset Successful!</h3>
              <p className="text-xs text-slate-400">
                Your new password has been securely saved to MongoDB. Redirecting to login...
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                <span>Click here if not redirected automatically</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : !resetData ? (
            /* STEP 1: Request Password Reset */
            <form onSubmit={handleRequestToken} className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed text-xs">
                Enter your registered seller email address below. We'll generate a secure reset token for your account.
              </p>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="seller@yourstore.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white font-extrabold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                <span>{isLoading ? 'Generating Token...' : 'Generate Reset Token'}</span>
              </button>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <Link href="/login" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Login</span>
                </Link>
                <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold">
                  Create New Account
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: Enter New Password */
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Reset Token Generated!</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 break-all bg-slate-950 p-2 rounded-lg border border-slate-800 mt-1">
                  Token: {resetData.token.substring(0, 16)}...
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Reset Token</label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  required
                  className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">New Password (Min 6 chars)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-extrabold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>{isResetting ? 'Updating Password...' : 'Save New Password & Login'}</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setResetData(null)}
                  className="hover:underline text-slate-400"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
