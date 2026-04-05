import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Square, RefreshCw, FileText, BarChart3 } from 'lucide-react';
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
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { Input } from '../components/UI/Input';
import { trainingApi } from '../api/training';
import { getWsUrl } from '../api/client';
import type { TrainingStart, TrainingJob, TrainingResult } from '../types';

interface WsMetric {
  type: string;
  experiment_id: number;
  timestep: number;
  episode_reward: number | null;
  loss: number | null;
  entropy: number | null;
  learning_rate: number | null;
  n_episodes: number;
  timestamp: string;
}

const statusVariant = (s: string) => {
  switch (s) {
    case 'completed':
      return 'success' as const;
    case 'running':
      return 'info' as const;
    case 'failed':
      return 'error' as const;
    case 'cancelled':
      return 'warning' as const;
    case 'queued':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
};

export default function Training() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<WsMetric[]>([]);
  const [jobInfo, setJobInfo] = useState<{ id: number; data: TrainingJob } | null>(null);
  const [resultInfo, setResultInfo] = useState<{ id: number; data: TrainingResult } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [form, setForm] = useState<TrainingStart>({
    environment_id: 'CartPole-v1',
    algorithm: 'PPO',
    total_timesteps: 10000,
    hyperparameters: {},
    n_envs: 1,
    experiment_name: '',
  });
  const [learningRate, setLearningRate] = useState('');

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['training'],
    queryFn: () => trainingApi.list(),
    refetchInterval: 5000,
  });

  const connectWs = useCallback((experimentId: number) => {
    if (wsRef.current) wsRef.current.close();
    setLiveMetrics([]);
    setSelectedSession(experimentId);

    const ws = new WebSocket(getWsUrl(`/ws/training/${experimentId}`));
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as WsMetric;
        if (data.type === 'connected') return;
        setLiveMetrics((prev) => [...prev.slice(-99), data]);
      } catch {
        /* ignore non-json */
      }
    };
    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, []);

  const startMutation = useMutation({
    mutationFn: (data: TrainingStart) => trainingApi.start(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['training'] });
      setModalOpen(false);
      setSubmitError(null);
      setForm({
        environment_id: 'CartPole-v1',
        algorithm: 'PPO',
        total_timesteps: 10000,
        hyperparameters: {},
        n_envs: 1,
        experiment_name: '',
      });
      setLearningRate('');
      connectWs(response.experiment_id);
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (error as Error)?.message ||
        'Failed to start training';
      setSubmitError(msg);
    },
  });

  const fetchJob = useCallback(async (experimentId: number) => {
    try {
      const data = await trainingApi.job(experimentId);
      setJobInfo({ id: experimentId, data });
    } catch {
      /* may not be available yet */
    }
  }, []);

  const fetchResult = useCallback(async (experimentId: number) => {
    try {
      const data = await trainingApi.result(experimentId);
      setResultInfo({ id: experimentId, data });
    } catch {
      /* may not be available yet */
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Training</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Manage and monitor training sessions
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Play size={16} />
          Start Training
        </Button>
      </div>

      {selectedSession != null && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">
              Live Metrics — <span className="font-mono text-accent">{selectedSession}</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSession(null);
                setLiveMetrics([]);
                wsRef.current?.close();
              }}
            >
              Close
            </Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dark-border)" />
                <XAxis dataKey="timestep" stroke="var(--color-dark-text-secondary)" fontSize={11} />
                <YAxis stroke="var(--color-dark-text-secondary)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-dark-card)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: 'var(--radius-card)',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="episode_reward"
                  name="Reward"
                  stroke="#d97757"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  name="Loss"
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {jobInfo && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Job Status — <span className="font-mono text-accent">{jobInfo.id}</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setJobInfo(null)}>
              Close
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Job ID:
              </span>{' '}
              <span className="font-mono">{jobInfo.data.id.slice(0, 12)}</span>
            </div>
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Status:
              </span>{' '}
              <span className="font-mono">{jobInfo.data.status}</span>
            </div>
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Enqueued:
              </span>{' '}
              <span className="font-mono">
                {new Date(jobInfo.data.enqueued_at).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Started:
              </span>{' '}
              <span className="font-mono">
                {jobInfo.data.started_at
                  ? new Date(jobInfo.data.started_at).toLocaleTimeString()
                  : '—'}
              </span>
            </div>
          </div>
          {jobInfo.data.error && (
            <p className="text-xs text-red-500 mt-2">Error: {jobInfo.data.error}</p>
          )}
          {jobInfo.data.completed_at && (
            <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-2">
              Completed: {new Date(jobInfo.data.completed_at).toLocaleString()}
            </p>
          )}
        </Card>
      )}

      {resultInfo && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Result — <span className="font-mono text-accent">{resultInfo.id}</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setResultInfo(null)}>
              Close
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Mean Reward:
              </span>{' '}
              <span className="font-mono font-bold">
                {resultInfo.data.mean_reward?.toFixed(2) ?? '—'}
              </span>
            </div>
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Std Reward:
              </span>{' '}
              <span className="font-mono">{resultInfo.data.std_reward?.toFixed(2) ?? '—'}</span>
            </div>
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Timesteps:
              </span>{' '}
              <span className="font-mono">{resultInfo.data.total_timesteps.toLocaleString()}</span>
            </div>
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Elapsed:
              </span>{' '}
              <span className="font-mono">
                {resultInfo.data.elapsed_time != null
                  ? `${resultInfo.data.elapsed_time.toFixed(1)}s`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">
                Algorithm:
              </span>{' '}
              <span className="font-mono">{resultInfo.data.algorithm}</span>
            </div>
            {resultInfo.data.model_path && (
              <div>
                <span className="dark:text-dark-text-secondary text-light-text-secondary">
                  Model:
                </span>{' '}
                <span className="font-mono">{resultInfo.data.model_path}</span>
              </div>
            )}
          </div>
          {resultInfo.data.completed_at && (
            <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-2">
              Completed: {new Date(resultInfo.data.completed_at).toLocaleString()}
            </p>
          )}
        </Card>
      )}

      {isLoading ? (
        <Card>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
            ))}
          </div>
        </Card>
      ) : sessions && sessions.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Experiment
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
                    Timesteps
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Mean Reward
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.experiment_id}
                    className="border-b last:border-b-0 dark:border-dark-border border-light-border dark:hover:bg-dark-hover/50 hover:bg-light-hover/50"
                  >
                    <td className="px-5 py-3 font-mono text-xs">{session.experiment_id}</td>
                    <td className="px-5 py-3 font-mono text-xs">{session.environment_id}</td>
                    <td className="px-5 py-3 font-mono text-xs">{session.algorithm}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant(session.status)}>{session.status}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {session.total_timesteps.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {session.mean_reward != null ? session.mean_reward.toFixed(2) : '—'}
                      {session.elapsed_time != null && (
                        <span className="dark:text-dark-text-secondary text-light-text-secondary ml-2">
                          ({session.elapsed_time.toFixed(0)}s)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(session.status === 'running' || session.status === 'queued') && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => connectWs(session.experiment_id)}
                            >
                              <RefreshCw size={13} />
                              Live
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchJob(session.experiment_id)}
                            >
                              <BarChart3 size={13} />
                              Job
                            </Button>
                            <Button variant="ghost" size="sm" disabled title="Stop not supported">
                              <Square size={13} />
                              Stop
                            </Button>
                          </>
                        )}
                        {session.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchResult(session.experiment_id)}
                          >
                            <FileText size={13} />
                            Result
                          </Button>
                        )}
                      </div>
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
              No training sessions yet
            </p>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSubmitError(null);
        }}
        title="Start Training"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitError(null);
            const hp = { ...form.hyperparameters };
            if (learningRate) hp.learning_rate = parseFloat(learningRate);
            startMutation.mutate({
              ...form,
              hyperparameters: hp,
              experiment_name: form.experiment_name || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Environment ID
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
              {[
                'PPO',
                'A2C',
                'DQN',
                'SAC',
                'TD3',
                'DDPG',
                'TQC',
                'TRPO',
                'ARS',
                'RecurrentPPO',
              ].map((alg) => (
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
            label="N Envs"
            type="number"
            value={form.n_envs}
            onChange={(e) => setForm({ ...form, n_envs: Number(e.target.value) })}
            required
          />
          <Input
            label="Experiment Name (optional)"
            value={form.experiment_name ?? ''}
            onChange={(e) => setForm({ ...form, experiment_name: e.target.value })}
          />
          <Input
            label="Learning Rate (optional)"
            type="number"
            step="any"
            value={learningRate}
            onChange={(e) => setLearningRate(e.target.value)}
          />
          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setModalOpen(false);
                setSubmitError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={startMutation.isPending}>
              Start
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
