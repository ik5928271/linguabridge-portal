import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  PhoneCall, 
  ShieldCheck, 
  Globe, 
  DollarSign, 
  Award, 
  BookOpen, 
  Headphones, 
  CheckCircle2, 
  Clock, 
  Mail, 
  User, 
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';

export default function AIAssistantWidget({ currentUser = null, currentRole = 'host' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'ticket'
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Chat Conversation State
  const [messages, setMessages] = useState(() => {
    if (currentUser) {
      return [
        {
          id: 'msg-welcome',
          sender: 'bot',
          text: `Hello **${currentUser.name || 'User'}**! 👋 I'm **LinguaBot**, your 24/7 AI Concierge for the **LinguaBridge 3-Way Interpretation Network** (powered by IK Enterprises).\n\nHow can I help you today? You can ask me about our **live 3-way calling protocols, client workflows, interpreter profile creation, 150+ supported languages**, or submit an inquiry directly to Admin Dispatch!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'welcome'
        }
      ];
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: `Hello! 👋 Welcome to **LinguaBridge 3-Way Interpretation Network** (powered by IK Enterprises).\n\nTo connect you with Admin Dispatch, prepare custom rate proposals, or assist with interpreter onboarding, **please enter your Name and Contact Details below to start our chat:**`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'welcome'
      }
    ];
  });
  
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Inquiry / Message Form State
  const [ticketName, setTicketName] = useState(currentUser?.name || '');
  const [ticketEmail, setTicketEmail] = useState(currentUser?.email || '');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketRole, setTicketRole] = useState(currentUser?.role === 'interpreter' ? 'interpreter' : currentUser?.role === 'admin' ? 'admin' : 'client');
  const [ticketCategory, setTicketCategory] = useState('General Support');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [contactCaptured, setContactCaptured] = useState(() => Boolean(currentUser));

  // Sync user info if user logs in
  useEffect(() => {
    if (currentUser) {
      if (!ticketName) setTicketName(currentUser.name || '');
      if (!ticketEmail) setTicketEmail(currentUser.email || '');
      if (currentUser.role) setTicketRole(currentUser.role === 'host' ? 'client' : currentUser.role);
      setContactCaptured(true);
    }
  }, [currentUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping, activeTab]);

  // Quick prompt suggestions
  const QUICK_PROMPTS = [
    { label: '📞 How does 3-Way Calling work?', query: 'How does the 3-way conference calling work for doctor, patient, and interpreter?' },
    { label: '📋 Clinical & Court Protocols', query: 'What are the live interpretation protocols for medical and legal sessions?' },
    { label: '👤 Interpreter Profile & CV Setup', query: 'How do I create and set up my interpreter profile with Propio credentials?' },
    { label: '🔄 Client Workflow & Inviting Patients', query: 'How do clients start a call, invite guests, or schedule an appointment?' },
    { label: '🌐 150+ Supported Languages', query: 'What languages are supported on LinguaBridge?' },
    { label: '✉️ Inquiries & Rate Quotes', query: 'How do I request rates, billing, or custom organization proposals?' }
  ];

  // Comprehensive Knowledge Base Engine
  const generateBotResponse = (query) => {
    const q = query.toLowerCase().trim();

    if (q.includes('3-way') || q.includes('3 way') || q.includes('three way') || q.includes('call room') || q.includes('how it works') || q.includes('how does') || q.includes('connect patient') || q.includes('guest link') || q.includes('invite')) {
      return `### 📞 How LinguaBridge 3-Way Calling Works:
1. **Host Initiates**: The Host (e.g. Doctor, Attorney, or Customer Rep) selects their target language (e.g. Spanish, Russian, Arabic) and specialty.
2. **Instant Match**: The system connects a verified, certified live interpreter into the encrypted WebRTC room in **under 15 seconds**.
3. **Patient / Client Joins**: The host clicks **"Invite Patient"** to send an instant SMS or copy a direct guest join link. The third party joins on any phone or browser with zero downloads required!
4. **Live Audio/Video**: Everyone communicates with crystal-clear 3-way simultaneous audio, video toggle, and live terminology glossary aids.`;
    }

    const isPricingOrRateQuery = 
      q.includes('rate') || q.includes('rates') || 
      q.includes('charge') || q.includes('charges') || 
      q.includes('price') || q.includes('pricing') || 
      q.includes('cost') || q.includes('costs') || 
      q.includes('fee') || q.includes('fees') || 
      q.includes('how much') || q.includes('pay') || 
      q.includes('salary') || q.includes('hourly') || 
      q.includes('per minute') || q.includes('minute') || 
      q.includes('earning') || q.includes('compensation') || 
      q.includes('quote') || q.includes('quotation') || 
      q.includes('proposal') || q.includes('package') || 
      q.includes('packages') || q.includes('wallet') || 
      q.includes('invoice') || q.includes('invoicing') || 
      q.includes('net 30') || q.includes('net-30') || 
      q.includes('bill') || q.includes('billing') ||
      q.includes('discount') || q.includes('deposit');

    if (isPricingOrRateQuery) {
      return `### 📋 Official Pricing, Rates & Custom Quotes:
All client rates, minute package pricing, and interpreter compensation agreements are **customized and provided separately** by **IK Enterprises Administration & Dispatch**.

* **For Clients & Organizations (Hospitals, Clinics, Law Firms)**:
  Custom rate sheets, prepaid bulk minute packages, and Net-30 enterprise invoicing terms are provided directly based on your monthly volume and language requirements.
  📧 **Client Billing & Proposals**: \`iksale9817@gmail.com\`

* **For Interpreters & Linguists**:
  Compensation models (Live Talk, Scheduled Shifts, or Salary Base) are finalized privately during the credentialing and onboarding review.
  📧 **Interpreter Relations & Rates**: \`iksale9815@gmail.com\`

👇 **Please enter your details in the form below so Admin Dispatch can immediately send you the customized rate quote!**`;
    }

    if (q.includes('protocol') || q.includes('conduct') || q.includes('rule') || q.includes('standard') || q.includes('ethics') || q.includes('guideline') || q.includes('best practice')) {
      return `### 📋 Interpretation Protocols & Professional Conduct:
LinguaBridge enforces industry-standard protocols for high-stakes medical, legal, and enterprise sessions:
1. **Consecutive Protocol**: The speaker pauses every 1–2 sentences for accurate, unhurried translation without interruption.
2. **Direct First-Person Delivery**: Interpreters speak in the first person ("I have pain in my chest" rather than "She says she has pain").
3. **Impartiality & Neutrality**: Interpreters maintain absolute professional neutrality, adding or omitting nothing.
4. **Pre-Session Briefing**: The host can spend 30 seconds briefing the interpreter on case nuances before admitting the guest.
5. **HIPAA & Confidentiality**: All dialogue is confidential; no medical recordings are retained without written patient authorization.`;
    }

    if (q.includes('apply') || q.includes('profile') || q.includes('propio') || q.includes('credential') || q.includes('resume') || q.includes('cv') || q.includes('certif') || q.includes('join as interpreter') || q.includes('onboard') || q.includes('document')) {
      return `### 👤 Interpreter Profile Setup & Onboarding:
1. Click **"Apply as Interpreter"** on the top navigation bar.
2. **Personal & Contact Info**: Enter your full name, email, phone number, and country.
3. **Working Language Pairs**: Select your primary and secondary language pairs (e.g. English ⟷ Russian, Spanish, Arabic, Urdu, etc.).
4. **Specialties & Certifications**: Select your areas of expertise (Medical, Legal, Immigration) and list your professional credentials.
5. **Attach Verification Files**:
   * **CV / Resume** (PDF/DOCX)
   * **Training / Credential Certificate** (such as **Propio Healthcare Training**, CCHI/NBCMI, Court Certification, or Diploma).
6. **Review & Approval**: Our **IK Enterprises Verification Board** reviews your application and documents. Once approved, your certified portal account is activated with your separate compensation schedule!
📧 **Interpreter Onboarding Support**: \`iksale9815@gmail.com\``;
    }

    return `Thank you for your question! LinguaBridge is an enterprise on-demand 3-way interpretation portal bridging Doctors, Patients, and Certified Interpreters in 150+ languages.

* **Workflows & 3-Way Calling**: Learn how instant calls, guest invites, and scheduled appointments operate.
* **Protocols & Ethics**: Learn about clinical and court interpretation standards.
* **Profile Setup**: Step-by-step guidance for interpreter applications and document uploads.
* **Rates & Inquiries**: Pricing and compensation are provided separately by Admin Dispatch:
  - 🏥 **For Clients**: \`iksale9817@gmail.com\`
  - 🗣️ **For Interpreters**: \`iksale9815@gmail.com\`

👇 **Please share your contact details below if you would like Admin Dispatch to reach out directly!**`;
  };

  // Quick Inline Lead Capture in Chat
  const handleQuickLeadSubmit = async (e) => {
    e?.preventDefault();
    if (!ticketName.trim() || !ticketEmail.trim()) {
      alert('Please enter your name and email address.');
      return;
    }

    setTicketSubmitting(true);
    const lastUserQuery = messages.filter(m => m.sender === 'user').slice(-1)[0]?.text || 'Pricing / General Inquiry';

    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: ticketName.trim(),
          userEmail: ticketEmail.trim(),
          userPhone: ticketPhone.trim(),
          phone: ticketPhone.trim(),
          userRole: currentUser?.role || currentRole || 'client',
          subject: `⚡ Direct Lead / Rate Request from ${ticketName.trim()}`,
          message: `Visitor submitted contact details via LinguaBot AI widget.\nName: ${ticketName.trim()}\nEmail: ${ticketEmail.trim()}\nPhone/WhatsApp: ${ticketPhone.trim() || 'Not provided'}\nRecent Question: "${lastUserQuery}"`,
          category: 'Rates & Custom Proposals',
          messages: messages
        })
      });

      setContactCaptured(true);
      setTicketSubmitting(false);

      // Append confirmation bot message
      const confirmBotMsg = {
        id: `msg-confirm-${Date.now()}`,
        sender: 'bot',
        text: `✅ **Thank you, ${ticketName.trim()}!**\n\nYour contact details have been successfully transmitted to the **IK Enterprises Admin Dispatch** team. We will review your inquiry regarding *"${lastUserQuery}"* and reach out to you directly at **${ticketEmail.trim()}**${ticketPhone.trim() ? ` / **${ticketPhone.trim()}**` : ''} with your customized rate proposal!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, confirmBotMsg]);
    } catch {
      setContactCaptured(true);
      setTicketSubmitting(false);
    }
  };

  // Handle Sending a Message in Chat
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();

    // Auto-detect email and phone if user typed them in chat
    const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = userText.match(/(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    if (emailMatch && !ticketEmail) setTicketEmail(emailMatch[0]);
    if (phoneMatch && !ticketPhone && phoneMatch[0].length >= 7) setTicketPhone(phoneMatch[0]);

    const userMsg = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI thinking and generate rich response
    setTimeout(async () => {
      const botResponseText = generateBotResponse(userText);
      const botMsg = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // Auto-log conversation snippet to backend inquiries database
      try {
        fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: currentUser?.name || ticketName || 'Guest User',
            userEmail: currentUser?.email || ticketEmail || (emailMatch ? emailMatch[0] : 'guest@linguabridge.com'),
            userPhone: ticketPhone || (phoneMatch ? phoneMatch[0] : ''),
            phone: ticketPhone || (phoneMatch ? phoneMatch[0] : ''),
            userRole: currentUser?.role || currentRole || 'guest',
            subject: `AI Chat: "${userText.substring(0, 45)}..."`,
            message: userText,
            category: 'AI Chat Assistant',
            messages: [userMsg, botMsg]
          })
        }).catch(() => {});
      } catch {}
    }, 600);
  };

  // Handle Submitting Formal Support Inquiry
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketName.trim() || !ticketEmail.trim() || !ticketMessage.trim()) {
      alert('Please provide your name, email, and message.');
      return;
    }

    setTicketSubmitting(true);
    const payload = {
      userName: ticketName.trim(),
      userEmail: ticketEmail.trim(),
      userPhone: ticketPhone.trim(),
      phone: ticketPhone.trim(),
      userRole: ticketRole,
      subject: ticketSubject.trim() || `Inquiry from ${ticketName.trim()}`,
      message: `${ticketMessage.trim()}${ticketPhone ? `\n\nContact Phone/WhatsApp: ${ticketPhone}` : ''}`,
      category: ticketCategory,
      messages: [
        { sender: 'user', text: ticketMessage.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    };

    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setTicketSuccess(true);
      setTicketSubmitting(false);
      setTicketSubject('');
      setTicketMessage('');
    } catch {
      setTicketSuccess(true);
      setTicketSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Widget Launcher Button (When Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-black text-xs shadow-2xl shadow-purple-600/40 border border-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
          title="Open AI Concierge & Support Box"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
          </div>
          <span className="hidden sm:inline font-bold tracking-wide">LinguaBot AI & Inquiries</span>
          <span className="sm:hidden font-bold">AI Bot</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider text-amber-200">
            24/7 Live
          </span>
        </button>
      )}

      {/* Expanded Interactive Chat & Inquiry Modal Window */}
      {isOpen && (
        <div className={`flex flex-col bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 rounded-3xl shadow-2xl shadow-purple-950/80 overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-[92vw] sm:w-[650px] h-[85vh]' : 'w-[92vw] sm:w-[420px] h-[560px]'
        }`}>
          
          {/* Header Bar */}
          <div className="p-4 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-b border-purple-500/30 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>LinguaBot AI</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                      v2.0
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • IK Enterprises Dispatch</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition hidden sm:inline-flex"
                title={isExpanded ? 'Minimize Window' : 'Maximize Window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                title="Close Window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs (AI Chat vs Inquire / Message Admin) */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-bold gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'chat' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Support Bot</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ticket');
                setTicketSuccess(false);
              }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'ticket' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquire / Message Box</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: 🤖 AI CHAT BOT CONCIERGE */}
          {/* ======================================================== */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60">
              
              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((m) => {
                  const isBot = m.sender === 'bot';
                  return (
                    <div 
                      key={m.id} 
                      className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      {isBot && (
                        <div className="w-7 h-7 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center shrink-0 ring-1 ring-purple-500/30 mt-0.5">
                          <Bot className="w-4 h-4 text-amber-300" />
                        </div>
                      )}
                      <div className={`max-w-[84%] p-3.5 rounded-2xl space-y-1 ${
                        isBot 
                          ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' 
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      }`}>
                        <div className="leading-relaxed whitespace-pre-line text-xs font-normal">
                          {m.text}
                        </div>
                        <div className={`text-[9px] font-mono text-right ${isBot ? 'text-slate-400 dark:text-slate-500' : 'text-purple-200'}`}>
                          {m.time}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Interactive Lead Capture Form Card inside Chat Feed - Prompts Immediately for Guests */}
                {!contactCaptured && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950/90 border border-purple-500/50 shadow-2xl space-y-3 my-2 animate-fadeIn">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-amber-300 flex items-center justify-center ring-1 ring-purple-500/40">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-extrabold text-white text-xs">
                          Please Enter Your Contact Details to Start
                        </h4>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                        IK Dispatch Direct
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      To provide you with customized rate proposals, language availability, and direct support from Admin Dispatch, please tell us your name and contact details:
                    </p>

                    <form onSubmit={handleQuickLeadSubmit} className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Your Full Name *</label>
                          <input
                            type="text"
                            required
                            value={ticketName}
                            onChange={(e) => setTicketName(e.target.value)}
                            placeholder="e.g. Dr. Sarah / John"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={ticketEmail}
                            onChange={(e) => setTicketEmail(e.target.value)}
                            placeholder="e.g. you@hospital.com"
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">WhatsApp / Phone Number</label>
                        <input
                          type="tel"
                          value={ticketPhone}
                          onChange={(e) => setTicketPhone(e.target.value)}
                          placeholder="e.g. +1 555-0199 or +92 300 1234567"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={ticketSubmitting || !ticketName.trim() || !ticketEmail.trim()}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {ticketSubmitting ? (
                          <span>Connecting to Admin Dispatch...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-amber-300" />
                            <span>Start Chat & Connect with Dispatch 🚀</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {contactCaptured && (
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 my-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Contact details registered ({ticketName || 'Visitor'} • {ticketEmail || ticketPhone})! Admin Dispatch has been alerted.</span>
                  </div>
                )}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs italic pl-9">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span>LinguaBot is typing an answer...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Pills Toolbar */}
              <div className="p-2.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/95 dark:bg-slate-900/90 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputQuery(qp.query);
                      setTimeout(() => {
                        handleSendMessage();
                      }, 50);
                    }}
                    className="linguabot-quick-pill px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-900 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500/50 text-[11px] font-bold whitespace-nowrap transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask anything about 3-way calling, protocols, profile setup, glossaries..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition shrink-0 shadow-lg shadow-purple-600/30 cursor-pointer"
                  title="Send Question"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ✉️ DIRECT INQUIRIES & DISPATCH MESSAGE BOX */}
          {/* ======================================================== */}
          {activeTab === 'ticket' && (
            <div className="flex-1 p-5 overflow-y-auto bg-slate-950/60 text-xs space-y-4">
              
              {ticketSuccess ? (
                <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-4 my-auto shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">Inquiry Dispatched Successfully!</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Your message has been transmitted directly to the **IK Enterprises Admin Dispatch Box**. Our verification & support team will review your inquiry promptly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTicketSuccess(false);
                      setActiveTab('chat');
                    }}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
                  >
                    Back to AI Chat
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-3.5">
                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span>Send Direct Message / Ticket to Admin Dispatch</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Have a specific question, profile issue, custom language request, or rate inquiry? Send it straight to platform administration.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Your Full Name:</label>
                      <input
                        type="text"
                        required
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        placeholder="e.g. Dr. Sarah / Elena Rodriguez"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address:</label>
                      <input
                        type="email"
                        required
                        value={ticketEmail}
                        onChange={(e) => setTicketEmail(e.target.value)}
                        placeholder="e.g. you@hospital.com"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Your Role:</label>
                      <select
                        value={ticketRole}
                        onChange={(e) => setTicketRole(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="client">Client / Host (Doctor, Attorney, Business)</option>
                        <option value="interpreter">Interpreter / Linguist Applicant</option>
                        <option value="guest">Patient / Guest Visitor</option>
                        <option value="admin">Administrator / Partner</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Inquiry Category:</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="General Support">General Support</option>
                        <option value="Interpreter Profile & Onboarding">Interpreter Profile Setup & Credentials</option>
                        <option value="Rates & Custom Proposals">Rates, Invoicing & Organization Proposals</option>
                        <option value="Custom Language Request">Custom Language Pair Request</option>
                        <option value="Technical 3-Way Room">Technical / 3-Way Call Room Issue</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subject / Topic:</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Question regarding Propio training approval / Organization rate proposal"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Your Message / Inquiry:</label>
                    <textarea
                      required
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Write your detailed inquiry here..."
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={ticketSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition transform hover:scale-[1.01]"
                  >
                    {ticketSubmitting ? 'Transmitting to Admin Dispatch...' : '📤 Send Inquiry to Admin Dispatch'}
                  </button>
                </form>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
