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
  CheckCircle2
} from 'lucide-react';

export default function PrepaidWalletModal({ 
  isOpen, 
  onClose, 
  onTopUpSuccess,
  currentBalance = 0
}) {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'bank', 'paypal'
  const [selectedPack, setSelectedPack] = useState(120); // 60, 120, 300, 600
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Card form fields
  const [cardHolder, setCardHolder] = useState('Authorized Client');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');

  const packages = [
    {
      minutes: 60,
      price: 54,
      ratePerMin: '0.90',
      tag: 'Starter (1 Hour)',
      popular: false
    },
    {
      minutes: 120,
      price: 99,
      ratePerMin: '0.82',
      tag: 'Most Popular (2 Hours)',
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

  const activePackage = packages.find(p => p.minutes === selectedPack) || packages[1];
  const activePrice = activePackage.price;
  const activeMinutes = activePackage.minutes;

  const handleTopUp = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onTopUpSuccess({
          minutesAdded: activeMinutes,
          amountPaid: parseFloat(activePrice)
        });
        onClose();
      }, 1000);
    }, 1200);
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
              Purchased minutes are credited immediately and deducted automatically per session.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
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
          <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-lg font-extrabold text-white">Payment Successful!</h4>
            <p className="text-xs text-emerald-300">
              +{activeMinutes} Minutes have been added to your wallet balance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleTopUp} className="space-y-4">
            
            {/* Packages Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Select Minute Package:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {packages.map((pack) => (
                  <button
                    key={pack.minutes}
                    type="button"
                    onClick={() => setSelectedPack(pack.minutes)}
                    className={`p-3.5 rounded-2xl border text-left transition relative ${
                      selectedPack === pack.minutes
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

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Choose Payment Method:
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
                    Fast & 0% Fee
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  UK & International clients can pay using their standard <strong>Debit or Credit Card</strong> (Visa, Mastercard) via Remitly or WorldRemit directly to our verified settlement account.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                  <p><span className="text-slate-500">Recipient Name:</span> IK Enterprises / Authorized Account</p>
                  <p><span className="text-slate-500">Delivery:</span> Bank Account / Instant Deposit</p>
                  <p><span className="text-slate-500">Payment Reference:</span> TOPUP-{activeMinutes}MINS</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Once initiated, click Confirm below to immediately activate your minutes.</span>
                </div>
              </div>
            )}

            {paymentMethod === 'ukbank' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-sky-400" />
                    Local UK Bank Transfer (Faster Payments / BACS)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                    Payoneer / Wise
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Transfer directly from any UK banking app (Barclays, HSBC, Lloyds, NatWest, Monzo, Revolut) using our UK receiving account:
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-300">
                  <p><span className="text-slate-500">Beneficiary:</span> IK Enterprises (LinguaBridge)</p>
                  <p><span className="text-slate-500">UK Sort Code:</span> 04-00-04 (or your Payoneer Sort Code)</p>
                  <p><span className="text-slate-500">Account Number:</span> 12345678 (Payoneer UK Account)</p>
                  <p><span className="text-slate-500">Reference:</span> TOPUP-{activeMinutes}M</p>
                </div>
                <p className="text-[10px] text-slate-400">
                  Funds clear in 1-2 minutes. Your account wallet is updated immediately.
                </p>
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
                    Corporate / Invoiced
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  For hospitals, legal practices, and corporate accounts paying via international wire or company invoice:
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-300">
                  <p><span className="text-slate-500">Account Name:</span> IK Enterprises</p>
                  <p><span className="text-slate-500">IBAN:</span> PK36MEZN0000000000000000 (Your Pakistani IBAN)</p>
                  <p><span className="text-slate-500">SWIFT/BIC:</span> MEZNPKKA (Your Bank SWIFT)</p>
                  <p><span className="text-slate-500">Bank:</span> Meezan Bank / HBL / Standard Chartered</p>
                </div>
                <p className="text-[10px] text-slate-400">
                  Official corporate invoice and VAT receipt sent automatically to your registered email.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing ${activePrice} Payment Authorization...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Confirm ${activePrice} & Add {activeMinutes} Minutes to Wallet</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

