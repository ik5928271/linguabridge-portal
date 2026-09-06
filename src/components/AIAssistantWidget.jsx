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
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: `Hello! 👋 I'm **LinguaBot**, your 24/7 AI Concierge for the **LinguaBridge 3-Way Interpretation Network** (powered by IK Enterprises).\n\nHow can I help you today? You can ask me about our **live 3-way calling protocols, client workflows, interpreter profile creation, 150+ supported languages**, or submit an inquiry directly to Admin Dispatch!`,
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
  const [ticketRole, setTicketRole] = useState(currentUser?.role === 'interpreter' ? 'interpreter' : currentUser?.role === 'admin' ? 'admin' : 'client');
  const [ticketCategory, setTicketCategory] = useState('General Support');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Sync user info if user logs in
  useEffect(() => {
    if (currentUser) {
      if (!ticketName) setTicketName(currentUser.name || '');
      if (!ticketEmail) setTicketEmail(currentUser.email || '');
      if (currentUser.role) setTicketRole(currentUser.role === 'host' ? 'client' : currentUser.role);
    }
  }, [currentUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping, activeTab]);

  // Quick prompt suggestions (strictly focused on workflows, protocols, profile setup, and inquiries)
  const QUICK_PROMPTS = [
    { label: '📞 How does 3-Way Calling work?', query: 'How does the 3-way conference calling work for doctor, patient, and interpreter?' },
    { label: '📋 Clinical & Court Protocols', query: 'What are the live interpretation protocols for medical and legal sessions?' },
    { label: '👤 Interpreter Profile & CV Setup', query: 'How do I create and set up my interpreter profile with Propio credentials?' },
    { label: '🔄 Client Workflow & Inviting Patients', query: 'How do clients start a call, invite guests, or schedule an appointment?' },
    { label: '🌐 150+ Supported Languages', query: 'What languages are supported on LinguaBridge?' },
    { label: '✉️ Inquiries & Rate Quotes', query: 'How do I request rates, billing, or custom organization proposals?' }
  ];

  // Comprehensive Knowledge Base Engine (No pricing disclosed - redirects to separate Admin quote)
  const generateBotResponse = (query) => {
    const q = query.toLowerCase().trim();

    // 1. 3-Way Conference Calling & WebRTC Workflow
    if (q.includes('3-way') || q.includes('3 way') || q.includes('three way') || q.includes('call room') || q.includes('how it works') || q.includes('how does') || q.includes('connect patient')) {
      return `### 📞 How LinguaBridge 3-Way Calling Works:
1. **Host Initiates**: The Host (e.g. Doctor, Attorney, or Customer Rep) selects their target language (e.g. Spanish, Russian, Arabic) and specialty.
2. **Instant Match**: The system connects a verified, certified live interpreter into the encrypted WebRTC room in **under 15 seconds**.
3. **Patient / Client Joins**: The host clicks **"Invite Patient"** to send an instant SMS or copy a direct guest join link. The third party joins on any phone or browser with zero downloads required!
4. **Live Audio/Video**: Everyone communicates with crystal-clear 3-way simultaneous audio, video toggle, and live terminology glossary aids.`;
    }

    // 2. Pricing, Rates, Compensation, or Billing Queries -> STRICTLY REDIRECT SEPARATELY
    if (q.includes('rate') || q.includes('price') || q.includes('pricing') || q.includes('pay') || q.includes('salary') || q.includes('hourly') || q.includes('per minute') || q.includes('earning') || q.includes('compensation') || q.includes('cost') || q.includes('package') || q.includes('wallet') || q.includes('invoice') || q.includes('net 30') || q.includes('net-30') || q.includes('fee')) {
      return `### 📋 Pricing & Compensation Policy:
All client rates, minute package pricing, and interpreter compensation agreements are **customized and provided separately** by **IK Enterprises Administration & Dispatch**.

* **For Clients & Organizations (Hospitals, Clinics, Law Firms)**: Custom rate sheets, prepaid bulk minute packages, and Net-30 enterprise invoicing terms are provided directly based on your monthly volume and language requirements.
* **For Interpreters & Linguists**: Compensation models (Live Talk, Scheduled Shifts, or Salary Base) are finalized privately during the credentialing and onboarding review.

👉 **To receive an official rate proposal or compensation details**, please switch to the **"✉️ Inquire / Message Box"** tab above to submit an inquiry, or contact Admin Dispatch (**Ikram-ul-haq Mian**) directly at \`ik5928271@gmail.com\`.`;
    }

    // 3. Clinical & Legal Interpretation Protocols
    if (q.includes('protocol') || q.includes('conduct') || q.includes('rule') || q.includes('standard') || q.includes('ethics') || q.includes('guideline') || q.includes('best practice')) {
      return `### 📋 Interpretation Protocols & Professional Conduct:
LinguaBridge enforces industry-standard protocols for high-stakes medical, legal, and enterprise sessions:
1. **Consecutive Protocol**: The speaker pauses every 1–2 sentences for accurate, unhurried translation without interruption.
2. **Direct First-Person Delivery**: Interpreters speak in the first person ("I have pain in my chest" rather than "She says she has pain").
3. **Impartiality & Neutrality**: Interpreters maintain absolute professional neutrality, adding or omitting nothing.
4. **Pre-Session Briefing**: The host can spend 30 seconds briefing the interpreter on case nuances before admitting the guest.
5. **HIPAA & Confidentiality**: All dialogue is confidential; no medical recordings are retained without written patient authorization.`;
    }

    // 4. Interpreter Profile Creation, CV & Credentials Setup
    if (q.includes('apply') || q.includes('profile') || q.includes('propio') || q.includes('credential') || q.includes('resume') || q.includes('cv') || q.includes('certif') || q.includes('join as interpreter') || q.includes('onboard') || q.includes('document')) {
      return `### 👤 Interpreter Profile Setup & Onboarding:
1. Click **"Apply as Interpreter"** on the top navigation bar.
2. **Personal & Contact Info**: Enter your full name, email, phone number, and country.
3. **Working Language Pairs**: Select your primary and secondary language pairs (e.g. English ⟷ Russian, Spanish, Arabic, Urdu, etc.).
4. **Specialties & Certifications**: Select your areas of expertise (Medical, Legal, Immigration) and list your professional credentials.
5. **Attach Verification Files**:
   * **CV / Resume** (PDF/DOCX)
   * **Training / Credential Certificate** (such as **Propio Healthcare Training**, CCHI/NBCMI, Court Certification, or Diploma).
6. **Review & Approval**: Our **IK Enterprises Verification Board** reviews your application and documents. Once approved, your certified portal account is activated with your separate compensation schedule!`;
    }

    // 5. Client Workflow & Inviting Patients/Guests / Scheduling
    if (q.includes('client workflow') || q.includes('invite') || q.includes('patient') || q.includes('guest') || q.includes('schedule') || q.includes('appointment') || q.includes('calendar') || q.includes('book')) {
      return `### 🔄 Client Workflow & Guest Invites:
* **Instant 3-Way Calls**:
  1. Choose your desired language and specialty.
  2. Get paired with an active certified interpreter.
  3. Click **"Invite Patient"** to send an SMS or copy a direct Web link. Guests join instantly without installing any app.
* **Scheduled Appointments**:
  1. Click **"Schedule Appointment"** to book an upcoming session.
  2. Both you and the assigned interpreter receive automated notifications **10 minutes before the call**.
  3. Click **"Start Call"** when ready to launch the room.`;
    }

    // 6. Languages Supported
    if (q.includes('language') || q.includes('spanish') || q.includes('russian') || q.includes('arabic') || q.includes('urdu') || q.includes('hindi') || q.includes('mandarin') || q.includes('punjabi') || q.includes('french')) {
      return `### 🌐 150+ Global Languages Supported:
LinguaBridge covers over **150+ spoken languages and dialects**, including:
* **Spanish** (Medical CCHI & Legal)
* **Russian & Ukrainian** (Certified Propio & Technical)
* **Arabic** (Levantine, Gulf, Egyptian, Standard)
* **Urdu, Punjabi & Hindi** (Healthcare & Judiciary)
* **Mandarin & Cantonese Chinese**
* **Vietnamese, Korean, Tagalog, Portuguese, French, Haitian Creole, Somali, and 140+ more!**`;
    }

    // 7. Medical & Legal Glossaries
    if (q.includes('glossary') || q.includes('medical') || q.includes('legal') || q.includes('term') || q.includes('dictionary') || q.includes('definition')) {
      return `### 📖 Live Interactive Glossaries:
During active 3-way conference calls, both the host and interpreter have access to our **Multi-Domain Terminology Bank**:
* **Medical / Clinical**: Anatomical terms, diagnostic procedures, pharmacology, and triage protocols.
* **Legal / Judiciary**: Courtroom procedures, sworn depositions, immigration hearings, and statutory terminology.
* **Emergency & Customer Care**: Standardized translations in Spanish, Russian, Arabic, Mandarin, and Urdu.`;
    }

    // 8. Inquiries & Receiving Help via Message Box
    if (q.includes('inquiry') || q.includes('ticket') || q.includes('message') || q.includes('ask') || q.includes('help') || q.includes('support') || q.includes('contact')) {
      return `### ✉️ Inquiries & Admin Dispatch Support:
Have a specific question, custom language request, profile issue, or need a rate proposal?
* Switch to the **"✉️ Inquire / Message Box"** tab in this widget.
* Fill in your name, email, category, and message.
* Your inquiry is transmitted directly to the **IK Enterprises Admin Dispatch Box** (monitored by Ikram-ul-haq Mian) for prompt review and resolution!`;
    }

    // 9. Ownership & Company Info
    if (q.includes('ikram') || q.includes('owner') || q.includes('ik enterprise') || q.includes('company') || q.includes('who are you')) {
      return `### 👑 About LinguaBridge & IK Enterprises:
* **Platform Owner & Administrator**: **Ikram-ul-haq Mian** (Master Operations Dispatch).
* **Enterprise Entity**: IK Enterprises.
* **Headquarters / Operations**: Lahore, Pakistan & Global Cloud Dispatch.
* **Direct Email**: \`ik5928271@gmail.com\` / \`operations@linguabridge.com\`
* You can also switch to the **"✉️ Inquire / Message Box"** tab to send a direct message to the admin dashboard!`;
    }

    // 10. Security, HIPAA, & Privacy
    if (q.includes('security') || q.includes('hipaa') || q.includes('privacy') || q.includes('safe') || q.includes('encrypt')) {
      return `### 🛡️ Enterprise Security & Compliance:
* **End-to-End Encrypted**: Live 3-way WebRTC media streams are encrypted using DTLS/SRTP protocols.
* **HIPAA & GDPR Ready**: No medical audio recordings are permanently stored without patient authorization.
* **Cloud Database**: Powered by 24/7 dedicated MongoDB Atlas with high-grade security clearance.`;
    }

    // 11. Default Intelligent Fallback
    return `Thank you for your question! LinguaBridge is an enterprise on-demand 3-way interpretation portal bridging Doctors, Patients, and Certified Interpreters in 150+ languages.

* **Workflows & 3-Way Calling**: Learn how instant calls, guest invites, and scheduled appointments operate.
* **Protocols & Ethics**: Learn about clinical and court interpretation standards.
* **Profile Setup**: Step-by-step guidance for interpreter applications and document uploads.
* **Rates & Inquiries**: Pricing and compensation are provided separately by Admin Dispatch. Switch to the **"✉️ Inquire / Message Box"** tab to submit an inquiry!`;
  };

  // Handle Sending a Message in Chat
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
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
            userEmail: currentUser?.email || ticketEmail || 'guest@linguabridge.com',
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
      userRole: ticketRole,
      subject: ticketSubject.trim() || `Inquiry from ${ticketName.trim()}`,
      message: ticketMessage.trim(),
      category: ticketCategory,
      messages: [
        { sender: 'user', text: ticketMessage.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTicketSuccess(true);
        setTicketSubmitting(false);
        setTicketSubject('');
        setTicketMessage('');
      } else {
        setTicketSuccess(true);
        setTicketSubmitting(false);
      }
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
                          ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md' 
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      }`}>
                        <div className="leading-relaxed whitespace-pre-line text-xs font-normal">
                          {m.text}
                        </div>
                        <div className={`text-[9px] font-mono text-right ${isBot ? 'text-slate-500' : 'text-purple-200'}`}>
                          {m.time}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-9">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <span>LinguaBot is typing an answer...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Pills Toolbar */}
              <div className="p-2 border-t border-slate-800/80 bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputQuery(qp.query);
                      setTimeout(() => {
                        handleSendMessage();
                      }, 50);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-200 border border-slate-700/60 hover:border-purple-500/40 text-[10px] font-semibold whitespace-nowrap transition shrink-0"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask anything about 3-way calling, protocols, profile setup, glossaries..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition shrink-0 shadow-lg shadow-purple-600/30"
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
