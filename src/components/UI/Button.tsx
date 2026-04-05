import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98]',
    secondary:
      'dark:bg-dark-card dark:text-dark-text dark:border-dark-border dark:hover:bg-dark-hover bg-light-card text-light-text border border-light-border hover:bg-light-hover',
    ghost:
      'dark:text-dark-text-secondary dark:hover:bg-dark-hover dark:hover:text-dark-text text-light-text-secondary hover:bg-light-hover hover:text-light-text',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-[var(--radius-btn)] gap-1.5',
    md: 'text-sm px-4 py-2 rounded-[var(--radius-btn)] gap-2',
    lg: 'text-base px-6 py-2.5 rounded-[var(--radius-btn)] gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
