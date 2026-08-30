import React, { useState, useEffect } from 'react';
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
  PhoneCall,
  UserPlus,
  Plus,
  Trash2,
  Edit,
  Key,
  ShieldCheck,
  CreditCard,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES } from '../data/mockData';

export default function AdminDashboard({ callLogs = [], appointments = [] }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'roster', 'billing', 'users'
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Dynamic user list
  const [usersList, setUsersList] = useState([
    {
      id: 'usr-owner-ikram',
      name: 'Ikram-ul-haq Mian',
      email: 'ik5928271@gmail.com',
      role: 'admin',
      isOwner: true,
      org: 'IK Enterprises',
      primaryLang: 'All Languages',
      specialty: 'Master Operations & Platform Owner',
      hourlyRate: 0,
      wallet: { totalPaid: 1000, totalMinutesPurchased: 9999, minutesRemaining: 9999, billingType: 'unlimited_owner' },
      createdAt: '2026-08-30'
    }
  ]);

  // Modal for creating new accounts
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAccountRole, setNewAccountRole] = useState('host'); // 'admin', 'interpreter', 'host'
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('pass123');
  const [formOrg, setFormOrg] = useState('');
  const [formLang, setFormLang] = useState('Spanish');
  const [formSpecialty, setFormSpecialty] = useState('Medical / Healthcare');
  const [formHourlyRate, setFormHourlyRate] = useState(5);
  const [formInitialMinutes, setFormInitialMinutes] = useState(120);
  const [formBillingType, setFormBillingType] = useState('prepaid');

  // Modal for EDITING existing accounts
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editOrg, setEditOrg] = useState('');
  const [editRole, setEditRole] = useState('host');
  const [editLang, setEditLang] = useState('Spanish');
  const [editSpecialty, setEditSpecialty] = useState('Medical / Healthcare');
  const [editHourlyRate, setEditHourlyRate] = useState(5);
  const [editMinutes, setEditMinutes] = useState(60);
  const [editTotalPaid, setEditTotalPaid] = useState(0);

  // Fetch users from backend
  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUsersList(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateAccount = (e) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      password: formPassword,
      role: newAccountRole,
      org: formOrg || (newAccountRole === 'admin' ? 'IK Enterprises Operations' : newAccountRole === 'interpreter' ? 'Certified Linguist Pool' : 'IK Enterprises Client'),
      primaryLang: formLang,
      specialty: formSpecialty,
      hourlyRate: parseInt(formHourlyRate) || 5,
      initialMinutes: parseInt(formInitialMinutes) || 60,
      billingType: formBillingType
    };

    fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUsersList(prev => [data.user, ...prev.filter(u => u.id !== data.user.id)]);
          setIsCreateModalOpen(false);
          setFormName('');
          setFormEmail('');
          setFormOrg('');
          setFormHourlyRate(5);
        }
      })
      .catch(() => {
        const localUser = {
          id: `usr-${Date.now()}`,
          ...payload,
          wallet: { totalPaid: payload.initialMinutes * 0.95, minutesRemaining: payload.initialMinutes }
        };
        setUsersList(prev => [localUser, ...prev]);
        setIsCreateModalOpen(false);
      });
  };

  const handleOpenEditModal = (u) => {
    setEditingUserId(u.id);
    setEditName(u.name || '');
    setEditEmail(u.email || '');
    setEditOrg(u.org || '');
    setEditRole(u.role || 'host');
    setEditLang(u.primaryLang || 'Spanish');
    setEditSpecialty(u.specialty || 'General');
    setEditHourlyRate(u.hourlyRate !== undefined ? u.hourlyRate : (u.interpreterProfile?.hourlyRate !== undefined ? u.interpreterProfile.hourlyRate : 5));
    setEditMinutes(u.wallet?.minutesRemaining !== undefined ? u.wallet.minutesRemaining : 60);
    setEditTotalPaid(u.wallet?.totalPaid !== undefined ? u.wallet.totalPaid : 0);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const payload = {
      name: editName,
      email: editEmail,
      org: editOrg,
      role: editRole,
      primaryLang: editLang,
      specialty: editSpecialty,
      hourlyRate: parseInt(editHourlyRate) || 5,
      minutesRemaining: parseInt(editMinutes) || 0,
      totalPaid: parseFloat(editTotalPaid) || 0
    };

    fetch(`/api/admin/users/${editingUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsersList(prev => prev.map(u => u.id === editingUserId ? { ...u, ...payload, wallet: data.wallet || u.wallet } : u));
          setIsEditModalOpen(false);
        }
      })
      .catch(() => {
        setUsersList(prev => prev.map(u => u.id === editingUserId ? { ...u, ...payload } : u));
        setIsEditModalOpen(false);
      });
  };

  const handleGrantMinutes = (userId, minutes = 60) => {
    fetch(`/api/admin/users/${userId}/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutesToAdd: minutes, amountPaid: minutes * 0.90 })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsersList(prev => prev.map(u => u.id === userId ? { ...u, wallet: data.wallet } : u));
        }
      })
      .catch(() => {
        setUsersList(prev => prev.map(u => {
          if (u.id === userId) {
            const currentMins = u.wallet?.minutesRemaining || 0;
            return { ...u, wallet: { ...u.wallet, minutesRemaining: currentMins + minutes } };
          }
          return u;
        }));
      });
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this account?')) {
      fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
        .then(() => {
          setUsersList(prev => prev.filter(u => u.id !== userId));
        })
        .catch(() => {
          setUsersList(prev => prev.filter(u => u.id !== userId));
        });
    }
  };

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.org && user.org.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (userRoleFilter === 'all') return matchesSearch;
    if (userRoleFilter === 'admin') return matchesSearch && user.role === 'admin';
    if (userRoleFilter === 'interpreter') return matchesSearch && user.role === 'interpreter';
    if (userRoleFilter === 'host') return matchesSearch && user.role === 'host';
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner with Owner Profile */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Master Platform Owner & Dispatch</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <span>IK Enterprises Control Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as: <strong className="text-white">Ikram-ul-haq Mian</strong> (<span className="text-purple-300">ik5928271@gmail.com</span>) • Full Root Privileges
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User & Account Manager</span>
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'roster' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Interpreters
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'billing' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ledger & Billing
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Registered Accounts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{usersList.length} Accounts</p>
          <span className="text-[11px] text-purple-300 font-medium mt-1 inline-block">
            Managed under IK Enterprises
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active 3-Way Calls</span>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white mt-2">Live WebRTC</p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">
            ● 0 dispatch wait time
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Available Interpreters</span>
            <Headphones className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">150+ Languages</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
            Russian, Spanish, Arabic, Hindi...
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Prepaid Balance System</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">Active</p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">
            Advance Minute Wallets + Net 30
          </span>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: 👑 USER & ACCOUNT MANAGEMENT SUITE (MASTER ACCESS) */}
      {/* ========================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Account Provisioning & Management</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create, edit rates, adjust balances, or remove accounts across the platform
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  setNewAccountRole('host');
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/25 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Create Client / Payer</span>
              </button>

              <button
                onClick={() => {
                  setNewAccountRole('interpreter');
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>+ Create Interpreter</span>
              </button>

              <button
                onClick={() => {
                  setNewAccountRole('admin');
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>+ Create Sub-Admin</span>
              </button>
            </div>
          </div>

          {/* User Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${userRoleFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All Accounts ({usersList.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('host')}
                className={`px-3 py-1.5 rounded-lg transition ${userRoleFilter === 'host' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Clients / Payers
              </button>
              <button
                onClick={() => setUserRoleFilter('interpreter')}
                className={`px-3 py-1.5 rounded-lg transition ${userRoleFilter === 'interpreter' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Interpreters
              </button>
              <button
                onClick={() => setUserRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg transition ${userRoleFilter === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Admins
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or org..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* User Accounts Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                    <th className="py-3.5 px-4 font-semibold">User & Organization</th>
                    <th className="py-3.5 px-4 font-semibold">Email</th>
                    <th className="py-3.5 px-4 font-semibold">Account Role</th>
                    <th className="py-3.5 px-4 font-semibold">Language / Domain</th>
                    <th className="py-3.5 px-4 font-semibold">Wallet / Rates</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Owner Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => {
                    const isMasterOwner = u.isOwner || u.email === 'ik5928271@gmail.com';
                    const activeRate = u.hourlyRate !== undefined ? u.hourlyRate : (u.interpreterProfile?.hourlyRate !== undefined ? u.interpreterProfile.hourlyRate : 5);

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-white ${
                              isMasterOwner ? 'bg-gradient-to-tr from-amber-500 to-purple-600 ring-2 ring-amber-400' :
                              u.role === 'admin' ? 'bg-purple-600' :
                              u.role === 'interpreter' ? 'bg-emerald-600' : 'bg-brand-600'
                            }`}>
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isMasterOwner && (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    👑 MASTER OWNER
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400">{u.org || 'IK Enterprises'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>

                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            u.role === 'interpreter' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          }`}>
                            {u.role === 'host' ? 'Client (Payer)' : u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          <p className="font-medium">{u.primaryLang || 'English'}</p>
                          <p className="text-[10px] text-slate-500">{u.specialty || 'General'}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.role === 'interpreter' ? (
                            <span className="font-mono text-emerald-400 font-bold">${activeRate} / hr</span>
                          ) : isMasterOwner ? (
                            <span className="text-amber-300 font-bold">Unlimited Root</span>
                          ) : (
                            <div>
                              <span className="font-bold text-white">{u.wallet?.minutesRemaining || 60} Mins</span>
                              <span className="text-[10px] text-slate-400 block">${u.wallet?.totalPaid || 0} Paid</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Button for all accounts */}
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              title="Edit Account Details & Rates"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                            >
                              <Edit className="w-3.5 h-3.5 text-brand-300" />
                            </button>

                            {u.role === 'host' && (
                              <button
                                onClick={() => handleGrantMinutes(u.id, 60)}
                                title="Grant 60 Free Prepaid Minutes"
                                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30"
                              >
                                +60 Mins
                              </button>
                            )}

                            {!isMasterOwner && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                title="Remove User Account"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1. PROVISION NEW ACCOUNT MODAL */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/40 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Create New System Account</h3>
                      <p className="text-xs text-slate-400">Provision account with custom access and rates</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Account Type to Provision:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewAccountRole('host')}
                        className={`p-2 rounded-xl border text-center font-bold transition ${newAccountRole === 'host' ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                      >
                        Client / Payer
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAccountRole('interpreter')}
                        className={`p-2 rounded-xl border text-center font-bold transition ${newAccountRole === 'interpreter' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                      >
                        Interpreter
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAccountRole('admin')}
                        className={`p-2 rounded-xl border text-center font-bold transition ${newAccountRole === 'admin' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                      >
                        Sub-Admin
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Maria Gonzalez"
                        className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Organization / Company</label>
                      <input
                        type="text"
                        value={formOrg}
                        onChange={(e) => setFormOrg(e.target.value)}
                        placeholder="e.g. IK Enterprises"
                        className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Password</label>
                      <input
                        type="text"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {newAccountRole === 'interpreter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Primary Language</label>
                        <select
                          value={formLang}
                          onChange={(e) => setFormLang(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                        >
                          {LANGUAGES.map(l => <option key={l.code} value={l.name}>{l.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Hourly Rate ($ / hr)</label>
                        <input
                          type="number"
                          value={formHourlyRate}
                          onChange={(e) => setFormHourlyRate(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  {newAccountRole === 'host' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Initial Minute Credits</label>
                        <input
                          type="number"
                          value={formInitialMinutes}
                          onChange={(e) => setFormInitialMinutes(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Billing Settlement</label>
                        <select
                          value={formBillingType}
                          onChange={(e) => setFormBillingType(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                        >
                          <option value="prepaid">Prepaid Minutes Wallet</option>
                          <option value="postpaid_hospital">Hospital Net-30 Invoicing</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create & Activate Account</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. EDIT ACCOUNT MODAL */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/40 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold">
                      <Edit className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Edit Account & Rates</h3>
                      <p className="text-xs text-slate-400">Update rates, email, organization, or minutes</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Organization / Company</label>
                      <input
                        type="text"
                        value={editOrg}
                        onChange={(e) => setEditOrg(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Account Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                      >
                        <option value="host">Client / Payer</option>
                        <option value="interpreter">Certified Interpreter</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>

                  {editRole === 'interpreter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Primary Language</label>
                        <select
                          value={editLang}
                          onChange={(e) => setEditLang(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                        >
                          {LANGUAGES.map(l => <option key={l.code} value={l.name}>{l.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Hourly Rate ($ / hr)</label>
                        <input
                          type="number"
                          value={editHourlyRate}
                          onChange={(e) => setEditHourlyRate(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {editRole === 'host' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Remaining Minutes</label>
                        <input
                          type="number"
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-300">Total Paid ($)</label>
                        <input
                          type="number"
                          value={editTotalPaid}
                          onChange={(e) => setEditTotalPaid(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-brand-500/30 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: LIVE OPERATIONS MONITOR */}
      {/* ========================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Call Map & Dispatch Queue */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Live 3-Party Dispatch Queue</span>
                  </h3>
                  <p className="text-xs text-slate-400">Incoming match requests and active video/audio bridges</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-Time WebSockets</span>
                </span>
              </div>

              {/* Dynamic Live Sessions List */}
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-white">0 Active Calls in Progress</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When a client initiates a live On-Demand or Scheduled 3-party session, the real-time audio/video bridge will appear here live.
                </p>
              </div>

            </div>

            {/* Operations Status */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>System Operations Status</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Socket.io Dispatch Engine</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Operational
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">WebRTC Audio/Video Server</span>
                  <span className="text-emerald-400 font-bold">Online</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Prepaid Minute Ledger</span>
                  <span className="text-purple-300 font-bold">Active</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Available Language Pairs</span>
                  <span className="text-white font-bold">150+ Ready</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: REAL INTERPRETER ROSTER */}
      {/* ========================================================== */}
      {activeTab === 'roster' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-400" />
                <span>Registered Interpreters & Active Linguist Pool</span>
              </h3>
              <p className="text-xs text-slate-400">Manage real registered linguists, language pairs, and rates</p>
            </div>
            <button
              onClick={() => {
                setNewAccountRole('interpreter');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add / Register Interpreter</span>
            </button>
          </div>

          {usersList.filter(u => u.role === 'interpreter').length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Headphones className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-white">No Interpreters Registered Yet</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "+ Add / Register Interpreter" or have linguists sign up online to populate your active roster.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersList.filter(u => u.role === 'interpreter').map((i) => {
                const rate = i.hourlyRate !== undefined ? i.hourlyRate : (i.interpreterProfile?.hourlyRate !== undefined ? i.interpreterProfile.hourlyRate : 5);
                return (
                  <div key={i.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center">
                          {i.name?.charAt(0) || 'I'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{i.name}</p>
                          <p className="text-[11px] text-brand-300">{i.primaryLang || 'Spanish'} ⟷ English</p>
                          <span className="text-[10px] text-emerald-400 font-semibold">● Online & Ready</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenEditModal(i)}
                        title="Edit Interpreter Rate & Details"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        <Edit className="w-3.5 h-3.5 text-brand-300" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 space-y-1">
                      <p>Domain: <strong className="text-slate-200">{i.specialty || 'General / Healthcare'}</strong></p>
                      <p>Email: <strong className="text-slate-300 font-mono text-[10px]">{i.email}</strong></p>
                      <p>Hourly Rate: <strong className="text-white font-mono font-bold">${rate} / hr</strong></p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: REAL CLIENT LEDGER & BILLING */}
      {/* ========================================================== */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Real Client Accounts & Prepaid Minute Ledgers</span>
                </h3>
                <p className="text-xs text-slate-400">Live itemized balances of registered client wallets</p>
              </div>
            </div>

            {usersList.filter(u => u.role === 'host').length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                  <DollarSign className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-white">No Client Ledgers Yet</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When clients sign up and top up prepaid minutes or request hospital Net-30 invoicing, their balances will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Client / Organization</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Billing Plan</th>
                      <th className="pb-3 font-semibold">Total Paid</th>
                      <th className="pb-3 font-semibold text-right">Remaining Minutes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.filter(u => u.role === 'host').map((client) => (
                      <tr key={client.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 text-white font-bold">
                          <p>{client.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{client.org || 'Independent Client'}</p>
                        </td>
                        <td className="py-3 font-mono text-slate-300">{client.email}</td>
                        <td className="py-3 text-brand-300 font-semibold capitalize">
                          {client.wallet?.billingType === 'postpaid_hospital' ? 'Hospital Net 30' : 'Prepaid Wallet'}
                        </td>
                        <td className="py-3 font-mono font-bold text-white">
                          ${(client.wallet?.totalPaid || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">
                            {client.wallet?.minutesRemaining || 0} Mins
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
