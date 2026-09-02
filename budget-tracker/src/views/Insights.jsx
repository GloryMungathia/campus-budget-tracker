import { TrendingUp } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { getSpendingByCategory, getWeeklySpending, getTopInsight } from '@/lib/analytics';
import { formatKSh, formatKShShort } from '@/lib/format';
import { DonutChart, BarChart } from '@/components/Charts';
import { CategoryIcon } from '@/components/CategoryIcon';

export function Insights() {
  const { transactions } = useStore();
  const spending = getSpendingByCategory(transactions);
  const weekly = getWeeklySpending(transactions);
  const insight = getTopInsight(transactions);
  const totalSpent = spending.reduce((s, c) => s + c.amount, 0);

  const donutData = spending.slice(0, 6).map((s) => ({ name: s.name, value: s.amount, color: s.color }));

  return (
    <div className="space-y-6">
      {insight && (
        <div className="insight-banner">
          <div className="insight-icon">
            <TrendingUp className="icon-md" />
          </div>
          <p className="insight-text">{insight}</p>
        </div>
      )}

      <div className="insights-grid">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="card-title">Spending by category</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>This month's breakdown</p>
          <div className="donut-layout">
            <DonutChart data={donutData} centerLabel="Total spent" centerValue={formatKShShort(totalSpent)} />
            <div className="legend-list">
              {spending.slice(0, 6).map((s) => (
                <div key={s.categoryId} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: s.color }} />
                  <div className="legend-icon" style={{ backgroundColor: `${s.color}15` }}>
                    <CategoryIcon name={s.icon} className="icon-sm" />
                  </div>
                  <span className="legend-name">{s.name}</span>
                  <span className="legend-pct">{Math.round(s.percentage)}%</span>
                </div>
              ))}
              {spending.length === 0 && <p style={{ fontSize: 14, color: '#94a3b8' }}>No spending recorded this month.</p>}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 className="card-title">Weekly spending trend</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>How your spending changed week to week</p>
          <BarChart data={weekly.map((w) => ({ label: w.label, value: w.amount }))} formatValue={formatKSh} />
          <div className="weekly-stats">
            <div>
              <p className="weekly-stat-label">Highest week</p>
              <p className="weekly-stat-value">{formatKSh(Math.max(...weekly.map((w) => w.amount)))}</p>
            </div>
            <div>
              <p className="weekly-stat-label">Weekly average</p>
              <p className="weekly-stat-value">{formatKSh(Math.round(weekly.reduce((s, w) => s + w.amount, 0) / weekly.length))}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 className="card-title" style={{ marginBottom: 16 }}>Full category breakdown</h3>
        <div className="breakdown-list">
          {spending.map((s) => (
            <div key={s.categoryId} className="breakdown-item">
              <div className="breakdown-icon" style={{ backgroundColor: `${s.color}15` }}>
                <CategoryIcon name={s.icon} className="icon-md" />
              </div>
              <div className="breakdown-info">
                <div className="breakdown-row">
                  <span className="breakdown-name">{s.name}</span>
                  <span className="breakdown-amount">{formatKSh(s.amount)}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${s.percentage}%`, background: s.color }} />
                </div>
              </div>
              <span className="breakdown-pct">{Math.round(s.percentage)}%</span>
            </div>
          ))}
          {spending.length === 0 && <p style={{ padding: '24px 0', textAlign: 'center', fontSize: 14, color: '#94a3b8' }}>No expenses recorded this month yet.</p>}
        </div>
      </div>
    </div>
  );
}
