import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  add: (message: string, type?: ToastType, duration?: number) => void;
  remove: (id: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

let nextId = 0;
const MAX_TOASTS = 3;
const DEFAULT_DURATION = 4000;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  add: (message, type = 'error', duration = DEFAULT_DURATION) => {
    const id = ++nextId;
    set((s) => {
      const next = [...s.toasts, { id, message, type, duration }];
      return { toasts: next.slice(-MAX_TOASTS) };
    });
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  success: (message) => {
    const id = ++nextId;
    set((s) => {
      const next = [
        ...s.toasts,
        { id, message, type: 'success' as const, duration: DEFAULT_DURATION },
      ];
      return { toasts: next.slice(-MAX_TOASTS) };
    });
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      DEFAULT_DURATION
    );
  },
  error: (message) => {
    const id = ++nextId;
    set((s) => {
      const next = [
        ...s.toasts,
        { id, message, type: 'error' as const, duration: DEFAULT_DURATION },
      ];
      return { toasts: next.slice(-MAX_TOASTS) };
    });
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      DEFAULT_DURATION
    );
  },
  warning: (message) => {
    const id = ++nextId;
    set((s) => {
      const next = [
        ...s.toasts,
        { id, message, type: 'warning' as const, duration: DEFAULT_DURATION },
      ];
      return { toasts: next.slice(-MAX_TOASTS) };
    });
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      DEFAULT_DURATION
    );
  },
  info: (message) => {
    const id = ++nextId;
    set((s) => {
      const next = [
        ...s.toasts,
        { id, message, type: 'info' as const, duration: DEFAULT_DURATION },
      ];
      return { toasts: next.slice(-MAX_TOASTS) };
    });
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      DEFAULT_DURATION
    );
  },
}));
