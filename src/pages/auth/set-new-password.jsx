"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authApi } from '../../api/authApi';
import { validatePassword, getPasswordHintText } from '../../utils/passwordValidation';
import logo from '../../assets/logo.png';
import loginImg from '../../assets/login.jpeg';

export default function SetNewPasswordPage() {
  const router = useRouter();
  const { email: queryEmail, code: queryCode } = router.query;
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (queryEmail && queryCode) {
      setEmail(decodeURIComponent(queryEmail));
      setCode(decodeURIComponent(queryCode));
    } else {
      // If no email or code, redirect back to reset password page
      router.push('/auth/reset-password');
    }
  }, [queryEmail, queryCode, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authApi.resetPassword({
        email,
        code,
        newPassword,
        confirmPassword
      });
      
      setSuccess(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !code) {
    return null; // Will redirect in useEffect
  }

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
          
          <h1 className="text-3xl font-extrabold mb-2 text-slate-800 tracking-tight">Create New Password</h1>
          <p className="text-base text-slate-500 mb-8">Enter your new password</p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
              <div className="relative">
                <input 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password" 
                  className="w-full pr-10 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" 
                  type={showNew ? 'text' : 'password'} 
                  required
                />
                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowNew((s)=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-transform duration-200">
                  {showNew ? (
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
              <p className="text-xs text-slate-500 mt-1">Must include: uppercase, lowercase, number, special character (min 8 chars)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
              <div className="relative">
                <input 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm new password" 
                  className="w-full pr-10 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" 
                  type={showConfirm ? 'text' : 'password'} 
                  required 
                  minLength="8"
                />
                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowConfirm((s)=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-transform duration-200">
                  {showConfirm ? (
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-600">Password reset successful! Redirecting to login...</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-2 mt-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed" 
              disabled={loading || success}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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