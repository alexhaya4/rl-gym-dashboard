import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
