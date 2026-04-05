import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
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
  GitCompare,
  Archive,
  Users,
  Target,
  TrendingUp,
  Workflow,
  Building,
  CreditCard,
  Layers,
  ClipboardCheck,
  FileText,
  Code,
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
  { to: '/environments', icon: Grid3X3, label: 'Environments', adminOnly: false },
  { to: '/vec-environments', icon: Layers, label: 'Vec Environments', adminOnly: false },
  { to: '/custom-environments', icon: Code, label: 'Custom Envs', adminOnly: false },
  { to: '/training', icon: Play, label: 'Training', adminOnly: false },
  { to: '/distributed', icon: Network, label: 'Distributed', adminOnly: false },
  { to: '/multi-agent', icon: Users, label: 'Multi-Agent', adminOnly: false },
  { to: '/experiments', icon: FlaskConical, label: 'Experiments', adminOnly: false },
  { to: '/comparison', icon: GitCompare, label: 'Comparison', adminOnly: false },
  { to: '/evaluation', icon: ClipboardCheck, label: 'Evaluation', adminOnly: false },
  { to: '/benchmarks', icon: BarChart3, label: 'Benchmarks', adminOnly: false },
  { to: '/optimization', icon: Target, label: 'Optimization', adminOnly: false },
  { to: '/pbt', icon: TrendingUp, label: 'PBT', adminOnly: false },
  { to: '/models', icon: Package, label: 'Models', adminOnly: false },
  { to: '/ab-testing', icon: GitBranch, label: 'A/B Testing', adminOnly: false },
  { to: '/algorithms', icon: Cpu, label: 'Algorithms', adminOnly: false },
  { to: '/inference', icon: Zap, label: 'Inference', adminOnly: false },
  { to: '/videos', icon: Video, label: 'Videos', adminOnly: false },
  { to: '/datasets', icon: Database, label: 'Datasets', adminOnly: false },
  { to: '/ml', icon: Brain, label: 'Machine Learning', adminOnly: false },
  { to: '/artifacts', icon: Archive, label: 'Artifacts', adminOnly: false },
  { to: '/pipelines', icon: Workflow, label: 'Pipelines', adminOnly: false },
  { to: '/organizations', icon: Building, label: 'Organizations', adminOnly: false },
  { to: '/billing', icon: CreditCard, label: 'Billing', adminOnly: true },
  { to: '/rbac', icon: Shield, label: 'Access Control', adminOnly: true },
  { to: '/audit-logs', icon: FileText, label: 'Audit Logs', adminOnly: false },
  { to: '/system-status', icon: Activity, label: 'System Status', adminOnly: false },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'admin';
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);
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
        {!collapsed && <span className="font-semibold text-sm whitespace-nowrap">RL Gym</span>}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
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
