import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { getMonthlySummary, getWeeklySpending, getTopInsight } from '@/lib/analytics';
import { formatKSh, formatKShShort } from '@/lib/format';
import { BarChart } from '@/components/Charts';
import { TransactionList } from '@/components/TransactionList';

function StatCard({ label, value, icon, tone }) {
  return (
    <div className="card stat-card animate-slide-up">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

export function Dashboard({ onNavigate, onAddClick }) {
  const { transactions, budgets } = useStore();
  const summary = getMonthlySummary(transactions, budgets);
  const weekly = getWeeklySpending(transactions);
  const insight = getTopInsight(transactions);
  const budgetPct = summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="balance-hero">
        <div className="balance-hero-blob1" />
        <div className="balance-hero-blob2" />
        <div style={{ position: 'relative' }}>
          <div className="balance-label">
            <Wallet className="icon-md" style={{ color: '#a7f3d0' }} />
            <p>Current balance this month</p>
          </div>
          <p className="balance-amount">{formatKSh(summary.balance)}</p>
          <div className="balance-actions">
            <button onClick={onAddClick} className="btn-white">
              <TrendingDown className="icon-sm" /> Add Expense
            </button>
            <button onClick={onAddClick} className="btn-glass">
              <TrendingUp className="icon-sm" /> Add Income
            </button>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Money In" value={formatKSh(summary.income)} icon={<TrendingUp className="icon-md" />} tone="success" />
        <StatCard label="Money Out" value={formatKSh(summary.expense)} icon={<TrendingDown className="icon-md" />} tone="danger" />
        <StatCard label="Budget Used" value={`${budgetPct}%`} icon={<Target className="icon-md" />} tone="primary" />
        <StatCard label="Total Budget" value={formatKShShort(summary.totalBudget)} icon={<Wallet className="icon-md" />} tone="neutral" />
      </div>

      {insight && (
        <div className="insight-banner">
          <div className="insight-icon">
            <TrendingUp className="icon-md" />
          </div>
          <p className="insight-text">{insight}</p>
        </div>
      )}

      <div className="dash-grid">
        <div className="card" style={{ padding: 20 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Spending this month</h3>
              <p className="card-sub">Weekly breakdown</p>
            </div>
            <button onClick={() => onNavigate('insights')} className="btn-ghost primary">
              View insights <ArrowRight className="icon-sm" />
            </button>
          </div>
          <BarChart data={weekly.map((w) => ({ label: w.label, value: w.amount }))} formatValue={formatKSh} />
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="card-header">
            <h3 className="card-title">Budget progress</h3>
            <button onClick={() => onNavigate('budgets')} className="btn-ghost primary">
              All <ArrowRight className="icon-sm" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                <span style={{ fontWeight: 500, color: '#475569' }}>Overall</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatKShShort(summary.totalSpent)} / {formatKShShort(summary.totalBudget)}</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(budgetPct, 100)}%`,
                    background: budgetPct >= 100 ? '#ef4444' : budgetPct >= 80 ? '#f59e0b' : '#059669',
                  }}
                />
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              {summary.totalBudget - summary.totalSpent > 0
                ? `${formatKSh(summary.totalBudget - summary.totalSpent)} left across all budgets`
                : `Over budget by ${formatKSh(summary.totalSpent - summary.totalBudget)}`}
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Recent transactions</h3>
          <button onClick={() => onNavigate('history')} className="btn-ghost primary">
            View all <ArrowRight className="icon-sm" />
          </button>
        </div>
        <TransactionList transactions={transactions} limit={6} emptyMessage="No transactions yet — add your first one!" />
      </div>
    </div>
  );
}
