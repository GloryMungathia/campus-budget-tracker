export function parseDate(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatKSh(amount) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}KSh ${Math.abs(amount).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

export function formatKShShort(amount) {
  const sign = amount < 0 ? '-' : '';
  const n = Math.abs(amount);
  if (n >= 1000000) return `${sign}KSh ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${sign}KSh ${(n / 1000).toFixed(1)}k`;
  return `${sign}KSh ${n}`;
}

export function formatDate(iso) {
  return parseDate(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(iso) {
  return parseDate(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export function monthKey(iso) {
  return iso.slice(0, 7);
}

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(now = new Date()) {
  return toISODate(now);
}

export function isThisMonth(iso, now = new Date()) {
  return monthKey(iso) === toISODate(now).slice(0, 7);
}
