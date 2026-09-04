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
  DollarSign,
  Building2,
  Lock
} from 'lucide-react';

export default function PrepaidWalletModal({ 
  isOpen, 
  onClose, 
  onTopUpSuccess,
  currentBalance = 85
}) {
  if (!isOpen) return null;

  const [selectedPack, setSelectedPack] = useState(120); // 60, 120, 300, 600, or 'custom'
  const [customMinutes, setCustomMinutes] = useState(150);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4892');

  const packages = [
    {
      minutes: 60,
      price: 54,
      ratePerMin: '0.90',
      tag: 'Starter Pack',
      popular: false
    },
    {
      minutes: 120,
      price: 99,
      ratePerMin: '0.82',
      tag: 'Most Popular',
      popular: true
    },
    {
      minutes: 300,
      price: 235,
      ratePerMin: '0.78',
      tag: 'Value Pack (Save 18%)',
      popular: false
    },
    {
      minutes: 600,
      price: 450,
      ratePerMin: '0.75',
      tag: 'Pro Practice (Save 22%)',
      popular: false
    }
  ];

  const activePrice = selectedPack === 'custom' 
    ? (customMinutes * 0.85).toFixed(2)
    : packages.find(p => p.minutes === selectedPack)?.price || 99;

  const activeMinutes = selectedPack === 'custom' ? customMinutes : selectedPack;

  const handleTopUp = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onTopUpSuccess({
        minutesAdded: activeMinutes,
        amountPaid: parseFloat(activePrice)
      });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-lg w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Prepaid Minute Wallet</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-0.5">Top-Up Interpretation Minutes</h3>
            <p className="text-xs text-slate-400">
              Pay in advance to receive minute credits. Minutes never expire and deduct automatically during calls.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
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
            Active Wallet
          </span>
        </div>

        <form onSubmit={handleTopUp} className="space-y-4">
          
          {/* Packages Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Prepaid Package:
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {packages.map((pack) => (
                <button
                  key={pack.minutes}
                  type="button"
                  onClick={() => setSelectedPack(pack.minutes)}
                  className={`p-3.5 rounded-2xl border text-left transition relative ${
                    selectedPack === pack.minutes
                      ? 'bg-emerald-600/20 border-emerald-500 text-white ring-2 ring-emerald-500/50 shadow-lg'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                      Popular
                    </span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <p className="text-base font-black text-white">{pack.minutes} Mins</p>
                    <p className="text-xs font-bold text-emerald-400">${pack.price}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span>${pack.ratePerMin}/min</span>
                    <span className="text-emerald-400 font-semibold">{pack.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Card & Security */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-400" />
                <span>Card on File:</span>
              </span>
              <span className="font-mono text-white font-bold">Visa ending in •••• 4892</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Instant minute credit. Receipt will be sent to your billing email.</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding {activeMinutes} Minutes to Wallet...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Pay ${activePrice} & Add {activeMinutes} Minutes</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
