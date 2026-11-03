import { useState } from 'react';
import { Wallet, Loader2, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { hasAccount } from '@/lib/api';
import { validateLogin, validateSignup } from '@/lib/validation';
import { Field, PasswordField } from '@/components/Form';

const EMPTY = { name: '', email: '', password: '', confirm: '' };

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(() => (hasAccount() ? 'login' : 'signup'));
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [remember, setRemember] = useState(true);
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);

  const isSignup = mode === 'signup';
  const errors = isSignup ? validateSignup(values) : validateLogin(values);
  const show = (name) => (submitted || touched[name] ? errors[name] : '');

  function switchMode(next) {
    setMode(next);
    setValues((v) => ({ ...EMPTY, email: v.email }));
    setTouched({});
    setSubmitted(false);
    setServerError('');
  }

  function bind(name) {
    return {
      value: values[name],
      onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
      onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');
    if (Object.keys(errors).length > 0) return;
    setBusy(true);
    const timer = setTimeout(() => setSlow(true), 4000);
    try {
      if (isSignup) await register(values.name.trim(), values.email.trim(), values.password, remember);
      else await login(values.email.trim(), values.password, remember);
    } catch (err) {
      setServerError(err.message);
    } finally {
      clearTimeout(timer);
      setSlow(false);
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card animate-scale-in">
        <div className="auth-brand">
          <div className="brand-icon">
            <Wallet className="icon-lg" style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 className="brand-title">Bob Check</h1>
            <p className="brand-sub">Campus Budget Tracker</p>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={isSignup} className={`auth-tab ${isSignup ? 'active' : ''}`} onClick={() => switchMode('signup')}>
            Sign up
          </button>
          <button type="button" role="tab" aria-selected={!isSignup} className={`auth-tab ${!isSignup ? 'active' : ''}`} onClick={() => switchMode('login')}>
            Log in
          </button>
        </div>

        <h2 className="auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
        <p className="auth-sub">
          {isSignup ? 'It takes a minute. Start tracking every shilling.' : 'Log in to see your budget.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {isSignup && (
            <Field label="Full name" icon={User} placeholder="e.g. Wanjiku Kamau" maxLength={80} autoComplete="name" error={show('name')} {...bind('name')} />
          )}
          <Field label="Email" icon={Mail} type="email" placeholder="name@example.com" autoComplete="email" error={show('email')} {...bind('email')} />
          <PasswordField
            label="Password"
            icon={Lock}
            maxLength={128}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            helper={isSignup ? 'At least 8 characters, with a letter and a number' : ''}
            error={show('password')}
            {...bind('password')}
          />
          {isSignup && (
            <PasswordField label="Confirm password" icon={Lock} maxLength={128} autoComplete="new-password" error={show('confirm')} {...bind('confirm')} />
          )}

          <label className="checkbox-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Keep me logged in for 30 days</span>
          </label>

          {serverError && <p className="form-error" role="alert">{serverError}</p>}
          {slow && <p className="field-note">Waking up the server, this can take up to a minute the first time…</p>}

          <button type="submit" className="btn-primary auth-submit" disabled={busy}>
            {busy && <Loader2 className="icon-sm spin" />}
            {isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => switchMode(isSignup ? 'login' : 'signup')}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
