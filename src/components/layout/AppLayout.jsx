"use client";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import { authApi } from '../../api/authApi';
import logo from '../../../src/assets/logo.png';
import NextImage from '../common/NextImage';

export default function AppLayout({ children }) {
  const { user, logout, setAuth, token } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => router.pathname.startsWith(path);
  const isDashboard = router.pathname === '/app/dashboard';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col md:flex-row">
      {/* Mobile header with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 z-45 gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center flex-1">
          <div className="h-8 w-8 flex items-center justify-center">
            <NextImage src={logo.src} alt="Logo" width={28} height={28} className="h-7 w-7" />
          </div>
          <div className="font-bold text-sm text-slate-900 ml-2">FormCraft</div>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 fixed md:static top-16 md:top-0 left-0 md:w-64 w-64 border-r border-slate-700 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col h-[calc(100vh-64px)] md:h-screen z-40`}>
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-700 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="h-16 w-16 flex items-center justify-center text-lg font-bold ">
              <NextImage src={logo.src} alt="Logo" width={56} height={56} className="h-14 w-14" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold tracking-tight text-base text-white">FormCraft</div>
              <div className="text-xs text-slate-400"></div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-4 md:mt-6 px-2 md:px-3 flex flex-col gap-1 md:gap-2 flex-1">
          <Link href="/app/dashboard" className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${isActive('/app/dashboard') ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Home</span>
          </Link>

          <Link href="/app/forms" className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${isActive('/app/forms') ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>My Forms</span>
          </Link>
          <Link href="/app/templates" className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${isActive('/app/templates') ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <span>Templates</span>
          </Link>

          <Link href="/app/analytics" className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${isActive('/app/analytics') ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18M4 10v8M18 6v12" />
            </svg>
            <span>Analytics</span>
          </Link>

          <Link href="/app/settings" className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${isActive('/app/settings') ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
            </svg>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-sm font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/auth/login');
            }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-600 text-slate-300 hover:border-red-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col w-full md:h-screen mt-16 md:mt-0">
        <UseAuthLoader />
        {isDashboard && (
          <header className="h-auto md:h-20 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-8 py-4 md:py-0 bg-white/70 backdrop-blur-sm flex-shrink-0 gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Home</h1>
              <p className="text-sm md:text-base text-slate-600">Manage your forms and view performance.</p>
            </div>
            <Link
              href="/app/forms/builder/new"
              className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center gap-2 justify-center md:justify-start text-sm md:text-base"
            >
              <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Form
            </Link>
          </header>
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

// fetch current user if token exists
function UseAuthLoader() {
  const { user, token, setAuth } = useAuthStore();
  useEffect(() => {
    if (!user && token) {
      authApi.me().then((res) => {
        if (res?.data) setAuth({ user: res.data, token });
      }).catch(() => {});
    }
  }, [user, token, setAuth]);
  return null;
}
