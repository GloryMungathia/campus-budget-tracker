import { useState, useEffect } from 'react';
import { X, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { useStore } from '@/store/StoreContext';
import { todayISO } from '@/lib/format';
import { CategoryIcon } from './CategoryIcon';

export function AddTransactionModal({ open, onClose, defaultType = 'expense' }) {
  const { addTransaction } = useStore();
  const [type, setType] = useState(defaultType);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setCategoryId('');
      setAmount('');
      setDate(todayISO());
      setNote('');
      setSaved(false);
    }
  }, [open, defaultType]);

  useEffect(() => {
    setCategoryId('');
  }, [type]);

  if (!open) return null;

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
  const isValid = categoryId && parsedAmount > 0 && date;

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    addTransaction({ type, categoryId, amount: parsedAmount, date, note: note.trim() });
    setSaved(true);
    setTimeout(onClose, 900);
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
            <p className="saved-sub">Your transaction has been logged.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h3 className="modal-title">Add Transaction</h3>
              <button onClick={onClose} className="modal-close" aria-label="Close">
                <X className="icon-md" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body modal-form">
              <div className="type-toggle">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                >
                  <TrendingDown className="icon-sm" /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                >
                  <TrendingUp className="icon-sm" /> Income
                </button>
              </div>

              <div>
                <label className="label">Amount (KSh)</label>
                <div className="amount-wrapper">
                  <span className="amount-prefix">KSh</span>
                  <input
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
                <label className="label">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
              </div>

              <div>
                <label className="label">Note (optional)</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Matatu to town" className="input" maxLength={80} />
              </div>

              <button type="submit" disabled={!isValid} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                Save transaction
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
