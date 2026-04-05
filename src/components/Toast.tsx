import { X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

const typeStyles = {
  error: 'bg-red-600 text-white',
  success: 'bg-emerald-600 text-white',
  info: 'bg-blue-600 text-white',
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-[var(--radius-card)] shadow-lg text-sm ${typeStyles[toast.type]}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => remove(toast.id)} className="cursor-pointer hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
