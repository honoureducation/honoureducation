import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      if (authService.isAdmin()) {
        navigate('/admin/dashboard');
      }
    }
  }, [navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await authService.sendAdminOtp(email);
      setOtpSent(true);
      toast.success('OTP sent successfully to your email');
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await authService.sendAdminOtp(email);
      toast.success('OTP resent successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.verifyAdminOtp(email, otp);
      toast.success(`Welcome back, ${response.user.firstName}!`);
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Admin Sign In</h2>
          <p className="mt-2 text-sm text-slate-600">
            Secure access for administrators only.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="form-label">Admin Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your admin email"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full btn-lg"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm flex justify-between items-center">
                <div>
                  An OTP has been sent to <strong>{email}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold underline ml-2"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="form-label text-center block w-full">Enter One-Time Password (OTP)</label>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-input tracking-widest text-center text-2xl font-bold"
                  placeholder="------"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading || loading}
                  className="text-purple-600 hover:text-purple-800 font-semibold underline disabled:opacity-50"
                >
                  {resendLoading ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full btn-lg"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-600">
              Need teacher access?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-slate-500">
              <Link to="/" className="hover:text-slate-700">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
