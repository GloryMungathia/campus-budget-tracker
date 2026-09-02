export const CATEGORIES = [
  { id: 'food', name: 'Food & Canteen', type: 'expense', icon: 'Utensils', color: '#f59e0b' },
  { id: 'transport', name: 'Matatu Fare', type: 'expense', icon: 'Bus', color: '#3b82f6' },
  { id: 'rent', name: 'Rent / Hostel', type: 'expense', icon: 'Home', color: '#8b5cf6' },
  { id: 'airtime', name: 'Airtime & Data', type: 'expense', icon: 'Smartphone', color: '#ec4899' },
  { id: 'books', name: 'Books & Supplies', type: 'expense', icon: 'BookOpen', color: '#06b6d4' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: 'Music', color: '#f43f5e' },
  { id: 'health', name: 'Health & Medical', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
  { id: 'shopping', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#6366f1' },
  { id: 'other_expense', name: 'Other Expense', type: 'expense', icon: 'Receipt', color: '#64748b' },

  { id: 'helb', name: 'HELB Loan', type: 'income', icon: 'GraduationCap', color: '#059669' },
  { id: 'pocket_money', name: 'Pocket Money', type: 'income', icon: 'Wallet', color: '#0d9488' },
  { id: 'side_hustle', name: 'Side Hustle', type: 'income', icon: 'Briefcase', color: '#14b8a6' },
  { id: 'other_income', name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#16a34a' },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === 'expense');
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type === 'income');

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}
