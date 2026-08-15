import React, { useState, useEffect } from 'react';
import { WeatherProvider } from './context/WeatherContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WeatherCanvas } from './components/3d/WeatherCanvas';
import { Header } from './components/ui/Header';
import { HeroWeather } from './components/ui/HeroWeather';
import { WeatherAlerts } from './components/ui/WeatherAlerts';
import { HourlyStrip } from './components/ui/HourlyStrip';
import { DailyForecast } from './components/ui/DailyForecast';
import { WeatherMetrics } from './components/ui/WeatherMetrics';
import { SavedLocationsDrawer } from './components/ui/SavedLocationsDrawer';
import { ShareModal } from './components/ui/ShareModal';
import { AuthModal } from './components/ui/AuthModal';
import { SmsToast } from './components/ui/SmsToast';
import { CloudRain, Timer, Lock } from 'lucide-react';

function DashboardContent() {
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { isAuthenticated, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  const [autoFillCode, setAutoFillCode] = useState('');
  
  // 5-Second Free Preview Timer for guest users
  const [previewSeconds, setPreviewSeconds] = useState(5);
  const [hasAutoPrompted, setHasAutoPrompted] = useState(false);

  useEffect(() => {
    // If user is already logged in or has already been prompted, do nothing
    if (isAuthenticated || hasAutoPrompted) return;

    const interval = setInterval(() => {
      setPreviewSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHasAutoPrompted(true);
          // Automatically trigger Auth Modal after 5 seconds of preview
          openAuthModal('signup');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, hasAutoPrompted, openAuthModal]);

  const handleAutoFillFromToast = (code) => {
    setAutoFillCode(code);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between text-white selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      {/* 5-Second Preview Banner for Unauthenticated Guests */}
      {!isAuthenticated && (
        <div className="relative z-50 bg-gradient-to-r from-indigo-900/90 via-blue-900/90 to-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 py-2 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              <Timer className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>
                <strong>5-Second Preview Mode:</strong> Enjoying the weather dashboard? Log in for permanent unlimited access!
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-400/30">
                {previewSeconds > 0 ? `Pop-up in ${previewSeconds}s` : 'Sign in Required'}
              </span>
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-md"
              >
                <Lock className="w-3 h-3" />
                <span>Sign In Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Simulated SMS Toast Banner */}
      <SmsToast onAutoFill={handleAutoFillFromToast} />

      {/* 3D WebGL Background Layer */}
      <WeatherCanvas />

      {/* Main Glassmorphic Foreground UI */}
      <div className="relative z-10 flex-1 flex flex-col pb-8">
        <Header
          onOpenSaved={() => setIsSavedOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
        />

        <main className="flex-1 flex flex-col gap-4 mt-2">
          {/* Active Severe Weather Warning Banner */}
          <WeatherAlerts />

          {/* Hero Section: Temperature, Condition & Feels-Like Reasoning */}
          <HeroWeather />

          {/* 24-Hour Forecast Strip */}
          <HourlyStrip />

          {/* 7-Day Forecast & Stat Chips 2-Column Grid */}
          <div className="w-full max-w-7xl mx-auto px-4 py-2 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <DailyForecast />
            </div>
            <div className="lg:col-span-6">
              <WeatherMetrics />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-blue-400" />
            <span>Atmosphere 3D • Condition-Reactive Weather System</span>
          </div>
          <div>
            Powered by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline hover:text-white">Open-Meteo API</a> (Free & Open Source)
          </div>
        </footer>
      </div>

      {/* Modals & Drawers */}
      <SavedLocationsDrawer isOpen={isSavedOpen} onClose={() => setIsSavedOpen(false)} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialAutoFillCode={autoFillCode}
        isAutoPrompted={hasAutoPrompted}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <DashboardContent />
      </WeatherProvider>
    </AuthProvider>
  );
}
