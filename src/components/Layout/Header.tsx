import { Sun, Moon, LogOut, User } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
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
    try { await authApi.logout(); } catch { /* proceed with local logout */ }
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 flex items-center justify-end gap-3 px-6 border-b dark:border-dark-border border-light-border dark:bg-dark-sidebar bg-light-sidebar">
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-btn)] dark:hover:bg-dark-hover hover:bg-light-hover transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
            <User size={14} className="text-accent" />
          </div>
          <span className="text-sm dark:text-dark-text text-light-text">
            {user?.username ?? 'User'}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-[var(--radius-card)] border shadow-lg dark:bg-dark-card dark:border-dark-border bg-light-card border-light-border z-50">
            <div className="px-3 py-2 border-b dark:border-dark-border border-light-border">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">{user?.email}</p>
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
