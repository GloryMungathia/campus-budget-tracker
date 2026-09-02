export function formatKSh(amount) {
  return `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

export function formatKShShort(amount) {
  if (amount >= 1000000) return `KSh ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `KSh ${(amount / 1000).toFixed(1)}k`;
  return `KSh ${amount}`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export function monthKey(iso) {
  return iso.slice(0, 7);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isThisMonth(iso) {
  const now = new Date();
  const d = new Date(iso);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
