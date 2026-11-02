import { useCallback, useState } from 'react';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { StoreProvider, useStore } from '@/store/StoreContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { Dashboard } from '@/views/Dashboard';
import { Budgets } from '@/views/Budgets';
import { Insights } from '@/views/Insights';
import { History } from '@/views/History';
import { AuthScreen } from '@/views/AuthScreen';
import { Account } from '@/views/Account';

function FullPageLoader({ text }) {
  return (
    <div className="page-loader">
      <Loader2 className="icon-xl spin" />
      <p>{text}</p>
    </div>
  );
}

function ErrorBanner() {
  const { error, clearError, reload } = useStore();
  if (!error) return null;
  return (
    <div className="error-banner" role="alert">
      <AlertCircle className="icon-md" />
      <p>{error}</p>
      <button onClick={reload} className="btn-ghost">Retry</button>
      <button onClick={clearError} className="modal-close" aria-label="Dismiss">
        <X className="icon-sm" />
      </button>
    </div>
  );
}

function MainApp() {
  const { loading } = useStore();
  const [view, setView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [editing, setEditing] = useState(null);

  function navigate(v) {
    setView(v);
    setMenuOpen(false);
  }

  function openAdd(defaultType = 'expense') {
    setEditing(null);
    setModalType(defaultType);
    setModalOpen(true);
  }

  const closeModal = useCallback(() => setModalOpen(false), []);

  function openEdit(transaction) {
    setEditing(transaction);
    setModalOpen(true);
  }

  return (
    <div className="app-shell">
      <Sidebar current={view} onNavigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="main-area">
        <Header view={view} onMenuClick={() => setMenuOpen(true)} onAddClick={() => openAdd('expense')} />

        <main className="main-content">
          <div key={view} className="animate-fade-in page-container">
            <ErrorBanner />
            {loading ? (
              <FullPageLoader text="Loading your budget…" />
            ) : (
              <>
                {view === 'dashboard' && <Dashboard onNavigate={navigate} onAddClick={openAdd} onEdit={openEdit} />}
                {view === 'budgets' && <Budgets />}
                {view === 'insights' && <Insights />}
                {view === 'history' && <History onEdit={openEdit} />}
                {view === 'account' && <Account />}
              </>
            )}
          </div>
        </main>
      </div>

      <AddTransactionModal open={modalOpen} onClose={closeModal} defaultType={modalType} editing={editing} />
    </div>
  );
}

function Gate() {
  const { user, checking } = useAuth();
  if (checking) return <FullPageLoader text="Checking your session…" />;
  if (!user) return <AuthScreen />;
  return (
    <StoreProvider key={user.id}>
      <MainApp />
    </StoreProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

export default App;
