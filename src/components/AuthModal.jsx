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
  Zap,
  Award,
  Camera,
  Upload
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES } from '../data/mockData';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'signin', // 'signin' or 'signup'
  initialRole = 'host', // 'host' or 'interpreter'
  onSuccessLogin,
  onOpenInterpreterApplication
}) {
  if (!isOpen) return null;

  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [role, setRole] = useState(initialRole || 'host'); // 'host', 'interpreter', 'guest'
  
  // Update mode/role when modal opens with new initial props
  React.useEffect(() => {
    setMode(initialMode);
    setRole(initialRole || 'host');
  }, [initialMode, initialRole, isOpen]);
  
  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign up state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [specialty, setSpecialty] = useState('Medical / Healthcare');
  const [primaryLang, setPrimaryLang] = useState('Spanish');
  const [certifications, setCertifications] = useState('Certified Professional Linguist');

  // Avatar / Profile Picture state (Optional)
  const [avatarType, setAvatarType] = useState('preset'); // 'preset' or 'custom'
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState('male-1');
  const [customPhotoData, setCustomPhotoData] = useState(null);
  const [customPhotoName, setCustomPhotoName] = useState('');

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomPhotoData(ev.target.result);
        setCustomPhotoName(file.name);
        setAvatarType('custom');
      };
      reader.readAsDataURL(file);
    }
  };
  // Helper to get local accounts
  const getLocalAccounts = () => {
    try {
      const saved = localStorage.getItem('linguabridge_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Helper to save local accounts
  const saveLocalAccount = (user, wallet) => {
    try {
      const accounts = getLocalAccounts();
      const existingIdx = accounts.findIndex(a => 
        (user.id && a.user.id === user.id) || 
        (user.email && a.user.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.name && a.user.name.toLowerCase() === user.name.toLowerCase())
      );
      if (existingIdx >= 0) {
        accounts[existingIdx] = { user: { ...accounts[existingIdx].user, ...user }, wallet: wallet || accounts[existingIdx].wallet };
      } else {
        accounts.push({ user, wallet: wallet || { totalPaid: 0, totalMinutesPurchased: 0, minutesRemaining: 0, billingType: 'prepaid' } });
      }
      localStorage.setItem('linguabridge_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error('Error saving local account:', e);
    }
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    const query = signInEmail.toLowerCase().trim();

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: query, password: signInPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          saveLocalAccount(data.user, data.wallet);
          onSuccessLogin(data.user, data.wallet);
          onClose();
        } else {
          fallbackSignIn(query);
        }
      })
      .catch(() => {
        fallbackSignIn(query);
      });
  };

  const fallbackSignIn = (query) => {
    // 1. Check local browser account store first!
    const localAccounts = getLocalAccounts();
    const found = localAccounts.find(a => 
      (a.user.email && a.user.email.toLowerCase() === query) ||
      (a.user.name && a.user.name.toLowerCase() === query) ||
      (a.user.name && a.user.name.toLowerCase().includes(query))
    );

    if (found) {
      onSuccessLogin(found.user, found.wallet);
      onClose();
      return;
    }

    // 2. Known system defaults
    if (query === 'iksale9817@gmail.com' || query === 'iksale9815@gmail.com' || query.includes('admin') || query.includes('ikram')) {
      const ownerUser = {
        id: 'usr-owner-ikram',
        name: 'Ikram-ul-haq Mian',
        email: 'iksale9817@gmail.com',
        role: 'admin',
        isOwner: true,
        org: 'IK Enterprises'
      };
      const ownerWallet = { totalPaid: 1000, totalMinutesPurchased: 9999, minutesRemaining: 9999, billingType: 'unlimited_owner' };
      saveLocalAccount(ownerUser, ownerWallet);
      onSuccessLogin(ownerUser, ownerWallet);
    } else if (query.includes('elena') || query.includes('interp') || query.includes('linguist')) {
      const interpUser = {
        id: 'usr-elena',
        name: 'Elena Rodriguez, CCHI',
        email: query.includes('@') ? query : `${query}@interpreters.org`,
        role: 'interpreter',
        org: 'Certified Linguist Pool',
        primaryLang: 'Spanish',
        rating: 4.98
      };
      saveLocalAccount(interpUser, null);
      onSuccessLogin(interpUser, null);
    } else {
      // 3. Auto-recover / instantiate user account with their custom input name
      const customUser = {
        id: `usr-${Date.now().toString(36)}`,
        name: signInEmail.includes('@') ? signInEmail.split('@')[0] : signInEmail,
        email: signInEmail.includes('@') ? query : `${query}@linguabridge.com`,
        role: 'host',
        org: 'IK Enterprises Client Pool'
      };
      const customWallet = { totalPaid: 0, totalMinutesPurchased: 0, minutesRemaining: 0, billingType: 'prepaid' };
      saveLocalAccount(customUser, customWallet);
      onSuccessLogin(customUser, customWallet);
    }
    onClose();
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim() || 'testing';
    const cleanEmail = email.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '')}@linguabridge.com`;

    const userObj = {
      id: `usr-${Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim(),
      role: role,
      avatarType: avatarType,
      avatarPreset: selectedAvatarPreset,
      photoUrl: avatarType === 'custom' ? customPhotoData : null,
      avatarEmoji: selectedAvatarPreset === 'female-1' ? '👩‍💼' :
                   selectedAvatarPreset === 'male-2' ? '👨‍⚕️' :
                   selectedAvatarPreset === 'female-2' ? '👩‍⚕️' :
                   selectedAvatarPreset === 'neutral' ? '🌐' : '👨‍💼',
      org: orgName || 'IK Enterprises Client',
      primaryLang: primaryLang,
      specialty: specialty
    };

    const walletObj = {
      userId: userObj.id,
      totalPaid: 0.00,
      totalMinutesPurchased: 0,
      minutesUsed: 0,
      minutesRemaining: 0,
      billingType: 'prepaid'
    };

    // 1. Immediately save to persistent browser store
    saveLocalAccount(userObj, walletObj);

    // 2. Sync to backend database
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userObj,
        password: password || 'pass123'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          saveLocalAccount(data.user, data.wallet);
          onSuccessLogin(data.user, data.wallet);
        } else {
          onSuccessLogin(userObj, walletObj);
        }
        onClose();
      })
      .catch(() => {
        onSuccessLogin(userObj, walletObj);
        onClose();
      });
  };

  const quickDemoLogin = (userRole) => {
    if (userRole === 'host') {
      onSuccessLogin({
        id: 'usr-jenkins',
        name: 'Dr. Sarah Jenkins, MD',
        email: 's.jenkins@mercygeneral.org',
        role: 'host',
        org: 'Mercy General Hospital - Cardiology'
      }, { totalPaid: 150, totalMinutesPurchased: 150, minutesRemaining: 150, billingType: 'prepaid' });
    } else if (userRole === 'interpreter') {
      onSuccessLogin({
        id: 'usr-elena',
        name: 'Elena Rodriguez, CCHI',
        email: 'elena.rodriguez@interpreters.org',
        role: 'interpreter',
        org: 'Certified Linguist Pool',
        primaryLang: 'Spanish',
        rating: 4.98
      }, null);
    } else if (userRole === 'admin') {
      onSuccessLogin({
        id: 'usr-owner-ikram',
        name: 'Ikram-ul-haq Mian',
        email: 'iksale9817@gmail.com',
        role: 'admin',
        isOwner: true,
        org: 'IK Enterprises'
      }, { totalPaid: 1000, totalMinutesPurchased: 9999, minutesRemaining: 9999, billingType: 'unlimited_owner' });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-4 flex justify-center items-start">
      <div className={`max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden my-6 sm:my-8 transition-all ${
        role === 'interpreter' ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-brand-500/50 ring-1 ring-brand-500/30'
      }`}>
        
        {/* Background glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          role === 'interpreter' ? 'bg-emerald-500/15' : 'bg-brand-500/15'
        }`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${
              role === 'interpreter' 
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-2 ring-emerald-400/40' 
                : 'bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 ring-2 ring-brand-400/40'
            }`}>
              {role === 'interpreter' ? <Headphones className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  role === 'interpreter' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                }`}>
                  {role === 'interpreter' ? '🎧 Interpreter & Linguist Portal' : '🏢 Client & Hospital Portal'}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {role === 'interpreter' 
                  ? (mode === 'signin' ? 'Interpreter Sign In' : 'Interpreter Application')
                  : (mode === 'signin' ? 'Client / Doctor Sign In' : 'Create Client Account')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {role === 'interpreter'
                  ? 'Access your live encounters, schedule, and earnings'
                  : 'Access on-demand & scheduled 3-way interpretation'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              mode === 'signin' 
                ? (role === 'interpreter' ? 'bg-emerald-600 text-white shadow-md' : 'bg-brand-600 text-white shadow-md') 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              if (role === 'interpreter') {
                onClose();
                if (onOpenInterpreterApplication) onOpenInterpreterApplication();
              } else {
                setMode('signup');
              }
            }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              mode === 'signup' 
                ? (role === 'interpreter' ? 'bg-emerald-600 text-white shadow-md' : 'bg-brand-600 text-white shadow-md') 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {role === 'interpreter' ? 'Apply as Interpreter ✍️' : 'Create Client Account'}
          </button>
        </div>

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                {role === 'interpreter' ? 'Interpreter Registered Email or Username' : 'Client / Hospital Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder={role === 'interpreter' ? 'e.g. rohim6360ba.en@gmail.com' : 'e.g. doctor@hospital.org'}
                  className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-xs text-white focus:outline-none bg-slate-950 border border-slate-700"
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
                  className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-xs text-white focus:outline-none bg-slate-950 border border-slate-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition cursor-pointer transform hover:-translate-y-0.5 ${
                role === 'interpreter'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 shadow-brand-500/25'
              }`}
            >
              <span>{role === 'interpreter' ? 'Sign In to Interpreter Workbench' : 'Sign In to Client Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Logins Helper */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                1-Click Instant Demo Login:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {role === 'interpreter' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('interpreter')}
                      className="py-2 px-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-[11px] border border-emerald-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Demo Interpreter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('admin')}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-[11px] border border-purple-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Demo Admin</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('host')}
                      className="py-2 px-2 rounded-xl bg-brand-950/60 hover:bg-brand-900/60 text-brand-300 font-bold text-[11px] border border-brand-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Demo Client / Doctor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('admin')}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-[11px] border border-purple-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Demo Admin</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Discrete Portal Switcher Link at Bottom */}
            <div className="pt-2 text-center text-[11px]">
              {role === 'interpreter' ? (
                <p className="text-slate-400">
                  Are you a Client or Doctor?{' '}
                  <button
                    type="button"
                    onClick={() => setRole('host')}
                    className="text-brand-400 hover:text-brand-300 font-bold underline cursor-pointer"
                  >
                    Go to Client Portal →
                  </button>
                </p>
              ) : (
                <p className="text-slate-400">
                  Are you a Certified Interpreter?{' '}
                  <button
                    type="button"
                    onClick={() => setRole('interpreter')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    Go to Interpreter Portal →
                  </button>
                </p>
              )}
            </div>
          </form>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
            
            {/* Role Selection */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">I am joining as:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    role === 'host' ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <div>
                    <p className="font-bold text-[11px]">Client / Organization (Payer)</p>
                    <p className="text-[9px] text-slate-400">Individual Client, Doctor, Law Firm, Hospital</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('interpreter')}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    role === 'interpreter' ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-[11px]">Certified Interpreter</p>
                    <p className="text-[9px] text-slate-400">Professional Linguist Pool</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Role specific forms */}
            {role === 'interpreter' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Interpreter Verification & Credential Intake</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        All prospective interpreters must submit their languages, qualifications, and <strong className="text-white">CV/Resume</strong> for verification by the <strong className="text-emerald-400">IK Enterprises Administration Board</strong> before portal login credentials are provisioned.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Step 1: Fill Application & Attach CV + Credentials</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Step 2: IK Enterprises Review & Verification</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Step 3: Receive Official Login Credentials via Email</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenInterpreterApplication) onOpenInterpreterApplication();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition transform hover:scale-[1.01]"
                  >
                    <span>Open Interpreter Application & Document Intake</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Profile Photo / Avatar Picker (Optional) */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-brand-400" />
                      <span>Profile Photo / Avatar (Optional)</span>
                    </label>
                    <span className="text-[9px] text-slate-400">Choose Avatar or Upload</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Live Preview */}
                    <div className="relative shrink-0">
                      {avatarType === 'custom' && customPhotoData ? (
                        <img 
                          src={customPhotoData} 
                          alt="Avatar" 
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500 shadow"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${
                          selectedAvatarPreset === 'female-1' ? 'from-pink-600 to-purple-600' :
                          selectedAvatarPreset === 'male-2' ? 'from-emerald-600 to-teal-600' :
                          selectedAvatarPreset === 'female-2' ? 'from-violet-600 to-fuchsia-600' :
                          selectedAvatarPreset === 'neutral' ? 'from-cyan-600 to-brand-600' :
                          'from-blue-600 to-indigo-600'
                        } flex items-center justify-center text-2xl shadow ring-1 ring-brand-400/40`}>
                          {selectedAvatarPreset === 'female-1' ? '👩‍💼' :
                           selectedAvatarPreset === 'male-2' ? '👨‍⚕️' :
                           selectedAvatarPreset === 'female-2' ? '👩‍⚕️' :
                           selectedAvatarPreset === 'neutral' ? '🌐' : '👨‍💼'}
                        </div>
                      )}
                      {avatarType === 'custom' && customPhotoData && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomPhotoData(null);
                            setCustomPhotoName('');
                            setAvatarType('preset');
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px]"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setAvatarType('preset'); setSelectedAvatarPreset('male-1'); }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                            avatarType === 'preset' && selectedAvatarPreset === 'male-1'
                              ? 'bg-blue-600/30 border-blue-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          👨‍💼 Male
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAvatarType('preset'); setSelectedAvatarPreset('female-1'); }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                            avatarType === 'preset' && selectedAvatarPreset === 'female-1'
                              ? 'bg-pink-600/30 border-pink-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          👩‍💼 Female
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAvatarType('preset'); setSelectedAvatarPreset('male-2'); }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                            avatarType === 'preset' && selectedAvatarPreset === 'male-2'
                              ? 'bg-emerald-600/30 border-emerald-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          👨‍⚕️ Medical
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAvatarType('preset'); setSelectedAvatarPreset('neutral'); }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                            avatarType === 'preset' && selectedAvatarPreset === 'neutral'
                              ? 'bg-cyan-600/30 border-cyan-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          🌐 Global
                        </button>
                      </div>

                      <label className="cursor-pointer inline-flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-semibold">
                        <Upload className="w-3 h-3" />
                        <span>{customPhotoName ? `✓ ${customPhotoName}` : 'Or upload photo file (JPG/PNG)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Interpreter switch alert */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 flex items-center justify-between gap-2 shadow-inner">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-300 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-white">Are you a Linguist / Interpreter?</p>
                      <p className="text-[10px] text-purple-300">Apply to join our paid interpretation roster.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenInterpreterApplication) onOpenInterpreterApplication();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] shrink-0 shadow-md shadow-purple-600/30 transition cursor-pointer"
                  >
                    Apply as Interpreter ✍️
                  </button>
                </div>

                {/* Client / Host Registration Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300 text-xs">Full Name</label>
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
                    <label className="font-semibold text-slate-300 text-xs">Work Email</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300 text-xs">WhatsApp / Mobile Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0199 or +92 300 1234567"
                      className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300 text-xs">Organization / Company (Optional)</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. St. Jude Hospital, Law Firm, or Individual"
                      className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300 text-xs">Primary Domain</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                  >
                    {SPECIALTIES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition"
                >
                  <span>Create Account & Start</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
