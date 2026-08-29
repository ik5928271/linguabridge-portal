import React, { useState } from 'react';
import { BookOpen, Search, X, Globe, Copy, Check } from 'lucide-react';

export default function GlossaryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const fullGlossary = [
    {
      id: 'g-1',
      category: 'Medical',
      en: 'Informed Consent',
      es: 'Consentimiento Informado',
      ar: 'الموافقة المستنيرة',
      zh: '知情同意',
      vi: 'Đồng thuận sau khi được giải thích',
      fr: 'Consentement éclairé',
      def: 'Permission granted in the knowledge of the possible consequences, typically given by a patient to a doctor for treatment with knowledge of the possible risks and benefits.'
    },
    {
      id: 'g-2',
      category: 'Medical',
      en: 'Myocardial Infarction (Heart Attack)',
      es: 'Infarto de Miocardio (Ataque Cardíaco)',
      ar: 'احتشاء عضلة القلب (أزمة قلبية)',
      zh: '心肌梗死（心脏病发作）',
      vi: 'Nhồi máu cơ tim (Đau tim)',
      fr: 'Infarctus du myocarde (Crise cardiaque)',
      def: 'Necrosis of heart muscle due to blocked arterial blood supply.'
    },
    {
      id: 'g-3',
      category: 'Medical',
      en: 'Hypertension',
      es: 'Hipertensión Arterial / Presión Alta',
      ar: 'ارتفاع ضغط الدم',
      zh: '高血压',
      vi: 'Tăng huyết áp / Cao huyết áp',
      fr: 'Hypertension artérielle',
      def: 'Abnormally high arterial blood pressure.'
    },
    {
      id: 'g-4',
      category: 'Medical',
      en: 'Adverse Reaction',
      es: 'Reacción Adversa / Efecto Secundario Grave',
      ar: 'تفاعل دوائي ضار',
      zh: '药物不良反应',
      vi: 'Phản ứng bất lợi',
      fr: 'Effet indésirable',
      def: 'An unwanted or harmful effect resulting from a medication or medical intervention.'
    },
    {
      id: 'g-5',
      category: 'Medical',
      en: 'Biopsy',
      es: 'Biopsia',
      ar: 'خزعة',
      zh: '活检 / 活体组织检查',
      vi: 'Sinh thiết',
      fr: 'Biopsie',
      def: 'An examination of tissue removed from a living body to discover the presence, cause, or extent of a disease.'
    },
    {
      id: 'g-6',
      category: 'Legal',
      en: 'Affidavit',
      es: 'Declaración Jurada',
      ar: 'إفادة خطية مشفوعة بيمين',
      zh: '宣誓书 / 宣誓证明',
      vi: 'Bản khai có tuyên thệ',
      fr: 'Déclaration sous serment',
      def: 'A written statement confirmed by oath or affirmation, for use as judicial evidence.'
    },
    {
      id: 'g-7',
      category: 'Legal',
      en: 'Subpoena',
      es: 'Citación Judicial / Orden de Comparecencia',
      ar: 'مذكرة استدعاء قضائية',
      zh: '传票 / 出庭令',
      vi: 'Trát hầu tòa',
      fr: 'Assignation à comparaître',
      def: 'A writ ordering a person to attend a court under penalty.'
    },
    {
      id: 'g-8',
      category: 'Legal',
      en: 'Power of Attorney',
      es: 'Poder Notarial / Carta Poder',
      ar: 'توكيل رسمي',
      zh: '委托授权书',
      vi: 'Giấy ủy quyền',
      fr: 'Procuration',
      def: 'The authority to act for another person in specified legal or financial matters.'
    },
    {
      id: 'g-9',
      category: 'Legal',
      en: 'Deposition',
      es: 'Declaración Testimonial / Deposición',
      ar: 'شهادة خطية مسجلة',
      zh: '庭外采证 / 宣誓证言',
      vi: 'Lời khai hữu thệ',
      fr: 'Déposition',
      def: 'The out-of-court oral testimony of a witness that is reduced to writing for later use in court or for discovery purposes.'
    },
    {
      id: 'g-10',
      category: 'Financial',
      en: 'Escrow Account',
      es: 'Cuenta de Fideicomiso / Cuenta de Garantía',
      ar: 'حساب ضمان ائتماني',
      zh: '第三方托管账户',
      vi: 'Tài khoản ký quỹ',
      fr: 'Compte séquestre',
      def: 'A contractual arrangement in which a third party receives and disburses money for primary transacting parties.'
    }
  ];

  const filtered = fullGlossary.filter(item => {
    const matchesCat = category === 'All' || item.category === category;
    const q = query.toLowerCase();
    const matchesQuery = !query ||
      item.en.toLowerCase().includes(q) ||
      item.es.toLowerCase().includes(q) ||
      item.def.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const copyTerm = (term, id) => {
    navigator.clipboard.writeText(term);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-3xl w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6 max-h-[85vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <span>Medical, Legal & Financial Terminology Glossary</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified multi-language terminology dictionary for certified interpreters
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by English, Spanish, or clinical definition..."
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            {['All', 'Medical', 'Legal', 'Financial'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                  category === cat ? 'bg-brand-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Glossary Cards */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filtered.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{item.en}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.category === 'Medical' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    item.category === 'Legal' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => copyTerm(item.es, item.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
                  title="Copy Translation"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Multi-language translations grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold block">🇪🇸 Español:</span>
                  <span className="font-bold text-amber-300">{item.es}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold block">🇸🇦 العربية:</span>
                  <span className="font-bold text-amber-300">{item.ar}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold block">🇨🇳 中文:</span>
                  <span className="font-bold text-amber-300">{item.zh}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold block">🇻🇳 Tiếng Việt:</span>
                  <span className="font-bold text-amber-300">{item.vi}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-semibold block">🇫🇷 Français:</span>
                  <span className="font-bold text-amber-300">{item.fr}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                <strong className="text-slate-300">Definition:</strong> {item.def}
              </p>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching terminology found for "{query}".
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
