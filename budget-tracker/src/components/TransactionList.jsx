import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import { getCategory } from '@/lib/categories';
import { formatKSh, formatDateShort } from '@/lib/format';
import { CategoryIcon } from './CategoryIcon';

export function TransactionList({ transactions, limit, emptyMessage = 'No transactions yet', onDelete }) {
  const list = limit ? transactions.slice(0, limit) : transactions;

  if (list.length === 0) {
    return (
      <div className="tx-empty">
        <div className="tx-empty-icon">
          <Receipt className="icon-lg" />
        </div>
        <p className="tx-empty-text">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="tx-list">
      {list.map((t) => {
        const cat = getCategory(t.categoryId);
        const isIncome = t.type === 'income';
        return (
          <li key={t.id} className="tx-item">
            <div className="tx-icon" style={{ backgroundColor: `${cat?.color}15` }}>
              <CategoryIcon name={cat?.icon ?? 'Receipt'} className="icon-md" />
            </div>
            <div className="tx-info">
              <p className="tx-name">{cat?.name ?? 'Unknown'}</p>
              <p className="tx-meta">
                {formatDateShort(t.date)}
                {t.note ? ` · ${t.note}` : ''}
              </p>
            </div>
            <div className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
              {isIncome ? <ArrowDownLeft className="icon-sm" style={{ color: '#22c55e' }} /> : <ArrowUpRight className="icon-sm" style={{ color: '#ef4444' }} />}
              {formatKSh(t.amount)}
            </div>
            {onDelete && (
              <button onClick={() => onDelete(t.id)} className="tx-delete">
                Delete
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
