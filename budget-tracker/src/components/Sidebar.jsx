import { X, LayoutDashboard, Target, PieChart, History, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'insights', label: 'Insights', icon: PieChart },
  { id: 'history', label: 'History', icon: History },
];

export function Sidebar({ current, onNavigate, open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${open ? '' : 'hidden'}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? '' : 'closed'}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-left">
            <div className="brand-icon">
              <Wallet className="icon-lg" style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 className="brand-title">TumaTrack</h1>
              <p className="brand-sub">Campus Budget Tracker</p>
            </div>
          </div>
          <button onClick={onClose} className="sidebar-close" aria-label="Close menu">
            <X className="icon-md" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-label">Menu</p>
          {NAV_ITEMS.map((item) => {
            const active = current === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <Icon className="icon" />
                {item.label}
                {active && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-card">
            <p className="sidebar-card-title">Stay on budget</p>
            <p className="sidebar-card-text">Track every shilling. A clear view of your money means smarter spending.</p>
          </div>
          <p className="sidebar-made">Made for Kenyan campus students</p>
        </div>
      </aside>
    </>
  );
}
