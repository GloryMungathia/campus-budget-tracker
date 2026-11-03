import { test, expect } from '@playwright/test';
import { logIn, newEmail, openFresh, signUp } from './helpers.js';

test('a new visitor sees sign up and lands on the dashboard after creating an account', async ({ page }) => {
  await openFresh(page);
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await signUp(page);
  await expect(page.getByText('Make your money last')).toBeVisible();
});

test('sign up shows clear errors for empty, weak and mismatched details', async ({ page }) => {
  await openFresh(page);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Enter your name')).toBeVisible();
  await expect(page.getByText('Enter your email')).toBeVisible();
  await page.getByLabel('Full name').fill('Brian');
  await page.getByLabel('Email').fill('brian@');
  await page.getByLabel('Password', { exact: true }).fill('short');
  await page.getByLabel('Confirm password').fill('different1');
  await expect(page.getByText('Enter a valid email, like name@example.com')).toBeVisible();
  await expect(page.getByText('Use at least 8 characters')).toBeVisible();
  await expect(page.getByText('Passwords do not match')).toBeVisible();
});

test('the same email cannot create two accounts', async ({ page }) => {
  const user = await signUp(page);
  await openFresh(page);
  await page.getByLabel('Full name').fill('Someone Else');
  await page.getByLabel('Email').fill(user.email.toUpperCase());
  await page.getByLabel('Password', { exact: true }).fill('another123');
  await page.getByLabel('Confirm password').fill('another123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('An account with this email already exists')).toBeVisible();
});

test('keep me logged in survives closing the browser, unticked does not', async ({ page, browser }) => {
  const user = await signUp(page, { remember: true });
  const saved = await page.context().storageState();
  const again = await browser.newContext({ storageState: saved });
  const reopened = await again.newPage();
  await reopened.goto('/');
  await expect(reopened.getByText('Money you have left')).toBeVisible();
  await again.close();

  await page.getByRole('button', { name: 'Log out' }).click();
  await logIn(page, { email: user.email, password: user.password, remember: false });
  await expect(page.getByText('Money you have left')).toBeVisible();
  const closed = await browser.newContext({ storageState: await page.context().storageState() });
  const fresh = await closed.newPage();
  await fresh.goto('/');
  await expect(fresh.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await closed.close();
});

test('five wrong passwords pause login for 3 minutes', async ({ page }) => {
  const user = await signUp(page);
  await page.getByRole('button', { name: 'Log out' }).click();
  for (let i = 0; i < 5; i++) {
    await logIn(page, { email: user.email, password: `wrongpass${i}` });
    await expect(page.getByText('Wrong email or password')).toBeVisible();
  }
  await logIn(page, { email: user.email, password: user.password });
  await expect(page.getByText('Too many wrong attempts. Try again in 3 minutes.')).toBeVisible();
});

test('a new email address works for a second student', async ({ page }) => {
  await signUp(page, { name: 'Brian Otieno', email: newEmail('brian') });
  await expect(page.getByText('Brian Otieno').first()).toBeVisible();
});
