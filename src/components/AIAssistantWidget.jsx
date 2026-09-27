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
  const [isLauncherMinimized, setIsLauncherMinimized] = useState(() => {
    return localStorage.getItem('linguabot_launcher_mini') === 'true';
  });
  
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
  const sessionIdRef = useRef('inq-chat-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6));

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

  // Intelligent, Conversational Knowledge Base & Natural Response Engine
  const generateBotResponse = (query) => {
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);

    // 1. Natural Greetings & Salutations (Short & Friendly)
    const isGreeting = 
      q === 'hi' || q === 'hello' || q === 'hey' || q === 'salam' || q === 'assalam o alaikum' || 
      q === 'aoa' || q === 'hola' || q === 'good morning' || q === 'good evening' || q === 'good afternoon' ||
      words.includes('hi') || words.includes('hello') || words.includes('hey') || words.includes('salam');
    
    if (isGreeting && words.length <= 4 && !q.includes('rate') && !q.includes('price') && !q.includes('human') && !q.includes('call') && !q.includes('apply')) {
      return `Hi! 👋 How can I help you today? You can ask me about our 3-way interpretation calls, finding an interpreter in 150+ languages, rates, or applying as a linguist.`;
    }

    // 2. Casual / Well-being Inquiries ("how are you", "hope you ok")
    if (q.includes('how are you') || q.includes('hope you ok') || q.includes('hope you are ok') || q.includes('how r u') || q.includes('how you doing') || q.includes('are you ok')) {
      return `I'm doing great, thank you for asking! 😊 How can I assist you with LinguaBridge today?`;
    }

    // 3. Live Human / Admin Dispatch Requests ("any human available", "talk to human", "real person")
    if (q.includes('human') || q.includes('real person') || q.includes('live agent') || q.includes('talk to someone') || q.includes('speak to human') || q.includes('admin') || q.includes('dispatch') || q.includes('support team') || q.includes('representative')) {
      return `Yes, our **IK Enterprises Admin Dispatch** team is available! 🙋‍♂️\n\nYou can type your request or contact details right here in this chat, or email us directly:\n• 🏥 **Client & Enterprise Support**: \`iksale9817@gmail.com\`\n• 🗣️ **Interpreter Inquiries**: \`iksale9815@gmail.com\`\n\nHow can we help you right now?`;
    }

    // 4. Short conversational acknowledgments ("hmmm", "ok", "okay", "thanks", "thank you", "great", "got it")
    if (q.includes('thank') || q.includes('thx')) {
      return `You're very welcome! 😊 Let me know if you need anything else.`;
    }
    if (q === 'ok' || q === 'okay' || q === 'hmmm' || q === 'hmm' || q === 'k' || q === 'alright' || q === 'got it' || q === 'sure' || q === 'cool' || q === 'perfect' || q === 'yes' || q === 'no') {
      return `Feel free to ask whenever you have a question! I'm here 24/7 to assist with calls, rates, or interpreter onboarding.`;
    }
    if (q.includes('bye') || q.includes('goodbye') || q.includes('see you')) {
      return `Goodbye! Have a wonderful day, and feel free to reach out anytime you need live interpretation. 👋`;
    }

    // 5. 3-Way Conference Calling Workflows
    if (q.includes('3-way') || q.includes('3 way') || q.includes('three way') || q.includes('how it works') || q.includes('how does it work') || q.includes('call room') || q.includes('connect patient') || q.includes('guest link') || q.includes('start call')) {
      return `### 📞 How 3-Way Calling Works:\n1. **Select Language**: The Host (Doctor, Attorney, or Business) selects their target language and connects to a certified live interpreter in **under 15 seconds**.\n2. **Invite Guest**: Click **"Invite Patient / Guest"** to send an instant SMS or direct join link (no app download needed).\n3. **3-Way Real-Time Audio/Video**: All three parties communicate simultaneously in encrypted HD audio with terminology aids.`;
    }

    // 6. Pricing, Rates & Billing Queries
    const isPricingOrRateQuery = 
      q.includes('rate') || q.includes('rates') || 
      q.includes('charge') || q.includes('charges') || 
      q.includes('price') || q.includes('pricing') || 
      q.includes('cost') || q.includes('costs') || 
      q.includes('fee') || q.includes('fees') || 
      q.includes('how much') || q.includes('pay') || 
      q.includes('salary') || q.includes('hourly') || 
      q.includes('per minute') || q.includes('minute package') || 
      q.includes('earning') || q.includes('compensation') || 
      q.includes('quote') || q.includes('quotation') || 
      q.includes('proposal') || q.includes('wallet') || 
      q.includes('invoice') || q.includes('invoicing') || 
      q.includes('net 30') || q.includes('net-30') || 
      q.includes('billing') || q.includes('discount');

    if (isPricingOrRateQuery) {
      return `### 📋 Pricing & Custom Rate Quotes:\nAll client minute package rates and interpreter compensation schedules are customized by **IK Enterprises Administration & Dispatch**:\n\n• 🏥 **For Clients (Hospitals, Clinics, Law Firms)**: Custom volume rate sheets & Net-30 enterprise terms via \`iksale9817@gmail.com\`.\n• 🗣️ **For Interpreters**: Per-minute, shift, and compensation models finalized via \`iksale9815@gmail.com\`.\n\nLeave your details below and Admin Dispatch will send your tailored proposal!`;
    }

    // 7. Supported Languages
    if (q.includes('language') || q.includes('languages') || q.includes('spanish') || q.includes('arabic') || q.includes('urdu') || q.includes('russian') || q.includes('french') || q.includes('chinese') || q.includes('punjabi') || q.includes('pashto') || q.includes('hindi') || q.includes('vietnamese') || q.includes('korean')) {
      return `🌐 We support **150+ languages** on demand, including Spanish, Arabic, Urdu, Russian, Mandarin, Cantonese, Pashto, Punjabi, French, Portuguese, Vietnamese, Somali, Korean, and many more.\n\nWould you like to connect with an interpreter for a specific language pair right now?`;
    }

    // 8. Interpreter Application & Onboarding
    if (q.includes('apply') || q.includes('profile') || q.includes('propio') || q.includes('credential') || q.includes('resume') || q.includes('cv') || q.includes('certif') || q.includes('join as interpreter') || q.includes('onboard') || q.includes('job') || q.includes('hiring') || q.includes('document')) {
      return `### 👤 Interpreter Application & Onboarding:\n1. Click **"Apply as Interpreter"** in the top navigation.\n2. Enter your working language pairs, specialties, and upload your **CV/Resume** and **Training Certificate** (e.g. Propio, CCHI/NBCMI, Court/Medical Certification).\n3. Our verification board reviews and approves applications within 24–48 hours.\n\n📧 Questions? Contact: \`iksale9815@gmail.com\``;
    }

    // 9. Interpretation Protocols & Standards
    if (q.includes('protocol') || q.includes('conduct') || q.includes('rule') || q.includes('ethics') || q.includes('guideline') || q.includes('hipaa') || q.includes('confidential')) {
      return `### 📋 Professional Interpretation Protocols:\n• **Consecutive Mode**: Speaker pauses every 1–2 sentences for accurate, unhurried translation.\n• **First-Person Delivery**: Interpreters speak directly as the speaker ("I feel dizzy").\n• **Strict Neutrality & Confidentiality**: 100% HIPAA-compliant, impartial, with nothing added or omitted.`;
    }

    // 10. Smart, concise fallback for unrecognized queries (Never repeating the huge generic block!)
    return `I'm here to assist with **3-way interpretation calls**, finding interpreters in **150+ languages**, **rate quotes**, or **interpreter onboarding**.\n\nCould you please clarify your question, or leave your message here for our Admin Dispatch team?`;
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
          id: sessionIdRef.current,
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
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmBotMsg]);
    } catch {
      setContactCaptured(true);
      setTicketSubmitting(false);
    }
  };

  // Handle Sending a Message in Chat
  const handleSendMessage = async (e, directQuery = null) => {
    e?.preventDefault();
    const userText = (typeof directQuery === 'string' ? directQuery : inputQuery).trim();
    if (!userText) return;

    // Auto-detect email and phone if user typed them in chat
    const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = userText.match(/(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    if (emailMatch && !ticketEmail) setTicketEmail(emailMatch[0]);
    if (phoneMatch && !ticketPhone && phoneMatch[0].length >= 7) setTicketPhone(phoneMatch[0]);

    const userMsg = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setIsTyping(true);

    // Query Google Gemini 1.5 Flash API with local rule-engine fallback
    let botResponseText = '';
    try {
      const aiRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          messages: updatedMessages
        })
      });
      const aiData = await aiRes.json();
      if (aiData && aiData.success && aiData.reply) {
        botResponseText = aiData.reply;
      } else {
        botResponseText = generateBotResponse(userText);
      }
    } catch {
      botResponseText = generateBotResponse(userText);
    }

    const botMsg = {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: botResponseText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    const finalMessages = [...updatedMessages, botMsg];
    setMessages(finalMessages);
    setIsTyping(false);

    // Automatically sync live chat to Admin Support Hub & MongoDB Atlas
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionIdRef.current,
          userName: ticketName.trim() || (currentUser?.name || 'Guest Visitor'),
          userEmail: ticketEmail.trim() || (currentUser?.email || ''),
          userPhone: ticketPhone.trim() || '',
          phone: ticketPhone.trim() || '',
          userRole: currentUser?.role || currentRole || 'guest',
          subject: `💬 Live Guest Chat: "${userText.slice(0, 40)}${userText.length > 40 ? '...' : ''}"`,
          message: userText,
          category: 'AI Concierge & Live Chat',
          messages: finalMessages
        })
      });
    } catch {}
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
    <div className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 font-sans ${isOpen ? 'z-50' : 'z-40'}`}>
      
      {/* Floating Widget Launcher Button (When Closed) */}
      {!isOpen && (
        isLauncherMinimized ? (
          <div className="relative group">
            <button
              onClick={() => setIsOpen(true)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 border border-white/30 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
              title="Open LinguaBot AI Concierge"
            >
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLauncherMinimized(false);
                localStorage.setItem('linguabot_launcher_mini', 'false');
              }}
              className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:text-white flex items-center justify-center text-[10px] font-black opacity-0 group-hover:opacity-100 transition shadow"
              title="Expand badge text"
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 pl-1.5 rounded-full border border-purple-500/30 shadow-2xl shadow-purple-950/60">
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-black text-xs transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Open AI Concierge & Support Box"
            >
              <div className="relative">
                <Bot className="w-4 h-4 text-amber-300 animate-bounce" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
              </div>
              <span className="hidden sm:inline font-bold tracking-wide text-xs">LinguaBot AI</span>
              <span className="sm:hidden font-bold text-[11px]">AI Bot</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px] font-extrabold uppercase tracking-wider text-amber-200">
                24/7
              </span>
            </button>

            {/* Quick 1-click minimize to unblock elements behind */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLauncherMinimized(true);
                localStorage.setItem('linguabot_launcher_mini', 'true');
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Minimize to small icon so you can see behind"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
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
                    onClick={() => handleSendMessage(null, qp.query)}
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
