"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authApi } from '../../api/authApi';
import { validatePassword, getPasswordHintText } from '../../utils/passwordValidation';
import logo from '../../assets/logo.png';
import loginImg from '../../assets/bg.jpeg';

export default function SetNewPasswordPage() {
  const router = useRouter();
  const { email: queryEmail, code: queryCode } = router.query;
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
              <input 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Enter new password" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" 
                type="password" 
                required
              />
              <p className="text-xs text-slate-500 mt-1">Must include: uppercase, lowercase, number, special character (min 8 chars)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
              <input 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm new password" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition" 
                type="password" 
                required 
                minLength="6"
              />
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