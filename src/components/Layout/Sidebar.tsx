import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid3X3,
  Play,
  FlaskConical,
  BarChart3,
  Package,
  GitBranch,
  Cpu,
  Zap,
  Video,
  Database,
  Brain,
  Network,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/environments', icon: Grid3X3, label: 'Environments' },
  { to: '/training', icon: Play, label: 'Training' },
  { to: '/experiments', icon: FlaskConical, label: 'Experiments' },
  { to: '/benchmarks', icon: BarChart3, label: 'Benchmarks' },
  { to: '/models', icon: Package, label: 'Models' },
  { to: '/ab-testing', icon: GitBranch, label: 'A/B Testing' },
  { to: '/algorithms', icon: Cpu, label: 'Algorithms' },
  { to: '/inference', icon: Zap, label: 'Inference' },
  { to: '/videos', icon: Video, label: 'Videos' },
  { to: '/datasets', icon: Database, label: 'Datasets' },
  { to: '/ml', icon: Brain, label: 'Machine Learning' },
  { to: '/distributed', icon: Network, label: 'Distributed' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40 flex flex-col border-r transition-all duration-200
        dark:bg-dark-sidebar dark:border-dark-border
        bg-light-sidebar border-light-border
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      <div className="flex items-center gap-3 px-4 h-14 border-b dark:border-dark-border border-light-border">
        <div className="w-8 h-8 rounded-[var(--radius-btn)] bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">RL</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm whitespace-nowrap">RL Gym</span>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-[var(--radius-btn)] text-sm transition-colors
              ${
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'dark:text-dark-text-secondary dark:hover:bg-dark-hover dark:hover:text-dark-text text-light-text-secondary hover:bg-light-hover hover:text-light-text'
              }
              ${collapsed ? 'justify-center' : ''}
              `
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t dark:border-dark-border border-light-border dark:text-dark-text-secondary text-light-text-secondary dark:hover:bg-dark-hover hover:bg-light-hover transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
