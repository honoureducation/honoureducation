import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLearner } from '../LearnerContext';
import { learnerAPI, errorMessage } from '../api';
import { inputCls, btnPrimary } from '../components';

const COUNTRIES = [
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'Jordan', 'Egypt', 'Lebanon', 'Iraq', 'Other',
];

// Only allow internal redirects after sign-in.
const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/learn/my-courses');

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card-md p-6 sm:p-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</span>
    {children}
  </label>
);

export function LearnerLogin() {
  const { login } = useLearner();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const l = await login(form.email, form.password);
      toast.success(`Welcome back, ${l.firstName}!`);
      navigate(safeNext(next), { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Sign in failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access the courses you've bought"
      footer={<>New here? <Link className="font-bold text-blue-600" to={`/learn/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><input type="email" required autoComplete="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required autoComplete="current-password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <div className="text-right"><Link to="/learn/forgot-password" className="text-sm font-semibold text-blue-600">Forgot password?</Link></div>
        <button disabled={busy} className={`${btnPrimary} w-full py-3`}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthCard>
  );
}

export function LearnerRegister() {
  const { register } = useLearner();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', country: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const { confirm, ...payload } = form;
      await register(payload);
      toast.success('Your account is ready!');
      navigate(next ? safeNext(next) : '/learn', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create account'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Buy courses and learn at your own pace"
      footer={<>Already have an account? <Link className="font-bold text-blue-600" to={`/learn/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name"><input required autoComplete="given-name" className={inputCls} value={form.firstName} onChange={set('firstName')} /></Field>
          <Field label="Last name"><input required autoComplete="family-name" className={inputCls} value={form.lastName} onChange={set('lastName')} /></Field>
        </div>
        <Field label="Email"><input type="email" required autoComplete="email" className={inputCls} value={form.email} onChange={set('email')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone (optional)"><input type="tel" autoComplete="tel" className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+971…" /></Field>
          <Field label="Country">
            <select className={inputCls} value={form.country} onChange={set('country')}>
              <option value="">Select</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Password"><input type="password" required minLength={8} autoComplete="new-password" className={inputCls} value={form.password} onChange={set('password')} /></Field>
        <Field label="Confirm password"><input type="password" required minLength={8} autoComplete="new-password" className={inputCls} value={form.confirm} onChange={set('confirm')} /></Field>
        <p className="text-xs text-slate-500">At least 8 characters.</p>
        <button disabled={busy} className={`${btnPrimary} w-full py-3`}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthCard>
  );
}

export function LearnerForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await learnerAPI.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Reset password" footer={<Link className="font-bold text-blue-600" to="/learn/login">Back to sign in</Link>}>
      {sent ? (
        <p className="text-slate-700">If an account exists for <strong>{email}</strong>, we've emailed a link to reset your password. It expires in 1 hour.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email"><input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <button disabled={busy} className={`${btnPrimary} w-full py-3`}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
    </AuthCard>
  );
}

export function LearnerResetPassword() {
  const { token } = useParams();
  const { resetPassword } = useLearner();
  const navigate = useNavigate();
  const [pw, setPw] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.password !== pw.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, pw.password);
      toast.success('Password updated');
      navigate('/learn/my-courses', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password"><input type="password" required minLength={8} autoComplete="new-password" className={inputCls} value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} /></Field>
        <Field label="Confirm password"><input type="password" required minLength={8} autoComplete="new-password" className={inputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
        <button disabled={busy} className={`${btnPrimary} w-full py-3`}>{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    </AuthCard>
  );
}
