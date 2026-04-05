import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Search } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { auditLogsApi } from '../api/auditLogs';
import type { AuditLog } from '../types';
import { PermissionGate } from '../components/PermissionGate';

const statusVariant = (s: string) => {
  switch (s) {
    case 'success':
      return 'success' as const;
    case 'failure':
    case 'error':
      return 'error' as const;
    case 'warning':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
};

export default function AuditLogs() {
  const [filters, setFilters] = useState({
    event_type: '',
    action: '',
    from_date: '',
    to_date: '',
    page: 1,
  });
  const [myLogs, setMyLogs] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', myLogs, filters],
    queryFn: () => {
      if (myLogs) return auditLogsApi.me();
      const params: Record<string, unknown> = { page: filters.page };
      if (filters.event_type) params.event_type = filters.event_type;
      if (filters.action) params.action = filters.action;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      return auditLogsApi.list(params as Parameters<typeof auditLogsApi.list>[0]);
    },
  });

  const { data: selectedLog } = useQuery({
    queryKey: ['audit-log', selectedLogId],
    queryFn: () => auditLogsApi.get(selectedLogId!),
    enabled: selectedLogId !== null,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-accent" />
          <div>
            <h1 className="text-2xl font-semibold">Audit Logs</h1>
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
              Track system events and user actions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            My Logs
          </span>
          <button
            type="button"
            onClick={() => setMyLogs(!myLogs)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              myLogs ? 'bg-accent' : 'dark:bg-dark-border bg-light-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                myLogs ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {myLogs ? (
        <Card>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-dark-border border-light-border">
                    <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                      Event Type
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                      Action
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                      Status
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                      IP Address
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: AuditLog) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className="border-b dark:border-dark-border/50 border-light-border/50 dark:hover:bg-dark-hover hover:bg-light-hover transition-colors cursor-pointer"
                    >
                      <td className="py-2 px-3 font-mono text-xs">{log.event_type}</td>
                      <td className="py-2 px-3 text-xs">{log.action}</td>
                      <td className="py-2 px-3">
                        <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs">{log.ip_address ?? '-'}</td>
                      <td className="py-2 px-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="dark:text-dark-text-secondary text-light-text-secondary">
                No audit logs found.
              </p>
            </div>
          )}
        </Card>
      ) : (
        <PermissionGate
          permission="audit:read"
          fallback={
            <Card>
              <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary text-center py-4">
                Full audit logs require admin access. Showing your activity below.
              </p>
            </Card>
          }
        >
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Search
                size={16}
                className="dark:text-dark-text-secondary text-light-text-secondary"
              />
              <h3 className="text-sm font-semibold">Filters</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Input
                label="Event Type"
                placeholder="e.g. login"
                value={filters.event_type}
                onChange={(e) => setFilters({ ...filters, event_type: e.target.value, page: 1 })}
              />
              <Input
                label="Action"
                placeholder="e.g. create"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              />
              <Input
                label="From Date"
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value, page: 1 })}
              />
              <Input
                label="To Date"
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value, page: 1 })}
              />
              <Input
                label="Page"
                type="number"
                min={1}
                value={filters.page}
                onChange={(e) => setFilters({ ...filters, page: Number(e.target.value) })}
              />
            </div>
          </Card>

          <Card>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
                ))}
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-dark-border border-light-border">
                      <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Event Type
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Action
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        IP Address
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: AuditLog) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className="border-b dark:border-dark-border/50 border-light-border/50 dark:hover:bg-dark-hover hover:bg-light-hover transition-colors cursor-pointer"
                      >
                        <td className="py-2 px-3 font-mono text-xs">{log.event_type}</td>
                        <td className="py-2 px-3 text-xs">{log.action}</td>
                        <td className="py-2 px-3">
                          <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
                        </td>
                        <td className="py-2 px-3 font-mono text-xs">{log.ip_address ?? '-'}</td>
                        <td className="py-2 px-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="dark:text-dark-text-secondary text-light-text-secondary">
                  No audit logs found.
                </p>
              </div>
            )}
          </Card>

          {logs && logs.length > 0 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </Button>
              <span className="text-sm dark:text-dark-text-secondary text-light-text-secondary flex items-center px-3">
                Page {filters.page}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </PermissionGate>
      )}

      <Modal
        open={selectedLogId !== null}
        onClose={() => setSelectedLogId(null)}
        title="Audit Log Detail"
      >
        {selectedLog ? (
          <div className="space-y-3">
            {Object.entries(selectedLog).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                  {key}
                </span>
                <span className="text-sm font-mono break-all">
                  {typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : String(value ?? '-')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-pulse space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 rounded dark:bg-dark-border bg-light-border" />
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
