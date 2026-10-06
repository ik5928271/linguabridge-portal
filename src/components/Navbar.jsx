import React, { useState } from 'react';
import { 
  Globe, 
  Headphones, 
  Users, 
  ShieldAlert, 
  Sparkles, 
  PhoneCall, 
  Layers, 
  Calendar, 
  BookOpen, 
  LayoutGrid, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ChevronDown,
  Zap,
  CreditCard,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  currentView, 
  setCurrentView,
  currentUser,
  theme = 'dark',
  onToggleTheme,
  onOpenAuth,
  onLogout,
  onOpenGlossary,
  onOpenSchedule,
  onOpenInterpreterApplication,
  onInstallPwa
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const scrollToSection = (sectionId) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
        
        {/* Brand Logo & Mobile Quick Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" onClick={() => setCurrentView('landing')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/25 ring-2 ring-brand-400/30">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                  theme === 'light'
                    ? 'bg-gradient-to-r from-slate-950 via-slate-800 to-brand-600 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent'
                }`}>
                  LinguaBridge
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  3-Way
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">Enterprise On-Demand Interpretation Portal</p>
            </div>
          </div>

          {/* Quick Actions for Mobile (< md) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/90 dark:border-slate-700 shadow-sm"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Glossary */}
            <button
              onClick={onOpenGlossary}
              aria-label="Glossary"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/90 dark:border-slate-700 shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </button>

            {/* Mobile Auth Button */}
            {!currentUser ? (
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-brand-600/25 border border-brand-400/40"
              >
                Sign In
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1 rounded-xl bg-slate-900 border border-slate-700"
                >
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover ring-1 ring-brand-400" />
                  ) : currentUser.avatarEmoji ? (
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                      {currentUser.avatarEmoji}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
                      {currentUser.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border-2 border-slate-700 shadow-2xl rounded-2xl p-2.5 space-y-1.5 text-xs z-50">
                    <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/60 rounded-xl space-y-1">
                      <p className="font-extrabold text-white text-xs truncate">{currentUser.name || 'User'}</p>
                      <p className="text-[11px] text-slate-300 truncate font-mono">{currentUser.email || ''}</p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentView(currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'interpreter' ? 'interpreter' : 'host');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-white font-bold flex items-center gap-2 transition"
                    >
                      <Users className="w-4 h-4 text-brand-400" />
                      <span>My Dashboard</span>
                    </button>
                    {onInstallPwa && (
                      <button
                        onClick={() => {
                          onInstallPwa();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-500/20 text-sky-400 font-bold flex items-center gap-2 transition"
                      >
                        <Zap className="w-4 h-4 text-sky-400" />
                        <span>Install Mobile App</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                        setCurrentView('landing');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 font-bold flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Navigation - Sleek Scrollable Pills on Mobile */}
        <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2 py-0.5">
          {!currentUser ? (
            /* 1. PUBLIC VISITOR NAVIGATION */
            <nav className="flex items-center gap-1 sm:gap-2 text-xs font-bold whitespace-nowrap">
              <button
                onClick={() => setCurrentView('landing')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  currentView === 'landing' 
                    ? 'text-white bg-slate-800/90 border border-slate-700 font-extrabold shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
              >
                Pricing & Minutes
              </button>
              {onOpenInterpreterApplication && (
                <button
                  onClick={onOpenInterpreterApplication}
                  className="sm:hidden px-3 py-1.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition font-bold"
                >
                  Apply as Interpreter
                </button>
              )}
            </nav>
          ) : currentUser?.role === 'admin' ? (
            /* 2. ADMIN USER NAVIGATION */
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-purple-300 dark:border-purple-500/40 shadow-inner whitespace-nowrap">
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  setCurrentView('admin');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
                <span>Admin Ops</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('host');
                  setCurrentView('host');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'host'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Client Portal</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('interpreter');
                  setCurrentView('interpreter');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'interpreter'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Interpreter</span>
              </button>
            </div>
          ) : currentUser?.role === 'interpreter' ? (
            /* 3. LOGGED-IN INTERPRETER NAVIGATION */
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-emerald-300 dark:border-emerald-500/30 whitespace-nowrap">
              <button
                onClick={() => {
                  setCurrentRole('interpreter');
                  setCurrentView('interpreter');
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              >
                <Headphones className="w-3.5 h-3.5 text-white" />
                <span>Interpreter Workbench</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              </button>
            </div>
          ) : (
            /* 4. LOGGED-IN CLIENT / PAYER NAVIGATION */
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-brand-300 dark:border-brand-500/30 whitespace-nowrap">
              <button
                onClick={() => {
                  setCurrentRole('host');
                  setCurrentView('host');
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-600/30"
              >
                <Users className="w-3.5 h-3.5 text-white" />
                <span>Client / Payer Dashboard</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Tools & Auth Suite (Desktop only, hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            aria-label="Toggle Dark / Light Theme"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-300/90 dark:border-slate-700 transition shadow-sm"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="inline text-xs font-bold text-slate-800">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="inline text-xs font-semibold text-slate-200">Light</span>
              </>
            )}
          </button>

          {/* Glossary button */}
          <button
            onClick={onOpenGlossary}
            title="Search Medical & Legal Glossaries"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-300/90 dark:border-slate-700 transition shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Glossary</span>
          </button>

          {/* Admin-only Demo Preview */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('split-demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                currentView === 'split-demo'
                  ? 'bg-gradient-to-r from-brand-500 to-indigo-600 text-white ring-2 ring-brand-400'
                  : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 dark:bg-gradient-to-r dark:from-brand-600/20 dark:to-indigo-600/20 dark:text-brand-300 dark:border-brand-500/30'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>3-Way Demo</span>
            </button>
          )}

          {/* AUTH SUITE */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition shadow-md cursor-pointer"
              >
                {currentUser.photoUrl ? (
                  <img src={currentUser.photoUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover ring-1 ring-brand-400" />
                ) : currentUser.avatarEmoji ? (
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                    {currentUser.avatarEmoji}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
                    {currentUser.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-black text-white leading-tight truncate max-w-[120px]">{currentUser.name || 'User'}</p>
                  <p className="text-[9.5px] text-slate-300 font-semibold capitalize">
                    {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role === 'interpreter' ? 'Certified Linguist' : 'Client / Payer'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-900 border-2 border-slate-700 shadow-2xl shadow-black rounded-2xl p-2.5 space-y-1.5 text-xs z-50">
                  <div className="px-3 py-2.5 border-b border-slate-800 bg-slate-950/60 rounded-xl space-y-1">
                    <p className="font-extrabold text-white text-xs truncate">{currentUser.name || 'User'}</p>
                    <p className="text-[11px] text-slate-300 truncate font-mono">{currentUser.email || ''}</p>
                    <span className="inline-block mt-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {currentUser?.role === 'admin' ? '👑 Admin Account' : currentUser?.role === 'interpreter' ? '🎧 Certified Linguist' : '💳 Client / Payer Account'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView(currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'interpreter' ? 'interpreter' : 'host');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-white font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-brand-400" />
                    <span>My Dashboard</span>
                  </button>

                  {onInstallPwa && (
                    <button
                      onClick={() => {
                        onInstallPwa();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-sky-500/20 text-sky-400 font-bold flex items-center gap-2 transition cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-sky-400" />
                      <span>Install Mobile App</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                      setCurrentView('landing');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onInstallPwa && (
                <button
                  onClick={onInstallPwa}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-400 text-xs font-bold border border-sky-500/30 transition shadow-sm cursor-pointer"
                  title="Install LinguaBridge on your Mobile or Desktop"
                >
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Install App</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (onOpenInterpreterApplication) onOpenInterpreterApplication();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 border border-emerald-400/30 transition transform hover:scale-105 cursor-pointer"
                title="Submit Interpreter Application & CV"
              >
                <Headphones className="w-3.5 h-3.5 text-white" />
                <span>Apply as Interpreter</span>
              </button>

              <button
                onClick={() => onOpenAuth('signin')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-brand-600/25 border border-brand-400/40 transition transform hover:scale-105 cursor-pointer"
                title="Sign In to Admin, Interpreter, or Client Portal"
              >
                <LogIn className="w-3.5 h-3.5 text-white" />
                <span>Sign In</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
