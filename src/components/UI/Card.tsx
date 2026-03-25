import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, hover, padding = 'md', className = '', ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        rounded-[var(--radius-card)] border
        dark:bg-dark-card dark:border-dark-border
        bg-light-card border-light-border
        ${hover ? 'hover:dark:border-dark-text-secondary/30 hover:border-light-text-secondary/30 transition-colors cursor-pointer' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
