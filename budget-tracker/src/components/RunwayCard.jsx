import { useState } from 'react';
import { CalendarClock, Check, AlertTriangle, Pencil } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';
import { getRunway, daysLabel } from '@/lib/runway';
import { formatKSh, formatDate, todayISO } from '@/lib/format';

function DateForm({ initial, onDone, onCancel }) {
  const { setNextMoneyDate } = useAuth();
  const [date, setDate] = useState(initial ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const min = todayISO();

  async function save(e) {
    e.preventDefault();
    if (!date || date <= min) {
      setError('Pick a date after today');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await setNextMoneyDate(date);
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="runway-form" noValidate>
      <label className="label" htmlFor="next-money">When does your next money arrive?</label>
      <p className="runway-help">HELB, pocket money or a side hustle payment. We will spread what you have until then.</p>
      <div className="runway-form-row">
        <input id="next-money" type="date" min={min} value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        <button type="submit" className="btn-primary" disabled={busy}>Save</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
      {error && <p className="field-note error">{error}</p>}
    </form>
  );
}

export function RunwayCard() {
  const { transactions } = useStore();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const r = getRunway(transactions, user?.nextMoneyDate ?? null);

  if (!r.daysLeft || editing) {
    return (
      <div className="card runway-card">
        <div className="runway-head">
          <div className="runway-icon"><CalendarClock className="icon-md" /></div>
          <h3 className="card-title">Make your money last</h3>
        </div>
        {user?.nextMoneyDate && !editing && <p className="runway-help">Your last date has passed. Set the next one.</p>}
        <DateForm initial={editing ? user?.nextMoneyDate : ''} onDone={() => setEditing(false)} onCancel={editing ? () => setEditing(false) : null} />
      </div>
    );
  }

  const over = r.perDay !== null && r.todaySpent > r.perDay;

  return (
    <div className={`card runway-card ${r.status}`}>
      <div className="runway-head">
        <div className="runway-icon"><CalendarClock className="icon-md" /></div>
        <div style={{ flex: 1 }}>
          <h3 className="card-title">Make your money last</h3>
          <p className="card-sub">{formatKSh(r.left)} left · {daysLabel(r.daysLeft)} until {formatDate(user.nextMoneyDate)}</p>
        </div>
        <button className="budget-edit" style={{ opacity: 1 }} onClick={() => setEditing(true)} aria-label="Change next money date">
          <Pencil className="icon-sm" />
        </button>
      </div>

      <div className="runway-grid">
        <div>
          <p className="stat-label">Safe to spend per day</p>
          <p className="runway-big" data-testid="per-day">{formatKSh(r.perDay)}</p>
        </div>
        <div>
          <p className="stat-label">Left for today</p>
          <p className={`runway-big ${over ? 'danger' : ''}`} data-testid="left-today">{formatKSh(r.leftToday)}</p>
          {over && <p className="runway-note danger">You are {formatKSh(r.todaySpent - r.perDay)} over today</p>}
        </div>
      </div>

      {r.status === 'short' && (
        <p className="runway-status short" data-testid="runway-status">
          <AlertTriangle className="icon-sm" /> At your pace ({formatKSh(r.avg)} a day) your money runs out on {formatDate(r.runsOutOn)}, {daysLabel(r.shortBy)} before your next money.
        </p>
      )}
      {r.status === 'new' && (
        <p className="runway-status new" data-testid="runway-status">
          <CalendarClock className="icon-sm" /> Keep logging for a few days and we will show how long your money will last at your pace.
        </p>
      )}
      {r.status === 'on-track' && (
        <p className="runway-status on-track" data-testid="runway-status">
          <Check className="icon-sm" />
          {r.avg > 0
            ? ` At your pace (${formatKSh(r.avg)} a day) your money lasts until your next money. Keep it up.`
            : ' Spend at most the daily amount and your money will last.'}
        </p>
      )}
    </div>
  );
}
