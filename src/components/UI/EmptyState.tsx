import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6">
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full dark:bg-dark-hover bg-light-hover flex items-center justify-center">
          <Icon size={28} className="dark:text-dark-text-secondary text-light-text-secondary" />
        </div>
      )}
      <h3 className="text-base font-semibold dark:text-dark-text text-light-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
