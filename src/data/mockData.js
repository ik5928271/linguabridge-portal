// Supported Languages with Native Names, Codes, and Flags
export const LANGUAGES = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', popular: true },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文 (普通话)', flag: '🇨🇳', popular: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', popular: true },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', popular: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', popular: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', popular: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', popular: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', popular: false },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', popular: false },
  { code: 'tl', name: 'Tagalog / Filipino', nativeName: 'Tagalog', flag: '🇵🇭', popular: false },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', flag: '🇭🇹', popular: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', popular: false },
  { code: 'asl', name: 'American Sign Language (ASL)', nativeName: 'ASL (Video Only)', flag: '🤟', popular: false }
];

export const SPECIALTIES = [
  { id: 'medical', name: 'Medical / Healthcare', icon: 'HeartPulse', desc: 'HIPAA compliant, surgical, clinical triage, oncology' },
  { id: 'legal', name: 'Legal / Court Certified', icon: 'Scale', desc: 'Depositions, court hearings, asylum, contracts' },
  { id: 'financial', name: 'Financial / Banking', icon: 'Briefcase', desc: 'Mortgages, loan processing, tax, wealth management' },
  { id: 'immigration', name: 'Immigration & Refugee', icon: 'Globe', desc: 'USCIS interviews, consular services, visas' },
  { id: 'education', name: 'Education & Community', icon: 'GraduationCap', desc: 'IEP meetings, parent conferences, municipal services' },
  { id: 'general', name: 'General / Customer Support', icon: 'Headphones', desc: 'General inquiries, retail, utility customer service' }
];

