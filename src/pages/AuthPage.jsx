import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2, Lock, Mail, User } from 'lucide-react';

export default function AuthPage() {
  const { user, signIn, signUp, resetPassword, authError, clearError, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // If user is already authenticated, redirect to Dashboard immediately
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn({ email, password });
        navigate('/dashboard');
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setIsSubmitting(false);
          return;
        }
        await signUp({ email, password, fullName });
        setSuccessMessage('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--slate-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--slate-200)',
        overflow: 'hidden'
      }}>
        {/* Header Branding */}
        <div style={{
          backgroundColor: 'var(--navy-900)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--teal-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <Shield size={28} color="#ffffff" />
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem' }}>AnimoPulse Healthcare</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {mode === 'login' && 'Sign in to access pet records & AI assistant'}
            {mode === 'signup' && 'Create your account to manage your pets'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--slate-200)' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); clearError(); setSuccessMessage(''); }}
              style={{
                flex: 1,
                padding: '0.85rem',
                fontWeight: '700',
                fontSize: '0.95rem',
                backgroundColor: mode === 'login' ? '#ffffff' : 'var(--slate-100)',
                color: mode === 'login' ? 'var(--teal-600)' : 'var(--slate-600)',
                borderBottom: mode === 'login' ? '3px solid var(--teal-600)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); clearError(); setSuccessMessage(''); }}
              style={{
                flex: 1,
                padding: '0.85rem',
                fontWeight: '700',
                fontSize: '0.95rem',
                backgroundColor: mode === 'signup' ? '#ffffff' : 'var(--slate-100)',
                color: mode === 'signup' ? 'var(--teal-600)' : 'var(--slate-600)',
                borderBottom: mode === 'signup' ? '3px solid var(--teal-600)' : 'none'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleAuthSubmit} style={{ padding: '1.75rem' }}>
          {/* Error Alert Banner */}
          {authError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--red-100)',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: 'var(--red-600)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--green-100)',
              border: '1px solid #A7F3D0',
              borderRadius: '8px',
              color: 'var(--green-600)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full Name for Signup */}
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Dr. Sarah Jenkins"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="user@animopulse.org"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password (for login and signup) */}
          {mode !== 'forgot' && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); clearError(); setSuccessMessage(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--teal-600)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create My Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Forgot Password Back Button */}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); clearError(); setSuccessMessage(''); }}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
