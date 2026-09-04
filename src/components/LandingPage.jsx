import React, { useState } from 'react';
import { 
  Globe, 
  Users, 
  Headphones, 
  ShieldCheck, 
  Zap, 
  Clock, 
  PhoneCall, 
  Video, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  LayoutGrid,
  HeartPulse,
  Scale,
  Briefcase,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  Lock,
  Building2,
  DollarSign,
  Star,
  Check,
  HelpCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES } from '../data/mockData';

export default function LandingPage({ 
  onSelectRole, 
  onOpenSchedule, 
  onOpenGlossary,
  onOpenAuth,
  onOpenInterpreterApplication 
}) {
  const [langSearch, setLangSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [calculatorMinutes, setCalculatorMinutes] = useState(120);

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(langSearch.toLowerCase()) || 
    l.nativeName.toLowerCase().includes(langSearch.toLowerCase())
  );

  const faqs = [
    {
      q: 'How quickly can I connect to a live interpreter?',
      a: 'Our average connection speed is under 15 seconds for popular languages (Spanish, Mandarin, Arabic, Vietnamese, French). For rare indigenous or regional dialects, connections are fulfilled in under 45 seconds.'
    },
    {
      q: 'Is LinguaBridge HIPAA, GDPR, and Court-Certified compliant?',
      a: 'Yes. All audio and video streams use end-to-end 256-bit WebRTC TLS/SRTP encryption. We execute Business Associate Agreements (BAAs) with healthcare providers, and our interpreters adhere to strict court confidentiality canons.'
    },
    {
      q: 'Do non-English speaking patients or clients need to download an app?',
      a: 'No! Non-English clients join via a simple web link or QR code sent via SMS/email. The interface automatically adapts into their native language (Spanish, Arabic, Chinese, etc.) on any phone, tablet, or desktop browser with zero downloads.'
    },
    {
      q: 'How does pricing work?',
      a: 'We offer straightforward pay-as-you-go pricing at $0.95/minute for audio interpretation and $1.45/minute for HD video interpretation, with no monthly minimums or setup fees. Enterprise volume discounts are available.'
    },
    {
      q: 'How are your interpreters certified and vetted?',
      a: 'All linguists on our platform hold credentials from recognized bodies such as CCHI (Certified Healthcare Interpreter), NBCMI, Federal Court Certification, or the American Translators Association (ATA), with at least 5+ years of verified industry experience.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION WITH INTRODUCTION & CTAs */}
      <section className="relative pt-16 pb-12 px-4 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[650px] h-[650px] bg-brand-500/20 rounded-full blur-3xl" />
          <div className="w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Global 3-Party Language Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-tight">
          Bridging <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">English Providers</span> & <span className="text-amber-400">Non-English Clients</span> with Certified Interpreters.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          The next-generation on-demand and scheduled interpretation platform. Connect doctors, attorneys, and businesses with certified linguists and diverse non-English clients in under 15 seconds across 150+ languages.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onOpenAuth('signup')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-extrabold text-base shadow-xl shadow-brand-500/30 transition transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenAuth('signin')}
            className="flex items-center gap-2 px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700 transition"
          >
            <LogIn className="w-5 h-5 text-brand-400" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => onSelectRole('split-demo')}
            className="flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-300 font-bold text-base border border-emerald-500/40 transition"
          >
            <LayoutGrid className="w-5 h-5 text-emerald-400" />
            <span>Live 3-Way Demo</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>&lt; 15s Average Connect Time</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HIPAA & SOC-2 Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>CCHI, NBCMI & Court Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>150+ Spoken & Signed Languages</span>
          </div>
        </div>
      </section>

      {/* 2. COMPREHENSIVE SERVICES SHOWCASE */}
      <section id="services" className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">What We Provide</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Comprehensive Language Solutions</h2>
          <p className="text-slate-400 text-sm mt-3">
            Tailored interpretation modalities designed for mission-critical consultations, legal proceedings, and enterprise client communications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Service 1: Audio OPI */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-brand-500/50 hover:bg-slate-800/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <PhoneCall className="w-7 h-7" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">On-Demand Audio (OPI)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">Default Mode</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Instant over-the-phone voice interpretation accessible 24/7. Crystal-clear WebRTC audio with zero delay, ideal for emergency triage, telephone intake, and fast customer inquiries.
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Instant 1-click dial with no PIN required</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Connects in under 12 seconds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Low bandwidth optimized for mobile networks</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => onSelectRole('host')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>Launch Audio Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Service 2: Video Remote Interpretation */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Video className="w-7 h-7" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Video Remote (VRI)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">1080p HD</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                High-definition multi-party video rooms allowing visual nuances, facial expressions, document sharing, and American Sign Language (ASL) interpretation.
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>3-way video tiles with active speaker focus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ASL and tactile interpretation support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Screen sharing for medical scans & contracts</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => onSelectRole('host')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>Explore Video Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Service 3: Scheduled Consecutive Sessions */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/40 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Scheduled Appointments</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Pre-Booked</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Pre-book certified specialist interpreters for planned surgeries, court depositions, patent hearings, and parent-teacher IEP conferences with calendar integration.
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Guaranteed interpreter assignment in advance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Automated SMS and email reminders to client</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Pre-session case brief and document briefing</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={onOpenSchedule}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>Schedule an Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 3. INDUSTRY VERTICALS */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Industry Specializations</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Engineered for Regulated Industries</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Healthcare & Telehealth</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              HIPAA compliant CCHI/NBCMI medical interpreters for ER triage, oncology, psychiatry, and surgical consent.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Legal & Judiciary</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              State & Federal Court Certified linguists for depositions, asylum hearings, criminal defense, and arbitrations.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Banking & Insurance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              GLBA & PCI-DSS compliant financial interpreters for loan underwriting, wealth advisory, and auto claims.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Education & Municipal</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supporting school districts, IEP family evaluations, social services, and emergency municipal relief services.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (THE DUAL-PAYER MODEL) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Flexible Payer Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">How LinguaBridge Works in 3 Simple Steps</h2>
          <p className="text-slate-400 text-sm mt-2">
            Either party can be the paying <strong className="text-brand-300">Main Client</strong> (English provider or Non-English client). You book & pay, choose the interpreter & time, and we generate a free link to send to your guest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4 text-center relative hover:border-brand-500/40 transition">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Main Client Signs Up & Chooses</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Whoever is paying (English speaker or Non-English speaker) creates the Main Client account, chooses the language, specific interpreter, and time/date.
            </p>
          </div>

          <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4 text-center relative hover:border-emerald-500/40 transition">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Pay & Generate Private Link</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Main Client completes payment. Our platform instantly locks in the certified interpreter and generates a secure, 1-click meeting link & QR code.
            </p>
          </div>

          <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4 text-center relative hover:border-amber-500/40 transition">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-amber-600/30">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Send Link to Guest & Connect</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Main Client shares the link with their guest via SMS/WhatsApp. At meeting time, all 3 parties connect in the private 3-way interpretation room!
            </p>
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE LANGUAGE COVERAGE EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-400" />
                <span>Explore Our 150+ Supported Languages</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Search real-time language availability and certified roster</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                placeholder="Search language (e.g. Spanish, Arabic)..."
                className="w-full glass-input pl-10 pr-3 py-2 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredLanguages.map((lang) => (
              <div 
                key={lang.code}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition flex items-center gap-2.5"
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{lang.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{lang.nativeName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING & ESTIMATOR */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Custom & Transparent Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Pay Only For What You Use</h2>
          <p className="text-slate-400 text-sm mt-2">No setup fees, no monthly minimums. Inquire for custom volume rates, prepaid minute packages, and corporate invoicing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Plan 1: Prepaid Minute Packs (Standard Clients - Charged Before Service) */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between hover:border-emerald-500/50 transition">
            <div className="space-y-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Prepaid Wallet (Charged Before Service)
              </span>
              <h3 className="text-2xl font-black text-white">Prepaid Minute Packs</h3>
              <div className="space-y-1">
                <div className="text-3xl font-black text-emerald-400">Custom Rates</div>
                <div className="text-slate-400 text-xs font-semibold">Pricing upon inquiry • Second-by-second billing</div>
              </div>
              <p className="text-xs text-slate-300">
                Pay in advance, receive instant minute credits in your live wallet. Deducts second-by-second during calls with zero overage surprises.
              </p>
              
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Minutes never expire</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live wallet tracker (Paid / Used / Remaining)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-click instant top-ups (60, 120, 300 mins)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-600/25"
            >
              Inquire for Prepaid Rates
            </button>
          </div>

          {/* Plan 2: Professional Practice Prepaid Bundle */}
          <div className="glass-panel p-8 rounded-3xl border-2 border-brand-500 bg-brand-950/20 space-y-6 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
              Most Popular
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300">
                Practice Bundle (Volume Discount)
              </span>
              <h3 className="text-2xl font-black text-white">120 Min Minute Wallet</h3>
              <div className="space-y-1">
                <div className="text-3xl font-black text-brand-300">Flexible Volume</div>
                <div className="text-slate-400 text-xs font-semibold">Special package rates available on request</div>
              </div>
              <p className="text-xs text-slate-300">Popular choice for clinics, legal attorneys, and recurring consultations.</p>
              
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>120 High Definition minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated Medical & Legal Specialists</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>HIPAA BAA & Court Certificate Included</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-brand-500/30 transition"
            >
              Ask for 120 Min Bundle Price
            </button>
          </div>

          {/* Plan 3: Enterprise Bulk Prepaid Package (Advance Custom Volume) */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between hover:border-purple-500/50 transition">
            <div className="space-y-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Enterprise & Hospital (Bulk Volume)
              </span>
              <h3 className="text-2xl font-black text-white">Enterprise Bulk Prepaid</h3>
              <div className="space-y-1">
                <div className="text-3xl font-black text-purple-300">Custom Advance Pool</div>
                <div className="text-slate-400 text-xs font-semibold">Volume tiered discounts for hospitals & firms</div>
              </div>
              <p className="text-xs text-slate-300">
                For hospitals, legal departments, and global enterprises requiring dedicated interpreter pools with advance wallet allocation.
              </p>
              
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom pooled minute packages (500 to 5,000+ mins)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Itemized department billing codes & reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated certified interpreter roster</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition shadow-lg shadow-purple-600/25"
            >
              Inquire for Enterprise Bulk Rates
            </button>
          </div>

        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-brand-300"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-brand-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7.5 CERTIFIED LINGUIST ONBOARDING CTA BANNER */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
              Career & Credentialing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Are you a Certified Interpreter? Join Our Global Roster
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Submit your CV, languages, and credentials to the <strong className="text-white">IK Enterprises Verification Board</strong>. Earn competitive hourly rates with flexible remote schedules.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenInterpreterApplication) onOpenInterpreterApplication();
              else onOpenAuth('signup');
            }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 shrink-0 flex items-center gap-2"
          >
            <Award className="w-5 h-5" />
            <span>Apply as Certified Linguist</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-800/80 pt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <Globe className="w-5 h-5 text-brand-400" />
              <span>LinguaBridge</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Global on-demand & scheduled 3-party interpretation portal connecting English speakers, non-English clients, and certified linguists.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Interpretation Modalities</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-white">Audio Over-the-Phone (OPI)</a></li>
              <li><a href="#services" className="hover:text-white">Video Remote (VRI)</a></li>
              <li><a href="#services" className="hover:text-white">Scheduled Appointments</a></li>
              <li><a href="#services" className="hover:text-white">American Sign Language (ASL)</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Specialized Verticals</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-white">Healthcare & Telemedicine</a></li>
              <li><a href="#services" className="hover:text-white">Legal, Courts & Depositions</a></li>
              <li><a href="#services" className="hover:text-white">Banking, Mortgages & Insurance</a></li>
              <li><a href="#services" className="hover:text-white">Education & IEP Conferences</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Compliance & Security</h4>
            <p className="text-[11px] leading-relaxed mb-3">
              HIPAA Compliant, SOC 2 Type II Certified, ISO 17100 Certified Translation & Interpretation Quality.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>256-Bit Encrypted WebRTC</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 py-6 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} LinguaBridge Technologies Inc. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
