import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn,
  AlertTriangle,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import globalStore from '@/lib/store';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  onSyncChannels?: () => void;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onSyncChannels,
  isSyncing: propIsSyncing,
}) => {
  const router = useRouter();
  const [isLocalSyncing, setIsLocalSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLiveData, setIsLiveData] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const isSyncing = propIsSyncing ?? isLocalSyncing;

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      setIsDark(false);
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Check auth status
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    // Check backend health & live data mode
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
        setIsLiveData(data.isLiveData || false);
        setIsDbConnected(data.isDatabaseConnected || false);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('app_theme', 'light');
    } else {
      setIsDark(true);
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    }
  };

  const handleGlobalSync = () => {
    if (onSyncChannels) {
      onSyncChannels();
    } else {
      setIsLocalSyncing(true);
      setTimeout(() => {
        setIsLocalSyncing(false);
        setSyncMessage('Marketplace sync completed.');
        setTimeout(() => setSyncMessage(null), 4000);
      }, 1500);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Mobile menu button + Left Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Global Search ASIN, FSN, SKU, Order ID..."
              className="w-full h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>

          {/* Sync Button */}
          <button
            onClick={handleGlobalSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            title="Sync all channels"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 dark:text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* User Profile / Auth Toggle */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {user.name ? user.name[0] : 'S'}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-bold text-slate-900 dark:text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{user.storeName || 'Seller'}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Seller Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Sync toast */}
      {syncMessage && (
        <div className="absolute top-16 right-6 p-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-slide-up z-50">
          <CheckCircle2 className="h-4 w-4" />
          <span>{syncMessage}</span>
        </div>
      )}
    </header>
  );
};
