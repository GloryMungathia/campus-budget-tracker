import { useId, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export function FieldNote({ id, error, helper }) {
  if (error) {
    return (
      <p id={id} className="field-note error">
        <AlertCircle className="icon-xs" /> {error}
      </p>
    );
  }
  if (helper) return <p id={id} className="field-note">{helper}</p>;
  return null;
}

export function Field({ label, icon: Icon, error, helper, className = '', ...props }) {
  const id = useId();
  const noteId = `${id}-note`;
  return (
    <div className={`field ${className}`}>
      <label className="label" htmlFor={id}>{label}</label>
      <div className={`field-box ${error ? 'has-error' : ''}`}>
        {Icon && <Icon className="field-icon icon-sm" />}
        <input
          id={id}
          className={`input field-input ${Icon ? 'with-icon' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helper ? noteId : undefined}
          {...props}
        />
      </div>
      <FieldNote id={noteId} error={error} helper={helper} />
    </div>
  );
}

export function PasswordField({ label, icon: Icon, error, helper, ...props }) {
  const id = useId();
  const noteId = `${id}-note`;
  const [hidden, setHidden] = useState(true);
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <div className={`field-box ${error ? 'has-error' : ''}`}>
        {Icon && <Icon className="field-icon icon-sm" />}
        <input
          id={id}
          type={hidden ? 'password' : 'text'}
          className={`input field-input with-toggle ${Icon ? 'with-icon' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helper ? noteId : undefined}
          {...props}
        />
        <button
          type="button"
          className="field-toggle"
          onClick={() => setHidden((h) => !h)}
          aria-label={hidden ? 'Show password' : 'Hide password'}
        >
          {hidden ? <Eye className="icon-sm" /> : <EyeOff className="icon-sm" />}
        </button>
      </div>
      <FieldNote id={noteId} error={error} helper={helper} />
    </div>
  );
}
