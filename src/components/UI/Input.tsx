import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border
            dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder:text-dark-text-secondary/50
            bg-light-input border-light-border text-light-text placeholder:text-light-text-secondary/50
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500/40' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
