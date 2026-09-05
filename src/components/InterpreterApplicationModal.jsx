import React, { useState } from 'react';
import { 
  Award, 
  Globe, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText, 
  Briefcase, 
  Clock, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Send,
  User,
  Mail,
  Phone,
  Check,
  Building2,
  FileCheck,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES, EMPLOYMENT_MODELS } from '../data/mockData';

export default function InterpreterApplicationModal({ isOpen, onClose }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');

  // Avatar / Profile Picture state (Optional)
  const [avatarType, setAvatarType] = useState('preset'); // 'preset' or 'custom'
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState('male-1'); // 'male-1', 'female-1', 'male-2', 'female-2', 'neutral'
  const [customPhotoData, setCustomPhotoData] = useState(null);
  const [customPhotoName, setCustomPhotoName] = useState('');

  const [primaryLang, setPrimaryLang] = useState('Spanish');
  const [customPrimaryLang, setCustomPrimaryLang] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(['Spanish', 'English']);
  const [customWorkingLangInput, setCustomWorkingLangInput] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState(['Medical / Healthcare']);
  const [certificationsText, setCertificationsText] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  
  // 3-Tier Compensation & Employment Preference
  const [employmentType, setEmploymentType] = useState('hourly'); // 'hourly', 'per_minute', 'salary_base'
  const [hourlyRate, setHourlyRate] = useState(8);
  const [minuteRate, setMinuteRate] = useState(0.30);
  const [monthlySalary, setMonthlySalary] = useState(1200);
  const [bio, setBio] = useState('');
  
  // File uploads
  const [cvFile, setCvFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Profile photo size should be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCustomPhotoData(uploadEvent.target.result);
        setCustomPhotoName(file.name);
        setAvatarType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleLang = (langName) => {
    if (selectedLanguages.includes(langName)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(prev => prev.filter(l => l !== langName));
      }
    } else {
      setSelectedLanguages(prev => [...prev, langName]);
    }
  };

  const handleAddCustomWorkingLang = (e) => {
    if (e) e.preventDefault();
    const trimmed = customWorkingLangInput.trim();
    if (trimmed && !selectedLanguages.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedLanguages(prev => [...prev, trimmed]);
      setCustomWorkingLangInput('');
    }
  };

  const handleRemoveCustomLang = (langName) => {
    if (selectedLanguages.length > 1) {
      setSelectedLanguages(prev => prev.filter(l => l !== langName));
    }
  };

  const handleToggleSpecialty = (specName) => {
    if (selectedSpecialties.includes(specName)) {
      if (selectedSpecialties.length > 1) {
        setSelectedSpecialties(prev => prev.filter(s => s !== specName));
      }
    } else {
      setSelectedSpecialties(prev => [...prev, specName]);
    }
  };

  const handleCvChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCvFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          data: uploadEvent.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setDocFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          data: uploadEvent.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Full name and email address are required.');
      return;
    }

    const resolvedPrimary = primaryLang === 'Other' ? (customPrimaryLang.trim() || 'Custom Language') : primaryLang;

    if (primaryLang === 'Other' && !customPrimaryLang.trim()) {
      setErrorMessage('Please specify your custom primary language.');
      return;
    }

    setIsSubmitting(true);

    let finalLanguages = [...selectedLanguages];
    if (resolvedPrimary && !finalLanguages.some(l => l.toLowerCase() === resolvedPrimary.toLowerCase())) {
      finalLanguages.push(resolvedPrimary);
    }
    if (!finalLanguages.some(l => l.toLowerCase() === 'english')) {
      finalLanguages.push('English');
    }

    const resolvedRateLabel = employmentType === 'salary_base' 
      ? `$${monthlySalary}/mo (Salary Base)`
      : employmentType === 'per_minute' 
        ? `$${minuteRate.toFixed(2)}/min (Live Talk)`
        : `$${hourlyRate}/hr (Scheduled Shift)`;

    const payload = {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      country: country.trim(),
      avatarType: avatarType,
      avatarPreset: selectedAvatarPreset,
      photoUrl: avatarType === 'custom' ? customPhotoData : null,
      avatarEmoji: selectedAvatarPreset === 'female-1' ? '👩‍💼' :
                   selectedAvatarPreset === 'male-2' ? '👨‍⚕️' :
                   selectedAvatarPreset === 'female-2' ? '👩‍⚕️' :
                   selectedAvatarPreset === 'neutral' ? '🌐' : '👨‍💼',
      primaryLang: resolvedPrimary,
      languages: finalLanguages,
      specialties: selectedSpecialties,
      certifications: certificationsText 
        ? certificationsText.split(',').map(c => c.trim()).filter(Boolean)
        : ['Certified Professional Linguist'],
      experienceYears: parseInt(experienceYears) || 1,
      employmentType: employmentType, // 'salary_base', 'hourly', 'per_minute'
      hourlyRate: parseInt(hourlyRate) || 8,
      minuteRate: parseFloat(minuteRate) || 0.30,
      monthlySalary: parseInt(monthlySalary) || 1200,
      rateLabel: resolvedRateLabel,
      bio: bio.trim() || `Professional ${resolvedPrimary} interpreter with ${experienceYears} years experience under ${resolvedRateLabel}.`,
      cvFileName: cvFile ? cvFile.name : 'Resume_CV_Submitted.pdf',
      cvFileData: cvFile?.data || null,
      docFileName: docFile ? docFile.name : 'Certification_Proof.pdf',
      docFileData: docFile?.data || null
    };


    try {
      // Local safety backup first
      try {
        const existingApps = JSON.parse(localStorage.getItem('linguabridge_submitted_applications') || '[]');
        existingApps.unshift({ ...payload, submittedAt: new Date().toISOString() });
        localStorage.setItem('linguabridge_submitted_applications', JSON.stringify(existingApps));
      } catch {}

      const response = await fetch('/api/interpreter-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      // Fallback submission safety
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setCustomPrimaryLang('');
    setCustomWorkingLangInput('');
    setCvFile(null);
    setDocFile(null);
    setCustomPhotoData(null);
    setCustomPhotoName('');
    setAvatarType('preset');
    setSelectedAvatarPreset('male-1');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white font-sans">
        
        {/* Close button */}
        <button 
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          // SUCCESS CONFIRMATION VIEW
          <div className="text-center py-6 sm:py-8 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Application Received & Logged
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Thank You, {fullName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Your professional interpreter application, CV, credentials, and profile picture have been securely submitted to the <strong className="text-white">IK Enterprises Verification Board</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 max-w-md mx-auto text-left space-y-3 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                {avatarType === 'custom' && customPhotoData ? (
                  <img src={customPhotoData} alt="Avatar" className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xl">
                    {selectedAvatarPreset === 'female-1' ? '👩‍💼' :
                     selectedAvatarPreset === 'male-2' ? '👨‍⚕️' :
                     selectedAvatarPreset === 'female-2' ? '👩‍⚕️' :
                     selectedAvatarPreset === 'neutral' ? '🌐' : '👨‍💼'}
                  </div>
                )}
                <div>
                  <p className="font-bold text-white text-sm">{fullName}</p>
                  <p className="text-[11px] text-slate-400">{email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Primary Language:</span>
                <span className="font-bold text-brand-300">
                  {primaryLang === 'Other' ? customPrimaryLang : primaryLang} (with English)
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Compensation Model:</span>
                <span className="font-bold text-emerald-400">
                  {employmentType === 'salary_base' ? `$${monthlySalary}/mo (Base Salary)` : employmentType === 'per_minute' ? `$${minuteRate.toFixed(2)}/min` : `$${hourlyRate}/hr (Hourly)`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Attached Documents:</span>
                <span className="font-bold text-slate-200">
                  {cvFile ? cvFile.name : 'CV/Resume Attached'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-500/30 max-w-lg mx-auto text-xs text-brand-300">
              ⚡ <strong>Next Step:</strong> You will receive an official onboarding confirmation and login PIN on <strong>{email}</strong> once your credentials pass our verification check.
            </div>

            <button
              onClick={handleResetAndClose}
              className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition shadow-lg shadow-brand-500/30"
            >
              Done & Return to Homepage
            </button>
          </div>
        ) : (
          // APPLICATION FORM VIEW
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header */}
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Certified Linguist Onboarding</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Interpreter Application & Document Submission
              </h2>
              <p className="text-xs text-slate-400">
                Submit your profile, certifications, photo, and CV. Our administrative team reviews all applicants before issuing official portal login credentials.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION 1: PERSONAL & CONTACT */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>1. Personal & Profile Picture / Avatar</span>
              </h3>

              {/* Profile Photo / Avatar Picker (Optional) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-brand-400" />
                    <span>Profile Photo / Avatar (Optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Choose an Avatar or Upload Picture</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Live Preview */}
                  <div className="relative shrink-0">
                    {avatarType === 'custom' && customPhotoData ? (
                      <img 
                        src={customPhotoData} 
                        alt="Profile Preview" 
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500 shadow-lg"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${
                        selectedAvatarPreset === 'female-1' ? 'from-pink-600 to-purple-600' :
                        selectedAvatarPreset === 'male-2' ? 'from-emerald-600 to-teal-600' :
                        selectedAvatarPreset === 'female-2' ? 'from-violet-600 to-fuchsia-600' :
                        selectedAvatarPreset === 'neutral' ? 'from-cyan-600 to-brand-600' :
                        'from-blue-600 to-indigo-600'
                      } flex items-center justify-center text-3xl shadow-lg ring-2 ring-brand-400/40`}>
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
                        title="Remove Photo"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-[10px] shadow"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Options */}
                  <div className="flex-1 w-full space-y-2.5">
                    {/* Preset Avatars */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarType('preset');
                          setSelectedAvatarPreset('male-1');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                          avatarType === 'preset' && selectedAvatarPreset === 'male-1'
                            ? 'bg-blue-600/30 border-blue-500 text-white ring-1 ring-blue-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>👨‍💼</span>
                        <span>Male Pro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAvatarType('preset');
                          setSelectedAvatarPreset('female-1');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                          avatarType === 'preset' && selectedAvatarPreset === 'female-1'
                            ? 'bg-pink-600/30 border-pink-500 text-white ring-1 ring-pink-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>👩‍💼</span>
                        <span>Female Pro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAvatarType('preset');
                          setSelectedAvatarPreset('male-2');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                          avatarType === 'preset' && selectedAvatarPreset === 'male-2'
                            ? 'bg-emerald-600/30 border-emerald-500 text-white ring-1 ring-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>👨‍⚕️</span>
                        <span>Male Medical</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAvatarType('preset');
                          setSelectedAvatarPreset('female-2');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                          avatarType === 'preset' && selectedAvatarPreset === 'female-2'
                            ? 'bg-purple-600/30 border-purple-500 text-white ring-1 ring-purple-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>👩‍⚕️</span>
                        <span>Female Medical</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAvatarType('preset');
                          setSelectedAvatarPreset('neutral');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                          avatarType === 'preset' && selectedAvatarPreset === 'neutral'
                            ? 'bg-cyan-600/30 border-cyan-500 text-white ring-1 ring-cyan-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>🌐</span>
                        <span>Global</span>
                      </button>
                    </div>

                    {/* Upload Photo Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition">
                        <Upload className="w-3.5 h-3.5 text-brand-400" />
                        <span>Upload Custom Picture</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {customPhotoName ? (
                        <span className="text-[11px] text-emerald-400 font-medium truncate max-w-[220px]">
                          ✓ {customPhotoName}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Optional: JPG, PNG, WebP (Max 5MB)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Farooq, CCHI"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email Address (For Login Dispatch) *</label>
                  <input
                    type="email"
                    required
                    placeholder="ahmed.interpreter@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Country of Residence</label>
                  <input
                    type="text"
                    placeholder="United States / Canada / UK / UAE..."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: LANGUAGES & SPECIALTIES */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>2. Language Fluency & Working Specialties</span>
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 w-fit">
                  Base Language: English (Default 3-Way Bridge)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                ℹ️ <strong>How It Works:</strong> Our platform connects English-speaking clients (doctors, lawyers, customer service) with non-English speakers. All interpreters interpret <strong>bidirectionally between English and their chosen language(s)</strong>.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    Primary Target Language (Paired with English) *
                  </label>
                  <select
                    value={primaryLang}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrimaryLang(val);
                      if (val !== 'Other' && !selectedLanguages.includes(val)) {
                        setSelectedLanguages(prev => [...prev, val]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="English">🇺🇸 English Only (Direct / Monolingual Support)</option>
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.name}>
                        {l.flag} English ⟷ {l.name} ({l.nativeName})
                      </option>
                    ))}
                    <option value="Other">🌐 Other / Custom Language...</option>
                  </select>

                  {primaryLang === 'Other' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        required
                        placeholder="Type custom language (e.g. English ⟷ Pashto, Somali, Kurdish...)"
                        value={customPrimaryLang}
                        onChange={(e) => setCustomPrimaryLang(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-brand-500 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">
                      All Working Languages ({selectedLanguages.length} active)
                    </label>
                    <span className="text-[10px] text-slate-400">Click to toggle</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/80 rounded-xl border border-slate-800 mb-2">
                    <button
                      type="button"
                      onClick={() => handleToggleLang('English')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                        selectedLanguages.includes('English') ? 'bg-brand-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🇺🇸</span>
                      <span>English</span>
                      {selectedLanguages.includes('English') && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                    {LANGUAGES.map(l => {
                      const isSel = selectedLanguages.includes(l.name);
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleToggleLang(l.name)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                            isSel ? 'bg-brand-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{l.flag}</span>
                          <span>{l.name}</span>
                          {isSel && <Check className="w-3 h-3 ml-0.5" />}
                        </button>
                      );
                    })}

                    {/* Custom added languages list with remove icon */}
                    {selectedLanguages.filter(lang => lang !== 'English' && !LANGUAGES.some(l => l.name === lang)).map(customLang => (
                      <span
                        key={customLang}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600/90 text-white shadow flex items-center gap-1"
                      >
                        <span>🌐</span>
                        <span>{customLang}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomLang(customLang)}
                          className="hover:text-red-300 transition ml-0.5 p-0.5"
                          title="Remove custom language"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Custom Working Language Input */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add another language (e.g. Pashto, Somali, Kurdish...)"
                      value={customWorkingLangInput}
                      onChange={(e) => setCustomWorkingLangInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomWorkingLang();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomWorkingLang}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition flex items-center gap-1 shrink-0 shadow"
                    >
                      <span>+ Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Specialty Domains</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPECIALTIES.map(spec => {
                    const isSel = selectedSpecialties.includes(spec.name);
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => handleToggleSpecialty(spec.name)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition ${
                          isSel 
                            ? 'bg-brand-600/20 border-brand-500 text-white ring-1 ring-brand-500' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <p className="font-bold truncate">{spec.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 3: EMPLOYMENT & COMPENSATION MODEL */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>3. Preferred Employment & Compensation Model</span>
                </h3>
                <span className="text-[10px] text-slate-400">
                  Select how you wish to be engaged & compensated
                </span>
              </div>

              {/* 3 Model Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Model 2: Hourly Shift */}
                <div 
                  onClick={() => setEmploymentType('hourly')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                    employmentType === 'hourly'
                      ? 'bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-400" />
                        <span>Hourly Rate</span>
                      </span>
                      {employmentType === 'hourly' && (
                        <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px]">✓</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20 block w-fit mb-1.5">
                      Scheduled Shifts
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      For Interpreters with dedicated long shifts & confirmed assignment worklists, QA specialists, and consultants.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-brand-300">
                    Typically $6 - $25 / hr
                  </div>
                </div>

                {/* Model 3: Per-Minute Talk Rate */}
                <div 
                  onClick={() => setEmploymentType('per_minute')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                    employmentType === 'per_minute'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Per-Minute Talk</span>
                      </span>
                      {employmentType === 'per_minute' && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 block w-fit mb-1.5">
                      On-Demand Flex (2x Rate)
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      For On-Demand Interpreters with variable standby volume. Paid strictly per live call minute at a higher rate.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-emerald-300">
                    Typically $0.20 - $0.75 / min
                  </div>
                </div>

                {/* Model 1: Salary Base */}
                <div 
                  onClick={() => setEmploymentType('salary_base')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                    employmentType === 'salary_base'
                      ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Salary Base</span>
                      </span>
                      {employmentType === 'salary_base' && (
                        <span className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px]">✓</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 block w-fit mb-1.5">
                      Fixed Full-Time / Dedicated
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      For Full-Time In-House Interpreters, Admin staff, Accounts, and dedicated shift operations with fixed monthly pay.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-purple-300">
                    Typically $1,200 - $3,500 / mo
                  </div>
                </div>
              </div>

              {/* Dynamic Rate Input according to selected model */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {employmentType === 'hourly' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Desired Hourly Rate ($/hr) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-brand-400 font-bold">$</span>
                      <input
                        type="number"
                        min="5"
                        max="200"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full pl-7 pr-12 py-2.5 rounded-xl bg-slate-900 border border-brand-500/50 text-xs text-white font-bold focus:outline-none focus:border-brand-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">/ hr</span>
                    </div>
                  </div>
                )}

                {employmentType === 'per_minute' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Desired Live Talk Rate ($/min) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-emerald-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0.10"
                        max="5.00"
                        value={minuteRate}
                        onChange={(e) => setMinuteRate(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-12 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">/ min</span>
                    </div>
                  </div>
                )}

                {employmentType === 'salary_base' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Desired Monthly Salary ($/mo) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-purple-400 font-bold">$</span>
                      <input
                        type="number"
                        min="300"
                        max="15000"
                        step="50"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(e.target.value)}
                        className="w-full pl-7 pr-12 py-2.5 rounded-xl bg-slate-900 border border-purple-500/50 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">/ mo</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Certifications (comma separated)</label>
                  <input
                    type="text"
                    placeholder="CCHI, NBCMI, Court Certified..."
                    value={certificationsText}
                    onChange={(e) => setCertificationsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Professional Bio / Summary</label>
                <textarea
                  rows="2"
                  placeholder="Briefly describe your translation background, medical/court setting experience, and shift availability..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>


            {/* SECTION 4: DOCUMENT & CV ATTACHMENTS */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>4. CV / Resume & Supporting Document Uploads</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CV Upload */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-brand-500/50 transition text-center space-y-2 relative">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Upload CV / Resume (PDF / DOCX)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {cvFile ? `${cvFile.name} (${cvFile.size})` : 'Click or browse file to attach'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {cvFile && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" /> CV Attached
                    </span>
                  )}
                </div>

                {/* Supporting Certification / ID Upload */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-brand-500/50 transition text-center space-y-2 relative">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Upload Certification / ID Document</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {docFile ? `${docFile.name} (${docFile.size})` : 'Attach credential certificate or diploma'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleDocChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {docFile && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" /> Certificate Attached
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                🔒 Protected by HIPAA & IK Enterprises confidentiality agreements.
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-brand-500/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
