const API_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_KEY = 'tumatrack_token';
const HAS_ACCOUNT_KEY = 'tumatrack_has_account';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function storage(kind) {
  return kind === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
}

function read(kind, key) {
  try {
    return storage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(kind, key, value) {
  try {
    if (value === null) storage(kind)?.removeItem(key);
    else storage(kind)?.setItem(key, value);
  } catch {
    return;
  }
}

export function getToken() {
  return read('local', TOKEN_KEY) ?? read('session', TOKEN_KEY);
}

export function setToken(token, remember = true) {
  write('local', TOKEN_KEY, null);
  write('session', TOKEN_KEY, null);
  if (token) write(remember ? 'local' : 'session', TOKEN_KEY, token);
}

export function hasAccount() {
  return read('local', HAS_ACCOUNT_KEY) === 'yes';
}

export function markHasAccount() {
  write('local', HAS_ACCOUNT_KEY, 'yes');
}

export function forgetAccount() {
  write('local', HAS_ACCOUNT_KEY, null);
}

export function errorMessage(body, status) {
  if (body && typeof body.detail === 'string') return body.detail;
  if (body && Array.isArray(body.detail) && body.detail.length > 0) {
    const msg = String(body.detail[0].msg ?? 'Invalid input');
    return msg.replace(/^Value error, /, '');
  }
  if (status >= 500) return 'The server had a problem. Please try again.';
  return 'Something went wrong. Please try again.';
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet and try again.', 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status);
  return data;
}

export const api = {
  register: (name, email, password, remember = true) =>
    request('/api/auth/register', { method: 'POST', body: { name, email, password, remember } }),
  login: (email, password, remember = false) =>
    request('/api/auth/login', { method: 'POST', body: { email, password, remember } }),
  me: () => request('/api/auth/me'),
  updateMe: (name) => request('/api/auth/me', { method: 'PATCH', body: { name } }),
  setAvatar: (image) => request('/api/auth/me/avatar', { method: 'PUT', body: { image } }),
  removeAvatar: () => request('/api/auth/me/avatar', { method: 'DELETE' }),
  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
  deleteAccount: (password) => request('/api/auth/delete-account', { method: 'POST', body: { password } }),
  listTransactions: () => request('/api/transactions'),
  createTransaction: (t) => request('/api/transactions', { method: 'POST', body: t }),
  deleteTransaction: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
  listBudgets: () => request('/api/budgets'),
  setBudget: (categoryId, limit) => request(`/api/budgets/${categoryId}`, { method: 'PUT', body: { limit } }),
  deleteBudget: (categoryId) => request(`/api/budgets/${categoryId}`, { method: 'DELETE' }),
};
