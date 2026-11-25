import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useLearner } from '../LearnerContext';
import { learnerAPI, errorMessage } from '../api';
import { inputCls, btnPrimary } from '../components';

export default function Account() {
  const { learner, updateProfile } = useLearner();
  const [form, setForm] = useState({
    firstName: learner.firstName || '',
    lastName: learner.lastName || '',
    phone: learner.phone || '',
    country: learner.country || '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy('profile');
    try {
      await updateProfile(form);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy('');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setBusy('pw');
    try {
      await learnerAPI.put('/auth/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy('');
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <h1 className="text-3xl font-black text-slate-900">Account</h1>

      <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-500">{learner.email}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <input className={inputCls} value={form.firstName} onChange={set('firstName')} placeholder="First name" required />
          <input className={inputCls} value={form.lastName} onChange={set('lastName')} placeholder="Last name" required />
          <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="Phone" />
          <input className={inputCls} value={form.country} onChange={set('country')} placeholder="Country" />
        </div>
        <button disabled={busy === 'profile'} className={btnPrimary}>{busy === 'profile' ? 'Saving…' : 'Save profile'}</button>
      </form>

      <form onSubmit={savePassword} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Change password</h2>
        <input type="password" autoComplete="current-password" className={inputCls} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder="Current password" required />
        <input type="password" autoComplete="new-password" minLength={8} className={inputCls} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder="New password (8+ characters)" required />
        <button disabled={busy === 'pw'} className={btnPrimary}>{busy === 'pw' ? 'Saving…' : 'Change password'}</button>
      </form>
    </div>
  );
}
