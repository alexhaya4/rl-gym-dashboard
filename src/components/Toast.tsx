import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, type ToastType } from '../store/toastStore';

const typeConfig: Record<
  ToastType,
  { bg: string; icon: React.ComponentType<{ size?: number; className?: string }>; bar: string }
> = {
  error: { bg: 'bg-red-600 text-white', icon: AlertCircle, bar: 'bg-red-300' },
  success: { bg: 'bg-emerald-600 text-white', icon: CheckCircle2, bar: 'bg-emerald-300' },
  warning: { bg: 'bg-amber-500 text-white', icon: AlertTriangle, bar: 'bg-amber-200' },
  info: { bg: 'bg-blue-600 text-white', icon: Info, bar: 'bg-blue-300' },
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto flex flex-col items-stretch sm:items-end gap-2 max-w-md sm:max-w-sm pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const cfg = typeConfig[toast.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative overflow-hidden rounded-[var(--radius-card)] shadow-lg text-sm pointer-events-auto ${cfg.bg}`}
            >
              <div className="flex items-start gap-2 px-4 py-3">
                <Icon size={16} className="flex-shrink-0 mt-0.5" />
                <span className="flex-1 break-words">{toast.message}</span>
                <button
                  onClick={() => remove(toast.id)}
                  className="cursor-pointer hover:opacity-80 flex-shrink-0 mt-0.5"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
              <motion.div
                className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
