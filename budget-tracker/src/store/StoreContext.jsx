import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/store/AuthContext';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) logout();
      setError(err.message);
      throw err;
    },
    [logout]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [txs, bs] = await Promise.all([api.listTransactions(), api.listBudgets()]);
      setTransactions(txs);
      setBudgets(bs);
    } catch (err) {
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    load();
  }, [load]);

  const addTransaction = async (t) => {
    try {
      const saved = await api.createTransaction(t);
      setTransactions((prev) =>
        [saved, ...prev].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      );
      return saved;
    } catch (err) {
      return handleError(err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      return handleError(err);
    }
  };

  const setBudget = async (categoryId, limit) => {
    try {
      const saved = await api.setBudget(categoryId, limit);
      setBudgets((prev) => {
        const exists = prev.some((b) => b.categoryId === categoryId);
        if (exists) return prev.map((b) => (b.categoryId === categoryId ? saved : b));
        return [...prev, saved];
      });
      return saved;
    } catch (err) {
      return handleError(err);
    }
  };

  const removeBudget = async (categoryId) => {
    try {
      await api.deleteBudget(categoryId);
      setBudgets((prev) => prev.filter((b) => b.categoryId !== categoryId));
    } catch (err) {
      return handleError(err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        transactions,
        budgets,
        loading,
        error,
        clearError: () => setError(''),
        reload: load,
        addTransaction,
        deleteTransaction,
        setBudget,
        removeBudget,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
