import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Activity, Clock } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { pipelinesApi } from '../api/pipelines';

const statusVariant = (s: string) => {
  switch (s) {
    case 'completed':
      return 'success' as const;
    case 'running':
      return 'info' as const;
    case 'failed':
      return 'error' as const;
    case 'pending':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
};

export default function Pipelines() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    environment_id: 'CartPole-v1',
    algorithm: 'PPO',
    total_timesteps: 10000,
    experiment_name: '',
  });

  const { data: health } = useQuery({
    queryKey: ['pipelines-health'],
    queryFn: () => pipelinesApi.health(),
  });

  const { data: pipelines, isLoading } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelinesApi.list(),
  });

  const runMutation = useMutation({
    mutationFn: (data: {
      environment_id: string;
      algorithm: string;
      total_timesteps: number;
      experiment_name?: string;
    }) => pipelinesApi.run(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setForm({
        environment_id: 'CartPole-v1',
        algorithm: 'PPO',
        total_timesteps: 10000,
        experiment_name: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runMutation.mutate({
      ...form,
      experiment_name: form.experiment_name || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pipelines</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Run and manage training pipelines
        </p>
      </div>

      {/* Health Status */}
      <Card>
        <div className="flex items-center gap-3">
          <Activity size={18} className="text-accent" />
          <h2 className="text-sm font-semibold">Pipeline Health</h2>
        </div>
        {health ? (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Prefect Available:
              </span>
              <Badge variant={health.prefect_available ? 'success' : 'error'}>
                {health.prefect_available ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Version:
              </span>
              <span className="font-mono text-xs">{health.version}</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 animate-pulse h-6 rounded dark:bg-dark-border bg-light-border w-48" />
        )}
      </Card>

      {/* Run Pipeline Form */}
      <Card>
        <h2 className="text-sm font-semibold mb-4">Run Pipeline</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Environment
            </label>
            <select
              value={form.environment_id}
              onChange={(e) => setForm({ ...form, environment_id: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              required
            >
              <option value="CartPole-v1">CartPole-v1</option>
              <option value="LunarLander-v2">LunarLander-v2</option>
              <option value="MountainCar-v0">MountainCar-v0</option>
              <option value="Acrobot-v1">Acrobot-v1</option>
              <option value="Pendulum-v1">Pendulum-v1</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Algorithm
            </label>
            <select
              value={form.algorithm}
              onChange={(e) => setForm({ ...form, algorithm: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              required
            >
              {['PPO', 'A2C', 'DQN', 'SAC', 'TD3'].map((alg) => (
                <option key={alg} value={alg}>
                  {alg}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Total Timesteps"
            type="number"
            value={form.total_timesteps}
            onChange={(e) => setForm({ ...form, total_timesteps: Number(e.target.value) })}
            required
          />
          <Input
            label="Experiment Name (optional)"
            value={form.experiment_name}
            onChange={(e) => setForm({ ...form, experiment_name: e.target.value })}
          />
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" loading={runMutation.isPending}>
              <Play size={16} />
              Run Pipeline
            </Button>
          </div>
        </form>
      </Card>

      {/* Pipeline List */}
      {isLoading ? (
        <Card padding="none">
          <div className="animate-pulse p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
            ))}
          </div>
        </Card>
      ) : pipelines && pipelines.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Environment
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Algorithm
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {pipelines.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-b-0 dark:border-dark-border border-light-border dark:hover:bg-dark-hover/50 hover:bg-light-hover/50"
                  >
                    <td className="px-5 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-5 py-3">{p.environment_id}</td>
                    <td className="px-5 py-3 font-mono text-xs">{p.algorithm}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(p.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {p.completed_at ? new Date(p.completed_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              No pipelines yet
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
