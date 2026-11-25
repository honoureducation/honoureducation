import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { learnerAPI, LMS_TOKEN_KEY, LMS_USER_KEY, LMS_LOGOUT_EVENT } from './api';

const LearnerContext = createContext(null);

const readStoredLearner = () => {
  try {
    const raw = localStorage.getItem(LMS_USER_KEY);
    return raw && localStorage.getItem(LMS_TOKEN_KEY) ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export function LearnerProvider({ children }) {
  const [learner, setLearner] = useState(readStoredLearner);

  const saveSession = useCallback((token, l) => {
    try {
      localStorage.setItem(LMS_TOKEN_KEY, token);
      localStorage.setItem(LMS_USER_KEY, JSON.stringify(l));
    } catch (e) { /* ignore */ }
    setLearner(l);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(LMS_TOKEN_KEY);
      localStorage.removeItem(LMS_USER_KEY);
    } catch (e) { /* ignore */ }
    setLearner(null);
  }, []);

  useEffect(() => {
    const onLogout = () => setLearner(null);
    window.addEventListener(LMS_LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(LMS_LOGOUT_EVENT, onLogout);
  }, []);

  // Refresh the profile once on load (also validates the stored token).
  useEffect(() => {
    if (!readStoredLearner()) return;
    learnerAPI
      .get('/auth/me')
      .then((r) => {
        setLearner(r.data.learner);
        try { localStorage.setItem(LMS_USER_KEY, JSON.stringify(r.data.learner)); } catch (e) { /* ignore */ }
      })
      .catch(() => {});
  }, []);

  const login = async (email, password) => {
    const { data } = await learnerAPI.post('/auth/login', { email, password });
    saveSession(data.token, data.learner);
    return data.learner;
  };

  const register = async (form) => {
    const { data } = await learnerAPI.post('/auth/register', form);
    saveSession(data.token, data.learner);
    return data.learner;
  };

  const resetPassword = async (token, password) => {
    const { data } = await learnerAPI.post('/auth/reset-password', { token, password });
    saveSession(data.token, data.learner);
    return data.learner;
  };

  const updateProfile = async (form) => {
    const { data } = await learnerAPI.put('/auth/me', form);
    setLearner(data.learner);
    try { localStorage.setItem(LMS_USER_KEY, JSON.stringify(data.learner)); } catch (e) { /* ignore */ }
    return data.learner;
  };

  return (
    <LearnerContext.Provider value={{ learner, login, register, logout, resetPassword, updateProfile }}>
      {children}
    </LearnerContext.Provider>
  );
}

export const useLearner = () => useContext(LearnerContext);
