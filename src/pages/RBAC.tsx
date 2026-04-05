import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { rbacApi } from '../api/rbac';
import { PermissionGate } from '../components/PermissionGate';

export default function RBAC() {
  const [assignForm, setAssignForm] = useState({ user_id: 0, role: '', organization_id: '' });
  const [permCheck, setPermCheck] = useState('');
  const [checkResult, setCheckResult] = useState<{ allowed: boolean } | null>(null);

  const { data: permissions } = useQuery({
    queryKey: ['rbac-permissions'],
    queryFn: () => rbacApi.myPermissions(),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['rbac-roles'],
    queryFn: () => rbacApi.roles(),
  });

  const assignMutation = useMutation({
    mutationFn: (data: { user_id: number; role: string; organization_id?: number }) =>
      rbacApi.assign(data),
    onSuccess: () => {
      setAssignForm({ user_id: 0, role: '', organization_id: '' });
    },
  });

  const checkMutation = useMutation({
    mutationFn: (permission: string) => rbacApi.check(permission),
    onSuccess: (data) => setCheckResult(data),
  });

  const roles = rolesData?.roles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Access Control</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Manage roles, permissions, and access
        </p>
      </div>

      {/* My Permissions */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-accent" />
          <h2 className="text-sm font-semibold">My Permissions</h2>
        </div>
        {permissions ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(permissions).map(([key, value]) => (
              <div key={key} className="p-2 rounded-lg dark:bg-dark-bg bg-light-bg text-sm">
                <span className="dark:text-dark-text-secondary text-light-text-secondary">
                  {key}:
                </span>{' '}
                <span className="font-mono text-xs">{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-pulse h-10 rounded dark:bg-dark-border bg-light-border" />
        )}
      </Card>

      {/* Roles List */}
      <Card>
        <h2 className="text-sm font-semibold mb-4">Available Roles</h2>
        {roles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role} variant="info">
                {role}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            No roles available
          </p>
        )}
      </Card>

      {/* Assign Role */}
      <PermissionGate
        permission="rbac:assign"
        fallback={
          <Card>
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary text-center py-4">
              Admin access required to assign roles
            </p>
          </Card>
        }
      >
        <Card>
          <h2 className="text-sm font-semibold mb-4">Assign Role</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              assignMutation.mutate({
                user_id: assignForm.user_id,
                role: assignForm.role,
                organization_id: assignForm.organization_id
                  ? Number(assignForm.organization_id)
                  : undefined,
              });
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Input
              label="User ID"
              type="number"
              value={assignForm.user_id || ''}
              onChange={(e) => setAssignForm({ ...assignForm, user_id: Number(e.target.value) })}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Role
              </label>
              <select
                value={assignForm.role}
                onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                required
              >
                <option value="">Select role...</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Organization ID (optional)"
              type="number"
              value={assignForm.organization_id}
              onChange={(e) => setAssignForm({ ...assignForm, organization_id: e.target.value })}
            />
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" loading={assignMutation.isPending}>
                Assign Role
              </Button>
            </div>
          </form>
          {assignMutation.isSuccess && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle size={14} />
              Role assigned successfully
            </div>
          )}
        </Card>
      </PermissionGate>

      {/* Permission Check */}
      <Card>
        <h2 className="text-sm font-semibold mb-4">Check Permission</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkMutation.mutate(permCheck);
          }}
          className="flex items-end gap-3"
        >
          <div className="flex-1">
            <Input
              label="Permission"
              value={permCheck}
              onChange={(e) => setPermCheck(e.target.value)}
              placeholder="e.g. experiments:write"
              required
            />
          </div>
          <Button type="submit" loading={checkMutation.isPending}>
            Check
          </Button>
        </form>
        {checkResult && (
          <div className="mt-4 flex items-center gap-2">
            {checkResult.allowed ? (
              <>
                <CheckCircle size={16} className="text-emerald-400" />
                <Badge variant="success">Allowed</Badge>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-red-400" />
                <Badge variant="error">Denied</Badge>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
