import { useState } from 'react';
import { Plus, Pencil, Check, X, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { getBudgetProgress } from '@/lib/analytics';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import { formatKSh } from '@/lib/format';
import { CategoryIcon } from '@/components/CategoryIcon';

export function Budgets() {
  const { transactions, budgets, setBudget } = useStore();
  const progress = getBudgetProgress(transactions, budgets);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const budgetedIds = new Set(budgets.map((b) => b.categoryId));
  const availableCats = EXPENSE_CATEGORIES.filter((c) => !budgetedIds.has(c.id));

  function startEdit(catId, current) {
    setEditing(catId);
    setEditValue(String(current));
  }

  function saveEdit() {
    if (editing && editValue) {
      setBudget(editing, parseInt(editValue.replace(/[^0-9]/g, ''), 10) || 0);
    }
    setEditing(null);
  }

  function handleAdd() {
    if (newCat && newLimit) {
      setBudget(newCat, parseInt(newLimit.replace(/[^0-9]/g, ''), 10) || 0);
      setNewCat('');
      setNewLimit('');
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 14, color: '#64748b' }}>Set a monthly limit for each category and watch your spending fill the bar.</p>
        {availableCats.length > 0 && (
          <button onClick={() => setAdding(true)} className="btn-secondary">
            <Plus className="icon-sm" /> New budget
          </button>
        )}
      </div>

      {adding && (
        <div className="card budget-add-form animate-slide-up">
          <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Create a budget</h4>
          <div className="budget-add-grid">
            <div>
              <label className="label">Category</label>
              <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="input">
                <option value="">Select a category…</option>
                {availableCats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Monthly limit (KSh)</label>
              <input
                type="text"
                inputMode="numeric"
                value={newLimit ? parseInt(newLimit).toLocaleString('en-KE') : ''}
                onChange={(e) => setNewLimit(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 8000"
                className="input"
              />
            </div>
          </div>
          <div className="budget-add-actions">
            <button onClick={handleAdd} disabled={!newCat || !newLimit} className="btn-primary"><Check className="icon-sm" /> Save budget</button>
            <button onClick={() => setAdding(false)} className="btn-secondary"><X className="icon-sm" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="budget-grid">
        {progress.map((b) => (
          <div key={b.categoryId} className="card budget-card">
            <div className="budget-header">
              <div className="budget-icon" style={{ backgroundColor: `${b.color}15` }}>
                <CategoryIcon name={b.icon} className="icon-lg" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="budget-name">{b.name}</h4>
                <p className="budget-sub">{formatKSh(b.spent)} of {formatKSh(b.limit)}</p>
              </div>
              <button onClick={() => startEdit(b.categoryId, b.limit)} className="budget-edit" aria-label="Edit budget">
                <Pencil className="icon-sm" />
              </button>
            </div>

            <div className="budget-progress">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${b.percentage}%`,
                    background: b.status === 'over' ? '#ef4444' : b.status === 'warning' ? '#f59e0b' : b.color,
                  }}
                />
              </div>
              <div className="budget-meta">
                {b.status === 'over' ? (
                  <span className="budget-over">
                    <AlertTriangle className="icon-sm" /> Over by {formatKSh(b.spent - b.limit)}
                  </span>
                ) : (
                  <span className="budget-remaining">{formatKSh(b.remaining)} left</span>
                )}
                <span className={`budget-pct ${b.status}`}>{Math.round(b.percentage)}%</span>
              </div>
            </div>

            {editing === b.categoryId && (
              <div className="budget-inline-edit">
                <input
                  type="text"
                  inputMode="numeric"
                  value={editValue ? parseInt(editValue).toLocaleString('en-KE') : ''}
                  onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
                  className="input"
                  style={{ padding: '8px 12px' }}
                  autoFocus
                />
                <button onClick={saveEdit} className="btn-primary" style={{ padding: '8px 12px' }}><Check className="icon-sm" /></button>
                <button onClick={() => setEditing(null)} className="btn-secondary" style={{ padding: '8px 12px' }}><X className="icon-sm" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
