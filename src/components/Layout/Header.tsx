import { Sun, Moon, LogOut, User, Menu, Search } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const roleBadgeStyle = (role: string | null) => {
  switch (role) {
    case 'admin':
      return 'bg-red-500/15 text-red-400';
    case 'member':
      return 'bg-blue-500/15 text-blue-400';
    default:
      return 'dark:bg-dark-border dark:text-dark-text-secondary bg-light-border text-light-text-secondary';
  }
};

interface HeaderProps {
  onMobileMenuClick?: () => void;
  onSearchClick?: () => void;
}

export function Header({ onMobileMenuClick, onSearchClick }: HeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* proceed with local logout */
    }
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 flex items-center gap-3 px-4 sm:px-6 border-b dark:border-dark-border border-light-border dark:bg-dark-sidebar bg-light-sidebar">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuClick}
        className="md:hidden p-2 rounded-[var(--radius-btn)] dark:text-dark-text-secondary dark:hover:bg-dark-hover text-light-text-secondary hover:bg-light-hover transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1" />

      {/* Global search trigger */}
      <button
        onClick={onSearchClick}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-btn)] border dark:border-dark-border border-light-border dark:text-dark-text-secondary text-light-text-secondary dark:hover:bg-dark-hover hover:bg-light-hover transition-colors cursor-pointer"
      >
        <Search size={14} />
        <span className="text-xs">Search...</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded dark:bg-dark-border bg-light-border">
          ⌘K
        </span>
      </button>

      {/* Mobile search icon only */}
      <button
        onClick={onSearchClick}
        className="sm:hidden p-2 rounded-[var(--radius-btn)] dark:text-dark-text-secondary dark:hover:bg-dark-hover text-light-text-secondary hover:bg-light-hover transition-colors cursor-pointer"
        aria-label="Search"
      >
        <Search size={18} />
      </button>

      <button
        onClick={toggleTheme}
        className="p-2 rounded-[var(--radius-btn)] dark:text-dark-text-secondary dark:hover:bg-dark-hover text-light-text-secondary hover:bg-light-hover transition-colors cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-[var(--radius-btn)] dark:hover:bg-dark-hover hover:bg-light-hover transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-accent" />
          </div>
          <span className="hidden sm:inline text-sm dark:text-dark-text text-light-text">
            {user?.username ?? 'User'}
          </span>
          {role && (
            <span
              className={`hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full ${roleBadgeStyle(role)}`}
            >
              {role}
            </span>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-[var(--radius-card)] border shadow-lg dark:bg-dark-card dark:border-dark-border bg-light-card border-light-border z-50">
            <div className="px-3 py-2 border-b dark:border-dark-border border-light-border">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{user?.username}</p>
                {role && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full ${roleBadgeStyle(role)}`}
                  >
                    {role}
                  </span>
                )}
              </div>
              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
