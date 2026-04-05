import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Play } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { benchmarksApi } from '../api/benchmarks';
import type { BenchmarkRunRequest, BenchmarkRunResponse } from '../types';

const COLORS = ['#d97757', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6'];

export default function Benchmarks() {
  const [modalOpen, setModalOpen] = useState(false);
  const [runForm, setRunForm] = useState<BenchmarkRunRequest>({
    environments: ['CartPole-v1'],
    algorithms: ['PPO'],
    total_timesteps: 5000,
    n_eval_episodes: 5,
  });
  const [envInput, setEnvInput] = useState('CartPole-v1');
  const [algoInput, setAlgoInput] = useState('PPO');
  const [lastResult, setLastResult] = useState<BenchmarkRunResponse | null>(null);

  const runMutation = useMutation({
    mutationFn: (data: BenchmarkRunRequest) => benchmarksApi.run(data),
    onSuccess: (data) => {
      setLastResult(data);
      setModalOpen(false);
    },
  });

  const chartData = lastResult?.results.map((r) => ({
    ...r,
    label: `${r.algorithm} / ${r.environment_id}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Benchmarks</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Compare algorithm performance across environments
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Play size={16} />
          Run Benchmark
        </Button>
      </div>

      {lastResult ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold">Benchmark Results</h2>
              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-0.5">
                {lastResult.total_combinations} combinations — completed{' '}
                {new Date(lastResult.completed_at).toLocaleString()}
              </p>
            </div>
          </div>

          {lastResult.results.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <p className="text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary mb-2">
                  Mean Reward
                </p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dark-border)" />
                    <XAxis
                      dataKey="label"
                      stroke="var(--color-dark-text-secondary)"
                      fontSize={11}
                    />
                    <YAxis stroke="var(--color-dark-text-secondary)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-dark-card)',
                        border: '1px solid var(--color-dark-border)',
                        borderRadius: 'var(--radius-card)',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="mean_reward" radius={[4, 4, 0, 0]}>
                      {(chartData ?? []).map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-dark-border border-light-border">
                      <th className="text-left py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Environment
                      </th>
                      <th className="text-left py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Algorithm
                      </th>
                      <th className="text-right py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Mean Reward
                      </th>
                      <th className="text-right py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Std Reward
                      </th>
                      <th className="text-right py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary">
                        Time (s)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastResult.results.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-b-0 dark:border-dark-border border-light-border"
                      >
                        <td className="py-2 font-mono text-xs">{r.environment_id}</td>
                        <td className="py-2 font-mono text-xs">{r.algorithm}</td>
                        <td className="py-2 text-right font-mono text-xs">
                          {r.mean_reward.toFixed(2)}
                        </td>
                        <td className="py-2 text-right font-mono text-xs">
                          {r.std_reward.toFixed(2)}
                        </td>
                        <td className="py-2 text-right font-mono text-xs">
                          {r.training_time_seconds.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
              No results available
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              No benchmarks yet. Run one to compare algorithms.
            </p>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Run Benchmark">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runMutation.mutate(runForm);
          }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Environments
            </label>
            <div className="flex gap-2">
              <select
                value={envInput}
                onChange={(e) => setEnvInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              >
                <option value="CartPole-v1">CartPole-v1</option>
                <option value="LunarLander-v2">LunarLander-v2</option>
                <option value="MountainCar-v0">MountainCar-v0</option>
                <option value="Acrobot-v1">Acrobot-v1</option>
                <option value="Pendulum-v1">Pendulum-v1</option>
                <option value="MountainCarContinuous-v0">MountainCarContinuous-v0</option>
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (envInput && !runForm.environments.includes(envInput)) {
                    setRunForm({ ...runForm, environments: [...runForm.environments, envInput] });
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {runForm.environments.map((env) => (
                <span
                  key={env}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded dark:bg-dark-hover bg-light-hover font-mono"
                >
                  {env}
                  <button
                    type="button"
                    onClick={() =>
                      setRunForm({
                        ...runForm,
                        environments: runForm.environments.filter((e) => e !== env),
                      })
                    }
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Algorithms
            </label>
            <div className="flex gap-2">
              <select
                value={algoInput}
                onChange={(e) => setAlgoInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (algoInput && !runForm.algorithms.includes(algoInput)) {
                    setRunForm({ ...runForm, algorithms: [...runForm.algorithms, algoInput] });
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {runForm.algorithms.map((alg) => (
                <span
                  key={alg}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded dark:bg-dark-hover bg-light-hover font-mono"
                >
                  {alg}
                  <button
                    type="button"
                    onClick={() =>
                      setRunForm({
                        ...runForm,
                        algorithms: runForm.algorithms.filter((a) => a !== alg),
                      })
                    }
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          <Input
            label="Total Timesteps"
            type="number"
            value={runForm.total_timesteps}
            onChange={(e) => setRunForm({ ...runForm, total_timesteps: Number(e.target.value) })}
            required
          />
          <Input
            label="N Eval Episodes"
            type="number"
            value={runForm.n_eval_episodes}
            onChange={(e) => setRunForm({ ...runForm, n_eval_episodes: Number(e.target.value) })}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={runMutation.isPending}>
              Run
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
