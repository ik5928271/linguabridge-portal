// Supported Languages with Native Names, Codes, and Flags
export const LANGUAGES = [
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', popular: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ / پنجابی', flag: '🇵🇰', popular: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', popular: true },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文 (普通话)', flag: '🇨🇳', popular: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', popular: true },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', popular: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', popular: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', popular: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', popular: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', popular: true },
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
  ur: {
    welcome: 'آپ کے ترجمانی سیشن میں خوش آمدید',
    subWelcome: 'آپ کو تصدیق شدہ مترجم کے ساتھ ایک نجی 3 فریقی کال میں مدعو کیا گیا ہے۔',
    languageSelect: 'اپنی پسندیدہ زبان منتخب کریں',
    enterName: 'آپ کا پورا نام',
    readyToJoin: 'کال میں شامل ہوں',
    audioTest: 'مائیکروفون چیک',
    cameraTest: 'کیمرہ چیک',
    audioOk: 'آواز موصول ہو رہی ہے',
    cameraOk: 'کیمرہ فعال ہے',
    waitingRoom: 'میزبان اور تصدیق شدہ مترجم سے رابطہ قائم ہو رہا ہے...',
    privacyNotice: 'یہ کال مکمل طور پر محفوظ، خفیہ اور انکرپٹڈ ہے۔',
    tipsHeader: 'شامل ہونے سے پہلے:',
    tip1: 'ایک پرسکون جگہ تلاش کریں جہاں شور کم ہو۔',
    tip2: 'اپنے مائیکروفون کے قریب صاف آواز میں بولیں۔',
    tip3: 'مترجم آپ کی تمام بات چیت کا تسلسل سے ترجمہ کرے گا۔'
  },
  pa: {
    welcome: 'ਤੁਹਾਡੇ ਅਨੁਵਾਦ ਸੈਸ਼ਨ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ / جی آیاں نوں',
    subWelcome: 'ਤੁਹਾਨੂੰ ਇੱਕ ਪ੍ਰਮਾਣਿਤ ਦੁਭਾਸ਼ੀਏ ਨਾਲ ਕਾਲ ਵਿੱਚ ਬੁਲਾਇਆ ਗਿਆ ਹੈ।',
    languageSelect: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ',
    enterName: 'ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ',
    readyToJoin: 'ਹੁਣੇ ਸ਼ਾਮਲ ਹੋਵੋ',
    audioTest: 'ਮਾਈਕ੍ਰੋਫੋਨ ਚੈੱਕ',
    cameraTest: 'ਕੈਮਰਾ ਚੈੱਕ',
    audioOk: 'ਆਡੀਓ ਚਾਲੂ ਹੈ',
    cameraOk: 'ਕੈਮਰਾ ਚਾਲੂ ਹੈ',
    waitingRoom: 'ਮੇਜ਼ਬਾਨ ਅਤੇ ਦੁਭਾਸ਼ੀਏ ਨਾਲ ਸੰਪਰਕ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...',
    privacyNotice: 'ਇਹ ਕਾਲ ਸੁਰੱਖਿਅਤ ਅਤੇ ਗੁਪਤ ਹੈ।',
    tipsHeader: 'ਸ਼ਾਮਲ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ:',
    tip1: 'ਸ਼ਾਂਤ ਜਗ੍ਹਾ ਚੁਣੋ।',
    tip2: 'ਸਾਫ਼ ਅਤੇ ਸਪਸ਼ਟ ਆਵਾਜ਼ ਵਿੱਚ ਬੋਲੋ।',
    tip3: 'ਦੁਭਾਸ਼ੀਆ ਹਰ ਗੱਲ ਦਾ ਅਨੁਵਾਦ ਕਰੇਗਾ।'
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
    tip3: 'El intérprete traducirá todo consecutivamente con total fidelidad.'
  },
  zh: {
    welcome: '欢迎参加您的口译会议',
    subWelcome: '您已受邀参加包含专业认证译员的专属三方口译通话。',
    languageSelect: '选择您的首选语言',
    enterName: '您的姓名',
    readyToJoin: '立即进入会议室',
    audioTest: '麦克风测试',
    cameraTest: '摄像头测试',
    audioOk: '麦克风正常',
    cameraOk: '摄像头已开启',
    waitingRoom: '正在连接您的英语主办方及专业认证口译员...',
    privacyNotice: '本次通话符合HIPAA隐私规范，受到全链路端到端加密保护。',
    tipsHeader: '参会建议：',
    tip1: '请保持周围环境安静，避免杂音干扰。',
    tip2: '发言时请保持语速适中，吐字清晰。',
    tip3: '译员将为您进行准确的逐句交替口译。'
  },
  ar: {
    welcome: 'مرحبًا بك في جلسة الترجمة الفورية',
    subWelcome: 'لقد تمت دعوتك لمكالمة ثلاثية خاصة مع مترجم فوري معتمد.',
    languageSelect: 'اختر لغتك المفضلة',
    enterName: 'الاسم الكامل',
    readyToJoin: 'الانضمام إلى الغرفة الآن',
    audioTest: 'فحص الميكروفون',
    cameraTest: 'فحص الكاميرا',
    audioOk: 'تم الكشف عن الصوت',
    cameraOk: 'الكاميرا تعمل',
    waitingRoom: 'جارٍ الاتصال بمضيفك باللغة الإنجليزية والمترجم الفوري المعتمد...',
    privacyNotice: 'هذه المكالمة آمنة ومشفرة ومتوافقة مع أعلى معايير الخصوصية الطبية والقانونية.',
    tipsHeader: 'قبل الانضمام:',
    tip1: 'يرجى التواجد في مكان هادئ بدون ضوضاء.',
    tip2: 'تحدث بنبرة واضحة ومباشرة في ميكروفون جهازك.',
    tip3: 'سيقوم المترجم بترجمة كل عبارة بدقة وأمانة.'
  },
  vi: {
    welcome: 'Chào mừng bạn đến với Buổi Thông dịch',
    subWelcome: 'Bạn đã được mời tham gia cuộc gọi thông dịch 3 bên bảo mật với thông dịch viên chuyên nghiệp.',
    languageSelect: 'Chọn ngôn ngữ của bạn',
    enterName: 'Họ và tên của bạn',
    readyToJoin: 'Vào Phòng Ngay',
    audioTest: 'Kiểm tra Micro',
    cameraTest: 'Kiểm tra Camera',
    audioOk: 'Đã nhận tín hiệu âm thanh',
    cameraOk: 'Camera hoạt động tốt',
    waitingRoom: 'Đang kết nối với người chủ trì tiếng Anh và thông dịch viên chứng chỉ...',
    privacyNotice: 'Cuộc gọi này được bảo mật và mã hóa nghiêm ngặt theo tiêu chuẩn HIPAA.',
    tipsHeader: 'Trước khi tham gia:',
    tip1: 'Tìm một không gian yên tĩnh, ít tiếng ồn xung quanh.',
    tip2: 'Nói rõ ràng và trực tiếp vào micro của thiết bị.',
    tip3: 'Thông dịch viên sẽ dịch trung thực từng câu sau khi bạn nói.'
  },
  ru: {
    welcome: 'Добро пожаловать на сеанс перевода',
    subWelcome: 'Вас пригласили на защищенный трехсторонний звонок с сертифицированным переводчиком.',
    languageSelect: 'Выберите предпочитаемый язык',
    enterName: 'Ваше полное имя',
    readyToJoin: 'Войти в комнату',
    audioTest: 'Проверка микрофона',
    cameraTest: 'Проверка камеры',
    audioOk: 'Звук обнаружен',
    cameraOk: 'Камера активна',
    waitingRoom: 'Соединение с англоязычным организатором и переводчиком...',
    privacyNotice: 'Этот звонок полностью защищен, зашифрован и конфиденциален.',
    tipsHeader: 'Перед началом:',
    tip1: 'Найдите тихое место без постороннего шума.',
    tip2: 'Говорите четко и прямо в микрофон вашего устройства.',
    tip3: 'Переводчик будет последовательно и точно переводить каждую фразу.'
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

// Clean Registered Interpreters - Populated dynamically from database / admin provisioning
export const INITIAL_INTERPRETERS = [];

// Helper to return registered interpreters
export function getInterpretersForLanguage(languageName) {
  return [];
}

// 3-Tier Employment & Compensation Models
export const EMPLOYMENT_MODELS = [
  {
    id: 'salary_base',
    name: 'Salary Base (Fixed Full-Time / Dedicated)',
    badge: 'Fixed Salary',
    rateUnit: '/ month',
    roles: ['Admin Operations', 'Accounts & Finance', 'Full-Time In-House Interpreters', 'Shift Supervisors'],
    description: 'Fixed monthly salary, confirmed shift timings, predictable roster and guaranteed monthly compensation.',
    defaultAmount: 1200,
    exampleRate: '$1,200 - $3,500 / month'
  },
  {
    id: 'hourly',
    name: 'Per Hour Paying Rate (Scheduled Shifts & Confirmed Queue)',
    badge: 'Hourly Shift',
    rateUnit: '/ hr',
    roles: ['Scheduled Interpreters (Long Shifts)', 'Consultants', 'QA Specialists', 'Shift Interpreters'],
    description: 'Scheduled long shifts and confirmed assignment queues. Paid per confirmed shift hour worked.',
    defaultAmount: 8,
    exampleRate: '$6 - $25 / hr'
  },
  {
    id: 'per_minute',
    name: 'Per Minute Talking Rate (On-Demand / Flexible Talk Time)',
    badge: 'Per-Minute Live Talk',
    rateUnit: '/ min',
    roles: ['On-Demand Flex Interpreters', 'Standby Medical/Legal Linguists'],
    description: 'Flexible standby queue with variable call volumes. Paid strictly per live call talk-time minute at a higher/double effective rate.',
    defaultAmount: 0.30,
    exampleRate: '$0.20 - $0.75 / min (~$12 - $45/hr active talk)'
  }
];

