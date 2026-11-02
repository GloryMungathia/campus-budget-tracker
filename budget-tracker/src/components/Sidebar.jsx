import { X, LayoutDashboard, Target, PieChart, History, Wallet, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { Avatar } from './Avatar';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'insights', label: 'Insights', icon: PieChart },
  { id: 'history', label: 'History', icon: History },
  { id: 'account', label: 'Account', icon: UserRound },
];

export function Sidebar({ current, onNavigate, open, onClose }) {
  const { user, logout } = useAuth();
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
          {user && (
            <div className="sidebar-user">
              <button className="sidebar-avatar" onClick={() => onNavigate('account')} aria-label="Open account">
                <Avatar user={user} size={36} />
              </button>
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user.name}</p>
                <p className="sidebar-user-email">{user.email}</p>
              </div>
              <button onClick={logout} className="sidebar-logout" aria-label="Log out" title="Log out">
                <LogOut className="icon-sm" />
              </button>
            </div>
          )}
          <p className="sidebar-made">Made for Kenyan campus students</p>
        </div>
      </aside>
    </>
  );
}
