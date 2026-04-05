import { useQuery } from '@tanstack/react-query';
import { Activity, Server, Radio } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { apiClient } from '../api/client';

interface StatusCardProps {
  title: string;
  icon: React.ReactNode;
  data: Record<string, unknown> | undefined;
  isLoading: boolean;
  isError: boolean;
}

function StatusCard({ title, icon, data, isLoading, isError }: StatusCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
        {!isLoading && (
          <Badge variant={isError ? 'error' : 'success'} className="ml-auto">
            {isError ? 'Down' : 'Up'}
          </Badge>
        )}
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-5 rounded dark:bg-dark-border bg-light-border" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-red-400">Unable to reach endpoint</p>
      ) : data ? (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between py-1.5 border-b dark:border-dark-border/50 border-light-border/50 last:border-0"
            >
              <span className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                {key}
              </span>
              <span className="text-xs font-mono">
                {typeof value === 'boolean' ? (
                  <Badge variant={value ? 'success' : 'error'}>{String(value)}</Badge>
                ) : typeof value === 'object' && value !== null ? (
                  JSON.stringify(value)
                ) : (
                  String(value ?? '-')
                )}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export default function SystemStatus() {
  const healthQuery = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await apiClient.get<Record<string, unknown>>('/health');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const statusQuery = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const res = await apiClient.get<Record<string, unknown>>('/status');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const grpcQuery = useQuery({
    queryKey: ['system-grpc'],
    queryFn: async () => {
      const res = await apiClient.get<Record<string, unknown>>('/status/grpc');
      return res.data;
    },
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">System Status</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Monitor system health and service availability. Auto-refreshes every 30 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Health"
          icon={<Activity size={18} className="text-emerald-400" />}
          data={healthQuery.data as Record<string, unknown> | undefined}
          isLoading={healthQuery.isLoading}
          isError={healthQuery.isError}
        />
        <StatusCard
          title="API Status"
          icon={<Server size={18} className="text-blue-400" />}
          data={statusQuery.data as Record<string, unknown> | undefined}
          isLoading={statusQuery.isLoading}
          isError={statusQuery.isError}
        />
        <StatusCard
          title="gRPC Status"
          icon={<Radio size={18} className="text-purple-400" />}
          data={grpcQuery.data as Record<string, unknown> | undefined}
          isLoading={grpcQuery.isLoading}
          isError={grpcQuery.isError}
        />
      </div>
    </div>
  );
}
