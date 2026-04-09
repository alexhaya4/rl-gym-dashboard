import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FlaskConical, Grid3X3, Database, Package, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  label: string;
  path: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// Static navigable pages for search - a full search would hit APIs per category
const pages: SearchResult[] = [
  { label: 'Dashboard', path: '/', category: 'Pages', icon: Grid3X3 },
  { label: 'Environments', path: '/environments', category: 'Environments', icon: Grid3X3 },
  {
    label: 'Vec Environments',
    path: '/vec-environments',
    category: 'Environments',
    icon: Grid3X3,
  },
  {
    label: 'Custom Environments',
    path: '/custom-environments',
    category: 'Environments',
    icon: Grid3X3,
  },
  { label: 'Training', path: '/training', category: 'Training', icon: Play },
  { label: 'Distributed Training', path: '/distributed', category: 'Training', icon: Play },
  { label: 'Multi-Agent', path: '/multi-agent', category: 'Training', icon: Play },
  { label: 'PBT', path: '/pbt', category: 'Training', icon: Play },
  { label: 'Experiments', path: '/experiments', category: 'Experiments', icon: FlaskConical },
  { label: 'Comparison', path: '/comparison', category: 'Experiments', icon: FlaskConical },
  { label: 'Evaluation', path: '/evaluation', category: 'Experiments', icon: FlaskConical },
  { label: 'Benchmarks', path: '/benchmarks', category: 'Experiments', icon: FlaskConical },
  { label: 'Optimization', path: '/optimization', category: 'Experiments', icon: FlaskConical },
  { label: 'Models', path: '/models', category: 'Models', icon: Package },
  { label: 'A/B Testing', path: '/ab-testing', category: 'Models', icon: Package },
  { label: 'Inference', path: '/inference', category: 'Models', icon: Package },
  { label: 'Datasets', path: '/datasets', category: 'Data', icon: Database },
  { label: 'Machine Learning', path: '/ml', category: 'Data', icon: Database },
  { label: 'Videos', path: '/videos', category: 'Data', icon: Database },
  { label: 'Artifacts', path: '/artifacts', category: 'Data', icon: Database },
];

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIdx(0);
    }
  }, [open]);

  const results = query
    ? pages.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
    : pages.slice(0, 8);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.category] ||= []).push(r);
    return acc;
  }, {});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(results.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = results[selectedIdx];
        if (item) {
          navigate(item.path);
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, results, selectedIdx, navigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex items-start justify-center pt-24 px-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl rounded-[var(--radius-card)] border shadow-2xl dark:bg-dark-card dark:border-dark-border bg-light-card border-light-border overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b dark:border-dark-border border-light-border">
              <Search
                size={16}
                className="dark:text-dark-text-secondary text-light-text-secondary flex-shrink-0"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder="Search pages..."
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIdx(0);
                }}
                className="flex-1 py-4 bg-transparent outline-none text-sm dark:text-dark-text text-light-text"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-[var(--radius-btn)] dark:hover:bg-dark-hover hover:bg-light-hover cursor-pointer"
              >
                <X size={14} className="dark:text-dark-text-secondary text-light-text-secondary" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider dark:text-dark-text-secondary text-light-text-secondary">
                    {category}
                  </div>
                  {items.map((item) => {
                    const globalIdx = results.indexOf(item);
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIdx(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-btn)] text-sm cursor-pointer transition-colors ${
                          globalIdx === selectedIdx
                            ? 'bg-accent/15 text-accent'
                            : 'dark:text-dark-text text-light-text'
                        }`}
                      >
                        <item.icon size={14} className="flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm dark:text-dark-text-secondary text-light-text-secondary">
                  No results for "{query}"
                </p>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t dark:border-dark-border border-light-border text-[10px] dark:text-dark-text-secondary text-light-text-secondary">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
