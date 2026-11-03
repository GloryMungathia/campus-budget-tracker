import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

function fakeStorage(map) {
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

const store = new Map();
const session = new Map();
globalThis.localStorage = fakeStorage(store);
globalThis.sessionStorage = fakeStorage(session);

const { api, request, getToken, setToken, errorMessage, ApiError, hasAccount, markHasAccount, forgetAccount } = await import(
  '../src/lib/api.js'
);

let calls;
function mockFetch(status, body) {
  calls = [];
  globalThis.fetch = async (url, opts) => {
    calls.push({ url, opts });
    return {
      status,
      ok: status >= 200 && status < 300,
      json: async () => {
        if (body === undefined) throw new Error('no body');
        return body;
      },
    };
  };
}

beforeEach(() => {
  store.clear();
  session.clear();
});

test('token is saved and cleared', () => {
  setToken('abc');
  assert.equal(getToken(), 'abc');
  setToken(null);
  assert.equal(getToken(), null);
});

test('remembered token goes in local storage', () => {
  setToken('long', true);
  assert.equal(store.get('tumatrack_token'), 'long');
  assert.equal(session.has('tumatrack_token'), false);
  assert.equal(getToken(), 'long');
});

test('token that is not remembered goes in session storage', () => {
  setToken('old', true);
  setToken('short', false);
  assert.equal(session.get('tumatrack_token'), 'short');
  assert.equal(store.has('tumatrack_token'), false);
  assert.equal(getToken(), 'short');
});

test('has account flag', () => {
  assert.equal(hasAccount(), false);
  markHasAccount();
  assert.equal(hasAccount(), true);
  forgetAccount();
  assert.equal(hasAccount(), false);
});

test('token helpers survive blocked storage', () => {
  const savedLocal = globalThis.localStorage;
  const savedSession = globalThis.sessionStorage;
  const blocked = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
  };
  globalThis.localStorage = blocked;
  globalThis.sessionStorage = blocked;
  assert.equal(getToken(), null);
  assert.equal(hasAccount(), false);
  assert.doesNotThrow(() => setToken('x'));
  assert.doesNotThrow(() => markHasAccount());
  globalThis.localStorage = savedLocal;
  globalThis.sessionStorage = savedSession;
});

test('token helpers survive missing storage', () => {
  const savedLocal = globalThis.localStorage;
  const savedSession = globalThis.sessionStorage;
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
  assert.equal(getToken(), null);
  assert.doesNotThrow(() => setToken('x'));
  globalThis.localStorage = savedLocal;
  globalThis.sessionStorage = savedSession;
});

test('request sends the token and JSON body', async () => {
  setToken('tok123');
  mockFetch(201, { id: 1 });
  const res = await api.createTransaction({ amount: 10 });
  assert.deepEqual(res, { id: 1 });
  assert.equal(calls[0].url, 'http://localhost:8000/api/transactions');
  assert.equal(calls[0].opts.method, 'POST');
  assert.equal(calls[0].opts.headers.Authorization, 'Bearer tok123');
  assert.equal(calls[0].opts.headers['Content-Type'], 'application/json');
  assert.equal(calls[0].opts.body, '{"amount":10}');
});

test('request without token or body', async () => {
  mockFetch(200, []);
  await api.listBudgets();
  assert.equal(calls[0].opts.headers.Authorization, undefined);
  assert.equal(calls[0].opts.body, undefined);
});

test('204 returns null', async () => {
  mockFetch(204);
  assert.equal(await api.deleteTransaction(5), null);
  assert.equal(calls[0].url, 'http://localhost:8000/api/transactions/5');
  assert.equal(calls[0].opts.method, 'DELETE');
});

test('errors carry the server message and status', async () => {
  mockFetch(401, { detail: 'Wrong email or password' });
  await assert.rejects(api.login('a@b.co', 'x'), (err) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 401);
    assert.equal(err.message, 'Wrong email or password');
    return true;
  });
});

test('network failure gives a friendly message', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(request('/api/health'), (err) => err.status === 0 && /Cannot reach the server/.test(err.message));
});

test('error with no JSON body', async () => {
  mockFetch(500);
  await assert.rejects(api.me(), (err) => err.status === 500 && /server had a problem/.test(err.message));
});

test('errorMessage reads validation errors', () => {
  assert.equal(errorMessage({ detail: [{ msg: 'Value error, Enter a valid email address' }] }, 422), 'Enter a valid email address');
  assert.equal(errorMessage({ detail: [{}] }, 422), 'Invalid input');
  assert.equal(errorMessage(null, 400), 'Something went wrong. Please try again.');
});

test('login and register send the remember choice', async () => {
  mockFetch(200, {});
  await api.login('a@b.co', 'secret123', true);
  await api.login('a@b.co', 'secret123');
  await api.register('A', 'a@b.co', 'secret123', false);
  await api.register('A', 'a@b.co', 'secret123');
  assert.deepEqual(calls.map((c) => JSON.parse(c.opts.body).remember), [true, false, false, true]);
});

test('all api helpers hit the right paths', async () => {
  mockFetch(200, {});
  await api.register('A', 'a@b.co', 'secret123');
  await api.me();
  await api.updateMe('B');
  await api.changePassword('old12345', 'new12345');
  await api.deleteAccount('old12345');
  await api.setNextMoneyDate('2026-11-25');
  await api.updateTransaction(7, { amount: 5 });
  await api.setAvatar('data:image/jpeg;base64,AAAA');
  await api.removeAvatar();
  await api.listTransactions();
  await api.setBudget('food', 500);
  await api.deleteBudget('food');
  assert.deepEqual(
    calls.map((c) => `${c.opts.method} ${c.url.replace('http://localhost:8000', '')}`),
    [
      'POST /api/auth/register',
      'GET /api/auth/me',
      'PATCH /api/auth/me',
      'POST /api/auth/change-password',
      'POST /api/auth/delete-account',
      'PUT /api/auth/me/next-money',
      'PUT /api/transactions/7',
      'PUT /api/auth/me/avatar',
      'DELETE /api/auth/me/avatar',
      'GET /api/transactions',
      'PUT /api/budgets/food',
      'DELETE /api/budgets/food',
    ]
  );
  assert.equal(calls[3].opts.body, '{"currentPassword":"old12345","newPassword":"new12345"}');
});
