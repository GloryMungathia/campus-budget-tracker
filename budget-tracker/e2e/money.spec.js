import { test, expect } from '@playwright/test';
import { addTransaction, isoInDays, setNextMoney, signUp } from './helpers.js';

test('setting the next money date shows the safe amount per day', async ({ page }) => {
  await signUp(page);
  await addTransaction(page, { type: 'income', amount: 10000, category: 'HELB Loan', nextMoney: isoInDays(10) });
  await expect(page.getByTestId('per-day')).toHaveText('KSh 1,000');
  await page.getByRole('button', { name: 'Change next money date' }).click();
  await setNextMoney(page, isoInDays(20));
  await expect(page.getByTestId('per-day')).toHaveText('KSh 500');
  await page.reload();
  await expect(page.getByTestId('per-day')).toHaveText('KSh 500');
});

test('adding an expense shows its cost in days and warns when it is too much', async ({ page }) => {
  await signUp(page);
  await addTransaction(page, { type: 'income', amount: 10000, category: 'HELB Loan', nextMoney: isoInDays(10) });
  await page.getByRole('button', { name: 'Add Expense' }).click();
  await page.getByLabel('Amount (KSh)').fill('3000');
  await expect(page.getByTestId('cost-days')).toContainText('3 days');
  await page.getByLabel('Amount (KSh)').fill('20000');
  await expect(page.getByTestId('cost-days')).toContainText('more than');
});

test('spending more than the daily amount today shows a warning', async ({ page }) => {
  await signUp(page);
  await addTransaction(page, { type: 'income', amount: 10000, category: 'HELB Loan', nextMoney: isoInDays(10) });
  await addTransaction(page, { type: 'expense', amount: 1500, category: 'Food & Canteen' });
  await expect(page.getByText(/over today/)).toBeVisible();
  await expect(page.getByText('Money you have left').locator('..').locator('..')).toContainText('KSh 8,500');
});

test('adding, editing and deleting a transaction updates the totals', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await signUp(page);
  await addTransaction(page, { type: 'income', amount: 5000, category: 'HELB Loan' });
  await addTransaction(page, { type: 'expense', amount: 800, category: 'Food & Canteen' });
  const left = page.locator('.balance-amount');
  await expect(left).toHaveText('KSh 4,200');

  await page.getByRole('button', { name: 'Edit Food & Canteen' }).first().click();
  await expect(page.getByText('Edit Transaction')).toBeVisible();
  await page.getByLabel('Amount (KSh)').fill('1000');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(left).toHaveText('KSh 4,000');

  await page.getByRole('button', { name: 'History' }).first().click();
  await page.getByRole('button', { name: 'Delete transaction' }).first().click();
  await page.getByRole('button', { name: 'Dashboard' }).first().click();
  await expect(page.locator('.balance-amount')).not.toHaveText('KSh 4,000');
});

test('one student cannot see another student’s money', async ({ page, browser }) => {
  await signUp(page, { name: 'Achieng' });
  await addTransaction(page, { type: 'income', amount: 7777, category: 'HELB Loan' });
  await expect(page.locator('.balance-amount')).toHaveText('KSh 7,777');

  const other = await browser.newContext();
  const second = await other.newPage();
  await signUp(second, { name: 'Brian' });
  await expect(second.locator('.balance-amount')).toHaveText('KSh 0');
  await expect(second.getByText('7,777')).toHaveCount(0);
  await other.close();
});

test('the app works on a phone screen @phone', async ({ page }) => {
  await signUp(page);
  await addTransaction(page, { type: 'income', amount: 6000, category: 'HELB Loan', nextMoney: isoInDays(6) });
  await expect(page.getByTestId('per-day')).toHaveText('KSh 1,000');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
