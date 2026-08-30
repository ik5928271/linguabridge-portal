import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Headphones, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES } from '../data/mockData';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'signin', // 'signin' or 'signup'
  onSuccessLogin 
}) {
  if (!isOpen) return null;

  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [role, setRole] = useState('host'); // 'host', 'interpreter', 'guest'
  
  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign up state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [specialty, setSpecialty] = useState('Medical / Healthcare');
  const [primaryLang, setPrimaryLang] = useState('Spanish');
  const [certifications, setCertifications] = useState('Certified Healthcare Interpreter (CCHI)');

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    onSuccessLogin({
      name: signInEmail.includes('admin') ? 'Platform Administrator' : signInEmail.includes('elena') ? 'Elena Rodriguez, CCHI' : 'Dr. Sarah Jenkins, MD',
      email: signInEmail || 'sarah.jenkins@hospital.org',
      role: signInEmail.includes('admin') ? 'admin' : signInEmail.includes('elena') ? 'interpreter' : 'host',
      org: 'Mercy General Hospital'
    });
    onClose();
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    onSuccessLogin({
      name: name || (role === 'interpreter' ? 'New Interpreter' : 'Organization Host'),
      email: email || 'user@linguabridge.com',
      role: role,
      org: orgName || 'General Health Clinic',
      primaryLang: primaryLang,
      specialty: specialty
    });
    onClose();
  };

  const quickDemoLogin = (userRole) => {
    if (userRole === 'host') {
      onSuccessLogin({
        name: 'Dr. Sarah Jenkins, MD',
        email: 's.jenkins@mercygeneral.org',
        role: 'host',
        org: 'Mercy General Hospital - Cardiology'
      });
    } else if (userRole === 'interpreter') {
      onSuccessLogin({
        name: 'Elena Rodriguez, CCHI',
        email: 'elena.rodriguez@interpreters.org',
        role: 'interpreter',
        org: 'Certified Linguist Pool',
        primaryLang: 'Spanish',
        rating: 4.98
      });
    } else if (userRole === 'admin') {
      onSuccessLogin({
        name: 'Operations Dispatch Admin',
        email: 'admin@linguabridge.com',
        role: 'admin',
        org: 'LinguaBridge Dispatch Operations'
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'signin' ? 'Sign In to LinguaBridge' : 'Create Your Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'signin' ? 'Access your 3-party interpretation dashboard' : 'Join our global enterprise interpretation network'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'signin' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'signup' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Email Address or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="doctor@hospital.org or interpreter@network.com"
                  className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email.'); }} className="text-[11px] text-brand-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Logins Helper */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Or 1-Click Instant Demo Login:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickDemoLogin('host')}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 font-semibold text-[11px] border border-slate-700 transition"
                >
                  Doctor / Host
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('interpreter')}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-[11px] border border-slate-700 transition"
                >
                  Interpreter
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('admin')}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-[11px] border border-slate-700 transition"
                >
                  Admin
                </button>
              </div>
            </div>
          </form>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
            
            {/* Role Selection */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">I am joining as:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    role === 'host' ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <p className="font-bold text-[11px] text-white">Client (Payer)</p>
                  </div>
                  <p className="text-[9px] text-slate-400">Individual, Hospital, Law Firm</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('interpreter')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    role === 'interpreter' ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="font-bold text-[11px] text-white">Interpreter</p>
                  </div>
                  <p className="text-[9px] text-slate-400">Certified Linguist Pool</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    role === 'admin' ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <p className="font-bold text-[11px] text-white">Admin</p>
                  </div>
                  <p className="text-[9px] text-slate-400">Owner & Operations</p>
                </button>
              </div>
            </div>

            {/* Common fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jennifer Adams"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Role specific fields */}
            {role === 'host' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Organization / Company (Optional for Individuals)</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. St. Jude Hospital, Law Firm, or Individual"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Primary Domain</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                  >
                    {SPECIALTIES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            ) : role === 'admin' ? (
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Operations Title / Department</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Platform Owner / Operations Management"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Primary Language Pair</label>
                  <select
                    value={primaryLang}
                    onChange={(e) => setPrimaryLang(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                  >
                    {LANGUAGES.map(l => <option key={l.code} value={l.name}>{l.flag} {l.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Primary Certification</label>
                  <input
                    type="text"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="CCHI, NBCMI, Court Certified"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Create Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>By signing up, you agree to HIPAA Business Associate Agreement & Terms.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Create Account & Start</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
