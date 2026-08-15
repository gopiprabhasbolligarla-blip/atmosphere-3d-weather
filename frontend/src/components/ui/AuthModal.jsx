import React, { useState, useEffect, useRef } from 'react';
import { X, Smartphone, ArrowRight, ShieldCheck, RefreshCw, Sparkles, CheckCircle2, User, Lock, ChevronDown, Radio, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
];

export const AuthModal = ({ isOpen, onClose, initialAutoFillCode, isAutoPrompted }) => {
  const {
    authMode,
    setAuthMode,
    loginWithGoogle,
    requestMobileOTP,
    verifyMobileOTPAndLogin,
    resendMobileOTP,
    isFirebaseConfigured
  } = useAuth();

  // Mobile Auth Flow States: 'phone' | 'otp'
  const [step, setStep] = useState('phone');
  const [useRealSms, setUseRealSms] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[1]); // Default India +91 or +1
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  
  // 6-digit OTP array state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Timer & Error states
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auto-fill handling from toast
  useEffect(() => {
    if (initialAutoFillCode && initialAutoFillCode.length === 6) {
      setStep('otp');
      const digits = initialAutoFillCode.split('');
      setOtpDigits(digits);
    }
  }, [initialAutoFillCode]);

  // Countdown timer logic for OTP resend
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  if (!isOpen) return null;

  const fullPhoneString = `${selectedCountry.code}${phoneNumber.trim()}`;

  // Handle requesting OTP
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!phoneNumber || phoneNumber.trim().length < 7) {
      setError('Please enter a valid mobile phone number');
      return;
    }

    if (authMode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      const res = await requestMobileOTP(fullPhoneString, useRealSms);
      if (res?.success || res?.confirmationResult) {
        setStep('otp');
        setTimer(60);
        setIsTimerActive(true);
        if (useRealSms && isFirebaseConfigured) {
          setSuccessMsg(`Real SMS code sent to your phone ${fullPhoneString}!`);
        } else {
          setSuccessMsg(`OTP sent to ${fullPhoneString}! Check incoming SMS banner on screen.`);
        }
        
        // Focus first OTP input box
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 200);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit input changes
  const handleOtpDigitChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError('');

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across digit inputs
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Pasting full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newDigits = Array(6).fill('');
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  // Verify OTP submission
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    setError('');
    const code = otpDigits.join('');

    if (code.length < 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyMobileOTPAndLogin(fullPhoneString, code, useRealSms);
      setLoading(false);

      if (result.success) {
        onClose();
      } else {
        setError(result.message || 'Invalid OTP verification code');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Verification failed. Please check code.');
    }
  };

  // Resend OTP handler
  const handleResend = () => {
    if (isTimerActive) return;
    setError('');
    setOtpDigits(['', '', '', '', '', '']);
    try {
      requestMobileOTP(fullPhoneString, useRealSms);
      setTimer(60);
      setIsTimerActive(true);
      setSuccessMsg('A new OTP has been requested!');
    } catch (err) {
      setError(err.message || 'Error resending OTP');
    }
  };

  // Google Login Handler
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle();
      setGoogleLoading(false);
      if (res?.success) {
        onClose();
      } else if (res?.message) {
        setError(res.message);
      }
    } catch (err) {
      setGoogleLoading(false);
      setError(err.message || 'Google Sign-In failed');
    }
  };

  const resetModalState = () => {
    setStep('phone');
    setError('');
    setSuccessMsg('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Hidden element for Firebase invisible reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl bg-slate-900/95 text-white overflow-hidden">
        
        {/* Glow ambient background accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-white/20 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 5-Second Guest Preview Notice Banner */}
        {isAutoPrompted && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 border border-blue-400/40 text-blue-100 text-xs text-center font-medium shadow-inner">
            <span>🔒 <strong>5-Second Free Preview Completed:</strong> Log in or sign up to unlock permanent unlimited access!</span>
          </div>
        )}

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Atmosphere Weather Account
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {authMode === 'login'
              ? 'Access live forecast alerts, saved locations & custom themes'
              : 'Sign up to unlock personalized condition-reactive weather alerts'}
          </p>
        </div>

        {/* Login / Sign Up Tab Switcher */}
        <div className="flex rounded-2xl glass-pill p-1 mb-5 border border-white/10">
          <button
            onClick={() => {
              setAuthMode('login');
              resetModalState();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('signup');
              resetModalState();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'signup'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <X className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Google Auth Option */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-2xl glass-pill hover:bg-white/20 border border-white/20 text-slate-100 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-98 disabled:opacity-50"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.21 21.32 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.45 8.14 0 9.99 0 12s.45 3.86 1.23 5.42l4.05-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.21 2.68 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
            or via mobile number
          </span>
        </div>

        {/* SMS Mode Selector Toggle */}
        <div className="mb-4 p-2.5 rounded-2xl glass-pill bg-slate-950/60 border border-white/10">
          <div className="text-[11px] font-bold text-slate-300 mb-1.5 px-1 flex items-center justify-between">
            <span>SMS Delivery Method</span>
            <span className="text-[10px] text-blue-400 font-normal">Choose mode</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUseRealSms(false)}
              className={`p-2 rounded-xl text-left transition-all flex items-start gap-2 border ${
                !useRealSms
                  ? 'bg-blue-600/30 border-blue-400 text-white shadow'
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 mt-0.5 ${!useRealSms ? 'text-blue-400' : ''}`} />
              <div>
                <p className="text-xs font-bold leading-tight">Instant Web Banner</p>
                <p className="text-[9px] text-slate-400">Shows OTP in screen toast</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUseRealSms(true)}
              className={`p-2 rounded-xl text-left transition-all flex items-start gap-2 border ${
                useRealSms
                  ? 'bg-emerald-600/30 border-emerald-400 text-white shadow'
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 mt-0.5 ${useRealSms ? 'text-emerald-400' : ''}`} />
              <div>
                <p className="text-xs font-bold leading-tight">Real Phone SMS</p>
                <p className="text-[9px] text-slate-400">Firebase Phone Gateway</p>
              </div>
            </button>
          </div>

          {/* Firebase setup notice */}
          {useRealSms && !isFirebaseConfigured && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Firebase Config Required for Real SMS:</strong>
                <p className="text-[10px] text-amber-300/90 mt-0.5">
                  To send real physical SMS to your mobile phone for free, add your Firebase keys in <code className="bg-black/40 px-1 py-0.5 rounded font-mono">src/services/firebaseConfig.js</code>!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE AUTH FORM */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            {/* Full Name for Sign Up */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* Mobile Number Input with Country Code Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center gap-2">
                {/* Country selector */}
                <div className="relative">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const found = COUNTRY_CODES.find((c) => c.code === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className="appearance-none glass-input py-2.5 pl-3 pr-8 rounded-2xl text-xs font-semibold cursor-pointer bg-slate-800/80"
                  >
                    {COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code} className="bg-slate-900 text-white">
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>

                {/* Phone Input */}
                <div className="relative flex-1">
                  <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Mobile phone number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm font-mono tracking-wide"
                  />
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                A 6-digit OTP verification code will be sent via {useRealSms ? 'Real SMS' : 'SMS Banner'}
              </p>
            </div>

            {/* Submit Send OTP Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP VERIFICATION FORM */
          <form onSubmit={handleVerifyOTP} className="space-y-5 animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-xs text-slate-300">
                <span>Sending to: <strong className="text-white font-mono">{fullPhoneString}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-blue-400 underline hover:text-blue-300 ml-1"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* 6-Digit OTP Inputs */}
            <div>
              <label className="block text-center text-xs font-semibold text-slate-300 mb-3">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 rounded-2xl glass-input text-center text-xl font-bold font-mono border-2 border-white/20 focus:border-blue-400 focus:bg-blue-500/10 transition-all shadow-md"
                  />
                ))}
              </div>
            </div>

            {/* Timer & Resend Controls */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                {isTimerActive ? (
                  <span>Resend code in <strong className="text-blue-400 font-mono">{timer}s</strong></span>
                ) : (
                  <span className="text-amber-400">Code expired</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={isTimerActive}
                className="flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 disabled:text-slate-500 disabled:no-underline underline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTimerActive ? 'animate-spin' : ''}`} />
                Resend OTP
              </button>
            </div>

            {/* Verify Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify & {authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
