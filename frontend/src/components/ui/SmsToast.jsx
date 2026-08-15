import React, { useState, useEffect } from 'react';
import { Smartphone, X, Copy, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SmsToast = ({ onAutoFill }) => {
  const { smsNotification, dismissSmsNotification } = useAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (smsNotification) {
      const timer = setTimeout(() => {
        // keep toast visible for 15 seconds or until dismissed
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [smsNotification]);

  if (!smsNotification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsNotification.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoFillClick = () => {
    if (onAutoFill) {
      onAutoFill(smsNotification.code);
    }
    handleCopy();
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-bounce-short">
      <div className="glass-panel p-4 rounded-2xl border-2 border-emerald-400/40 shadow-2xl bg-slate-900/90 backdrop-blur-xl text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg text-white">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Incoming SMS</span>
                <span className="text-[10px] text-slate-400">{smsNotification.timestamp}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100">Verification OTP Code</h4>
            </div>
          </div>
          <button
            onClick={dismissSmsNotification}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">To: {smsNotification.phoneNumber}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-mono font-extrabold tracking-widest text-emerald-300">
                {smsNotification.code}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Valid 60s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAutoFillClick}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-fill
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400 italic">
          {smsNotification.message}
        </p>
      </div>
    </div>
  );
};
