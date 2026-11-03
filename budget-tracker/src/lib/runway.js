import { parseDate, toISODate } from './format.js';

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(fromISO, toISO) {
  return Math.round((parseDate(toISO) - parseDate(fromISO)) / DAY);
}

export function moneyLeft(transactions, now = new Date()) {
  const today = toISODate(now);
  return transactions
    .filter((t) => t.date <= today)
    .reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
}

export function spentToday(transactions, now = new Date()) {
  const today = toISODate(now);
  return transactions.filter((t) => t.type === 'expense' && t.date === today).reduce((s, t) => s + t.amount, 0);
}

export function averageDailySpend(transactions, now = new Date(), windowDays = 14) {
  const today = toISODate(now);
  const expenses = transactions.filter((t) => t.type === 'expense' && t.date <= today);
  if (expenses.length === 0) return 0;
  const first = expenses.reduce((min, t) => (t.date < min ? t.date : min), today);
  const days = Math.min(windowDays, daysBetween(first, today) + 1);
  const from = toISODate(new Date(startOfDay(now).getTime() - (days - 1) * DAY));
  const total = expenses.filter((t) => t.date >= from).reduce((s, t) => s + t.amount, 0);
  return Math.round(total / days);
}

export function addDays(now, days) {
  return toISODate(new Date(startOfDay(now).getTime() + days * DAY));
}

export const MIN_HISTORY_DAYS = 3;

export function historyDays(transactions, now = new Date()) {
  const today = toISODate(now);
  const past = transactions.filter((t) => t.date <= today);
  if (past.length === 0) return 0;
  const first = past.reduce((min, t) => (t.date < min ? t.date : min), today);
  return daysBetween(first, today) + 1;
}

export function getRunway(transactions, nextMoneyDate, now = new Date()) {
  const today = toISODate(now);
  const history = historyDays(transactions, now);
  const left = Math.max(0, moneyLeft(transactions, now));
  const avg = averageDailySpend(transactions, now);
  const daysLeft = nextMoneyDate && nextMoneyDate > today ? daysBetween(today, nextMoneyDate) : null;
  const perDay = daysLeft ? Math.floor(left / daysLeft) : null;
  const todaySpent = spentToday(transactions, now);
  const leftToday = perDay === null ? null : Math.max(0, perDay - todaySpent);
  const lastsDays = avg > 0 ? Math.floor(left / avg) : null;
  const runsOutOn = lastsDays === null ? null : addDays(now, lastsDays);
  let status = 'unknown';
  if (daysLeft !== null && lastsDays !== null) status = lastsDays >= daysLeft ? 'on-track' : 'short';
  if (daysLeft !== null && lastsDays === null) status = 'on-track';
  if (daysLeft !== null && lastsDays !== null && history < MIN_HISTORY_DAYS) status = 'new';
  const shortBy = status === 'short' ? daysLeft - lastsDays : 0;
  return { left, avg, daysLeft, perDay, todaySpent, leftToday, lastsDays, runsOutOn, status, shortBy, history };
}

export function costInDays(amount, perDay) {
  if (!amount || !perDay || perDay <= 0) return null;
  return Math.round((amount / perDay) * 10) / 10;
}

export function daysLabel(days) {
  if (days === null || days === undefined) return '';
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