// Localized Guest Join View Translations
export const GUEST_TRANSLATIONS = {
  en: {
    welcome: 'Welcome to your Interpretation Session',
    subWelcome: 'You have been invited to a private 3-party interpretation call.',
    languageSelect: 'Select your preferred language',
    enterName: 'Your Full Name',
    readyToJoin: 'Join Room Now',
    audioTest: 'Microphone Check',
    cameraTest: 'Camera Check',
    audioOk: 'Audio detected',
    cameraOk: 'Camera active',
    waitingRoom: 'Connecting with your English host and certified interpreter...',
    privacyNotice: 'This call is secure, encrypted, and strictly confidential.',
    tipsHeader: 'Before you join:',
    tip1: 'Find a quiet environment with minimal background noise.',
    tip2: 'Speak directly into your device microphone.',
    tip3: 'The interpreter will translate everything said consecutively.'
  },
  es: {
    welcome: 'Bienvenido a su Sesión de Interpretación',
    subWelcome: 'Ha sido invitado a una llamada privada con un intérprete certificado.',
    languageSelect: 'Seleccione su idioma preferido',
    enterName: 'Su Nombre Completo',
    readyToJoin: 'Entrar a la Sala Ahora',
    audioTest: 'Prueba de Micrófono',
    cameraTest: 'Prueba de Cámara',
    audioOk: 'Audio detectado',
    cameraOk: 'Cámara activa',
    waitingRoom: 'Conectando con su anfitrión en inglés y el intérprete profesional...',
    privacyNotice: 'Esta llamada es segura, encriptada y estrictamente confidencial.',
    tipsHeader: 'Antes de conectarse:',
    tip1: 'Busque un lugar tranquilo con poco ruido ambiental.',
    tip2: 'Hable pausadamente y claro hacia el micrófono de su dispositivo.',
    tip3: 'El intérprete traducirá todo lo que se diga palabra por palabra.'
  },
  ar: {
    welcome: 'مرحبًا بك في جلسة الترجمة الفورية',
    subWelcome: 'تمت دعوتك إلى مكالمة ترجمة خاصة ثلاثية الأطراف مع مترجم معتمد.',
    languageSelect: 'اختر لغتك المفضلة',
    enterName: 'اسمك الكامل',
    readyToJoin: 'الانضمام إلى الغرفة الآن',
    audioTest: 'فحص الميكروفون',
    cameraTest: 'فحص الكاميرا',
    audioOk: 'تم اكتشاف الصوت',
    cameraOk: 'الكاميرا نشطة',
    waitingRoom: 'جارٍ الاتصال بالمضيف باللغة الإنجليزية والمترجم المعتمد...',
    privacyNotice: 'هذه المكالمة آمنة ومشفرة وسرية تمامًا.',
    tipsHeader: 'قبل الانضمام:',
    tip1: 'ابحث عن مكان هادئ مع الحد الأدنى من الضوضاء.',
    tip2: 'تحدث بوضوح وتأنٍ نحو ميكروفون جهازك.',
    tip3: 'سيقوم المترجم بترجمة كل ما يقال بدقة وبصورة متتالية.'
  },
  zh: {
    welcome: '欢迎参加您的实时口译会议',
    subWelcome: '您已受邀参加由专业认证口译员协助的三方私密视频会议。',
    languageSelect: '选择您的首选语言',
    enterName: '您的姓名',
    readyToJoin: '立即进入会议室',
    audioTest: '麦克风测试',
    cameraTest: '摄像头测试',
    audioOk: '语音正常',
    cameraOk: '摄像头已开启',
    waitingRoom: '正在连接英文主办方和专业认证口译员...',
    privacyNotice: '此通话全程加密，完全保密且符合隐私标准。',
    tipsHeader: '加入前提示：',
    tip1: '请选择安静、无噪音干扰的环境。',
    tip2: '请清晰、平稳地向麦克风讲话。',
    tip3: '口译员将逐句准确传译所有发言内容。'
  },
  vi: {
    welcome: 'Chào mừng bạn đến với Buổi Thông Dịch Trực Tiếp',
    subWelcome: 'Bạn đã được mời tham gia cuộc gọi 3 bên có thông dịch viên chứng chỉ chuyên nghiệp.',
    languageSelect: 'Chọn ngôn ngữ của bạn',
    enterName: 'Họ và tên của bạn',
    readyToJoin: 'Tham Gia Phòng Ngay',
    audioTest: 'Kiểm tra Micrô',
    cameraTest: 'Kiểm tra Camera',
    audioOk: 'Đã nhận âm thanh',
    cameraOk: 'Camera hoạt động',
    waitingRoom: 'Đang kết nối với người chủ trì tiếng Anh và thông dịch viên...',
    privacyNotice: 'Cuộc gọi này an toàn, được mã hóa và bảo mật nghiêm ngặt.',
    tipsHeader: 'Trước khi tham gia:',
    tip1: 'Hãy chọn một nơi yên tĩnh và ít tiếng ồn.',
    tip2: 'Nói rõ ràng và chậm rãi vào micrô thiết bị.',
    tip3: 'Thông dịch viên sẽ dịch lần lượt từng câu đầy đủ.'
  },
  fr: {
    welcome: 'Bienvenue à votre Session d’Interprétation',
    subWelcome: 'Vous avez été invité à un appel privé à 3 avec un interprète professionnel certifié.',
    languageSelect: 'Sélectionnez votre langue',
    enterName: 'Votre Nom Complet',
    readyToJoin: 'Rejoindre la Salle Maintenant',
    audioTest: 'Test du Microphone',
    cameraTest: 'Test de la Caméra',
    audioOk: 'Audio détecté',
    cameraOk: 'Caméra active',
    waitingRoom: 'Connexion en cours avec votre hôte anglophone et l’interprète...',
    privacyNotice: 'Cet appel est sécurisé, crypté et strictement confidentiel.',
    tipsHeader: 'Avant de rejoindre :',
    tip1: 'Trouvez un endroit calme sans bruit de fond.',
    tip2: 'Parlez distinctement et à un rythme modéré.',
    tip3: 'L’interprète traduira fidèlement et consécutivement chaque propos.'
  }
};

// Common Quick In-Call Phrases for Instant Interpretation
export const QUICK_PHRASES = [
  { id: 'p-1', label: 'Please slow down', text: 'Please speak at a slower pace so the interpreter can translate accurately.' },
  { id: 'p-2', label: 'Clarification needed', text: 'The interpreter requests a brief clarification regarding that last statement.' },
  { id: 'p-3', label: 'One at a time', text: 'Please allow one person to speak at a time for clear translation.' },
  { id: 'p-4', label: 'Confirm understanding', text: 'Did the client fully understand the instructions given?' },
  { id: 'p-5', label: 'Translating document', text: 'The interpreter is now performing sight translation of the document on screen.' }
];

