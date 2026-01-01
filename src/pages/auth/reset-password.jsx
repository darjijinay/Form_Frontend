"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authApi } from '../../api/authApi';
import logo from '../../assets/logo.png';
import loginImg from '../../assets/login.jpeg';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { email: queryEmail } = router.query;
  const codeSentRef = useRef(false);
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (queryEmail && !codeSentRef.current) {
      const decodedEmail = decodeURIComponent(queryEmail);
      setEmail(decodedEmail);
      // Automatically send verification code only once
      sendVerificationCode(decodedEmail);
      codeSentRef.current = true;
    }
  }, [queryEmail]);

  const sendVerificationCode = async (emailToSend) => {
    if (!emailToSend || codeSent) return;
    
    setSendingCode(true);
    setError(null);
    
    try {
      await authApi.forgotPassword({ email: emailToSend });
      setCodeSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send verification code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleResendCode = async () => {
    codeSentRef.current = false;
    setCodeSent(false);
    await sendVerificationCode(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      // Verify the code exists and is valid before proceeding
      const response = await authApi.verifyResetCode({ email, code });
      
      // If verification successful, redirect to set new password page
      router.push(`/auth/set-new-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid or expired code');
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
          
          <h1 className="text-3xl font-extrabold mb-2 text-slate-800 tracking-tight">Reset Password</h1>
          <p className="text-base text-slate-500 mb-8">
            {sendingCode ? 'Sending verification code...' : codeSent ? 'Verification code sent to your email' : 'Enter the verification code'}
          </p>

          {sendingCode && (
            <div className="mb-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {codeSent && !sendingCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-600">Verification code sent! Check your email.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition bg-slate-50" 
                type="email" 
                required 
                readOnly={!!queryEmail}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600">Verification Code</label>
                {codeSent && (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={sendingCode}
                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>
              <input 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="Enter 6-digit code" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" 
                type="text" 
                maxLength="6"
                required 
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-2 mt-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <p>
              Remember your password?{' '}
              <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}