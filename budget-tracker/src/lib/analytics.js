import { getCategory } from './categories';
import { isThisMonth } from './format';

export function getMonthlySummary(transactions, budgets) {
  const thisMonth = transactions.filter((t) => isThisMonth(t.date));
  const income = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = thisMonth
    .filter((t) => t.type === 'expense')
    .filter((t) => budgets.some((b) => b.categoryId === t.categoryId))
    .reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense, totalBudget, totalSpent };
}

export function getSpendingByCategory(transactions) {
  const thisMonth = transactions.filter((t) => t.type === 'expense' && isThisMonth(t.date));
  const total = thisMonth.reduce((s, t) => s + t.amount, 0);
  const byCat = new Map();
  for (const t of thisMonth) {
    byCat.set(t.categoryId, (byCat.get(t.categoryId) ?? 0) + t.amount);
  }
  return Array.from(byCat.entries())
    .map(([categoryId, amount]) => {
      const cat = getCategory(categoryId);
      return {
        categoryId,
        name: cat?.name ?? 'Unknown',
        color: cat?.color ?? '#64748b',
        icon: cat?.icon ?? 'Receipt',
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getWeeklySpending(transactions) {
  const thisMonth = transactions.filter((t) => t.type === 'expense' && isThisMonth(t.date));
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const weeks = [];
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(startOfMonth);
    weekStart.setDate(startOfMonth.getDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const amount = thisMonth
      .filter((t) => {
        const d = new Date(t.date);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((s, t) => s + t.amount, 0);
    weeks.push({ label: `W${w + 1}`, amount });
  }
  return weeks;
}

export function getBudgetProgress(transactions, budgets) {
  const thisMonth = transactions.filter((t) => t.type === 'expense' && isThisMonth(t.date));
  return budgets
    .map((b) => {
      const cat = getCategory(b.categoryId);
      const spent = thisMonth
        .filter((t) => t.categoryId === b.categoryId)
        .reduce((s, t) => s + t.amount, 0);
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'safe';
      return {
        categoryId: b.categoryId,
        name: cat?.name ?? 'Unknown',
        color: cat?.color ?? '#64748b',
        icon: cat?.icon ?? 'Receipt',
        limit: b.limit,
        spent,
        remaining: Math.max(0, b.limit - spent),
        percentage: Math.min(percentage, 100),
        status,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
}

export function getTopInsight(transactions) {
  const spending = getSpendingByCategory(transactions);
  if (spending.length === 0) return null;
  const top = spending[0];
  return `You spent the most on ${top.name} — ${Math.round(top.percentage)}% of your expenses this month.`;
}
