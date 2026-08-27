import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ConfigBanner from '../components/layout/ConfigBanner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Info,
  Lock,
  Mail,
  User,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Crown
} from 'lucide-react';

export const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'

  const {
    loginWithPassword,
    requestSignupOTP,
    verifyOTPAndRegister,
    adminQuickLogin,
    loginWithGoogle,
    isAuthenticated,
    user,
    diagnostics
  } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupStep, setSignupStep] = useState(1); // 1 = Details, 2 = OTP Verification
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpPreview, setDevOtpPreview] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (!user?.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setSearchParams({ mode: newMode });
    setErrorMsg('');
    setSuccessMsg('');
    setSignupStep(1);
  };

  // Sign In Handler
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await loginWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (!res.success) {
        setErrorMsg(res.message);
        if (res.needsVerification) {
          setSignupEmail(res.email);
          setMode('signup');
          setSignupStep(2);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Signup Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await requestSignupOTP({
        name: signupName,
        email: signupEmail,
        password: signupPassword
      });

      if (res.success) {
        setSuccessMsg(res.message);
        if (res.previewOtp) {
          setDevOtpPreview(res.previewOtp);
          setOtpCode(res.previewOtp); // Auto-fill for instant frictionless review
        }
        setSignupStep(2);
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Signup Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await verifyOTPAndRegister({
        email: signupEmail,
        otpCode
      });

      if (!res.success) {
        setErrorMsg(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Quick Login
  const handleAdminLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await adminQuickLogin();
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleConfigured = diagnostics?.googleOAuth?.configured;

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#12B8A6]/20 selection:text-[#087F73]">
      <ConfigBanner />
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-6 animate-fade-in">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <img src="/logo.png" alt="BeyondCGPA" className="h-12 w-auto object-contain mx-auto" />
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B172A] tracking-tight">
              {mode === 'signup' ? 'Create Your Student Profile' : 'Sign in to BeyondCGPA'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Personalized career companion & adaptive preparation engine.
            </p>
          </div>

          <Card className="bg-white p-6 sm:p-8 shadow-md space-y-6 border-[#E2E8F0]">
            {/* Tab Selector */}
            <div className="flex rounded-xl p-1 bg-[#F8FAFC] border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#0B172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B172A]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#0B172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B172A]'
                }`}
              >
                Create Account (OTP)
              </button>
            </div>

            {/* Error and Success Alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'login' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  icon={UserCheck}
                  className="w-full mt-2 shadow-md shadow-[#12B8A6]/20"
                >
                  Sign In with Password
                </Button>
              </form>
            )}

            {/* SIGN UP FORM (2-Step Email Verification Flow) */}
            {mode === 'signup' && (
              <>
                {signupStep === 1 ? (
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="student@university.edu"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isLoading}
                      icon={KeyRound}
                      className="w-full mt-2 shadow-md shadow-[#12B8A6]/20"
                    >
                      Send Verification Code to Email
                    </Button>
                  </form>
                ) : (
                  /* Step 2: Enter 6-digit OTP */
                  <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
                    <div className="p-3.5 rounded-xl bg-[#E5F7F4]/50 border border-[#12B8A6]/30 text-xs text-[#087F73]">
                      <p className="font-bold mb-0.5">Verification Code Sent!</p>
                      <p>
                        We sent a 6-digit code to <strong>{signupEmail}</strong>. Please enter it below.
                      </p>
                      {devOtpPreview && (
                        <p className="mt-2 bg-white p-2 rounded border border-[#12B8A6]/30 text-[#0B172A] font-mono text-center font-bold">
                          ⚡ Code: {devOtpPreview}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5 text-center">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full py-3 px-4 rounded-xl border-2 border-[#12B8A6] text-center font-mono font-extrabold text-2xl tracking-[8px] text-[#087F73] focus:outline-none bg-white shadow-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isLoading}
                      icon={CheckCircle2}
                      className="w-full shadow-md shadow-[#12B8A6]/20"
                    >
                      Verify Code & Complete Registration
                    </Button>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => setSignupStep(1)}
                        className="text-[#64748B] hover:text-[#0B172A] underline cursor-pointer"
                      >
                        ← Change Email
                      </button>
                      <button
                        type="button"
                        onClick={handleRequestOTP}
                        className="text-[#087F73] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend Code
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider absolute">
                Or Continue With
              </span>
            </div>

            {/* Google OAuth & Admin Quick Access */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!googleConfigured) {
                    setErrorMsg('Google OAuth client ID is not configured in server/.env. Please use Email/Password login or Admin Access below.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0B172A] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Instant Admin / Reviewer Access Button */}
              <button
                type="button"
                onClick={handleAdminLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B172A] hover:bg-[#1E293B] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Crown className="w-3.5 h-3.5 text-[#12B8A6]" />
                <span>Admin Quick Access (1-Click Review Login)</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