// Initial mock data with interpreters across all core languages
export const INITIAL_INTERPRETERS = [
  {
    id: 'int-1',
    name: 'Elena Rodriguez, CCHI',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    languages: ['Spanish (Español)', 'English'],
    primaryLang: 'Spanish',
    specialties: ['Medical / Healthcare', 'Legal / Court', 'General / Customer Support'],
    status: 'online',
    rating: 4.98,
    totalCalls: 1420,
    hourlyRate: 55,
    certifications: ['Certified Healthcare Interpreter (CCHI)', 'State Court Certified'],
    bio: '12+ years of medical and judicial interpretation experience in trauma, surgery, and civil litigation.'
  },
  {
    id: 'int-2',
    name: 'Dr. Tarek Al-Mansoor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    languages: ['Arabic (العربية)', 'English'],
    primaryLang: 'Arabic',
    specialties: ['Medical / Healthcare', 'Immigration & Refugee', 'Financial / Banking', 'General / Customer Support'],
    status: 'online',
    rating: 4.95,
    totalCalls: 980,
    hourlyRate: 60,
    certifications: ['NBCMI Certified', 'Federal Court Interpreter'],
    bio: 'Native Arabic speaker specializing in oncology, cardiology, and immigration hearings.'
  },
  {
    id: 'int-3',
    name: 'Mei-Ling Chen',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    languages: ['Mandarin Chinese (中文)', 'Cantonese (粤语)', 'English'],
    primaryLang: 'Mandarin Chinese',
    specialties: ['Legal / Court Certified', 'Financial / Banking', 'Medical / Healthcare', 'General / Customer Support'],
    status: 'online',
    rating: 5.0,
    totalCalls: 1850,
    hourlyRate: 65,
    certifications: ['ATA Certified (English/Chinese)', 'Judicial Council of CA Certified'],
    bio: 'Simultaneous & consecutive conference interpreter with high-stakes commercial & arbitration expertise.'
  },
  {
    id: 'int-4',
    name: 'Nguyen Van Minh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    languages: ['Vietnamese (Tiếng Việt)', 'English'],
    primaryLang: 'Vietnamese',
    specialties: ['Medical / Healthcare', 'Education & Community', 'General / Customer Support'],
    status: 'online',
    rating: 4.92,
    totalCalls: 830,
    hourlyRate: 50,
    certifications: ['Washington DSHS Medical Certified'],
    bio: 'Dedicated healthcare interpreter helping patients navigate complex clinical visits.'
  },
  {
    id: 'int-5',
    name: 'Jean-Luc Dubois',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    languages: ['French (Français)', 'Haitian Creole (Kreyòl)', 'English'],
    primaryLang: 'French',
    specialties: ['Legal / Court Certified', 'Immigration & Refugee', 'General / Customer Support'],
    status: 'online',
    rating: 4.96,
    totalCalls: 620,
    hourlyRate: 55,
    certifications: ['United Nations Accredited', 'ATA Certified'],
    bio: 'Bilingual French & Haitian Creole expert with extensive asylum interview background.'
  },
  {
    id: 'int-6',
    name: 'Dmitri Volkov, CCHI',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    languages: ['Russian (Русский)', 'English', 'Ukrainian (Українська)'],
    primaryLang: 'Russian',
    specialties: ['General / Customer Support', 'Medical / Healthcare', 'Legal / Court Certified', 'Financial / Banking'],
    status: 'online',
    rating: 4.97,
    totalCalls: 1210,
    hourlyRate: 55,
    certifications: ['Certified Healthcare Interpreter (CCHI)', 'State Judiciary Russian Certified'],
    bio: '10+ years of professional Russian interpretation in customer support, corporate hearings, and surgery.'
  },
  {
    id: 'int-7',
    name: 'Svetlana Petrova, ATA',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    languages: ['Russian (Русский)', 'English'],
    primaryLang: 'Russian',
    specialties: ['General / Customer Support', 'Immigration & Refugee', 'Education & Community'],
    status: 'online',
    rating: 4.99,
    totalCalls: 940,
    hourlyRate: 58,
    certifications: ['American Translators Association (ATA)', 'Federal Court Certified'],
    bio: 'Specialist in Russian consecutive interpretation, consumer support, and legal immigration filings.'
  },
  {
    id: 'int-8',
    name: 'Thiago Silva, NBCMI',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    languages: ['Portuguese (Português)', 'English', 'Spanish (Español)'],
    primaryLang: 'Portuguese',
    specialties: ['Medical / Healthcare', 'Financial / Banking', 'General / Customer Support'],
    status: 'online',
    rating: 4.96,
    totalCalls: 880,
    hourlyRate: 52,
    certifications: ['National Board Certified (NBCMI)', 'ABRATES Accredited'],
    bio: 'Bilingual Brazilian Portuguese linguist specializing in financial services and telemedicine.'
  },
  {
    id: 'int-9',
    name: 'Rajesh Sharma, CCHI',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    languages: ['Hindi (हिन्दी)', 'Punjabi (ਪੰਜਾਬੀ)', 'English'],
    primaryLang: 'Hindi',
    specialties: ['Medical / Healthcare', 'General / Customer Support', 'Legal / Court Certified'],
    status: 'online',
    rating: 4.98,
    totalCalls: 1150,
    hourlyRate: 50,
    certifications: ['Certified Healthcare Interpreter (CCHI)', 'Court Certified'],
    bio: 'Native Hindi and Punjabi interpreter with 9 years of medical, legal, and public sector experience.'
  },
  {
    id: 'int-10',
    name: 'Olena Kovalenko, ATA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    languages: ['Ukrainian (Українська)', 'Russian (Русский)', 'English'],
    primaryLang: 'Ukrainian',
    specialties: ['Immigration & Refugee', 'Medical / Healthcare', 'General / Customer Support'],
    status: 'online',
    rating: 4.99,
    totalCalls: 760,
    hourlyRate: 55,
    certifications: ['ATA Certified Ukrainian Linguist', 'DSHS Certified'],
    bio: 'Expert Ukrainian interpreter assisting families with refugee resettlement, healthcare, and administrative needs.'
  },
  {
    id: 'int-11',
    name: 'Maria Santos-Reyes',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    languages: ['Tagalog / Filipino', 'Ilocano', 'English'],
    primaryLang: 'Tagalog / Filipino',
    specialties: ['Healthcare & Nursing', 'Education & Community', 'General / Customer Support'],
    status: 'online',
    rating: 4.96,
    totalCalls: 690,
    hourlyRate: 48,
    certifications: ['CA Healthcare Certified Tagalog Interpreter'],
    bio: 'Over 8 years supporting Tagalog and Ilocano speaking families in community healthcare and insurance.'
  },
  {
    id: 'int-12',
    name: 'Dr. Min-Jun Park',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    languages: ['Korean (한국어)', 'English'],
    primaryLang: 'Korean',
    specialties: ['Medical / Healthcare', 'Financial / Banking', 'General / Customer Support'],
    status: 'online',
    rating: 4.98,
    totalCalls: 1320,
    hourlyRate: 60,
    certifications: ['Korean Medical Association Certified', 'Court Certified'],
    bio: 'Dual-degreed medical and corporate Korean conference & consecutive interpreter.'
  },
  {
    id: 'int-13',
    name: 'Sarah Miller, RID',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    languages: ['American Sign Language (ASL)', 'English'],
    primaryLang: 'American Sign Language (ASL)',
    specialties: ['Medical / Healthcare', 'Legal / Court Certified', 'Education & Community'],
    status: 'online',
    rating: 5.0,
    totalCalls: 2100,
    hourlyRate: 70,
    certifications: ['RID Certified (Registry of Interpreters for the Deaf)', 'NIC Master'],
    bio: 'Master certified ASL interpreter specializing in high-definition video remote interpretation.'
  }
];

