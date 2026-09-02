function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function genId() {
  return Math.random().toString(36).slice(2, 11);
}

const SEED_TRANSACTIONS = [
  { id: genId(), type: 'income', categoryId: 'helb', amount: 45000, date: daysAgo(28), note: 'HELB disbursement this semester', createdAt: daysAgo(28) },
  { id: genId(), type: 'income', categoryId: 'pocket_money', amount: 8000, date: daysAgo(25), note: 'From mum', createdAt: daysAgo(25) },
  { id: genId(), type: 'income', categoryId: 'side_hustle', amount: 3500, date: daysAgo(14), note: 'Design gig for a church poster', createdAt: daysAgo(14) },
  { id: genId(), type: 'income', categoryId: 'pocket_money', amount: 5000, date: daysAgo(8), note: 'Dad sent via M-Pesa', createdAt: daysAgo(8) },
  { id: genId(), type: 'income', categoryId: 'side_hustle', amount: 2000, date: daysAgo(3), note: 'Typing assignment', createdAt: daysAgo(3) },

  { id: genId(), type: 'expense', categoryId: 'rent', amount: 12000, date: daysAgo(27), note: 'Hostel rent for the month', createdAt: daysAgo(27) },
  { id: genId(), type: 'expense', categoryId: 'food', amount: 1850, date: daysAgo(26), note: 'Canteen lunch + dinner', createdAt: daysAgo(26) },
  { id: genId(), type: 'expense', categoryId: 'transport', amount: 120, date: daysAgo(26), note: 'Matatu to town', createdAt: daysAgo(26) },
  { id: genId(), type: 'expense', categoryId: 'airtime', amount: 500, date: daysAgo(25), note: 'Safaricom data bundle 500MB', createdAt: daysAgo(25) },
  { id: genId(), type: 'expense', categoryId: 'food', amount: 2400, date: daysAgo(24), note: 'Weekend food batch', createdAt: daysAgo(24) },
  { id: genId(), type: 'expense', categoryId: 'transport', amount: 200, date: daysAgo(22), note: 'To and from town', createdAt: daysAgo(22) },
  { id: genId(), type: 'expense', categoryId: 'entertainment', amount: 800, date: daysAgo(20), note: 'Netflix split with roommate', createdAt: daysAgo(20) },
  { id: genId(), type: 'expense', categoryId: 'books', amount: 1500, date: daysAgo(18), note: 'Photocopy handouts & printing', createdAt: daysAgo(18) },
  { id: genId(), type: 'expense', categoryId: 'food', amount: 2200, date: daysAgo(17), note: 'Canteen meals', createdAt: daysAgo(17) },
  { id: genId(), type: 'expense', categoryId: 'airtime', amount: 1000, date: daysAgo(15), note: 'Monthly data bundle', createdAt: daysAgo(15) },
  { id: genId(), type: 'expense', categoryId: 'transport', amount: 300, date: daysAgo(12), note: 'Matatu to campus and back x3', createdAt: daysAgo(12) },
  { id: genId(), type: 'expense', categoryId: 'food', amount: 2600, date: daysAgo(10), note: 'Weekly groceries', createdAt: daysAgo(10) },
  { id: genId(), type: 'expense', categoryId: 'health', amount: 600, date: daysAgo(9), note: 'Pharmacy — flu meds', createdAt: daysAgo(9) },
  { id: genId(), type: 'expense', categoryId: 'transport', amount: 150, date: daysAgo(6), note: 'Matatu to town', createdAt: daysAgo(6) },
  { id: genId(), type: 'expense', categoryId: 'food', amount: 1950, date: daysAgo(5), note: 'Canteen lunch week', createdAt: daysAgo(5) },
  { id: genId(), type: 'expense', categoryId: 'shopping', amount: 1200, date: daysAgo(4), note: 'Toiletries', createdAt: daysAgo(4) },
  { id: genId(), type: 'expense', categoryId: 'transport', amount: 100, date: daysAgo(2), note: 'Boda boda', createdAt: daysAgo(2) },
  { id: genId(), type: 'expense', categoryId: 'food', amount: 2100, date: daysAgo(1), note: 'Weekend food', createdAt: daysAgo(1) },
  { id: genId(), type: 'expense', categoryId: 'airtime', amount: 250, date: daysAgo(0), note: 'Top up for calls', createdAt: daysAgo(0) },
];

const SEED_BUDGETS = [
  { categoryId: 'food', limit: 12000 },
  { categoryId: 'transport', limit: 2000 },
  { categoryId: 'airtime', limit: 2000 },
  { categoryId: 'entertainment', limit: 3000 },
  { categoryId: 'books', limit: 3000 },
  { categoryId: 'health', limit: 2000 },
  { categoryId: 'shopping', limit: 3000 },
  { categoryId: 'rent', limit: 12000 },
];

export function getSeedTransactions() {
  return SEED_TRANSACTIONS.map((t) => ({ ...t }));
}

export function getSeedBudgets() {
  return SEED_BUDGETS.map((b) => ({ ...b }));
}
