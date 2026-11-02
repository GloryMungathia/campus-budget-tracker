import { useRef, useState } from 'react';
import { Camera, Check, KeyRound, Loader2, LogOut, Pencil, Trash2, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { nameError, validatePasswordChange } from '@/lib/validation';
import { photoFileError, resizePhoto } from '@/lib/image';
import { Field, PasswordField, FieldNote } from '@/components/Form';
import { Avatar } from '@/components/Avatar';

function PhotoPicker() {
  const { user, setAvatar, removeAvatar } = useAuth();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const problem = photoFileError(file);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      await setAvatar(await resizePhoto(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError('');
    try {
      await removeAvatar();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-picker">
      <button type="button" className="photo-button" onClick={() => input.current?.click()} disabled={busy} aria-label="Upload profile photo">
        <Avatar user={user} size={72} />
        <span className="photo-badge">{busy ? <Loader2 className="icon-xs spin" /> : <Camera className="icon-xs" />}</span>
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} hidden data-testid="photo-input" />
      <div className="photo-links">
        <button type="button" onClick={() => input.current?.click()} disabled={busy}>{user.avatar ? 'Change photo' : 'Upload photo'}</button>
        {user.avatar && <button type="button" className="danger" onClick={remove} disabled={busy}>Remove</button>}
      </div>
      <FieldNote error={error} />
    </div>
  );
}

function NameCard() {
  const { user, updateName } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e) {
    e.preventDefault();
    const problem = nameError(name);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      await updateName(name.trim());
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card account-card">
      <div className="account-profile">
        <PhotoPicker />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="account-name">{user.name}</p>
          <p className="account-email"><Mail className="icon-xs" /> {user.email}</p>
        </div>
        {!editing && (
          <button className="btn-secondary" onClick={() => { setEditing(true); setSaved(false); setName(user.name); setError(''); }}>
            <Pencil className="icon-sm" /> Edit name
          </button>
        )}
      </div>
      {saved && !editing && <p className="form-success"><Check className="icon-sm" /> Name updated</p>}
      {editing && (
        <form onSubmit={save} className="account-form" noValidate>
          <Field label="Full name" icon={User} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} error={error} autoFocus />
          <div className="account-actions">
            <button type="submit" className="btn-primary" disabled={busy}><Check className="icon-sm" /> Save</button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

function PasswordCard() {
  const { changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const errors = validatePasswordChange(values);
  const show = (k) => (submitted ? errors[k] : '');
  const bind = (k) => ({ value: values[k], onChange: (e) => setValues((v) => ({ ...v, [k]: e.target.value })) });

  function reset() {
    setValues({ current: '', next: '', confirm: '' });
    setSubmitted(false);
    setServerError('');
  }

  async function save(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');
    if (Object.keys(errors).length > 0) return;
    setBusy(true);
    try {
      await changePassword(values.current, values.next);
      reset();
      setOpen(false);
      setDone(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card account-card">
      <div className="account-row">
        <div className="account-row-icon"><KeyRound className="icon-md" /></div>
        <div style={{ flex: 1 }}>
          <p className="account-row-title">Password</p>
          <p className="account-row-sub">Change the password you use to log in.</p>
        </div>
        {!open && (
          <button className="btn-secondary" onClick={() => { setOpen(true); setDone(false); }}>Change</button>
        )}
      </div>
      {done && !open && <p className="form-success"><Check className="icon-sm" /> Password changed</p>}
      {open && (
        <form onSubmit={save} className="account-form" noValidate>
          <PasswordField label="Current password" icon={Lock} autoComplete="current-password" error={show('current')} {...bind('current')} />
          <PasswordField label="New password" icon={Lock} autoComplete="new-password" helper="At least 8 characters, with a letter and a number" error={show('next')} {...bind('next')} />
          <PasswordField label="Confirm new password" icon={Lock} autoComplete="new-password" error={show('confirm')} {...bind('confirm')} />
          {serverError && <p className="form-error" role="alert">{serverError}</p>}
          <div className="account-actions">
            <button type="submit" className="btn-primary" disabled={busy}>Save password</button>
            <button type="button" className="btn-secondary" onClick={() => { reset(); setOpen(false); }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

function DangerCard() {
  const { logout, deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function remove(e) {
    e.preventDefault();
    if (!password) {
      setError('Enter your password to confirm');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await deleteAccount(password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="card account-card">
      <div className="account-row">
        <div className="account-row-icon"><LogOut className="icon-md" /></div>
        <div style={{ flex: 1 }}>
          <p className="account-row-title">Log out</p>
          <p className="account-row-sub">You will need your email and password to log in again.</p>
        </div>
        <button className="btn-secondary" onClick={logout}>Log out</button>
      </div>

      <div className="account-divider" />

      <div className="account-row">
        <div className="account-row-icon danger"><Trash2 className="icon-md" /></div>
        <div style={{ flex: 1 }}>
          <p className="account-row-title">Delete account</p>
          <p className="account-row-sub">This removes your account, transactions and budgets. It cannot be undone.</p>
        </div>
        {!confirming && (
          <button className="btn-danger-outline" onClick={() => setConfirming(true)}>Delete</button>
        )}
      </div>
      {confirming && (
        <form onSubmit={remove} className="account-form" noValidate>
          <PasswordField label="Enter your password to confirm" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} error={error} autoComplete="current-password" />
          <div className="account-actions">
            <button type="submit" className="btn-danger" disabled={busy}><Trash2 className="icon-sm" /> Delete my account</button>
            <button type="button" className="btn-secondary" onClick={() => { setConfirming(false); setPassword(''); setError(''); }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export function Account() {
  return (
    <div className="space-y-5">
      <NameCard />
      <PasswordCard />
      <DangerCard />
    </div>
  );
}
