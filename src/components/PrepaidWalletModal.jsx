import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Clock, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Building2,
  Lock,
  Landmark,
  CheckCircle2,
  Tag,
  Gift,
  Percent,
  Upload,
  FileText,
  AlertCircle,
  Copy,
  Info,
  Send
} from 'lucide-react';

export default function PrepaidWalletModal({ 
  isOpen, 
  onClose, 
  onTopUpSuccess,
  currentBalance = 0,
  initialClaimDiscount = true,
  currentUser = null
}) {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState('remitly'); // 'remitly', 'ukbank', 'iban'
  const [selectedPack, setSelectedPack] = useState(120); // 60, 120, 300, 600, or 'custom'
  const [customMinutes, setCustomMinutes] = useState(1000);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimDiscount, setClaimDiscount] = useState(initialClaimDiscount);
  const [promoCode, setPromoCode] = useState('FOUNDING2026');
  const [isPromoApplied, setIsPromoApplied] = useState(true);
  
  // Payment Proof & Receipt Submission Fields
  const [senderName, setSenderName] = useState(currentUser?.name || 'Authorized Client');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || 'client@linguabridge.com');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptFileData, setReceiptFileData] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [submittedReceiptData, setSubmittedReceiptData] = useState(null);

  // 2026 Tiered Promotional Packages (Valid for 6 full months from join date)
  const packages = [
    {
      minutes: 60,
      price: 54.00,
      ratePerMin: '0.90',
      discountPercent: 15,
      discountPrice: 45.90,
      discountRatePerMin: '0.765',
      savings: 8.10,
      tag: 'Starter (1 Hr • 15% OFF)',
      popular: false
    },
    {
      minutes: 120,
      price: 99.00,
      ratePerMin: '0.825',
      discountPercent: 20,
      discountPrice: 79.20,
      discountRatePerMin: '0.660',
      savings: 19.80,
      tag: 'Growth (2 Hrs • 20% OFF)',
      popular: true
    },
    {
      minutes: 300,
      price: 235.00,
      ratePerMin: '0.783',
      discountPercent: 25,
      discountPrice: 176.25,
      discountRatePerMin: '0.588',
      savings: 58.75,
      tag: 'Clinic Pack (5 Hrs • 25% OFF)',
      popular: false
    },
    {
      minutes: 600,
      price: 450.00,
      ratePerMin: '0.750',
      discountPercent: 30,
      discountPrice: 315.00,
      discountRatePerMin: '0.525',
      savings: 135.00,
      tag: 'Hospital Pack (10 Hrs • 30% OFF)',
      popular: false
    }
  ];

  // Dynamic Custom Minutes / Above 600 Minutes Package Calculation (35% OFF for 600+ mins)
  const parsedCustomMins = Math.max(60, parseInt(customMinutes) || 600);
  const customDiscountPercent = parsedCustomMins >= 600 ? 35 : parsedCustomMins >= 300 ? 25 : parsedCustomMins >= 120 ? 20 : 15;
  const customBasePrice = parseFloat(((parsedCustomMins / 60) * 45).toFixed(2)); // $0.75/min standard bulk rate ($45/hr)
  const customDiscountPrice = parseFloat((customBasePrice * (1 - customDiscountPercent / 100)).toFixed(2));
  const customSavings = parseFloat((customBasePrice - customDiscountPrice).toFixed(2));
  const customRatePerMin = (customBasePrice / parsedCustomMins).toFixed(2);
  const customDiscountRatePerMin = (customDiscountPrice / parsedCustomMins).toFixed(3);

  const customPackObj = {
    minutes: parsedCustomMins,
    price: customBasePrice,
    ratePerMin: customRatePerMin,
    discountPercent: customDiscountPercent,
    discountPrice: customDiscountPrice,
    discountRatePerMin: customDiscountRatePerMin,
    savings: customSavings,
    tag: `Custom Bulk (${parsedCustomMins} Mins • ${customDiscountPercent}% OFF)`,
    popular: false,
    isCustom: true
  };

  const activePackage = isCustomMode 
    ? customPackObj 
    : (packages.find(p => p.minutes === selectedPack) || packages[1]);

  const isDiscountActive = claimDiscount && isPromoApplied;
  const activePrice = isDiscountActive ? activePackage.discountPrice : activePackage.price;
  const activeOriginalPrice = activePackage.price;
  const activeSavings = isDiscountActive ? (activeOriginalPrice - activePrice).toFixed(2) : 0;
  const activeMinutes = activePackage.minutes;
  const activeDiscountPercent = activePackage.discountPercent || 20;

  const handleSelectFixedPack = (mins) => {
    setIsCustomMode(false);
    setSelectedPack(mins);
  };

  const handleSelectCustomMode = () => {
    setIsCustomMode(true);
  };

  const handleCustomMinutesChange = (newVal) => {
    const valid = Math.max(60, Math.min(100000, parseInt(newVal) || 0));
    setCustomMinutes(valid);
    setIsCustomMode(true);
  };

  const handleIncrementCustom = (delta) => {
    setCustomMinutes(prev => {
      const current = parseInt(prev) || 600;
      return Math.max(60, current + delta);
    });
    setIsCustomMode(true);
  };

  const handleToggleDiscount = () => {
    setClaimDiscount(!claimDiscount);
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptFileData(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReceipt = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const resolvedMethodLabel = paymentMethod === 'remitly' 
      ? 'Card / Remitly / WorldRemit' 
      : paymentMethod === 'ukbank' 
        ? 'UK Bank Transfer' 
        : 'International IBAN / SWIFT Wire';

    const payload = {
      userId: currentUser?.id || `usr-${Date.now().toString(36)}`,
      clientName: senderName || currentUser?.name || 'Client Account',
      clientEmail: senderEmail || currentUser?.email || 'client@linguabridge.com',
      clientOrg: currentUser?.org || 'Client Organization',
      clientPhone: senderPhone || '',
      packageMinutes: activeMinutes,
      amountPaid: parseFloat(activePrice),
      discountApplied: isDiscountActive ? activeDiscountPercent : 0,
      paymentMethod: resolvedMethodLabel,
      bankReference: transactionRef || `REF-${Date.now().toString(36).toUpperCase()}`,
      receiptFileName: receiptFileName || 'Bank_Deposit_Slip.pdf',
      receiptFileData: receiptFileData || null,
      clientNotes: clientNotes || ''
    };

    fetch('/api/payment-receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setIsProcessing(false);
        setSubmittedReceiptData(data.receipt || payload);
        setIsSuccess(true);
      })
      .catch(() => {
        setIsProcessing(false);
        setSubmittedReceiptData(payload);
        setIsSuccess(true);
      });
  };

  const handleCompleteAndReturn = () => {
    if (onTopUpSuccess) {
      onTopUpSuccess({
        minutesAdded: 0,
        pendingMinutes: activeMinutes,
        amountPaid: parseFloat(activePrice),
        discountApplied: isDiscountActive ? activeDiscountPercent : 0,
        status: 'pending_verification',
        paymentReceipt: submittedReceiptData
      });
    }
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative text-white my-8">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Instant Prepaid Wallet Credit</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-0.5">Top-Up Interpretation Minutes</h3>
            <p className="text-xs text-slate-400">
              Purchased minutes are credited upon admin receipt verification and deducted based on actual talk time.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🎁 2026 FOUNDING CLIENT 6-MONTH DISCOUNT PROMOTION BANNER */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          isDiscountActive 
            ? 'bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30' 
            : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition ${
                isDiscountActive ? 'bg-amber-500/25 text-amber-300 ring-2 ring-amber-400/40' : 'bg-slate-800 text-slate-400'
              }`}>
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 2026 Client Promotion
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                    Up to 35% OFF • 6 Months
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-0.5 font-medium leading-tight">
                  Join & pay in 2026 to lock in <strong className="text-emerald-300">15%–35% discount for 6 Months</strong> from join date.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleDiscount}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                claimDiscount ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  claimDiscount ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isDiscountActive && (
            <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Tag className="w-3.5 h-3.5" />
                <span>Promo Code: <strong className="tracking-wider bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">FOUNDING2026</strong></span>
              </div>
              <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                ✓ 6-Month Locked Promotional Rate
              </span>
            </div>
          )}
        </div>

        {/* Current Balance Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Current Available Balance</p>
              <p className="text-lg font-black text-white">{currentBalance} Minutes</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Prepaid Account
          </span>
        </div>

        {isSuccess ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-emerald-500/50 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
              <CheckCircle2 className="w-9 h-9 animate-bounce text-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                ⏳ Payment Proof Submitted • Verification Pending
              </span>
              <h4 className="text-xl font-extrabold text-white pt-2">Receipt Delivered to Administration</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Thank you! Your payment proof for <strong className="text-emerald-400">{activeMinutes} Minutes (${activePrice.toFixed(2)})</strong> has been sent to the IK Enterprises admin dispatch team.
              </p>
            </div>

            {/* Receipt Details Ticket */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Package Reserved:</span>
                <span className="font-bold text-white">{activeMinutes} Minutes (${activePrice.toFixed(2)})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Transfer Method:</span>
                <span className="font-semibold text-emerald-400">
                  {paymentMethod === 'remitly' ? 'Card / Remitly' : paymentMethod === 'ukbank' ? 'UK Bank Transfer' : 'IBAN Wire'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Transaction Ref:</span>
                <span className="font-mono font-bold text-amber-300">{transactionRef || 'Provided via Screenshot'}</span>
              </div>
              {receiptFileName && (
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Receipt Attachment:</span>
                  <span className="truncate max-w-[200px] text-emerald-300 font-medium">{receiptFileName}</span>
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs text-left flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Next Step:</strong> You can explore and check your dashboard right now. Once admin confirms your transfer, your minutes will be credited and you can immediately initiate live calls with interpreters.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCompleteAndReturn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Access Client Dashboard Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReceipt} className="space-y-4">
            
            {/* Packages Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Select Minute Package or Custom Volume:
                </label>
                {isDiscountActive && (
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    2026 Tiered 6-Month Promo Applied
                  </span>
                )}
              </div>

              {/* 4 Standard Packages Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {packages.map((pack) => {
                  const isSelected = !isCustomMode && selectedPack === pack.minutes;
                  const effectivePackPrice = isDiscountActive ? pack.discountPrice : pack.price;
                  const effectivePackRate = isDiscountActive ? pack.discountRatePerMin : pack.ratePerMin;

                  return (
                    <button
                      key={pack.minutes}
                      type="button"
                      onClick={() => handleSelectFixedPack(pack.minutes)}
                      className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600/25 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {pack.popular && (
                        <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                          Popular
                        </span>
                      )}
                      
                      <div className="flex items-baseline justify-between">
                        <p className="text-base font-black text-white">{pack.minutes} Mins</p>
                        <div className="text-right">
                          {isDiscountActive ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[11px] line-through text-slate-400 font-semibold">${pack.price.toFixed(2)}</span>
                              <span className="text-sm font-black text-emerald-400">${pack.discountPrice.toFixed(2)}</span>
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-emerald-400">${pack.price.toFixed(2)}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span>${effectivePackRate}/min</span>
                        <span className="text-emerald-400 font-semibold truncate max-w-[120px]">{pack.tag}</span>
                      </div>

                      {isDiscountActive && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-amber-300 font-bold">
                          <span>Save ${pack.savings.toFixed(2)}</span>
                          <span className="bg-amber-400/20 px-1.5 py-0.2 rounded text-amber-300">{pack.discountPercent}% OFF • 6 Mo</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 👑 CUSTOM & HIGH-VOLUME BUYERS BOX (>600 Mins = 35% OFF) */}
              <div 
                onClick={handleSelectCustomMode}
                className={`p-4 rounded-2xl border transition relative cursor-pointer ${
                  isCustomMode
                    ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-xl'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Custom Minutes / High-Volume Buyer</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
                          {parsedCustomMins >= 600 ? '35% OFF for 600+ Mins' : `${customDiscountPercent}% OFF`}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Enter any custom amount. Minutes &gt;=600 receive maximum 35% discount locked for 6 months!
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isDiscountActive ? (
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-xs line-through text-slate-400 font-semibold">${customBasePrice.toFixed(2)}</span>
                        <span className="text-base font-black text-emerald-400">${customDiscountPrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-base font-black text-emerald-400">${customBasePrice.toFixed(2)}</span>
                    )}
                    <span className="text-[10px] text-slate-400 block">${isDiscountActive ? customDiscountRatePerMin : customRatePerMin}/min</span>
                  </div>
                </div>

                {/* Interactive Minutes Input & Increments */}
                <div className="mt-3 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="60"
                        max="100000"
                        step="50"
                        value={customMinutes}
                        onChange={(e) => handleCustomMinutesChange(e.target.value)}
                        onFocus={() => setIsCustomMode(true)}
                        placeholder="e.g. 1000"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2 text-sm font-black text-white pl-9"
                      />
                      <Clock className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">Minutes</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleIncrementCustom(-100)}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      -100
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncrementCustom(100)}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      +100
                    </button>
                  </div>

                  {/* Quick Preset Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Select:</span>
                    {[800, 1000, 1500, 2500, 5000].map((quickVal) => (
                      <button
                        key={quickVal}
                        type="button"
                        onClick={() => {
                          setCustomMinutes(quickVal);
                          setIsCustomMode(true);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          isCustomMode && customMinutes === quickVal
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        {quickVal.toLocaleString()} min
                      </button>
                    ))}
                  </div>

                  {/* Savings Pill */}
                  {isDiscountActive && (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-[11px] text-amber-200">
                      <span className="font-medium">
                        {parsedCustomMins.toLocaleString()} mins (~{(parsedCustomMins / 60).toFixed(1)} hrs) with {customDiscountPercent}% Discount:
                      </span>
                      <strong className="text-amber-300">
                        Save ${customSavings.toFixed(2)} (6 Months Guaranteed)
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Choose Bank Payment Option:
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('remitly')}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    paymentMethod === 'remitly'
                      ? 'bg-emerald-600/25 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="text-[11px] block font-semibold">Card / Remitly</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ukbank')}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    paymentMethod === 'ukbank'
                      ? 'bg-emerald-600/25 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Landmark className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                  <span className="text-[11px] block font-semibold">UK Bank Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('iban')}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    paymentMethod === 'iban'
                      ? 'bg-emerald-600/25 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span className="text-[11px] block font-semibold">IBAN / Wire</span>
                </button>
              </div>
            </div>

            {/* Payment Details Container */}
            {paymentMethod === 'remitly' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    Pay via Card (Remitly / WorldRemit / SendWave)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Fast & Instant Deposit
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Send <strong>${activePrice.toFixed(2)}</strong> from your Visa/Mastercard debit or credit card via Remitly, WorldRemit, or SendWave directly to our verified bank account:
                </p>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-200">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Bank:</span>
                    <strong>Faysal Bank</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Title:</span>
                    <strong>IK Enterprises</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">IBAN:</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      PK55FAYS3376301000001057
                      <button
                        type="button"
                        onClick={() => handleCopy('PK55FAYS3376301000001057', 'iban')}
                        className="text-slate-400 hover:text-white ml-1"
                        title="Copy IBAN"
                      >
                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">City / Country:</span>
                    <span>Lahore, Pakistan</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Reference:</span>
                    <strong className="text-amber-300">TOPUP-{activeMinutes}MINS</strong>
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'ukbank' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-sky-400" />
                    Direct International Bank Transfer / UK Wire
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                    Direct Wire
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Transfer <strong>${activePrice.toFixed(2)}</strong> directly from your UK banking app using our verified corporate bank account:
                </p>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-200">
                  <p className="flex justify-between"><span className="text-slate-400">Beneficiary:</span> <strong>IK Enterprises</strong></p>
                  <p className="flex justify-between"><span className="text-slate-400">Bank:</span> <strong>Faysal Bank</strong></p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">IBAN:</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      PK55FAYS3376301000001057
                      <button
                        type="button"
                        onClick={() => handleCopy('PK55FAYS3376301000001057', 'iban')}
                        className="text-slate-400 hover:text-white ml-1"
                      >
                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </span>
                  </p>
                  <p className="flex justify-between"><span className="text-slate-400">SWIFT / BIC:</span> <strong className="text-sky-300">FAYSPKKA</strong></p>
                  <p className="flex justify-between"><span className="text-slate-400">City:</span> Lahore, Pakistan</p>
                </div>
              </div>
            )}

            {paymentMethod === 'iban' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    International SWIFT / Direct IBAN Wire
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    Corporate Wire
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  For law firms, hospitals, clinics, and corporate practices paying via direct international wire:
                </p>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-200">
                  <p className="flex justify-between"><span className="text-slate-400">Account Title:</span> <strong>IK Enterprises</strong></p>
                  <p className="flex justify-between"><span className="text-slate-400">Bank Name:</span> <strong>Faysal Bank Limited</strong></p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">IBAN:</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      PK55FAYS3376301000001057
                      <button
                        type="button"
                        onClick={() => handleCopy('PK55FAYS3376301000001057', 'iban')}
                        className="text-slate-400 hover:text-white ml-1"
                      >
                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </span>
                  </p>
                  <p className="flex justify-between"><span className="text-slate-400">SWIFT / BIC:</span> <strong className="text-amber-300">FAYSPKKA</strong></p>
                  <p className="flex justify-between"><span className="text-slate-400">City / Country:</span> Lahore, Pakistan</p>
                </div>
              </div>
            )}

            {/* 3. SUBMIT PAYMENT PROOF & RECEIPT FORM */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>3. Send Payment Receipt to LinguaBridge:</span>
                </label>
                <span className="text-[10px] text-slate-400">Admin Verification Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Sender / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none border border-slate-700 bg-slate-950"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email for Confirmation *</label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="client@email.com"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none border border-slate-700 bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">WhatsApp / Phone (Optional)</label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+44 / +1 / +92..."
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none border border-slate-700 bg-slate-950"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Transaction Ref / UTR / Track ID *</label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. REM-982341 / UTR-782"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none border border-slate-700 bg-slate-950"
                  />
                </div>
              </div>

              {/* Upload Receipt File / Screenshot */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Attach Payment Proof / Screenshot *
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 rounded-2xl p-3 bg-slate-950/60 text-center transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    {receiptFileName ? (
                      <span className="font-bold text-emerald-300 truncate max-w-[280px]">
                        ✓ {receiptFileName}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Click or drag receipt screenshot / PDF deposit slip here
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Client Note */}
              <div>
                <input
                  type="text"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Additional note for admin (optional)..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none border border-slate-700 bg-slate-950"
                />
              </div>
            </div>

            {/* Order Price Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected {isCustomMode ? 'Custom' : 'Standard'} Package ({activeMinutes} Minutes):</span>
                <span className="font-semibold text-slate-200">${activeOriginalPrice.toFixed(2)}</span>
              </div>
              {isDiscountActive && (
                <div className="flex justify-between text-amber-300 font-semibold">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>2026 Promo ({activeDiscountPercent}% OFF • 6 Mo Locked):</span>
                  </span>
                  <span>-${activeSavings}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
                <span className="font-bold text-white">Total Payable:</span>
                <div className="text-right">
                  {isDiscountActive && (
                    <span className="text-xs line-through text-slate-500 mr-2">${activeOriginalPrice.toFixed(2)}</span>
                  )}
                  <span className="font-black text-lg text-emerald-400">${activePrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Payment Receipt to Administration...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>
                    Submit Payment Receipt & Request Verification (${activePrice.toFixed(2)})
                  </span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

