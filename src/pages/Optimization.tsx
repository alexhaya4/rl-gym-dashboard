import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Play, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { optimizationApi } from '../api/optimization';

const statusVariant = (s: string) => {
  switch (s) {
    case 'completed':
      return 'success' as const;
    case 'running':
      return 'info' as const;
    case 'failed':
      return 'error' as const;
    default:
      return 'default' as const;
  }
};

export default function Optimization() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    environment_id: 'CartPole-v1',
    algorithm: 'PPO',
    n_trials: 50,
    optimization_metric: 'mean_reward',
  });
  const [selectedStudy, setSelectedStudy] = useState<{
    id: number;
    history: Record<string, unknown>[];
    bestParams: Record<string, unknown> | undefined;
  } | null>(null);

  const { data: spaces } = useQuery({
    queryKey: ['optimization-spaces'],
    queryFn: () => optimizationApi.spaces(),
  });

  const { data: studies, isLoading } = useQuery({
    queryKey: ['optimization-studies'],
    queryFn: () => optimizationApi.list(),
  });

  const runMutation = useMutation({
    mutationFn: () =>
      optimizationApi.run({
        environment_id: form.environment_id,
        algorithm: form.algorithm,
        n_trials: form.n_trials,
        optimization_metric: form.optimization_metric,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['optimization-studies'] }),
  });

  const fetchStudyDetails = useCallback(async (id: number, bestTrial?: Record<string, unknown>) => {
    const history = await optimizationApi.history(id);
    setSelectedStudy({ id, history, bestParams: bestTrial });
  }, []);

  const chartData =
    selectedStudy?.history.map((h, i) => ({
      trial_number: (h as Record<string, unknown>).trial_number ?? i + 1,
      value:
        (h as Record<string, unknown>).value ?? (h as Record<string, unknown>).mean_reward ?? 0,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hyperparameter Optimization</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Automated hyperparameter search with Optuna
        </p>
      </div>

      {/* Spaces info */}
      {spaces && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Settings size={18} className="text-accent" />
            <h3 className="text-sm font-semibold">Search Spaces</h3>
          </div>
          <div className="p-3 rounded-[var(--radius-card)] dark:bg-dark-bg bg-light-bg">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(spaces, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* Run form */}
      <Card>
        <h3 className="text-sm font-semibold mb-4">Run Optimization</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runMutation.mutate();
          }}
          className="space-y-4"
        >
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
              <option value="MountainCarContinuous-v0">MountainCarContinuous-v0</option>
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
              <option value="PPO">PPO</option>
              <option value="DQN">DQN</option>
              <option value="A2C">A2C</option>
              <option value="SAC">SAC</option>
              <option value="TD3">TD3</option>
            </select>
          </div>
          <Input
            label="Number of Trials"
            type="number"
            min={10}
            max={200}
            value={form.n_trials}
            onChange={(e) => setForm({ ...form, n_trials: Number(e.target.value) })}
            required
          />
          <Input
            label="Optimization Metric"
            value={form.optimization_metric}
            onChange={(e) => setForm({ ...form, optimization_metric: e.target.value })}
            placeholder="mean_reward"
            required
          />
          <Button type="submit" loading={runMutation.isPending}>
            <Play size={16} />
            Start Optimization
          </Button>
        </form>
      </Card>

      {/* Selected study detail */}
      {selectedStudy && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" />
              <h3 className="text-sm font-semibold">Study {selectedStudy.id} — Trial History</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedStudy(null)}>
              Close
            </Button>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="trial_number"
                    stroke="#888"
                    fontSize={12}
                    label={{ value: 'Trial', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#aaa' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary text-center py-4">
              No trial history available
            </p>
          )}
          {selectedStudy.bestParams && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold dark:text-dark-text-secondary text-light-text-secondary mb-2">
                Best Parameters
              </h4>
              <div className="p-3 rounded-[var(--radius-card)] dark:bg-dark-bg bg-light-bg">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(selectedStudy.bestParams, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Studies list */}
      <Card>
        <h3 className="text-sm font-semibold mb-4">Studies</h3>
        {isLoading ? (
          <div className="animate-pulse h-20 rounded dark:bg-dark-border bg-light-border" />
        ) : studies && studies.length > 0 ? (
          <div className="space-y-3">
            {studies.map((study) => (
              <div
                key={study.id}
                className="flex items-center justify-between p-3 rounded-[var(--radius-card)] border dark:border-dark-border border-light-border cursor-pointer dark:hover:bg-dark-hover hover:bg-light-hover"
                onClick={() => fetchStudyDetails(study.id, study.best_trial)}
              >
                <div>
                  <p className="text-sm font-medium">
                    {study.environment_id} — {study.algorithm}
                  </p>
                  <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                    {study.completed_trials}/{study.n_trials} trials &middot; metric:{' '}
                    {study.optimization_metric}
                    {study.best_value != null && ` · best: ${study.best_value.toFixed(4)}`}
                  </p>
                </div>
                <Badge variant={statusVariant(study.status)}>{study.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            No studies yet
          </p>
        )}
      </Card>
    </div>
  );
}
