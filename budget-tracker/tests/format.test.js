import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDate,
  formatKSh,
  formatKShShort,
  formatDate,
  formatDateShort,
  monthKey,
  toISODate,
  todayISO,
  isThisMonth,
} from '../src/lib/format.js';

test('parseDate reads a plain date as a local date', () => {
  const d = parseDate('2026-11-02');
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 10);
  assert.equal(d.getDate(), 2);
});

test('formatKSh adds the currency and commas', () => {
  assert.equal(formatKSh(45000), 'KSh 45,000');
  assert.equal(formatKSh(0), 'KSh 0');
  assert.equal(formatKSh(-1500), '-KSh 1,500');
});

test('formatKShShort shortens big numbers', () => {
  assert.equal(formatKShShort(950), 'KSh 950');
  assert.equal(formatKShShort(12500), 'KSh 12.5k');
  assert.equal(formatKShShort(2300000), 'KSh 2.3M');
  assert.equal(formatKShShort(-12500), '-KSh 12.5k');
});

test('formatDate keeps the same day', () => {
  assert.match(formatDate('2026-11-02'), /2/);
  assert.match(formatDate('2026-11-02'), /2026/);
  assert.match(formatDateShort('2026-11-30'), /30/);
});

test('monthKey and toISODate', () => {
  assert.equal(monthKey('2026-11-02'), '2026-11');
  assert.equal(toISODate(new Date(2026, 0, 5)), '2026-01-05');
});

test('todayISO uses the local date', () => {
  assert.equal(todayISO(new Date(2026, 10, 2, 0, 30)), '2026-11-02');
  assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

test('isThisMonth compares year and month', () => {
  const now = new Date(2026, 10, 15);
  assert.equal(isThisMonth('2026-11-01', now), true);
  assert.equal(isThisMonth('2026-11-30', now), true);
  assert.equal(isThisMonth('2026-10-31', now), false);
  assert.equal(isThisMonth('2025-11-15', now), false);
});
