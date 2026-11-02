import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nameError,
  emailError,
  passwordError,
  confirmError,
  validateSignup,
  validateLogin,
  validatePasswordChange,
} from '../src/lib/validation.js';

test('name rules', () => {
  assert.equal(nameError(''), 'Enter your name');
  assert.equal(nameError('   '), 'Enter your name');
  assert.equal(nameError('x'.repeat(81)), 'Name must be 80 characters or less');
  assert.equal(nameError('Wanjiku'), '');
});

test('email rules', () => {
  assert.equal(emailError(''), 'Enter your email');
  assert.match(emailError('wanjiku'), /valid email/);
  assert.match(emailError('wanjiku@gmail'), /valid email/);
  assert.equal(emailError(' wanjiku@gmail.com '), '');
});

test('password rules', () => {
  assert.equal(passwordError(''), 'Enter a password');
  assert.equal(passwordError('abc1'), 'Use at least 8 characters');
  assert.equal(passwordError('abcdefgh'), 'Use at least one letter and one number');
  assert.equal(passwordError('12345678'), 'Use at least one letter and one number');
  assert.equal(passwordError('secret123'), '');
});

test('confirm password rules', () => {
  assert.equal(confirmError('secret123', ''), 'Type your password again');
  assert.equal(confirmError('secret123', 'secret124'), 'Passwords do not match');
  assert.equal(confirmError('secret123', 'secret123'), '');
});

test('sign up form', () => {
  assert.deepEqual(Object.keys(validateSignup({ name: '', email: '', password: '', confirm: '' })), ['name', 'email', 'password', 'confirm']);
  assert.deepEqual(validateSignup({ name: 'A', email: 'a@b.co', password: 'secret123', confirm: 'secret123' }), {});
});

test('log in form', () => {
  assert.deepEqual(validateLogin({ email: '', password: '' }), { email: 'Enter your email', password: 'Enter your password' });
  assert.deepEqual(validateLogin({ email: 'a@b.co', password: 'x' }), {});
});

test('change password form', () => {
  assert.deepEqual(Object.keys(validatePasswordChange({ current: '', next: '', confirm: '' })), ['current', 'next', 'confirm']);
  assert.equal(validatePasswordChange({ current: 'secret123', next: 'secret123', confirm: 'secret123' }).next, 'New password must be different');
  assert.deepEqual(validatePasswordChange({ current: 'secret123', next: 'newpass456', confirm: 'newpass456' }), {});
});
