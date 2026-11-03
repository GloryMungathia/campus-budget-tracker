import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  daysBetween,
  moneyLeft,
  spentToday,
  averageDailySpend,
  addDays,
  getRunway,
  costInDays,
  daysLabel,
  historyDays,
} from '../src/lib/runway.js';

const now = new Date(2026, 10, 3, 15, 0);

const txs = [
  { type: 'income', amount: 10000, date: '2026-10-25' },
  { type: 'expense', amount: 2000, date: '2026-10-28' },
  { type: 'expense', amount: 500, date: '2026-11-03' },
  { type: 'expense', amount: 300, date: '2026-11-03' },
  { type: 'expense', amount: 999, date: '2026-11-10' },
];

test('daysBetween and addDays', () => {
  assert.equal(daysBetween('2026-11-03', '2026-11-25'), 22);
  assert.equal(daysBetween('2026-10-30', '2026-11-02'), 3);
  assert.equal(addDays(now, 5), '2026-11-08');
  assert.equal(addDays(new Date(2026, 9, 30), 3), '2026-11-02');
});

test('money left ignores future transactions', () => {
  assert.equal(moneyLeft(txs, now), 7200);
});

test('spent today', () => {
  assert.equal(spentToday(txs, now), 800);
  assert.equal(spentToday([], now), 0);
});

test('average daily spend uses days since first expense, up to 14', () => {
  assert.equal(averageDailySpend(txs, now), Math.round(2800 / 7));
  assert.equal(averageDailySpend([], now), 0);
  const old = [{ type: 'expense', amount: 1400, date: '2026-10-01' }, { type: 'expense', amount: 1400, date: '2026-11-01' }];
  assert.equal(averageDailySpend(old, now), 100);
});

test('runway with a next money date, on track', () => {
  const r = getRunway(txs, '2026-11-10', now);
  assert.equal(r.left, 7200);
  assert.equal(r.daysLeft, 7);
  assert.equal(r.perDay, Math.floor(7200 / 7));
  assert.equal(r.todaySpent, 800);
  assert.equal(r.leftToday, r.perDay - 800);
  assert.equal(r.status, 'on-track');
  assert.equal(r.shortBy, 0);
});

test('runway when money runs out before next money', () => {
  const r = getRunway(txs, '2026-12-31', now);
  assert.equal(r.status, 'short');
  assert.equal(r.lastsDays, Math.floor(7200 / 400));
  assert.equal(r.runsOutOn, addDays(now, r.lastsDays));
  assert.equal(r.shortBy, r.daysLeft - r.lastsDays);
});

test('runway without a date or with a past date', () => {
  for (const date of [null, '2026-11-03', '2026-10-01']) {
    const r = getRunway(txs, date, now);
    assert.equal(r.daysLeft, null);
    assert.equal(r.perDay, null);
    assert.equal(r.leftToday, null);
    assert.equal(r.status, 'unknown');
  }
});

test('runway with no spending yet is on track', () => {
  const r = getRunway([{ type: 'income', amount: 4500, date: '2026-11-01' }], '2026-11-12', now);
  assert.equal(r.perDay, 500);
  assert.equal(r.avg, 0);
  assert.equal(r.lastsDays, null);
  assert.equal(r.status, 'on-track');
});

test('runway never shows negative money', () => {
  const r = getRunway([{ type: 'expense', amount: 500, date: '2026-11-01' }], '2026-11-12', now);
  assert.equal(r.left, 0);
  assert.equal(r.perDay, 0);
  assert.equal(r.leftToday, 0);
});

test('cost in days', () => {
  assert.equal(costInDays(3000, 459), 6.5);
  assert.equal(costInDays(100, 459), 0.2);
  assert.equal(costInDays(0, 459), null);
  assert.equal(costInDays(100, 0), null);
  assert.equal(costInDays(100, null), null);
});

test('days label', () => {
  assert.equal(daysLabel(1), '1 day');
  assert.equal(daysLabel(7), '7 days');
  assert.equal(daysLabel(null), '');
});

test('history days', () => {
  assert.equal(historyDays(txs, now), 10);
  assert.equal(historyDays([], now), 0);
  assert.equal(historyDays([{ type: 'income', amount: 1, date: '2026-11-03' }], now), 1);
});

test('new users get no pace warning for the first days', () => {
  const fresh = [
    { type: 'income', amount: 10000, date: '2026-11-03' },
    { type: 'expense', amount: 1500, date: '2026-11-03' },
  ];
  const r = getRunway(fresh, '2026-11-13', now);
  assert.equal(r.status, 'new');
  assert.equal(r.shortBy, 0);
  assert.equal(r.perDay, 850);
});
