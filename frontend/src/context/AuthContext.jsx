import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendMobileOTP, verifyMobileOTP, resendMobileOTP } from '../utils/otpService';
import { sendRealSMS, confirmRealSMSOTP } from '../services/firebasePhoneAuth';
import { sendFreeRealSMS, verifyFreeRealSMSOTP } from '../services/freeSmsService';
import { sendBackendOtp, verifyBackendOtp, googleAuthBackend } from '../services/backendApi';
import { isFirebaseConfigured, auth, googleProvider } from '../services/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('atmosphere_weather_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [smsNotification, setSmsNotification] = useState(null);
  const [firebaseConfirmationResult, setFirebaseConfirmationResult] = useState(null);
  const [fast2smsApiKey, setFast2smsApiKey] = useState('');

  // Listen for simulated SMS events
  useEffect(() => {
    const handleSmsEvent = (e) => {
      const { phoneNumber, code, message } = e.detail;
      setSmsNotification({
        phoneNumber,
        code,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    };

    window.addEventListener('simulated_sms_received', handleSmsEvent);
    return () => window.removeEventListener('simulated_sms_received', handleSmsEvent);
  }, []);

  // Sync user with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('atmosphere_weather_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('atmosphere_weather_user');
    }
  }, [user]);

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * Google OAuth Login Handler
   * Connects to Firebase Auth + Express Backend + Google Firebase DB
   */
  const loginWithGoogle = async () => {
    try {
      let googleProfile = null;

      // 1. Try Real Firebase Google Sign-In Popup if configured
      if (isFirebaseConfigured()) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const fbUser = result.user;
          googleProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Google User',
            email: fbUser.email,
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            authMethod: 'google'
          };
        } catch (popupErr) {
          console.warn('[Firebase Google Popup Warning]', popupErr);
          if (popupErr.code === 'auth/popup-closed-by-user') {
            return { success: false, message: 'Google Sign-In popup was closed.' };
          }
          // If popup blocked or failed, fallback to mock profile below
        }
      }

      // 2. Fallback Profile if Firebase Google Popup not active
      if (!googleProfile) {
        googleProfile = {
          id: `google_${Date.now()}`,
          name: 'Alex Morgan',
          email: 'alex.morgan@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          authMethod: 'google'
        };
      }

      // 3. Post profile to Express backend & Store user credentials in Firebase Database!
      const backendRes = await googleAuthBackend(googleProfile);
      const finalUser = backendRes?.user || googleProfile;

      setUser(finalUser);
      setIsAuthModalOpen(false);
      return { success: true, user: finalUser };
    } catch (err) {
      console.error('[Google Login Error]', err);
      return { success: false, message: err.message || 'Google Sign-In Failed' };
    }
  };

  const requestMobileOTP = async (phoneNumber, useRealSms = false) => {
    // Call Node Express Backend API first
    const backendRes = await sendBackendOtp(phoneNumber);
    if (backendRes?.success) {
      if (backendRes.code) {
        window.dispatchEvent(new CustomEvent('simulated_sms_received', {
          detail: {
            phoneNumber,
            code: backendRes.code,
            message: backendRes.message
          }
        }));
      }
      return backendRes;
    }

    if (useRealSms) {
      if (isFirebaseConfigured()) {
        try {
          const res = await sendRealSMS(phoneNumber, 'recaptcha-container');
          setFirebaseConfirmationResult(res.confirmationResult);
          return res;
        } catch {
          console.warn('[Firebase SMS fallback to Free SMS Gateway]');
        }
      }

      const freeRes = await sendFreeRealSMS(phoneNumber, fast2smsApiKey);
      return freeRes;
    }

    return sendMobileOTP(phoneNumber);
  };

  const verifyMobileOTPAndLogin = async (phoneNumber, code, useRealSms = false) => {
    // 1. Try Backend REST API verification first
    const backendRes = await verifyBackendOtp(phoneNumber, code);
    if (backendRes?.success && backendRes.user) {
      setUser(backendRes.user);
      setIsAuthModalOpen(false);
      return backendRes;
    }

    if (useRealSms) {
      if (firebaseConfirmationResult) {
        try {
          const res = await confirmRealSMSOTP(firebaseConfirmationResult, code);
          if (res.success && res.user) {
            setUser(res.user);
            setIsAuthModalOpen(false);
          }
          return res;
        } catch {
          // fallback
        }
      }

      const freeVerify = verifyFreeRealSMSOTP(phoneNumber, code);
      if (freeVerify.success && freeVerify.user) {
        setUser(freeVerify.user);
        setIsAuthModalOpen(false);
      }
      return freeVerify;
    }

    const result = verifyMobileOTP(phoneNumber, code);
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthModalOpen(false);
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    setFirebaseConfirmationResult(null);
  };

  const dismissSmsNotification = () => {
    setSmsNotification(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        requestMobileOTP,
        verifyMobileOTPAndLogin,
        resendMobileOTP,
        logout,
        smsNotification,
        dismissSmsNotification,
        isFirebaseConfigured: isFirebaseConfigured()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
