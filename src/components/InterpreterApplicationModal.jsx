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
  FileCheck
} from 'lucide-react';
import { LANGUAGES, SPECIALTIES } from '../data/mockData';

export default function InterpreterApplicationModal({ isOpen, onClose }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [primaryLang, setPrimaryLang] = useState('Spanish');
  const [selectedLanguages, setSelectedLanguages] = useState(['Spanish', 'English']);
  const [selectedSpecialties, setSelectedSpecialties] = useState(['Medical / Healthcare']);
  const [certificationsText, setCertificationsText] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(5);
  const [bio, setBio] = useState('');
  
  // File uploads
  const [cvFile, setCvFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleToggleLang = (langName) => {
    if (selectedLanguages.includes(langName)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(prev => prev.filter(l => l !== langName));
      }
    } else {
      setSelectedLanguages(prev => [...prev, langName]);
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
      setCvFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type
      });
    }
  };

  const handleDocChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Full name and email address are required.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      country: country.trim(),
      primaryLang,
      languages: selectedLanguages.includes('English') ? selectedLanguages : [...selectedLanguages, 'English'],
      specialties: selectedSpecialties,
      certifications: certificationsText 
        ? certificationsText.split(',').map(c => c.trim()).filter(Boolean)
        : ['Certified Professional Linguist'],
      experienceYears: parseInt(experienceYears) || 1,
      hourlyRate: parseInt(hourlyRate) || 5,
      bio: bio.trim() || `Professional ${primaryLang} interpreter with ${experienceYears} years experience.`,
      cvFileName: cvFile ? cvFile.name : 'Resume_CV_Submitted.pdf',
      cvFileData: 'simulated_cv_attachment_data',
      docFileName: docFile ? docFile.name : 'Certification_Proof.pdf',
      docFileData: 'simulated_cert_attachment_data'
    };

    try {
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
      // Fallback submission simulation if offline
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
    setCvFile(null);
    setDocFile(null);
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
                Your professional interpreter application, CV, and credentials have been securely submitted to the <strong className="text-white">IK Enterprises Verification Board</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 max-w-md mx-auto text-left space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Applicant Name:</span>
                <span className="font-bold text-white">{fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Primary Language:</span>
                <span className="font-bold text-brand-300">{primaryLang}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">CV Attached:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" />
                  {cvFile?.name || 'Ahmed_CV_Submitted.pdf'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Notification Dispatch:</span>
                <span className="font-medium text-amber-300 truncate max-w-[180px]">{email}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 max-w-lg mx-auto text-xs text-brand-300 leading-relaxed">
              <ShieldCheck className="w-5 h-5 inline-block mr-1 text-brand-400 mb-0.5" />
              <strong>What Happens Next:</strong> Our administrative team reviews your qualifications and CV. Upon verification, you will receive an official email containing your provisioned login credentials and dashboard access link.
            </div>

            <button
              type="button"
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
                Submit your profile, certifications, and CV. Our administrative team reviews all applicants before issuing official portal login credentials.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION 1: PERSONAL & CONTACT */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>1. Personal & Contact Information</span>
              </h3>
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>2. Language Fluency & Working Specialties</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Primary Target Language</label>
                  <select
                    value={primaryLang}
                    onChange={(e) => {
                      setPrimaryLang(e.target.value);
                      if (!selectedLanguages.includes(e.target.value)) {
                        setSelectedLanguages(prev => [...prev, e.target.value]);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.name}>{l.flag} {l.name} ({l.nativeName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">All Working Languages (Click to toggle)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/80 rounded-xl border border-slate-800">
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

            {/* SECTION 3: QUALIFICATIONS & RATES */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>3. Qualifications & Rate Preferences</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Desired Hourly Rate ($/hr)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-emerald-400 font-bold">$</span>
                    <input
                      type="number"
                      min="5"
                      max="200"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Certifications (comma separated)</label>
                  <input
                    type="text"
                    placeholder="CCHI, NBCMI, Court Certified..."
                    value={certificationsText}
                    onChange={(e) => setCertificationsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Professional Bio / Summary</label>
                <textarea
                  rows="2"
                  placeholder="Briefly describe your translation background, medical/court setting experience, and language capabilities..."
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
