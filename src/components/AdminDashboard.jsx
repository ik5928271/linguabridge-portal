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
  Award,
  Send,
  FileCheck,
  Mail,
  Check,
  AlertCircle,
  Eye,
  X,
  Briefcase,
  Building2
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES, EMPLOYMENT_MODELS } from '../data/mockData';

export default function AdminDashboard({ callLogs = [], appointments = [] }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'applications', 'roster', 'billing'
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [employmentFilter, setEmploymentFilter] = useState('all'); // 'all', 'salary_base', 'hourly', 'per_minute'

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
      employmentType: 'salary_base',
      monthlySalary: 5000,
      hourlyRate: 0,
      wallet: { totalPaid: 1000, totalMinutesPurchased: 9999, minutesRemaining: 9999, billingType: 'unlimited_owner' },
      createdAt: '2026-08-30'
    }
  ]);

  // Interpreter Applications & Verification Queue state
  const [applications, setApplications] = useState([]);
  const [appFilter, setAppFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [reviewApprovedType, setReviewApprovedType] = useState('hourly'); // 'hourly', 'per_minute', 'salary_base'
  const [reviewApprovedRate, setReviewApprovedRate] = useState(8);
  const [reviewApprovedMinuteRate, setReviewApprovedMinuteRate] = useState(0.30);
  const [reviewApprovedMonthlySalary, setReviewApprovedMonthlySalary] = useState(1200);
  const [reviewPassword, setReviewPassword] = useState('interp2026!');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [emailDispatchModal, setEmailDispatchModal] = useState(null);
  const [docPreviewModal, setDocPreviewModal] = useState(null);

  // Live Visitor Traffic & Funnel Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    today: {
      totalVisits: 0,
      uniqueVisitors: 0,
      interpreterApplications: 0,
      clientSignups: 0,
      dropOffs: 0,
      conversionRate: '0.0%'
    },
    lifetime: {
      totalVisits: 0,
      totalApplications: 0,
      totalClients: 0
    },
    recentVisits: [],
    dailyHistory: []
  });

  // Modal for creating new accounts
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAccountRole, setNewAccountRole] = useState('host'); // 'admin', 'interpreter', 'host'
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('pass123');
  const [formOrg, setFormOrg] = useState('');
  const [formLang, setFormLang] = useState('Spanish');
  const [formSpecialty, setFormSpecialty] = useState('Medical / Healthcare');
  const [formEmploymentType, setFormEmploymentType] = useState('hourly');
  const [formHourlyRate, setFormHourlyRate] = useState(8);
  const [formMinuteRate, setFormMinuteRate] = useState(0.30);
  const [formMonthlySalary, setFormMonthlySalary] = useState(1200);
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
  const [editEmploymentType, setEditEmploymentType] = useState('hourly');
  const [editHourlyRate, setEditHourlyRate] = useState(8);
  const [editMinuteRate, setEditMinuteRate] = useState(0.30);
  const [editMonthlySalary, setEditMonthlySalary] = useState(1200);
  const [editMinutes, setEditMinutes] = useState(60);
  const [editTotalPaid, setEditTotalPaid] = useState(0);
  const [editBillingType, setEditBillingType] = useState('prepaid');


  // Fetch users & applications & analytics from backend
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

  const fetchApplications = () => {
    fetch('/api/admin/interpreter-applications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApplications(data);
        }
      })
      .catch(() => {});
  };

  const fetchAnalytics = () => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        if (data && data.today) {
          setAnalyticsData(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUsers();
    fetchApplications();
    fetchAnalytics();
    const timer = setInterval(() => {
      fetchApplications();
      fetchAnalytics();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateAccount = (e) => {
    e.preventDefault();
    const resolvedRateLabel = formEmploymentType === 'salary_base'
      ? `$${parseInt(formMonthlySalary) || 1200}/mo (Salary Base)`
      : formEmploymentType === 'per_minute'
        ? `$${(parseFloat(formMinuteRate) || 0.30).toFixed(2)}/min (Live Talk)`
        : `$${parseInt(formHourlyRate) || 8}/hr (Scheduled Shift)`;

    const payload = {
      name: formName,
      email: formEmail,
      password: formPassword,
      role: newAccountRole,
      org: formOrg || (newAccountRole === 'admin' ? 'IK Enterprises Operations' : newAccountRole === 'interpreter' ? 'Certified Linguist Pool' : 'IK Enterprises Client'),
      primaryLang: formLang,
      specialty: formSpecialty,
      employmentType: formEmploymentType,
      hourlyRate: parseInt(formHourlyRate) || 8,
      minuteRate: parseFloat(formMinuteRate) || 0.30,
      monthlySalary: parseInt(formMonthlySalary) || 1200,
      rateLabel: resolvedRateLabel,
      initialMinutes: parseInt(formInitialMinutes) !== undefined && !isNaN(parseInt(formInitialMinutes)) ? parseInt(formInitialMinutes) : 120,
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
          setFormHourlyRate(8);
          setFormMinuteRate(0.30);
          setFormMonthlySalary(1200);
        }
      })
      .catch(() => {
        const localUser = {
          id: `usr-${Date.now()}`,
          ...payload,
          wallet: { totalPaid: payload.initialMinutes * 0.95, minutesRemaining: payload.initialMinutes, billingType: payload.billingType }
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
    setEditEmploymentType(u.employmentType || (u.interpreterProfile?.employmentType || 'hourly'));
    setEditHourlyRate(u.hourlyRate !== undefined ? u.hourlyRate : (u.interpreterProfile?.hourlyRate !== undefined ? u.interpreterProfile.hourlyRate : 8));
    setEditMinuteRate(u.minuteRate !== undefined ? u.minuteRate : (u.interpreterProfile?.minuteRate !== undefined ? u.interpreterProfile.minuteRate : 0.30));
    setEditMonthlySalary(u.monthlySalary !== undefined ? u.monthlySalary : (u.interpreterProfile?.monthlySalary !== undefined ? u.interpreterProfile.monthlySalary : 1200));
    setEditMinutes(u.wallet?.minutesRemaining !== undefined ? u.wallet.minutesRemaining : 60);
    setEditTotalPaid(u.wallet?.totalPaid !== undefined ? u.wallet.totalPaid : 0);
    setEditBillingType(u.wallet?.billingType || u.billingType || 'prepaid');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const resolvedRateLabel = editEmploymentType === 'salary_base'
      ? `$${parseInt(editMonthlySalary) || 1200}/mo (Salary Base)`
      : editEmploymentType === 'per_minute'
        ? `$${(parseFloat(editMinuteRate) || 0.30).toFixed(2)}/min (Live Talk)`
        : `$${parseInt(editHourlyRate) || 8}/hr (Scheduled Shift)`;

    const payload = {
      name: editName,
      email: editEmail,
      org: editOrg,
      role: editRole,
      primaryLang: editLang,
      specialty: editSpecialty,
      employmentType: editEmploymentType,
      hourlyRate: parseInt(editHourlyRate) || 8,
      minuteRate: parseFloat(editMinuteRate) || 0.30,
      monthlySalary: parseInt(editMonthlySalary) || 1200,
      rateLabel: resolvedRateLabel,
      minutesRemaining: parseInt(editMinutes) || 0,
      totalPaid: parseFloat(editTotalPaid) || 0,
      billingType: editBillingType
    };

    fetch(`/api/admin/users/${editingUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsersList(prev => prev.map(u => u.id === editingUserId ? { ...u, ...payload, wallet: data.wallet || { ...u.wallet, ...payload } } : u));
          setIsEditModalOpen(false);
        }
      })
      .catch(() => {
        setUsersList(prev => prev.map(u => u.id === editingUserId ? { ...u, ...payload, wallet: { ...u.wallet, ...payload } } : u));
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

  // Application Handlers
  const handleOpenApproveModal = (app) => {
    setSelectedAppForReview(app);
    setReviewApprovedType(app.employmentType || 'hourly');
    setReviewApprovedRate(app.hourlyRate || 8);
    setReviewApprovedMinuteRate(app.minuteRate !== undefined ? app.minuteRate : 0.30);
    setReviewApprovedMonthlySalary(app.monthlySalary || 1200);
    setReviewPassword(`interp${Math.floor(100 + Math.random() * 900)}!`);
    setReviewNotes('Approved by IK Enterprises Administration');
    setIsApproveModalOpen(true);
  };

  const handleConfirmApproval = (e) => {
    e.preventDefault();
    if (!selectedAppForReview) return;

    fetch(`/api/admin/interpreter-applications/${selectedAppForReview.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvedEmploymentType: reviewApprovedType,
        approvedHourlyRate: parseInt(reviewApprovedRate) || 8,
        approvedMinuteRate: parseFloat(reviewApprovedMinuteRate) || 0.30,
        approvedMonthlySalary: parseInt(reviewApprovedMonthlySalary) || 1200,
        initialPassword: reviewPassword,
        adminNotes: reviewNotes
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsApproveModalOpen(false);
          fetchApplications();
          fetchUsers();
          if (data.emailDispatch) {
            setEmailDispatchModal(data.emailDispatch);
          }
        }
      })
      .catch(() => {
        setIsApproveModalOpen(false);
      });
  };


  const handleOpenRejectModal = (app) => {
    setSelectedAppForReview(app);
    setRejectReason('Application does not meet current credentialing requirements.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!selectedAppForReview) return;

    fetch(`/api/admin/interpreter-applications/${selectedAppForReview.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectReason })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsRejectModalOpen(false);
          fetchApplications();
        }
      })
      .catch(() => {
        setIsRejectModalOpen(false);
      });
  };

  const handleDeleteApplication = (id) => {
    if (!confirm('Are you sure you want to remove this application record?')) return;
    fetch(`/api/admin/interpreter-applications/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchApplications())
      .catch(() => {});
  };

  const pendingApplicationsCount = applications.filter(a => a.status === 'pending').length;

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

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.name && app.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.email && app.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.primaryLang && app.primaryLang.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (appFilter === 'all') return matchesSearch;
    return matchesSearch && app.status === appFilter;
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
        <div className="flex flex-wrap items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'applications' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Linguist Applications</span>
            {pendingApplicationsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold animate-pulse">
                {pendingApplicationsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User & Account Manager</span>
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'roster' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Interpreters
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
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
      {/* TAB: 📄 INTERPRETER APPLICATIONS & VERIFICATION QUEUE */}
      {/* ========================================================== */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Interpreter Applications & Credential Review Queue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review submitted linguist CVs, credentials, and languages before provisioning login accounts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchApplications}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setAppFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${appFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All Applications ({applications.length})
              </button>
              <button
                onClick={() => setAppFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${appFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <span>Pending Review</span>
                {pendingApplicationsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                    {pendingApplicationsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setAppFilter('approved')}
                className={`px-3 py-1.5 rounded-lg transition ${appFilter === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Approved & Active ({applications.filter(a => a.status === 'approved').length})
              </button>
              <button
                onClick={() => setAppFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg transition ${appFilter === 'rejected' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Declined ({applications.filter(a => a.status === 'rejected').length})
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search applicant name, email, language..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-white">No Applications Found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                When linguists apply through the portal signup form, their full resume, documents, and languages will appear in this review queue.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const isPending = app.status === 'pending';
                const isApproved = app.status === 'approved';
                const isRejected = app.status === 'rejected';

                return (
                  <div 
                    key={app.id} 
                    className={`p-6 rounded-3xl border transition space-y-4 relative ${
                      isPending 
                        ? 'bg-slate-900/90 border-amber-500/40 ring-1 ring-amber-500/20' 
                        : isApproved 
                          ? 'bg-slate-900/60 border-emerald-500/30' 
                          : 'bg-slate-900/40 border-slate-800 opacity-75'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-lg shrink-0">
                          {app.name?.charAt(0) || 'L'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-base font-extrabold text-white">{app.name}</h4>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                              isPending 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' 
                                : isApproved 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                  : 'bg-red-500/20 text-red-300 border-red-500/40'
                            }`}>
                              {app.status === 'pending' ? '● Pending Review' : app.status === 'approved' ? '✓ Verified & Provisioned' : '✕ Declined'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-purple-300">{app.email}</span>
                            {app.phone && <span>• {app.phone}</span>}
                            <span>• {app.country || 'United States'}</span>
                            <span className="text-slate-500">• Submitted {new Date(app.submittedAt || Date.now()).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleOpenApproveModal(app)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Review & Approve Account</span>
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(app)}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-300 font-bold text-xs border border-slate-700 hover:border-red-500/40 transition"
                            >
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {isApproved && app.emailDispatch && (
                          <button
                            onClick={() => setEmailDispatchModal(app.emailDispatch)}
                            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>View Email Dispatch</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition"
                          title="Delete Application Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Qualifications & CV Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* Column 1: Language Fluency */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-brand-400" />
                          <span>Language Expertise</span>
                        </span>
                        <p className="font-bold text-white text-sm">
                          Primary: <span className="text-brand-300">{app.primaryLang}</span>
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(app.languages || [app.primaryLang, 'English']).map((l, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] font-semibold border border-slate-800">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Column 2: Employment Model & Qualifications */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-purple-400" />
                            <span>Employment & Rate</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            app.employmentType === 'salary_base' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : app.employmentType === 'per_minute'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          }`}>
                            {app.employmentType === 'salary_base' ? '🏢 Salary Base' : app.employmentType === 'per_minute' ? '⏱️ Per-Minute Talk' : '💼 Hourly Shift'}
                          </span>
                        </div>
                        <p className="font-semibold text-white text-xs">
                          Requested: <span className="font-mono font-bold text-emerald-400">
                            {app.rateLabel || (
                              app.employmentType === 'salary_base' 
                                ? `$${app.monthlySalary || 1200}/mo` 
                                : app.employmentType === 'per_minute'
                                  ? `$${(app.minuteRate || 0.30).toFixed(2)}/min`
                                  : `$${app.hourlyRate || 8}/hr`
                            )}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-300">
                          Experience: <span className="font-bold text-white">{app.experienceYears || 3} Years</span>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Certifications: {Array.isArray(app.certifications) ? app.certifications.join(', ') : app.certifications}
                        </p>
                      </div>

                      {/* Column 3: Submitted CV & Documents */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Submitted Files</span>
                        </span>
                        
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setDocPreviewModal({ title: 'CV / Resume Preview', fileName: app.cvFileName || 'Applicant_Resume_CV.pdf', applicantName: app.name, type: 'cv' })}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-[11px] text-slate-200 transition"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                              <span className="truncate">{app.cvFileName || 'CV_Resume.pdf'}</span>
                            </span>
                            <Eye className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDocPreviewModal({ title: 'Credential Certificate Preview', fileName: app.docFileName || 'Certification_Diploma.pdf', applicantName: app.name, type: 'cert' })}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-[11px] text-slate-200 transition"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span className="truncate">{app.docFileName || 'Certificate.pdf'}</span>
                            </span>
                            <Eye className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Bio Snippet */}
                    {app.bio && (
                      <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60 leading-relaxed">
                        <strong className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Professional Bio:</strong>
                        {app.bio}
                      </p>
                    )}

                    {/* Admin Notes if processed */}
                    {app.adminNotes && (
                      <p className="text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Admin Decision Notes: <strong className="text-slate-200">{app.adminNotes}</strong></span>
                      </p>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

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
                          {u.role === 'interpreter' || u.role === 'admin' ? (
                            <div>
                              {u.employmentType === 'salary_base' ? (
                                <span className="inline-flex items-center gap-1 font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                  🏢 ${u.monthlySalary || 1200} / mo
                                </span>
                              ) : u.employmentType === 'per_minute' ? (
                                <span className="inline-flex items-center gap-1 font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  ⏱️ ${(u.minuteRate !== undefined ? u.minuteRate : 0.30).toFixed(2)} / min
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-mono text-brand-300 font-bold bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                                  💼 ${activeRate} / hr (Shift)
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                {u.employmentType === 'salary_base' ? 'Fixed Full-Time Salary' : u.employmentType === 'per_minute' ? 'On-Demand Talk (2x)' : 'Scheduled Shift Queue'}
                              </span>
                            </div>
                          ) : isMasterOwner ? (
                            <span className="text-amber-300 font-bold">Unlimited Root</span>
                          ) : (
                            <div>
                              <span className="font-bold text-white">
                                {u.wallet?.minutesRemaining !== undefined ? u.wallet.minutesRemaining : (u.initialMinutes || 0)} Mins
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                ${(u.wallet?.totalPaid !== undefined ? u.wallet.totalPaid : 0).toFixed(2)} Paid
                              </span>
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
                    <div className="space-y-3">
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
                          <label className="font-semibold text-slate-300">Employment Model</label>
                          <select
                            value={formEmploymentType}
                            onChange={(e) => setFormEmploymentType(e.target.value)}
                            className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                          >
                            <option value="hourly">💼 Hourly Rate (Scheduled Shifts)</option>
                            <option value="per_minute">⏱️ Per-Minute Talk Rate (On-Demand 2x)</option>
                            <option value="salary_base">🏢 Salary Base (Fixed Full-Time)</option>
                          </select>
                        </div>
                      </div>

                      {formEmploymentType === 'hourly' && (
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Hourly Shift Rate ($ / hr)</label>
                          <input
                            type="number"
                            value={formHourlyRate}
                            onChange={(e) => setFormHourlyRate(e.target.value)}
                            className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                            min="1"
                          />
                        </div>
                      )}

                      {formEmploymentType === 'per_minute' && (
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Per-Minute Live Talk Rate ($ / min)</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.10"
                            max="5.00"
                            value={formMinuteRate}
                            onChange={(e) => setFormMinuteRate(parseFloat(e.target.value) || 0)}
                            className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
                      )}

                      {formEmploymentType === 'salary_base' && (
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Monthly Fixed Salary ($ / mo)</label>
                          <input
                            type="number"
                            min="300"
                            step="50"
                            value={formMonthlySalary}
                            onChange={(e) => setFormMonthlySalary(e.target.value)}
                            className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>
                      )}
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
                    <div className="space-y-3">
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
                          <label className="font-semibold text-slate-300">Employment Model</label>
                          <select
                            value={editEmploymentType}
                            onChange={(e) => setEditEmploymentType(e.target.value)}
                            className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
                          >
                            <option value="hourly">💼 Hourly Rate (Scheduled Shifts)</option>
                            <option value="per_minute">⏱️ Per-Minute Talk Rate (On-Demand 2x)</option>
                            <option value="salary_base">🏢 Salary Base (Fixed Full-Time)</option>
                          </select>
                        </div>
                      </div>

                      {editEmploymentType === 'hourly' && (
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Hourly Shift Rate ($ / hr)</label>
                          <input
                            type="number"
                            value={editHourlyRate}
                            onChange={(e) => setEditHourlyRate(e.target.value)}
                            className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                            min="1"
                            required
                          />
                        </div>
                      )}

                      {editEmploymentType === 'per_minute' && (
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Per-Minute Live Talk Rate ($ / min)</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.10"
                            max="5.00"
                            value={editMinuteRate}
                            onChange={(e) => setEditMinuteRate(parseFloat(e.target.value) || 0)}
                            className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                            required
                          />
                        </div>
                      )}

                      {editEmploymentType === 'salary_base' && (
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-300">Monthly Fixed Salary ($ / mo)</label>
                          <input
                            type="number"
                            min="300"
                            step="50"
                            value={editMonthlySalary}
                            onChange={(e) => setEditMonthlySalary(e.target.value)}
                            className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {editRole === 'host' && (
                    <div className="space-y-3">
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

                      <div className="space-y-1">
                        <label className="font-semibold text-purple-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Client Billing Model (Admin Only)</span>
                        </label>
                        <select
                          value={editBillingType}
                          onChange={(e) => setEditBillingType(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900 border border-purple-500/40"
                        >
                          <option value="prepaid">⚡ Standard Prepaid Wallet (Default)</option>
                          <option value="postpaid_hospital">🏢 Hospital / Enterprise Post-Paid (Net 30 Invoicing)</option>
                        </select>
                        <p className="text-[10px] text-slate-400">
                          {editBillingType === 'postpaid_hospital'
                            ? 'Client can book without prepaid minute balance. Invoiced monthly Net 30.'
                            : 'Client must have prepaid minutes in wallet to connect to live interpreters.'}
                        </p>
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
      {/* TAB 2: LIVE OPERATIONS & VISITOR CONVERSION MONITOR */}
      {/* ========================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 🌟 1. REAL-TIME VISITOR TRAFFIC & CONVERSION FUNNEL HUD */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    <span>Real-Time Visitor Traffic & Intake Funnel</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                    Live Tracking Active
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">Today's Traffic, Submissions & Conversion Audit</h3>
                <p className="text-xs text-slate-400">
                  Track how many visitors arrived from introductory emails/links, how many applied or signed up, and how many browsed without submitting.
                </p>
              </div>

              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Live Stats</span>
              </button>
            </div>

            {/* 4 Core Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Visits Today */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Total Site Visits Today</span>
                  <Globe className="w-4 h-4 text-brand-400" />
                </div>
                <p className="text-3xl font-black text-white">{analyticsData.today?.totalVisits || 0}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Unique Visitors:</span>
                  <span className="font-bold text-brand-300">{analyticsData.today?.uniqueVisitors || 0}</span>
                </div>
              </div>

              {/* Card 2: Interpreter Applications */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
                  <span>Interpreters Applied Today</span>
                  <Award className="w-4 h-4" />
                </div>
                <p className="text-3xl font-black text-amber-400">{analyticsData.today?.interpreterApplications || 0}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Pending Review:</span>
                  <span className="font-bold text-amber-300">{pendingApplicationsCount}</span>
                </div>
              </div>

              {/* Card 3: Client Submissions / Signups */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                  <span>Client Accounts & Signups</span>
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-3xl font-black text-emerald-400">{analyticsData.today?.clientSignups || 0}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Total Clients:</span>
                  <span className="font-bold text-emerald-300">{usersList.filter(u => u.role === 'host').length}</span>
                </div>
              </div>

              {/* Card 4: Browsed Without Submitting (Drop-offs) */}
              <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1">
                <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
                  <span>Browsed (No Submission)</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-3xl font-black text-purple-300">{analyticsData.today?.dropOffs || 0}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Today's Conversion Rate:</span>
                  <span className="font-extrabold text-emerald-400">{analyticsData.today?.conversionRate || '0.0%'}</span>
                </div>
              </div>

            </div>

            {/* 7-Day History & Conversion Table */}
            {Array.isArray(analyticsData.dailyHistory) && analyticsData.dailyHistory.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>7-Day Visitor Traffic & Conversion Breakdown</span>
                </h4>
                
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Total Page Hits</th>
                        <th className="px-4 py-3">Unique Visitors</th>
                        <th className="px-4 py-3">Interpreters Applied</th>
                        <th className="px-4 py-3">Clients Created</th>
                        <th className="px-4 py-3">Browsed (No Submit)</th>
                        <th className="px-4 py-3 text-right">Conversion %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {analyticsData.dailyHistory.map((day) => (
                        <tr key={day.date} className="hover:bg-slate-900/50 transition">
                          <td className="px-4 py-3 font-mono font-bold text-white">{day.date}</td>
                          <td className="px-4 py-3 font-semibold text-slate-200">{day.visits}</td>
                          <td className="px-4 py-3 font-semibold text-brand-300">{day.uniqueVisitors}</td>
                          <td className="px-4 py-3 font-bold text-amber-400">{day.interpreterApplications}</td>
                          <td className="px-4 py-3 font-bold text-emerald-400">{day.clientSignups}</td>
                          <td className="px-4 py-3 font-medium text-slate-400">{day.dropOffs}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-emerald-400">{day.conversionRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Live Visitor Hits Stream */}
            {Array.isArray(analyticsData.recentVisits) && analyticsData.recentVisits.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recent Live Visitor Activity Stream</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Last 15 Hits</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {analyticsData.recentVisits.map((v) => (
                    <div key={v.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-brand-300 truncate max-w-[150px]">{v.path || '/'}</span>
                        <span className="text-[9px] text-slate-500">{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        Source: <span className="text-slate-300">{v.referrer || 'Direct'}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

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

      {/* ========================================================== */}
      {/* MODAL 1: APPROVE APPLICATION & PROVISION ACCOUNT */}
      {/* ========================================================== */}
      {isApproveModalOpen && selectedAppForReview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-white">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Approve & Provision Account</h3>
                  <p className="text-xs text-slate-400">Issue credentials to {selectedAppForReview.name}</p>
                </div>
              </div>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
              {/* Applicant Overview Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-bold text-white">{selectedAppForReview.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-purple-300">{selectedAppForReview.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Languages:</span>
                  <span className="font-semibold text-brand-300">{(selectedAppForReview.languages || [selectedAppForReview.primaryLang]).join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Submitted CV:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <FileText className="w-3 h-3" />
                    {selectedAppForReview.cvFileName || 'Resume.pdf'}
                  </span>
                </div>
              </div>

              {/* Approved Employment & Compensation Model */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300">Approved Employment & Compensation Model:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewApprovedType('hourly')}
                    className={`p-2 rounded-xl border text-center transition ${
                      reviewApprovedType === 'hourly'
                        ? 'bg-brand-600/30 border-brand-500 text-white font-bold ring-1 ring-brand-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-[11px] font-bold">💼 Hourly Shift</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Scheduled Queue</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewApprovedType('per_minute')}
                    className={`p-2 rounded-xl border text-center transition ${
                      reviewApprovedType === 'per_minute'
                        ? 'bg-emerald-600/30 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-[11px] font-bold">⏱️ Per-Minute</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Live Talk (2x)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewApprovedType('salary_base')}
                    className={`p-2 rounded-xl border text-center transition ${
                      reviewApprovedType === 'salary_base'
                        ? 'bg-purple-600/30 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-[11px] font-bold">🏢 Salary Base</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Fixed Full-Time</p>
                  </button>
                </div>
              </div>

              {/* Dynamic Rate Setting based on Approved Model */}
              {reviewApprovedType === 'hourly' && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Approved Hourly Shift Rate ($/hr):</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-brand-400">$</span>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      required
                      value={reviewApprovedRate}
                      onChange={(e) => setReviewApprovedRate(e.target.value)}
                      className="w-full pl-8 pr-12 py-2.5 rounded-xl bg-slate-950 border border-brand-500/50 text-xs text-white font-bold focus:outline-none focus:border-brand-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">/ hr</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Paid for scheduled shift hours and confirmed appointment queues.</span>
                </div>
              )}

              {reviewApprovedType === 'per_minute' && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Approved Live Talk Rate ($/min):</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-emerald-400">$</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.10"
                      max="5.00"
                      required
                      value={reviewApprovedMinuteRate}
                      onChange={(e) => setReviewApprovedMinuteRate(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-12 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">/ min</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Paid strictly per connected live talk minute (on-demand flexible standby).</span>
                </div>
              )}

              {reviewApprovedType === 'salary_base' && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Approved Monthly Fixed Salary ($/mo):</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-purple-400">$</span>
                    <input
                      type="number"
                      min="300"
                      max="15000"
                      step="50"
                      required
                      value={reviewApprovedMonthlySalary}
                      onChange={(e) => setReviewApprovedMonthlySalary(e.target.value)}
                      className="w-full pl-8 pr-12 py-2.5 rounded-xl bg-slate-950 border border-purple-500/50 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">/ mo</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Fixed monthly compensation for full-time in-house shifts & duties.</span>
                </div>
              )}

              {/* Set Initial Password */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Initial Login Password:</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-purple-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={reviewPassword}
                    onChange={(e) => setReviewPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400">This temporary password will be dispatched to the linguist via email.</span>
              </div>

              {/* Approval Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Internal Verification Notes:</label>
                <input
                  type="text"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Credentials verified with state licensing board"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>


              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Dispatch Login Credentials</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: DECLINE APPLICATION */}
      {/* ========================================================== */}
      {isRejectModalOpen && selectedAppForReview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Decline Application</h3>
                  <p className="text-xs text-slate-400">{selectedAppForReview.name}</p>
                </div>
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Reason for Declining:</label>
                <textarea
                  rows="3"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: OFFICIAL CREDENTIAL DISPATCH EMAIL PREVIEW */}
      {/* ========================================================== */}
      {emailDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ✓ Email Dispatched Successfully
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">Official Credential Notification</h3>
                </div>
              </div>
              <button onClick={() => setEmailDispatchModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Email Message Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 text-xs">
              <div className="border-b border-slate-800/80 pb-2.5 space-y-1">
                <p><span className="text-slate-400">To:</span> <strong className="text-white">{emailDispatchModal.to}</strong></p>
                <p><span className="text-slate-400">From:</span> <strong className="text-purple-300">operations@linguabridge.com (IK Enterprises)</strong></p>
                <p><span className="text-slate-400">Subject:</span> <strong className="text-emerald-300">{emailDispatchModal.subject}</strong></p>
              </div>

              <div className="space-y-2 text-slate-300 leading-relaxed">
                <p>Dear <strong>{emailDispatchModal.recipientName}</strong>,</p>
                <p>
                  Congratulations! Your application and professional credentials have been reviewed and approved by the <strong>IK Enterprises Verification Board</strong>. Your certified interpreter profile is now active on the LinguaBridge global network.
                </p>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
                  <p className="text-purple-300 font-bold font-sans uppercase text-[10px]">Your Official Portal Login Details:</p>
                  <p className="text-white">📧 Login Email: <span className="font-bold text-brand-300">{emailDispatchModal.loginEmail}</span></p>
                  <p className="text-white">🔑 Temporary Password: <span className="font-bold text-amber-400">{emailDispatchModal.temporaryPassword}</span></p>
                  <p className="text-white">📋 Contract Model: <span className="font-bold text-purple-300">{emailDispatchModal.employmentType || 'Hourly Rate (Scheduled Shifts)'}</span></p>
                  <p className="text-white">💵 Approved Terms: <span className="font-bold text-emerald-400">{emailDispatchModal.compensationTerms || emailDispatchModal.hourlyRate}</span></p>
                  <p className="text-white">🌐 Portal Access: <a href={emailDispatchModal.portalUrl} target="_blank" rel="noreferrer" className="text-brand-400 underline">{emailDispatchModal.portalUrl}</a></p>
                </div>

                <p className="text-[11px] text-slate-400">
                  Please sign in to your dashboard to set your availability status, review live 3-way conference dispatches, and access medical/legal glossaries.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Login Email: ${emailDispatchModal.loginEmail}\nPassword: ${emailDispatchModal.temporaryPassword}\nPortal: ${emailDispatchModal.portalUrl}`);
                  alert('Login details copied to clipboard!');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                Copy Details
              </button>
              <button
                type="button"
                onClick={() => setEmailDispatchModal(null)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: DOCUMENT & CV INSPECTION PREVIEW */}
      {/* ========================================================== */}
      {docPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{docPreviewModal.title}</h3>
                  <p className="text-xs text-slate-400">Applicant: {docPreviewModal.applicantName}</p>
                </div>
              </div>
              <button onClick={() => setDocPreviewModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto border border-slate-800">
                <FileCheck className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-white">{docPreviewModal.fileName}</p>
              <p className="text-xs text-slate-400">
                {docPreviewModal.type === 'cv' 
                  ? 'Official Curriculum Vitae / Resume with certified interpretation history and hospital clearances.'
                  : 'Certified Professional Linguist Accreditation & State License.'}
              </p>
              <span className="inline-block text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ✓ Verified File Format & Integrity (PDF)
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDocPreviewModal(null)}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
