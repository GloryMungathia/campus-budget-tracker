import { useState } from 'react';
import { StoreProvider } from '@/store/StoreContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { Dashboard } from '@/views/Dashboard';
import { Budgets } from '@/views/Budgets';
import { Insights } from '@/views/Insights';
import { History } from '@/views/History';

function App() {
  const [view, setView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');

  function navigate(v) {
    setView(v);
    setMenuOpen(false);
  }

  function openAdd(defaultType = 'expense') {
    setModalType(defaultType);
    setModalOpen(true);
  }

  return (
    <StoreProvider>
      <div className="app-shell">
        <Sidebar current={view} onNavigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="main-area">
          <Header view={view} onMenuClick={() => setMenuOpen(true)} onAddClick={() => openAdd('expense')} />

          <main className="main-content">
            <div key={view} className="animate-fade-in page-container">
              {view === 'dashboard' && <Dashboard onNavigate={navigate} onAddClick={() => openAdd('expense')} />}
              {view === 'budgets' && <Budgets />}
              {view === 'insights' && <Insights />}
              {view === 'history' && <History />}
            </div>
          </main>
        </div>

        <AddTransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultType={modalType}
        />
      </div>
    </StoreProvider>
  );
}

export default App;
