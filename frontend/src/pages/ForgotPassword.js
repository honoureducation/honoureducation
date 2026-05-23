import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset link sent if an account exists.');
    } catch (error) {
      toast.error(error.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Forgot Password?</h2>
          <p className="mt-2 text-sm text-slate-600">Enter your email to receive a password reset link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {submitted ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 text-sm">
                If an account with <strong>{email}</strong> exists and is approved, an email has been sent with reset instructions.
              </div>
              <p className="text-sm text-slate-500 text-center">
                Please check your inbox and spam folder. The link will expire in 24 hours.
              </p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full btn-lg">
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                {loading ? <><span className="spinner" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!submitted && (
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-slate-600">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-slate-500">
                <Link to="/" className="hover:text-slate-700">← Back to Home</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}