import { useState, useMemo } from 'react';
import { Search, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { CATEGORIES, getCategory } from '@/lib/categories';
import { formatKSh, formatDate } from '@/lib/format';
import { CategoryIcon } from '@/components/CategoryIcon';

export function History() {
  const { transactions, deleteTransaction } = useStore();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => (filterType === 'all' ? true : t.type === filterType))
      .filter((t) => (filterCategory === 'all' ? true : t.categoryId === filterCategory))
      .filter((t) => {
        if (!query.trim()) return true;
        const cat = getCategory(t.categoryId);
        const q = query.toLowerCase();
        return (
          cat?.name.toLowerCase().includes(q) ||
          t.note.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filterType, filterCategory, query]);

  return (
    <div className="space-y-5">
      <div className="card history-filters">
        <div className="search-wrapper">
          <Search className="search-icon icon-sm" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, note, or amount…"
            className="input search-input"
          />
        </div>
        <div className="filter-grid">
          <div>
            <label className="label">Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input">
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input">
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className="history-count">
            {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
          </h3>
          {(filterType !== 'all' || filterCategory !== 'all' || query) && (
            <button
              onClick={() => { setQuery(''); setFilterType('all'); setFilterCategory('all'); }}
              className="clear-filters"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="tx-empty">
            <div className="tx-empty-icon">
              <Search className="icon-lg" />
            </div>
            <p className="tx-empty-text">No transactions match your filters.</p>
          </div>
        ) : (
          <ul className="tx-list">
            {filtered.map((t) => {
              const cat = getCategory(t.categoryId);
              const isIncome = t.type === 'income';
              return (
                <li key={t.id} className="tx-item">
                  <div className="tx-icon" style={{ backgroundColor: `${cat?.color}15` }}>
                    <CategoryIcon name={cat?.icon ?? 'Receipt'} className="icon-md" />
                  </div>
                  <div className="tx-info">
                    <p className="tx-name">{cat?.name ?? 'Unknown'}</p>
                    <p className="tx-meta">{formatDate(t.date)}{t.note ? ` · ${t.note}` : ''}</p>
                  </div>
                  <div className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                    {isIncome ? <ArrowDownLeft className="icon-sm" style={{ color: '#22c55e' }} /> : <ArrowUpRight className="icon-sm" style={{ color: '#ef4444' }} />}
                    {formatKSh(t.amount)}
                  </div>
                  <button onClick={() => deleteTransaction(t.id)} className="budget-edit" style={{ opacity: 1 }} aria-label="Delete transaction">
                    <Trash2 className="icon-sm" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
