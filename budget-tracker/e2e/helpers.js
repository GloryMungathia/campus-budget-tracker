import { expect } from '@playwright/test';

export function newEmail(tag = 'student') {
  return `${tag}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
}

export function isoInDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function openFresh(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
}

export async function signUp(page, { name = 'Wanjiku Kamau', email = newEmail(), password = 'secret123', remember = true } = {}) {
  await openFresh(page);
  await page.getByLabel('Full name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  const box = page.getByLabel('Keep me logged in for 30 days');
  if (remember) await box.check();
  else await box.uncheck();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Money you have left')).toBeVisible();
  return { name, email, password };
}

export async function logIn(page, { email, password, remember = false }) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  const box = page.getByLabel('Keep me logged in for 30 days');
  if (remember) await box.check();
  else await box.uncheck();
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
}

export async function addTransaction(page, { type, amount, category, nextMoney }) {
  await page.getByRole('button', { name: type === 'income' ? 'Add Income' : 'Add Expense' }).click();
  await page.getByLabel('Amount (KSh)').fill(String(amount));
  await page.getByRole('button', { name: new RegExp(category) }).click();
  if (nextMoney) await page.getByLabel('When does your next money arrive? (optional)').fill(nextMoney);
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.getByText('Saved!')).toBeHidden();
}

export async function setNextMoney(page, iso) {
  await page.getByLabel('When does your next money arrive?').fill(iso);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}
