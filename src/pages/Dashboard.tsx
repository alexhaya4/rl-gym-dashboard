import { useQuery } from '@tanstack/react-query';
import {
  Grid3X3,
  FlaskConical,
  Play,
  CheckCircle2,
  Package,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { environmentsApi } from '../api/environments';
import { experimentsApi } from '../api/experiments';
import { trainingApi } from '../api/training';

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-[var(--radius-btn)] flex items-center justify-center ${
            accent ? 'bg-accent/15 text-accent' : 'dark:bg-dark-hover bg-light-hover dark:text-dark-text-secondary text-light-text-secondary'
          }`}
        >
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold font-mono">{value}</p>
          <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">{label}</p>
        </div>
      </div>
    </Card>
  );
}

const statusVariant = (s: string) => {
  switch (s) {
    case 'completed': return 'success' as const;
    case 'running': return 'info' as const;
    case 'failed': return 'error' as const;
    case 'cancelled': return 'warning' as const;
    default: return 'default' as const;
  }
};

export default function Dashboard() {
  const { data: environments } = useQuery({
    queryKey: ['environments'],
    queryFn: () => environmentsApi.list(),
  });

  const { data: experiments } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => experimentsApi.list(),
  });

  const { data: training } = useQuery({
    queryKey: ['training'],
    queryFn: () => trainingApi.list(),
  });

  const active = training?.filter((t) => t.status === 'running').length ?? 0;
  const completed = training?.filter((t) => t.status === 'completed').length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Overview of your RL training platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard icon={Grid3X3} label="Environments" value={environments?.length ?? 0} />
        <StatCard icon={FlaskConical} label="Experiments" value={experiments?.length ?? 0} />
        <StatCard icon={Play} label="Active Training" value={active} accent />
        <StatCard icon={CheckCircle2} label="Completed" value={completed} />
        <StatCard icon={Package} label="Total Sessions" value={training?.length ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-accent" />
            <h2 className="text-base font-semibold">Recent Experiments</h2>
          </div>
          {experiments && experiments.length > 0 ? (
            <div className="space-y-3">
              {experiments.slice(0, 5).map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0 dark:border-dark-border border-light-border"
                >
                  <div>
                    <p className="text-sm font-medium">{exp.name}</p>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {exp.algorithm}
                    </p>
                  </div>
                  <Badge variant={statusVariant(exp.status)}>{exp.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
              No experiments yet
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Play size={18} className="text-accent" />
            <h2 className="text-base font-semibold">Active Training Sessions</h2>
          </div>
          {training && training.filter((t) => t.status === 'running').length > 0 ? (
            <div className="space-y-3">
              {training
                .filter((t) => t.status === 'running')
                .slice(0, 5)
                .map((session) => (
                  <div
                    key={session.experiment_id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0 dark:border-dark-border border-light-border"
                  >
                    <div>
                      <p className="text-sm font-medium font-mono">{String(session.experiment_id)}</p>
                      <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                        {session.algorithm} on {session.environment_id} — {session.total_timesteps.toLocaleString()} timesteps
                      </p>
                    </div>
                    <Badge variant={statusVariant(session.status)}>{session.status}</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
              No active training sessions
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
