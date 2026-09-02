import { Menu, Plus } from 'lucide-react';

const TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Your money at a glance this month' },
  budgets: { title: 'Budgets', subtitle: 'Set limits and track spending per category' },
  insights: { title: 'Insights', subtitle: 'See where your money goes' },
  history: { title: 'History', subtitle: 'Every transaction you have logged' },
};

export function Header({ view, onMenuClick, onAddClick }) {
  const { title, subtitle } = TITLES[view];
  return (
    <header className="header">
      <button onClick={onMenuClick} className="menu-btn" aria-label="Open menu">
        <Menu className="icon-lg" />
      </button>
      <div>
        <h2 className="header-title">{title}</h2>
        <p className="header-sub">{subtitle}</p>
      </div>
      <div className="header-spacer" />
      <button onClick={onAddClick} className="btn-primary">
        <Plus className="icon-sm" />
        <span className="header-add-full">Add Transaction</span>
        <span className="header-add-short">Add</span>
      </button>
    </header>
  );
}
