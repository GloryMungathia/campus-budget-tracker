const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function nameError(name) {
  if (!name.trim()) return 'Enter your name';
  if (name.trim().length > 80) return 'Name must be 80 characters or less';
  return '';
}

export function emailError(email) {
  if (!email.trim()) return 'Enter your email';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email, like name@example.com';
  return '';
}

export function passwordError(password) {
  if (!password) return 'Enter a password';
  if (password.length < 8) return 'Use at least 8 characters';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Use at least one letter and one number';
  return '';
}

export function confirmError(password, confirm) {
  if (!confirm) return 'Type your password again';
  if (password !== confirm) return 'Passwords do not match';
  return '';
}

function clean(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
}

export function validateSignup({ name, email, password, confirm }) {
  return clean({
    name: nameError(name),
    email: emailError(email),
    password: passwordError(password),
    confirm: confirmError(password, confirm),
  });
}

export function validateLogin({ email, password }) {
  return clean({
    email: emailError(email),
    password: password ? '' : 'Enter your password',
  });
}

export function validatePasswordChange({ current, next, confirm }) {
  return clean({
    current: current ? '' : 'Enter your current password',
    next: passwordError(next) || (next && next === current ? 'New password must be different' : ''),
    confirm: confirmError(next, confirm),
  });
}
