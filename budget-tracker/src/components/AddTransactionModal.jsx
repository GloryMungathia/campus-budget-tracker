import { useState, useEffect } from 'react';
import { X, Check, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { useStore } from '@/store/StoreContext';
import { todayISO } from '@/lib/format';
import { CategoryIcon } from './CategoryIcon';

export function AddTransactionModal({ open, onClose, defaultType = 'expense', editing = null }) {
  const { addTransaction, updateTransaction } = useStore();
  const isEdit = Boolean(editing);
  const [type, setType] = useState(defaultType);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (open) {
      setType(editing ? editing.type : defaultType);
      setCategoryId(editing ? editing.categoryId : '');
      setAmount(editing ? String(editing.amount) : '');
      setDate(editing ? editing.date : todayISO());
      setNote(editing?.note ?? '');
      setSaved(false);
      setSaving(false);
      setError('');
    }
  }, [open, defaultType, editing]);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(onClose, 900);
    return () => clearTimeout(timer);
  }, [saved, onClose]);

  function changeType(next) {
    if (next === type) return;
    setType(next);
    setCategoryId('');
  }

  if (!open) return null;

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
  const isValid = Boolean(categoryId && parsedAmount > 0 && date);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    setError('');
    try {
      const data = { type, categoryId, amount: parsedAmount, date, note: note.trim() };
      if (isEdit) await updateTransaction(editing.id, data);
      else await addTransaction(data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {saved ? (
          <div className="saved-screen">
            <div className="saved-circle">
              <Check className="icon-xl" />
            </div>
            <p className="saved-title">Saved!</p>
            <p className="saved-sub">{isEdit ? 'Your changes have been saved.' : 'Your transaction has been logged.'}</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h3 className="modal-title">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button onClick={onClose} className="modal-close" aria-label="Close">
                <X className="icon-md" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body modal-form">
              <div className="type-toggle">
                <button
                  type="button"
                  onClick={() => changeType('expense')}
                  className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                >
                  <TrendingDown className="icon-sm" /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => changeType('income')}
                  className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                >
                  <TrendingUp className="icon-sm" /> Income
                </button>
              </div>

              <div>
                <label className="label" htmlFor="tx-amount">Amount (KSh)</label>
                <div className="amount-wrapper">
                  <span className="amount-prefix">KSh</span>
                  <input
                    id="tx-amount"
                    type="text"
                    inputMode="numeric"
                    value={amount ? parseInt(amount.replace(/[^0-9]/g, ''), 10).toLocaleString('en-KE') : ''}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="input amount-input"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="label">Category</label>
                <div className="category-grid">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`category-btn ${categoryId === c.id ? 'selected' : ''}`}
                      aria-pressed={categoryId === c.id}
                    >
                      <div className="category-icon-box" style={{ backgroundColor: `${c.color}15` }}>
                        <CategoryIcon name={c.icon} className="icon-md" />
                      </div>
                      <span className="category-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="tx-date">Date</label>
                <input id="tx-date" type="date" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className="input" />
              </div>

              <div>
                <label className="label" htmlFor="tx-note">Note (optional)</label>
                <input id="tx-note" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Matatu to town" className="input" maxLength={80} />
              </div>

              {error && <p className="form-error" role="alert">{error}</p>}

              <button type="submit" disabled={!isValid || saving} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                {saving && <Loader2 className="icon-sm spin" />}
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save transaction'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
