import { createContext, useContext, useState } from 'react';
import { getSeedTransactions, getSeedBudgets } from '@/lib/seed';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [transactions, setTransactions] = useState(getSeedTransactions());
  const [budgets, setBudgets] = useState(getSeedBudgets());

  const addTransaction = (t) => {
    setTransactions((prev) => [
      { ...t, id: Math.random().toString(36).slice(2, 11), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const setBudget = (categoryId, limit) => {
    setBudgets((prev) => {
      const exists = prev.find((b) => b.categoryId === categoryId);
      if (exists) return prev.map((b) => (b.categoryId === categoryId ? { ...b, limit } : b));
      return [...prev, { categoryId, limit }];
    });
  };

  return (
    <StoreContext.Provider value={{ transactions, budgets, addTransaction, deleteTransaction, setBudget }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
