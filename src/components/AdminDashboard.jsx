import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  Headphones, 
  Clock, 
  TrendingUp, 
  Globe, 
  CheckCircle2, 
  Search, 
  Filter, 
  FileText, 
  DollarSign,
  Download,
  Star,
  PhoneCall
} from 'lucide-react';
import { INITIAL_INTERPRETERS } from '../data/mockData';

export default function AdminDashboard({ callLogs = [], appointments = [] }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'roster', 'billing'
  const [searchTerm, setSearchTerm] = useState('');

  const interpretersList = INITIAL_INTERPRETERS;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Platform Dispatch & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            System Overview & Interpreter Operations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time quality monitoring, language queue analytics, and billing ledger
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'roster' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Interpreter Roster
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'billing' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Call Logs & Invoicing
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active 3-Way Calls</span>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white mt-2">18 Live</p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">
            ● 0 calls waiting in queue
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Online Interpreters</span>
            <Headphones className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">42 Certified</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
            Covering 36 language pairs
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Connect Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">11.4 sec</p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">
            ↓ 3.2s faster than SLA target
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Client Satisfaction</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">4.97 / 5.0</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
            Based on 1,480 ratings
          </span>
        </div>
      </div>

      {/* TAB 1: Live Overview & Demand Breakdown */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Active Conference Rooms */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Active Sessions Matrix</span>
                </h3>
                <span className="text-xs text-slate-400">Auto-refreshing live</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-extrabold text-white">Mercy General Emergency</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                        Spanish (Medical)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Host: Dr. Jenkins ⟷ Interpreter: Elena Rodriguez ⟷ Client: Carlos H.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-amber-400">14m 20s</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Stable 1080p
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-extrabold text-white">Vance & Sterling Immigration</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Arabic (Legal)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Host: Marcus Vance, Esq. ⟷ Interpreter: Dr. Tarek Al-Mansoor ⟷ Client: Amira H.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-amber-400">08m 45s</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Stable 1080p
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-extrabold text-white">First Horizon Commercial Banking</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        Mandarin (Financial)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Host: Loan Officer Sterling ⟷ Interpreter: Mei-Ling Chen ⟷ Client: Bao Wei
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-amber-400">22m 10s</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Stable 1080p
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Demand Pie / Percentage Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-400" />
                <span>Today's Language Demand</span>
              </h3>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Spanish (Español)</span>
                    <span className="text-brand-400">48%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: '48%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Mandarin / Cantonese</span>
                    <span className="text-indigo-400">22%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '22%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Arabic (العربية)</span>
                    <span className="text-emerald-400">14%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Vietnamese (Tiếng Việt)</span>
                    <span className="text-amber-400">9%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '9%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>French & Haitian Creole</span>
                    <span className="text-purple-400">7%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '7%' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Interpreter Roster */}
      {activeTab === 'roster' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-400" />
              <span>Certified Interpreter Registry</span>
            </h3>
            <span className="text-xs text-slate-400">5 Verified Linguists on Shift</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Interpreter</th>
                  <th className="pb-3 font-semibold">Language Pairs</th>
                  <th className="pb-3 font-semibold">Specialties</th>
                  <th className="pb-3 font-semibold">Certifications</th>
                  <th className="pb-3 font-semibold">Rating & Calls</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {interpretersList.map((interp) => (
                  <tr key={interp.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-bold text-white flex items-center gap-3">
                      <img src={interp.avatar} alt={interp.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <p>{interp.name}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{interp.id}</p>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">{interp.languages.join(', ')}</td>
                    <td className="py-3 text-slate-400">{interp.specialties.join(', ')}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                        {interp.certifications[0]}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-amber-400">
                      ★ {interp.rating} <span className="text-slate-400 font-normal">({interp.totalCalls})</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        interp.status === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {interp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-white">\${interp.hourlyRate}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Client Minute Wallets, Call Logs & Invoicing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          
          {/* 🌟 1. CLIENT PREPAID MINUTE WALLETS & ENTERPRISE LEDGER */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Client Prepaid Minute Accounts & Corporate Ledger</span>
                </h3>
                <p className="text-xs text-slate-400">Real-time overview of clients charged in advance vs hospital post-paid credit lines</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Total Prepaid Liability: 840 Mins ($756.00)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Client & Account</th>
                    <th className="pb-3 font-semibold">Billing Architecture</th>
                    <th className="pb-3 font-semibold">Total Paid ($)</th>
                    <th className="pb-3 font-semibold">Minutes Credited</th>
                    <th className="pb-3 font-semibold">Minutes Used</th>
                    <th className="pb-3 font-semibold">Remaining Balance</th>
                    <th className="pb-3 font-semibold text-right">Account Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-bold text-white">
                      <p>Dr. Sarah Jenkins, MD</p>
                      <p className="text-[10px] text-slate-400 font-normal">Cardiology Dept (#CL-8492)</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Prepaid (Charged Upfront)
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">$153.00</td>
                    <td className="py-3 text-brand-400 font-bold">180 mins</td>
                    <td className="py-3 text-amber-400 font-semibold">95 mins</td>
                    <td className="py-3 font-black text-emerald-400 text-sm">85 mins left</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => alert('Credit adjustment modal for Dr. Sarah Jenkins')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-bold text-white">
                      <p>Vance & Sterling Immigration</p>
                      <p className="text-[10px] text-slate-400 font-normal">Marcus Vance, Esq. (#CL-7104)</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Prepaid (Charged Upfront)
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">$300.00</td>
                    <td className="py-3 text-brand-400 font-bold">360 mins</td>
                    <td className="py-3 text-amber-400 font-semibold">210 mins</td>
                    <td className="py-3 font-black text-emerald-400 text-sm">150 mins left</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => alert('Credit adjustment modal for Vance & Sterling')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-bold text-white">
                      <p>Sr. Carlos Hernandez (Self-Payer)</p>
                      <p className="text-[10px] text-slate-400 font-normal">Spanish Client Account (#CL-3921)</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        Prepaid (Charged Upfront)
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">$54.00</td>
                    <td className="py-3 text-brand-400 font-bold">60 mins</td>
                    <td className="py-3 text-amber-400 font-semibold">30 mins</td>
                    <td className="py-3 font-black text-emerald-400 text-sm">30 mins left</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => alert('Credit adjustment modal for Carlos Hernandez')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition bg-purple-950/10">
                    <td className="py-3 font-bold text-white">
                      <p>Mercy General Health System</p>
                      <p className="text-[10px] text-slate-400 font-normal">Hospital System (#HOSP-8921)</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                        Post-Paid (Net 30 Invoiced After Delivery)
                      </span>
                    </td>
                    <td className="py-3 font-bold text-purple-300">Monthly Net 30</td>
                    <td className="py-3 text-slate-400">Unlimited Corp</td>
                    <td className="py-3 text-amber-400 font-bold">482 mins this mo</td>
                    <td className="py-3 font-bold text-purple-300">$457.90 accrued</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => alert('Generated Net 30 Statement for Mercy General')}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition"
                      >
                        Send Monthly Bill
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. COMPLETED CALL LOGS */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span>Completed Session Logs & Itemized Charges</span>
                </h3>
                <p className="text-xs text-slate-400">Call-by-call breakdown of prepaid deductions and post-paid records</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700">
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Host / Payer</th>
                    <th className="pb-3 font-semibold">Client & Language</th>
                    <th className="pb-3 font-semibold">Interpreter</th>
                    <th className="pb-3 font-semibold">Duration</th>
                    <th className="pb-3 font-semibold">Settlement Method</th>
                    <th className="pb-3 font-semibold text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {callLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-medium text-white">{log.date}</td>
                      <td className="py-3 text-slate-300">
                        <p className="font-semibold">{log.hostName}</p>
                        <p className="text-[10px] text-slate-500">{log.hostOrg}</p>
                      </td>
                      <td className="py-3 text-slate-300">{log.clientName}</td>
                      <td className="py-3 text-emerald-400 font-medium">{log.interpreterName}</td>
                      <td className="py-3 font-mono text-slate-300">{log.duration}</td>
                      <td className="py-3">
                        <span className="text-xs font-bold text-white">
                          {log.cost}
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-medium">Prepaid Deducted</span>
                      </td>
                      <td className="py-3 text-right text-amber-400 font-bold">★ {log.rating}.0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
