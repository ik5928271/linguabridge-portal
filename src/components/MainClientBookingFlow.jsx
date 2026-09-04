import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PhoneCall, 
  Video, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  QrCode, 
  Share2, 
  Clock, 
  Calendar, 
  FileText, 
  Search, 
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Star,
  CreditCard,
  Lock,
  MessageCircle,
  Mail,
  Award,
  CheckCircle2,
  DollarSign,
  UserCheck,
  Zap,
  TrendingUp,
  AlertCircle,
  Plus,
  Download,
  CalendarCheck,
  Building2
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES, INITIAL_INTERPRETERS, getInterpretersForLanguage } from '../data/mockData';
import PrepaidWalletModal from './PrepaidWalletModal';
import { getSocket } from '../services/socket';

export default function MainClientBookingFlow({ 
  onStartCall, 
  onSaveAppointment, 
  appointments = [], 
  callLogs = [],
  currentUser,
  wallet = {
    totalPaid: 153.00,
    totalMinutesPurchased: 180,
    minutesUsed: 95,
    minutesRemaining: 85,
    billingType: 'prepaid' // 'prepaid' or 'postpaid_hospital'
  },
  onUpdateWallet
}) {
  // Client Payer Profile: Is Main Client English-speaking or Non-English speaking?
  const [payerType, setPayerType] = useState('english_payer'); // 'english_payer' (e.g. Doctor/Lawyer) or 'foreign_payer' (e.g. Non-English Client)
  const clientBillingType = wallet?.billingType || currentUser?.billingType || 'prepaid';

  // Step in Wizard: 1: Service & Language, 2: Select Interpreter, 3: Date & Modality, 4: Payment / Minute Deduction, 5: Share Link Ready
  const [currentStep, setCurrentStep] = useState(1);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Form selections
  const [selectedLanguage, setSelectedLanguage] = useState('Russian');
  const [selectedSpecialty, setSelectedSpecialty] = useState('General / Customer Support');
  const [matchMode, setMatchMode] = useState('specific');
  const [realInterpreters, setRealInterpreters] = useState([]);
  const [selectedInterpreter, setSelectedInterpreter] = useState(null);

  // Fetch real registered interpreters from database
  useEffect(() => {
    fetch('/api/interpreters')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRealInterpreters(data);
        } else {
          fetch('/api/admin/users')
            .then(r => r.json())
            .then(users => {
              if (Array.isArray(users)) {
                const interps = users.filter(u => u.role === 'interpreter');
                setRealInterpreters(interps);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Filter registered interpreters for selected language
  const availableInterpreters = realInterpreters.filter(i => {
    const lang = selectedLanguage.toLowerCase();
    const pLang = (i.primaryLang || '').toLowerCase();
    const allLangs = (i.languages || []).map(l => l.toLowerCase());
    return pLang.includes(lang) || allLangs.some(l => l.includes(lang)) || lang.includes(pLang);
  });

  // Keep selected interpreter in sync
  useEffect(() => {
    if (availableInterpreters.length > 0) {
      if (!selectedInterpreter || !availableInterpreters.some(i => i.id === selectedInterpreter.id)) {
        setSelectedInterpreter(availableInterpreters[0]);
      }
    } else {
      setSelectedInterpreter(null);
    }
  }, [selectedLanguage, realInterpreters]);
  
  // Date & Modality
  const [bookingType, setBookingType] = useState('scheduled'); // 'instant' or 'scheduled'
  const [bookingDate, setBookingDate] = useState('2026-08-30');
  const [bookingTime, setBookingTime] = useState('02:30 PM');
  const [timezone, setTimezone] = useState('London (GMT / BST - United Kingdom)');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [callType, setCallType] = useState('audio'); // 'audio' by default
  
  // Client & Guest Information
  const [mainClientName, setMainClientName] = useState(currentUser?.name || 'Client Account');
  const [mainClientOrg, setMainClientOrg] = useState(currentUser?.org || 'IK Enterprises Client');
  const [guestName, setGuestName] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Generated Session Details after Payment
  const [generatedSession, setGeneratedSession] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Calculate client pricing (Platform Client Rate, never internal linguist wage)
  const clientRatePerHour = 54.00; // Standard platform client billing rate
  const estimatedCost = ((durationMinutes / 60) * clientRatePerHour).toFixed(2);
  const platformFee = '3.50';
  const totalCost = (parseFloat(estimatedCost) + parseFloat(platformFee)).toFixed(2);

  // Has sufficient minutes in prepaid wallet?
  const hasSufficientPrepaid = (wallet?.minutesRemaining || 0) >= durationMinutes;

  // Handle Payment / Minute Deduction & Create Link
  const handleConfirmAndPay = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);

      // Deduct minutes if prepaid
      if (clientBillingType === 'prepaid') {
        if (onUpdateWallet) {
          onUpdateWallet({
            minutesUsed: (wallet?.minutesUsed || 0) + durationMinutes,
            minutesRemaining: Math.max(0, (wallet?.minutesRemaining || 0) - durationMinutes)
          });
        }
      }

      const roomId = `room-${Date.now().toString(36).slice(-6)}`;
      const guestPin = Math.floor(1000 + Math.random() * 9000).toString();
      
      const guestLangCode = LANGUAGES.find(l => l.name.toLowerCase().includes(selectedLanguage.toLowerCase()))?.code || 'ru';
      const guestLink = `${window.location.origin}/?view=guest&roomId=${roomId}&lang=${payerType === 'english_payer' ? guestLangCode : 'en'}&name=${encodeURIComponent(guestName)}&payer=${encodeURIComponent(mainClientName)}`;

      const newSession = {
        id: `apt-${Date.now()}`,
        roomId,
        guestPin,
        guestLink,
        payerType,
        clientBillingType,
        mainClientName,
        mainClientOrg,
        guestName,
        language: selectedLanguage,
        specialty: selectedSpecialty,
        interpreter: selectedInterpreter || { name: 'Assigned Certified Linguist', primaryLang: selectedLanguage },
        bookingType,
        date: bookingDate,
        time: bookingTime,
        timezone,
        durationMinutes,
        callType,
        totalCost: clientBillingType === 'prepaid' ? `${durationMinutes} Prepaid Mins Deducted` : `$${totalCost} (Post-Paid Invoiced)`,
        status: 'confirmed',
        notes: sessionNotes,
        createdAt: new Date().toISOString()
      };


      setGeneratedSession(newSession);
      if (onSaveAppointment) {
        onSaveAppointment(newSession);
      }

      // Save to Backend API & Emit Live Socket Event to all Parties (Client, Interpreter, Admin)
      fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      }).catch(() => {});

      const socket = getSocket();
      if (socket) {
        socket.emit('new-appointment-created', newSession);
      }

      setCurrentStep(5);
    }, 1200);
  };

  const handleTopUpSuccess = ({ minutesAdded, amountPaid }) => {
    if (onUpdateWallet) {
      onUpdateWallet({
        totalPaid: (wallet?.totalPaid || 0) + amountPaid,
        totalMinutesPurchased: (wallet?.totalMinutesPurchased || 0) + minutesAdded,
        minutesRemaining: (wallet?.minutesRemaining || 0) + minutesAdded
      });
    }
  };

  // Sync client name if currentUser loads
  useEffect(() => {
    if (currentUser?.name) setMainClientName(currentUser.name);
    if (currentUser?.org) setMainClientOrg(currentUser.org);
  }, [currentUser]);

  const copyGuestLink = () => {
    if (generatedSession?.guestLink) {
      navigator.clipboard.writeText(generatedSession.guestLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareViaWhatsApp = () => {
    const interpName = selectedInterpreter?.name || 'Assigned Certified Linguist';
    const timeFormatted = generatedSession?.bookingType === 'scheduled' ? `Scheduled on ${generatedSession?.date} at ${generatedSession?.time} (${generatedSession?.timezone})` : 'Starting now (Instant On-Demand)';
    const text = `Hello ${guestName || 'Guest'}, here is your private 3-party interpretation session link with ${mainClientName || 'Host'} and certified ${selectedLanguage} interpreter ${interpName}.\n\n⏰ Time: ${timeFormatted}\n🔗 Join Free: ${generatedSession?.guestLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const interpName = selectedInterpreter?.name || 'Assigned Certified Linguist';
    const timeFormatted = generatedSession?.bookingType === 'scheduled' ? `${generatedSession?.date} at ${generatedSession?.time} (${generatedSession?.timezone})` : 'Starting immediately';
    const subject = `Confirmed: 3-Party Interpretation Session (${selectedLanguage}) on ${generatedSession?.date}`;
    const body = `Hello ${guestName || 'Guest'},\n\nYou are scheduled for a private 3-party interpretation session.\n\n📅 Date & Time: ${timeFormatted}\n🌐 Language: English ⟷ ${selectedLanguage} (${selectedSpecialty})\n👩‍💼 Certified Interpreter: ${interpName}\n👤 Host / Payer: ${mainClientName || 'Host'}\n🎙️ Call Type: ${callType === 'audio' ? 'Audio Call (Default)' : 'HD Video Call'}\n⏳ Duration: ${durationMinutes} Minutes\n\n🔗 Meeting Link: ${generatedSession?.guestLink}\n\nClick the link at your appointment time to join directly from any browser for free.`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const downloadCalendarFile = () => {
    const interpName = selectedInterpreter?.name || 'Assigned Certified Linguist';
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LinguaBridge//Interpreter Session//EN
BEGIN:VEVENT
SUMMARY:LinguaBridge Interpretation Session with ${mainClientName || 'Client'} (${selectedLanguage})
DESCRIPTION:3-Party Interpretation Session. Interpreter: ${interpName}. Join URL: ${generatedSession?.guestLink}
LOCATION:LinguaBridge Online Conference Room
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `interpretation-appointment-${bookingDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* 🌟 PREPAID WALLET & MINUTE TRACKER HUD BAR */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Client Account Billing & Minute Ledger</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Prepaid Minutes (Advance Secured)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Standard Client Model: All sessions require prepaid minutes in advance. Minutes are deducted 1:1 automatically upon booking.
            </p>
          </div>

          {/* Billing Settlement Model Badge */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Account Billing Model</span>
              <span className="text-xs font-bold text-emerald-400">
                Prepaid Minutes Wallet (Active)
              </span>
            </div>
          </div>
        </div>

        {/* 4 Live Ledger Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Paid */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount Paid</span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              ${(wallet?.totalPaid !== undefined && !isNaN(Number(wallet.totalPaid)) ? Number(wallet.totalPaid) : 0).toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Lifetime payment receipts</span>
          </div>

          {/* Card 2: Total Minutes Credited */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Minutes Credited</span>
            <p className="text-xl sm:text-2xl font-black text-brand-400 mt-1">{wallet?.totalMinutesPurchased || 0} Mins</p>
            <span className="text-[10px] text-slate-500 font-medium">Advance purchased volume</span>
          </div>

          {/* Card 3: Minutes Used */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Minutes Consumed</span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{wallet?.minutesUsed || 0} Mins</p>
            <span className="text-[10px] text-slate-500 font-medium">Across all 3-party sessions</span>
          </div>

          {/* Card 4: Available Balance & Top-Up */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Remaining Balance</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">{wallet?.minutesRemaining !== undefined ? wallet.minutesRemaining : 0} Mins</p>
              <span className="text-[10px] text-emerald-400/80 font-medium">Ready for instant calls</span>
            </div>

            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition transform hover:scale-105"
              title="Add more minutes"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Top-Up</span>
            </button>
          </div>

        </div>
      </div>

      {/* Payer Persona Toggle Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Book Certified Interpreter & Generate Guest Link
          </h2>
          <p className="text-xs text-slate-300">
            Select the required language pair, choose your certified interpreter & date/time, and generate a free private link for your counter-party.
          </p>
        </div>

        {/* Payer Persona Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 px-2">Payer Identity:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setPayerType('english_payer');
                setMainClientName('Dr. Sarah Jenkins, MD (English)');
                setGuestName('Carlos Hernandez (Russian)');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                payerType === 'english_payer' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 English Host Paying
            </button>

            <button
              onClick={() => {
                setPayerType('foreign_payer');
                setMainClientName('Sr. Carlos Hernandez (Russian Payer)');
                setGuestName('Dr. Sarah Jenkins, MD (English)');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                payerType === 'foreign_payer' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Non-English Client Paying
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {[
          { step: 1, label: 'Language & Specialty' },
          { step: 2, label: 'Choose Interpreter' },
          { step: 3, label: 'Schedule & Modality' },
          { step: 4, label: clientBillingType === 'prepaid' ? 'Minute Deduction' : 'Corporate Invoicing' },
          { step: 5, label: 'Share Link & Connect' }
        ].map((item) => (
          <div 
            key={item.step} 
            onClick={() => {
              if (item.step < currentStep || (generatedSession && item.step === 5)) {
                setCurrentStep(item.step);
              }
            }}
            className={`flex flex-col items-center cursor-pointer transition ${
              currentStep === item.step ? 'text-brand-400 font-bold' : item.step < currentStep ? 'text-emerald-400' : 'text-slate-600'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition ${
              currentStep === item.step 
                ? 'bg-brand-600 text-white ring-4 ring-brand-500/20' 
                : item.step < currentStep 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 text-slate-500'
            }`}>
              {item.step < currentStep ? <Check className="w-4 h-4" /> : item.step}
            </div>
            <span className="text-[11px] hidden sm:block text-center">{item.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: LANGUAGE & SPECIALTY */}
      {currentStep === 1 && (
        <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">Step 1: Select Language & Specialty Domain</h2>
            <p className="text-xs text-slate-400 mt-1">Choose the target language assistance needed for your session</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Target Language:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(lang.name);
                    const matched = getInterpretersForLanguage(lang.name);
                    if (matched && matched.length > 0) {
                      setSelectedInterpreter(matched[0]);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    selectedLanguage === lang.name 
                      ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500 shadow-lg shadow-brand-500/20' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{lang.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{lang.nativeName}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Industry / Domain Specialty:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SPECIALTIES.map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSelectedSpecialty(spec.name)}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    selectedSpecialty === spec.name
                      ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500 shadow-lg shadow-brand-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{spec.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{spec.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const matched = getInterpretersForLanguage(selectedLanguage);
                if (matched && matched.length > 0) {
                  setSelectedInterpreter(matched[0]);
                }
                setCurrentStep(2);
              }}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-brand-500/30"
            >
              <span>Continue: Choose {selectedLanguage} Interpreter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE INTERPRETER */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white">Step 2: Choose Certified {selectedLanguage} Interpreter</h2>
              <p className="text-xs text-slate-400 mt-0.5">Found {availableInterpreters.length} credentialed {selectedLanguage} linguist(s) ready for assignment</p>
            </div>

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setMatchMode('specific')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  matchMode === 'specific' ? 'bg-brand-600 text-white' : 'text-slate-400'
                }`}
              >
                Browse & Pick ({availableInterpreters.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatchMode('auto');
                  if (availableInterpreters.length > 0) {
                    setSelectedInterpreter(availableInterpreters[0]);
                  }
                }}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  matchMode === 'auto' ? 'bg-brand-600 text-white' : 'text-slate-400'
                }`}
              >
                Instant Best Match
              </button>
            </div>
          </div>

          {/* Interpreter Cards Grid */}
          {availableInterpreters.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">No Certified Interpreters Registered for {selectedLanguage} Yet</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Please create an interpreter in {selectedLanguage} in your Admin Control Center or have them sign up online.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableInterpreters.map((interp) => (
                <div
                  key={interp.id}
                  onClick={() => setSelectedInterpreter(interp)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                    selectedInterpreter?.id === interp.id
                      ? 'bg-brand-600/15 border-brand-500 ring-2 ring-brand-500/50 shadow-xl'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {interp.avatar ? (
                      <img src={interp.avatar} alt={interp.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white flex items-center justify-center text-lg shrink-0 shadow-lg shadow-emerald-500/20">
                        {interp.name?.charAt(0) || 'I'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white truncate">{interp.name}</h4>
                        {clientBillingType === 'prepaid' ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                            Included (1:1 Mins)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20 shrink-0">
                            $0.90/min Client Rate
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {(interp.languages || [interp.primaryLang || selectedLanguage, 'English']).join(' ⟷ ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          ● Online & Ready
                        </span>
                        <span>•</span>
                        <span>{interp.specialty || interp.specialties?.[0] || 'General / Customer Support'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                    {interp.bio || `Certified ${interp.primaryLang || selectedLanguage} professional linguist ready for live assignments.`}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {Array.isArray(interp.certifications) ? interp.certifications[0] : (interp.certifications || 'Certified Professional Linguist')}
                    </span>
                    {selectedInterpreter?.id === interp.id ? (
                      <span className="text-xs font-bold text-brand-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Click to choose</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              disabled={availableInterpreters.length === 0}
              onClick={() => setCurrentStep(3)}
              className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                availableInterpreters.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/30'
              }`}
            >
              <span>Continue: Timing & Modality</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SCHEDULE, DATE/TIME PICKER, MODALITY & PARTIES */}
      {currentStep === 3 && (
        <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">Step 3: Timing, Call Modality & Participants</h2>
            <p className="text-xs text-slate-400 mt-1">Specify session duration, schedule date & time, call modality (Audio by default), and participant names</p>
          </div>

          {/* When to Start: Instant vs Scheduled */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Appointment Type:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingType('instant')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  bookingType === 'instant' ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500 shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <p className="text-xs font-bold text-white">Instant On-Demand</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Connect immediately with {selectedInterpreter?.name || 'Assigned Certified Linguist'}</p>
              </button>

              <button
                type="button"
                onClick={() => setBookingType('scheduled')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  bookingType === 'scheduled' ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500 shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-bold text-white">Schedule Future Appointment</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Pick custom date, time & timezone in advance</p>
              </button>
            </div>
          </div>

          {/* 🌟 CONDITIONAL SCHEDULE DATE & TIME PICKER PANEL */}
          {bookingType === 'scheduled' && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-emerald-500/40 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                <CalendarCheck className="w-4 h-4" />
                <span>Select Appointment Date & Start Time:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Date Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Appointment Date:</label>
                  <input
                    type="date"
                    min="2026-08-29"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none bg-slate-950 border border-slate-700"
                  />
                </div>

                {/* 2. Time Slot Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Start Time Slot:</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none bg-slate-950 border border-slate-700 font-semibold"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM (Noon)</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>

                {/* 3. Timezone Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Timezone:</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none bg-slate-950 border border-slate-700"
                  >
                    <option value="London (GMT / BST - United Kingdom)">🇬🇧 London (GMT / BST - UK)</option>
                    <option value="Central European Time (CET / CEST)">🇪🇺 Central European Time (CET)</option>
                    <option value="Eastern Time (ET - US/Canada)">🇺🇸 Eastern Time (ET)</option>
                    <option value="Central Time (CT - US/Canada)">🇺🇸 Central Time (CT)</option>
                    <option value="Mountain Time (MT - US/Canada)">🇺🇸 Mountain Time (MT)</option>
                    <option value="Pacific Time (PT - US/Canada)">🇺🇸 Pacific Time (PT)</option>
                    <option value="Gulf Standard Time (GST - Dubai)">🇦🇪 Gulf Standard Time (GST)</option>
                    <option value="Pakistan Standard Time (PKT)">🇵🇰 Pakistan Standard Time (PKT)</option>
                    <option value="UTC (Coordinated Universal Time)">🌐 UTC (Universal Time)</option>
                  </select>
                </div>

              </div>

              {/* Quick Date Shortcuts */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-slate-400 font-semibold">Quick Date:</span>
                <button
                  type="button"
                  onClick={() => setBookingDate('2026-08-29')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    bookingDate === '2026-08-29' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Today (Aug 29)
                </button>
                <button
                  type="button"
                  onClick={() => setBookingDate('2026-08-30')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    bookingDate === '2026-08-30' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Tomorrow (Aug 30)
                </button>
                <button
                  type="button"
                  onClick={() => setBookingDate('2026-08-31')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    bookingDate === '2026-08-31' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Monday (Aug 31)
                </button>
                <button
                  type="button"
                  onClick={() => setBookingDate('2026-09-04')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    bookingDate === '2026-09-04' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Next Friday (Sep 4)
                </button>
              </div>

            </div>
          )}

          {/* Call Modality: Audio Default */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Call Modality:</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCallType('audio')}
                className={`flex-1 p-3 rounded-2xl border text-left transition ${
                  callType === 'audio' ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500 shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Audio Only (Default)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">High definition crystal voice channel</p>
              </button>

              <button
                type="button"
                onClick={() => setCallType('video')}
                className={`flex-1 p-3 rounded-2xl border text-left transition ${
                  callType === 'video' ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500 shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-bold text-white">HD Video + Audio</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">3-party video room with screen sharing</p>
              </button>
            </div>
          </div>

          {/* Reserved Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Reserved Duration for Session:</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none bg-slate-900 border border-slate-700"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 hour)</option>
              <option value={90}>90 Minutes</option>
            </select>
          </div>

          {/* Party Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Main Client (Payer Name)</label>
              <input
                type="text"
                value={mainClientName}
                onChange={(e) => setMainClientName(e.target.value)}
                placeholder="Enter your name / payer name"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Guest Name (Counter-party)</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest / counter-party name"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none border border-slate-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-brand-500/30"
            >
              <span>Continue to Payment / Minute Deduction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT / MINUTE DEDUCTION CHECKOUT */}
      {currentStep === 4 && (
        <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">
              Step 4: Confirm Minute Deduction from Prepaid Wallet
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Advance Payment Policy: This session will be secured in advance by deducting minutes from your prepaid balance.
            </p>
          </div>

          {/* Prepaid Balance Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Available Prepaid Balance:</span>
              <span className="font-black text-emerald-400">{wallet?.minutesRemaining || 0} Minutes</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Minutes Required for this Session:</span>
              <span className="font-bold text-white">{durationMinutes} Minutes</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-300">Remaining Balance after Session:</span>
              <span className={`font-black ${hasSufficientPrepaid ? 'text-emerald-300' : 'text-red-400'}`}>
                {(wallet?.minutesRemaining || 0) - durationMinutes} Minutes
              </span>
            </div>

            {!hasSufficientPrepaid && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Insufficient minutes in wallet ({wallet?.minutesRemaining || 0} min available). Please top up to proceed.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow-lg shadow-emerald-600/30"
                >
                  Top-Up Now
                </button>
              </div>
            )}
          </div>

          {/* Session Details Recap */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Timing & Date:</span>
              <span className="font-bold text-emerald-400">
                {bookingType === 'scheduled' ? `📅 ${bookingDate} at ${bookingTime} (${timezone})` : '⚡ Instant On-Demand'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Language Pair:</span>
              <span className="font-bold text-white">English ⟷ {selectedLanguage} ({selectedSpecialty})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Certified Interpreter:</span>
              <span className="font-semibold text-emerald-400">{selectedInterpreter?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Guest Recipient:</span>
              <span className="font-semibold text-amber-300">{guestName} (Free 1-Click Guest Link)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Back
            </button>

            <button
              type="button"
              disabled={clientBillingType === 'prepaid' && !hasSufficientPrepaid}
              onClick={handleConfirmAndPay}
              className={`px-8 py-3.5 rounded-xl text-white font-extrabold text-sm shadow-xl flex items-center gap-2 transition ${
                clientBillingType === 'prepaid' && !hasSufficientPrepaid
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25 transform hover:-translate-y-0.5'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Session & Generating Link...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {clientBillingType === 'prepaid' 
                      ? `Confirm & Deduct ${durationMinutes} Mins`
                      : `Authorize Post-Paid & Generate Link`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 🌟 STEP 5: FULL SCHEDULE CONFIRMATION TICKET, GUEST LINK & LAUNCH */}
      {currentStep === 5 && generatedSession && (
        <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-10 rounded-3xl border-2 border-emerald-500/50 space-y-8 shadow-2xl relative overflow-hidden">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg ring-4 ring-emerald-500/20">
              <Check className="w-8 h-8 animate-bounce" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              {clientBillingType === 'prepaid' ? 'Advance Payment Verified • Minutes Deducted' : 'Authorized to Hospital Corporate Account'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Your Interpretation Session is Confirmed!</h2>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Your certified interpreter and private room are locked in. Send the guest invitation link below to <strong>{generatedSession.guestName}</strong> to join for free.
            </p>
          </div>

          {/* 🌟 PRINTED SCHEDULED APPOINTMENT DETAILS TICKET */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>Official Booking & Schedule Confirmation Details</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                PIN: {generatedSession.guestPin}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              
              {/* Field 1: Scheduled Time & Date */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scheduled Date & Time:</span>
                </span>
                <p className="font-extrabold text-white text-sm">
                  {generatedSession.bookingType === 'scheduled' ? `${generatedSession.date} at ${generatedSession.time}` : 'Instant On-Demand'}
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold">{generatedSession.timezone || 'London (GMT / BST)'}</p>
              </div>

              {/* Field 2: Language & Specialty */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  <span>Language & Specialty:</span>
                </span>
                <p className="font-extrabold text-white text-sm">English ⟷ {generatedSession.language}</p>
                <p className="text-[10px] text-slate-400">{generatedSession.specialty}</p>
              </div>

              {/* Field 3: Modality & Duration */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modality & Duration:</span>
                </span>
                <p className="font-extrabold text-white text-sm">
                  {generatedSession.callType === 'audio' ? 'Audio Only (Default)' : 'HD Video Call'}
                </p>
                <p className="text-[10px] text-amber-400 font-semibold">{generatedSession.durationMinutes} Minutes Reserved</p>
              </div>

              {/* Field 4: Main Client (Payer) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                  <span>Main Client (Paying Party):</span>
                </span>
                <p className="font-extrabold text-white">{generatedSession.mainClientName}</p>
                <p className="text-[10px] text-slate-400">{generatedSession.mainClientOrg}</p>
              </div>

              {/* Field 5: Invited Guest */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Invited Guest (Counter-Party):</span>
                </span>
                <p className="font-extrabold text-amber-300">{generatedSession.guestName}</p>
                <p className="text-[10px] text-slate-400">Joins free with zero install</p>
              </div>

              {/* Field 6: Assigned Interpreter */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>Certified Interpreter:</span>
                </span>
                <p className="font-extrabold text-purple-300">{generatedSession.interpreter?.name || 'Assigned Certified Linguist'}</p>
                <p className="text-[10px] text-slate-400">
                  {Array.isArray(generatedSession.interpreter?.certifications) 
                    ? generatedSession.interpreter.certifications[0] 
                    : (generatedSession.interpreter?.certifications || 'Certified Professional Linguist')}
                </p>
              </div>

            </div>

            {/* Calendar Download Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={downloadCalendarFile}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Calendar Invite (.ics)</span>
              </button>
            </div>
          </div>

          {/* Copyable Link Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Secure Guest Invitation Link:</span>
              <span className="text-[10px] text-amber-400 font-semibold">Zero App Install Required</span>
            </label>

            <div className="glass-input p-3 rounded-xl text-xs text-white font-mono break-all flex items-center justify-between gap-3">
              <span className="truncate">{generatedSession.guestLink}</span>
              <button
                onClick={copyGuestLink}
                className="p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold shrink-0 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Instant 1-Click Share Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={copyGuestLink}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={shareViaEmail}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                <span>Email Invite</span>
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          {/* Launch Room Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onStartCall({
                  roomId: generatedSession.roomId,
                  role: 'host',
                  participantName: generatedSession.mainClientName,
                  targetLanguage: generatedSession.language,
                  specialty: generatedSession.specialty,
                  patientName: generatedSession.guestName,
                  hostName: generatedSession.mainClientName,
                  interpreter: generatedSession.interpreter,
                  interpreterName: generatedSession.interpreter?.name || 'Certified Interpreter',
                  callType: generatedSession.callType
                });
              }}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 transition transform hover:scale-[1.02]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Enter 3-Party Room as Main Client</span>
            </button>

            <button
              onClick={() => {
                window.open(generatedSession.guestLink, '_blank');
              }}
              className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Preview Guest Screen in New Tab</span>
            </button>
          </div>

        </div>
      )}

      {/* Prepaid Top-Up Modal */}
      <PrepaidWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onTopUpSuccess={handleTopUpSuccess}
        currentBalance={wallet?.minutesRemaining || 0}
      />

    </div>
  );
}