// Helper to reliably return interpreters for any chosen language
export function getInterpretersForLanguage(languageName) {
  if (!languageName) return INITIAL_INTERPRETERS;
  const lower = languageName.toLowerCase();
  
  const matches = INITIAL_INTERPRETERS.filter(interp => {
    return (
      (interp.primaryLang && interp.primaryLang.toLowerCase().includes(lower)) ||
      interp.languages.some(l => l.toLowerCase().includes(lower))
    );
  });

  if (matches.length > 0) {
    return matches;
  }

  // Dynamic fallback generator so NO language ever has an empty list!
  return [
    {
      id: `int-gen-1-${lower}`,
      name: `Dr. Alexander ${languageName.slice(0, 4)}ov, CCHI`,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      languages: [`${languageName}`, 'English'],
      primaryLang: languageName,
      specialties: ['General / Customer Support', 'Medical / Healthcare', 'Legal / Court Certified'],
      status: 'online',
      rating: 4.97,
      totalCalls: 890,
      hourlyRate: 55,
      certifications: [`Certified Healthcare ${languageName} Interpreter`, 'State Court Certified'],
      bio: `Certified consecutive & simultaneous ${languageName} linguist with over 9 years of professional expertise.`
    },
    {
      id: `int-gen-2-${lower}`,
      name: `Elena ${languageName.slice(0, 4)}a, ATA`,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      languages: [`${languageName}`, 'English'],
      primaryLang: languageName,
      specialties: ['General / Customer Support', 'Immigration & Refugee', 'Financial / Banking'],
      status: 'online',
      rating: 4.98,
      totalCalls: 670,
      hourlyRate: 58,
      certifications: ['ATA Certified Linguist', 'Federal Court Certified'],
      bio: `Specialist in ${languageName} communication, high-precision translation, and customer care.`
    }
  ];
}
