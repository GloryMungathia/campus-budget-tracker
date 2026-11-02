import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMonthlySummary,
  getSpendingByCategory,
  getWeeklySpending,
  getBudgetProgress,
  getTopInsight,
} from '../src/lib/analytics.js';
import { getCategory, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../src/lib/categories.js';

const now = new Date(2026, 9, 20);

const txs = [
  { id: 1, type: 'income', categoryId: 'helb', amount: 45000, date: '2026-10-02' },
  { id: 2, type: 'expense', categoryId: 'food', amount: 3000, date: '2026-10-03' },
  { id: 3, type: 'expense', categoryId: 'transport', amount: 1000, date: '2026-10-10' },
  { id: 4, type: 'expense', categoryId: 'food', amount: 1000, date: '2026-10-31' },
  { id: 5, type: 'expense', categoryId: 'rent', amount: 12000, date: '2026-09-28' },
  { id: 6, type: 'expense', categoryId: 'unknown_cat', amount: 0, date: '2026-09-01' },
];

const budgets = [
  { categoryId: 'food', limit: 4000 },
  { categoryId: 'transport', limit: 2000 },
  { categoryId: 'books', limit: 1000 },
];

test('categories are split by type', () => {
  assert.ok(EXPENSE_CATEGORIES.every((c) => c.type === 'expense'));
  assert.ok(INCOME_CATEGORIES.every((c) => c.type === 'income'));
  assert.equal(getCategory('helb').name, 'HELB Loan');
  assert.equal(getCategory('nope'), undefined);
});

test('monthly summary only counts this month', () => {
  const s = getMonthlySummary(txs, budgets, now);
  assert.equal(s.income, 45000);
  assert.equal(s.expense, 5000);
  assert.equal(s.balance, 40000);
  assert.equal(s.totalBudget, 7000);
  assert.equal(s.totalSpent, 5000);
});

test('spending by category is sorted with percentages', () => {
  const s = getSpendingByCategory(txs, now);
  assert.deepEqual(s.map((c) => c.categoryId), ['food', 'transport']);
  assert.equal(s[0].amount, 4000);
  assert.equal(s[0].percentage, 80);
  assert.equal(s[1].percentage, 20);
});

test('spending by category handles unknown categories', () => {
  const s = getSpendingByCategory([{ type: 'expense', categoryId: 'mystery', amount: 100, date: '2026-10-01' }], now);
  assert.equal(s[0].name, 'Unknown');
  assert.equal(s[0].percentage, 100);
});

test('weekly spending includes the last days of the month', () => {
  const weeks = getWeeklySpending(txs, now);
  assert.equal(weeks.length, 5);
  assert.deepEqual(weeks.map((w) => w.amount), [3000, 1000, 0, 0, 1000]);
  assert.equal(weeks[4].label, 'W5');
});

test('weekly spending has 4 weeks in a 28 day February', () => {
  assert.equal(getWeeklySpending([], new Date(2026, 1, 10)).length, 4);
});

test('budget progress shows status', () => {
  const p = getBudgetProgress(
    [...txs, { id: 7, type: 'expense', categoryId: 'transport', amount: 700, date: '2026-10-11' }],
    budgets,
    now
  );
  const byId = Object.fromEntries(p.map((b) => [b.categoryId, b]));
  assert.equal(byId.food.status, 'over');
  assert.equal(byId.food.remaining, 0);
  assert.equal(byId.food.percentage, 100);
  assert.equal(byId.transport.status, 'warning');
  assert.equal(byId.books.status, 'safe');
  assert.equal(byId.books.spent, 0);
  assert.equal(p[0].categoryId, 'food');
});

test('budget progress handles a zero limit and unknown category', () => {
  const p = getBudgetProgress([], [{ categoryId: 'mystery', limit: 0 }], now);
  assert.equal(p[0].percentage, 0);
  assert.equal(p[0].name, 'Unknown');
});

test('top insight names the biggest category', () => {
  assert.equal(getTopInsight(txs, now), 'You spent the most on Food & Canteen — 80% of your expenses this month.');
  assert.equal(getTopInsight([], now), null);
});
