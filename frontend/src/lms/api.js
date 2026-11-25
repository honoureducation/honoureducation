// API clients for the course store. Learners use their own token (lms_token),
// completely separate from the teacher/admin tokens of the assessment platform.
import axios from 'axios';
import { authAPI } from '../services/authService';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = process.env.REACT_APP_API_URL
  ? (process.env.REACT_APP_API_URL.endsWith('/api') ? process.env.REACT_APP_API_URL : `${process.env.REACT_APP_API_URL}/api`)
  : (isLocalhost ? 'http://localhost:5002/api' : 'https://honoureducation.onrender.com/api');

export const LMS_TOKEN_KEY = 'lms_token';
export const LMS_USER_KEY = 'lms_learner';
export const LMS_LOGOUT_EVENT = 'lms:logout';

const safeGet = (k) => {
  try { return localStorage.getItem(k); } catch (e) { return null; }
};

export const learnerAPI = axios.create({
  baseURL: `${API_BASE_URL}/lms`,
  headers: { 'Content-Type': 'application/json' },
});

learnerAPI.interceptors.request.use((config) => {
  const token = safeGet(LMS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

learnerAPI.interceptors.response.use(
  (r) => r,
  (error) => {
    const sentToken = error.config && error.config.headers && error.config.headers.Authorization;
    if (error.response && error.response.status === 401 && sentToken) {
      try {
        localStorage.removeItem(LMS_TOKEN_KEY);
        localStorage.removeItem(LMS_USER_KEY);
      } catch (e) { /* ignore */ }
      window.dispatchEvent(new Event(LMS_LOGOUT_EVENT));
    }
    return Promise.reject(error);
  }
);

// Admin calls reuse the existing admin session (admin_token) via authAPI.
export const lmsAdminAPI = {
  get: (url, config) => authAPI.get(`/lms/admin${url}`, config),
  post: (url, data, config) => authAPI.post(`/lms/admin${url}`, data, config),
  put: (url, data, config) => authAPI.put(`/lms/admin${url}`, data, config),
  patch: (url, data, config) => authAPI.patch(`/lms/admin${url}`, data, config),
  delete: (url, config) => authAPI.delete(`/lms/admin${url}`, config),
};

export const errorMessage = (err, fallback = 'Something went wrong') =>
  (err && err.response && err.response.data && err.response.data.message) || (err && err.message) || fallback;

// ── Money helpers (amounts are stored in the currency's smallest unit) ──────
const DECIMALS = { aed: 2, sar: 2, qar: 2, usd: 2, kwd: 3, bhd: 3, omr: 3 };

export const currencyDecimals = (currency) => DECIMALS[String(currency || '').toLowerCase()] ?? 2;

export const toMajor = (minor, currency) => (Number(minor) || 0) / 10 ** currencyDecimals(currency);

export const formatMoney = (minor, currency) => {
  const code = String(currency || 'aed').toUpperCase();
  const value = toMajor(minor, currency);
  try {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: code }).format(value);
  } catch (e) {
    return `${code} ${value.toFixed(currencyDecimals(currency))}`;
  }
};

export const formatPrice = (course) => (course.isFree || !course.price ? 'Free' : formatMoney(course.price, course.currency));

export const formatDuration = (sec) => {
  const s = Math.round(Number(sec) || 0);
  if (!s) return '';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m} min`;
  return `${s}s`;
};

export const formatBytes = (b) => {
  const n = Number(b) || 0;
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return n ? `${n} B` : '';
};

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// Upload a File straight to the signed URL (bucket or local API) with progress.
export const uploadFile = (target, file, onProgress) =>
  axios.put(target.uploadUrl, file, {
    headers: target.headers || { 'Content-Type': file.type || 'application/octet-stream' },
    onUploadProgress: (e) => onProgress && e.total && onProgress(Math.round((e.loaded / e.total) * 100)),
  });
