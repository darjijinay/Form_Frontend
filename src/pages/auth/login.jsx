"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo.png';
import loginImg from '../../assets/login.jpeg';
import { emailRegex } from '../../utils/validateField';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [step, setStep] = useState(1); // 1: login, 2: code
  const [code, setCode] = useState('');

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail && !emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (step === 1) {
        if (emailError || !emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }
        const res = await authApi.login({ email, password });
        const { user, token, message } = res.data || {};
        if (token) {
          setAuth({ user, token });
          router.push('/app/dashboard');
        } else if (message && message.toLowerCase().includes('verification code')) {
          setStep(2);
        } else {
          setError(message || 'Sign in failed');
        }
      } else if (step === 2) {
        const res = await authApi.login({ email, password, code });
        const { user, token, message } = res.data || {};
        if (token) {
          setAuth({ user, token });
          router.push('/app/dashboard');
        } else {
          setError(message || 'Verification failed');
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url(${loginImg.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        opacity: '1',
      }} />
      
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 via-transparent to-emerald-100/40 pointer-events-none" />
      <div className="w-full max-w-md mx-auto px-4 z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="mx-auto mb-6 h-16 w-16 flex items-center justify-center rounded-xl bg-white shadow-lg border border-slate-100">
                  <img src={logo.src} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
                </div>
               
                <h1 className="text-3xl font-extrabold mb-2 text-slate-800 tracking-tight">Welcome back</h1>
                <p className="text-base text-slate-500 mb-8">Sign in to continue to FormCraft</p>


          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input value={email} onChange={handleEmailChange} placeholder="you@example.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" type="email" required />
                  {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <div className="relative">
                    <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full pr-10 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" type={showPassword ? 'text' : 'password'} required />
                    <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((s)=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-transform duration-200">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4.5-10-7 0-.5 1.5-3.5 4.5-5.5m3-1.5A9.4 9.4 0 0112 5c5 0 9 4.5 10 7-.187.468-.742 1.442-1.8 2.55M3 3l18 18M9.9 9.9A3 3 0 0012 9c1.657 0 3 1.343 3 3 0 .76-.284 1.45-.75 1.967" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12zm10-4a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <Link href={email ? `/auth/reset-password?email=${encodeURIComponent(email)}` : '/auth/reset-password'} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Verification Code</label>
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter the code sent to your email" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" type="text" required />
                </div>
              </>
            )}
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <button type="submit" className="w-full py-2 mt-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? (step === 2 ? 'Verifying…' : 'Signing in…') : (step === 2 ? 'Verify & Sign in' : 'Sign in')}
            </button>
            {step === 2 && (
              <button type="button" className="w-full py-2 mt-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow transition" onClick={() => { setStep(1); setCode(''); setError(null); }} disabled={loading}>
                Back to Login
              </button>
            )}
          </form>

                <div className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <p>
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-indigo-600 font-semibold hover:underline">Create one</Link>
                  </p>
                </div>
        </div>
      </div>
    </div>
  );
}
