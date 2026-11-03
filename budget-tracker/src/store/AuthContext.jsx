import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, forgetAccount, getToken, markHasAccount, setToken } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    let active = true;
    api
      .me()
      .then((u) => active && setUser(u))
      .catch(() => {
        if (!active) return;
        setToken(null);
        setUser(null);
      })
      .finally(() => active && setChecking(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password, remember) => {
    const res = await api.login(email, password, remember);
    setToken(res.accessToken, remember);
    markHasAccount();
    setUser(res.user);
  }, []);

  const register = useCallback(async (name, email, password, remember) => {
    const res = await api.register(name, email, password, remember);
    setToken(res.accessToken, remember);
    markHasAccount();
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateName = useCallback(async (name) => {
    const updated = await api.updateMe(name);
    setUser(updated);
  }, []);

  const setNextMoneyDate = useCallback(async (date) => {
    setUser(await api.setNextMoneyDate(date));
  }, []);

  const setAvatar = useCallback(async (image) => {
    setUser(await api.setAvatar(image));
  }, []);

  const removeAvatar = useCallback(async () => {
    setUser(await api.removeAvatar());
  }, []);

  const changePassword = useCallback(async (current, next) => {
    await api.changePassword(current, next);
  }, []);

  const deleteAccount = useCallback(async (password) => {
    await api.deleteAccount(password);
    forgetAccount();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout, updateName, setNextMoneyDate, setAvatar, removeAvatar, changePassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
