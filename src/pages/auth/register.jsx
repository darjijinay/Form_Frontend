"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import logo from '../../assets/logo.png';
import loginImg from '../../assets/login.jpeg';
import { emailRegex } from '../../utils/validateField';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: register, 2: verify
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [resending, setResending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const timerRef = useRef();

  // Timer effect
  useEffect(() => {
    if (step !== 2) return;
    if (timer <= 0) return;
    timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timer, step]);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail && !emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (step === 1) {
      if (emailError || !emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      try {
        await authApi.register({ name, email, password, confirmPassword });
        setStep(2);
        setTimer(300);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      try {
        const res = await authApi.verify({ email, code });
        const { user, token } = res.data || {};
        if (token) setAuth({ user, token });
        router.push('/app/dashboard');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await authApi.resendCode({ email });
      setTimer(300);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to resend code');
    } finally {
      setResending(false);
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
          {step === 1 && <>
            <h1 className="text-3xl font-extrabold mb-2 text-slate-800 tracking-tight">Create your account</h1>
            <p className="text-base text-slate-500 mb-8">Build and share beautiful custom forms</p>
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Your Name" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" type="text" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input value={email} onChange={handleEmailChange} placeholder="you@example.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" type="email" required />
                {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" type="password" minLength={6} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" type="password" minLength={6} required />
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <button type="submit" className="w-full py-2 mt-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
                {loading ? 'Creating…' : 'Create account'}
              </button>
            </form>
            <div className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-600">
              <p>
                Already have an account?{' '}
                <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          </>}
          {step === 2 && <>
            <h1 className="text-2xl font-bold mb-2 text-slate-800 tracking-tight">Verify your email</h1>
            <p className="text-base text-slate-500 mb-6">Enter the 6-digit code sent to <b>{email}</b>. This code expires in <span className="font-semibold text-indigo-600">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</span>.</p>
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Verification Code</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition tracking-widest text-lg text-center" type="text" maxLength={6} required />
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <button type="submit" className="w-full py-2 mt-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </button>
            </form>
            <div className="mt-6">
              <button onClick={handleResend} className="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={timer > 0 || resending}>
                {resending ? 'Resending…' : 'Resend code'}
              </button>
              {timer > 0 && <p className="text-xs text-slate-500 mt-2">You can resend the code after the timer expires.</p>}
            </div>
            <div className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-600">
              <p>
                Already have an account?{' '}
                <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
