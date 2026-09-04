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
  onOpenSchedule
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
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setCurrentView('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/25 ring-2 ring-brand-400/30">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-extrabold tracking-tight ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-slate-950 via-slate-800 to-brand-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent'
              }`}>
                LinguaBridge
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                3-Way Connect
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enterprise On-Demand Interpretation Portal</p>
          </div>
        </div>

        {/* Center Navigation - Intelligently adapts based on user role! */}
        {!currentUser ? (
          /* 1. PUBLIC VISITOR NAVIGATION (No internal dashboards exposed) */
          <nav className="flex items-center gap-1 sm:gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentView === 'landing' ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10 font-bold' : 'hover:text-brand-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="px-3 py-1.5 rounded-lg hover:text-brand-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50 transition"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3 py-1.5 rounded-lg hover:text-brand-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50 transition"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="px-3 py-1.5 rounded-lg hover:text-brand-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50 transition"
            >
              Pricing & Minutes
            </button>
          </nav>
        ) : currentUser?.role === 'admin' ? (
          /* 2. ADMIN USER NAVIGATION (Master access to all dashboards) */
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-purple-500/40 shadow-inner">
            <button
              onClick={() => {
                setCurrentRole('admin');
                setCurrentView('admin');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
              <span>Admin Operations</span>
            </button>

            <button
              onClick={() => {
                setCurrentRole('host');
                setCurrentView('host');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'host'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Interpreter</span>
            </button>
          </div>
        ) : currentUser?.role === 'interpreter' ? (
          /* 3. LOGGED-IN INTERPRETER NAVIGATION */
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-emerald-500/30">
            <button
              onClick={() => {
                setCurrentRole('interpreter');
                setCurrentView('interpreter');
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Interpreter Workbench</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            </button>
          </div>
        ) : (
          /* 4. LOGGED-IN CLIENT / PAYER NAVIGATION */
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-brand-500/30">
            <button
              onClick={() => {
                setCurrentRole('host');
                setCurrentView('host');
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white shadow-md shadow-brand-600/30"
            >
              <Users className="w-3.5 h-3.5" />
              <span>My Client / Payer Dashboard</span>
            </button>
          </div>
        )}

        {/* Right Tools & Auth Suite */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Dark / Light Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            aria-label="Toggle Dark / Light Theme"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 transition shadow-sm"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden xl:inline text-[11px] font-bold text-slate-800">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline text-[11px] font-semibold text-slate-300">Light</span>
              </>
            )}
          </button>

          {/* Terminology Glossary button */}
          <button
            onClick={onOpenGlossary}
            title="Search Medical & Legal Glossaries"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium border border-slate-300 dark:border-slate-700 transition shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="hidden sm:inline">Glossary</span>
          </button>

          {/* Admin-only Demo Preview */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('split-demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                currentView === 'split-demo'
                  ? 'bg-gradient-to-r from-brand-500 to-indigo-600 text-white ring-2 ring-brand-400'
                  : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-200 dark:bg-gradient-to-r dark:from-brand-600/20 dark:to-indigo-600/20 dark:text-brand-300 border dark:border-brand-500/30'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>3-Way Demo</span>
            </button>
          )}

          {/* AUTH SUITE: Sign In & Sign Up for visitors OR User Profile for authenticated users */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[110px]">{currentUser.name || 'User'}</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 capitalize">
                    {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role === 'interpreter' ? 'Interpreter' : 'Client / Payer'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 glass-panel p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-1 text-xs z-50">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email || ''}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-300">
                      {currentUser?.role === 'admin' ? '👑 Admin Account' : currentUser?.role === 'interpreter' ? '🎧 Certified Linguist' : '💳 Client / Payer Account'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView(currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'interpreter' ? 'interpreter' : 'host');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition"
                  >
                    <Users className="w-3.5 h-3.5 text-brand-500" />
                    <span>My Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                      setCurrentView('landing');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Visitor Authentication Actions */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-brand-500/25 transition transform hover:scale-105"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
