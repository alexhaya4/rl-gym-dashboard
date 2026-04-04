import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Trash2 } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { inferenceApi } from '../api/inference';
import { environmentsApi } from '../api/environments';
import { apiClient, getItems } from '../api/client';
import type { Algorithm, InferenceResponse } from '../types';

export default function Inference() {
  const queryClient = useQueryClient();
  const [envId, setEnvId] = useState('CartPole-v1');
  const [algorithm, setAlgorithm] = useState('PPO');
  const [deterministic, setDeterministic] = useState(true);
  const [observations, setObservations] = useState<string[]>(['0', '0', '0', '0', '0']);
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: availableEnvs } = useQuery({
    queryKey: ['environments-available'],
    queryFn: () => environmentsApi.available(),
  });

  const { data: algorithms } = useQuery({
    queryKey: ['algorithms'],
    queryFn: async () => {
      const res = await apiClient.get('/algorithms/');
      return getItems<Algorithm>(res.data);
    },
  });

  const { data: cache, isLoading: cacheLoading } = useQuery({
    queryKey: ['inference-cache'],
    queryFn: () => inferenceApi.getCache(),
  });

  const predictMutation = useMutation({
    mutationFn: () =>
      inferenceApi.predict(
        envId,
        observations.map(Number),
        algorithm,
        deterministic,
      ),
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { status?: number; data?: { detail?: string } } })?.response
          ?.status === 404
          ? 'No production model found for this environment/algorithm'
          : (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            (err as Error)?.message ||
            'Prediction failed';
      setError(msg);
      setResult(null);
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: () => inferenceApi.clearCache(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inference-cache'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inference Playground</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Test model predictions in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel — Form */}
        <Card>
          <h2 className="text-base font-semibold mb-4">Configuration</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              predictMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Environment
              </label>
              <select
                value={envId}
                onChange={(e) => setEnvId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              >
                {availableEnvs?.map((env) => (
                  <option key={env.id || env.environment_id} value={env.id || env.environment_id}>
                    {env.id || env.environment_id}
                  </option>
                )) ?? (
                  <>
                    <option value="CartPole-v1">CartPole-v1</option>
                    <option value="LunarLander-v2">LunarLander-v2</option>
                    <option value="MountainCar-v0">MountainCar-v0</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              >
                {algorithms?.map((alg) => (
                  <option key={alg.name} value={alg.name}>
                    {alg.name}
                  </option>
                )) ?? ['PPO', 'A2C', 'DQN', 'SAC', 'TD3'].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="deterministic"
                checked={deterministic}
                onChange={(e) => setDeterministic(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="deterministic" className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
                Deterministic
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Observation ({observations.length} values)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {observations.map((val, i) => (
                  <input
                    key={i}
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => {
                      const next = [...observations];
                      next[i] = e.target.value;
                      setObservations(next);
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text text-center"
                  />
                ))}
              </div>
            </div>

            <Button type="submit" loading={predictMutation.isPending} className="w-full">
              <Zap size={16} />
              Predict
            </Button>
          </form>
        </Card>

        {/* Right panel — Response */}
        <Card>
          <h2 className="text-base font-semibold mb-4">Response</h2>
          {error && (
            <div className="p-4 rounded-[var(--radius-card)] bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">Action</p>
                  <p className="font-mono font-bold text-lg text-accent">
                    {Array.isArray(result.action) ? `[${result.action.join(', ')}]` : result.action}
                  </p>
                </div>
                <div>
                  <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">Probability</p>
                  <p className="font-mono font-bold text-lg">
                    {result.action_probability != null ? `${(result.action_probability * 100).toFixed(1)}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">Latency</p>
                  <p className="font-mono">{result.latency_ms.toFixed(1)} ms</p>
                </div>
                <div>
                  <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">Algorithm</p>
                  <p className="font-mono">{result.algorithm}</p>
                </div>
              </div>
            </div>
          )}
          {!result && !error && (
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary text-center py-8">
              Submit a prediction to see results
            </p>
          )}
        </Card>
      </div>

      {/* Bottom — Cache table */}
      <Card padding="none">
        <div className="flex items-center justify-between p-5 border-b dark:border-dark-border border-light-border">
          <h2 className="text-base font-semibold">Cached Models</h2>
          <Button
            variant="danger"
            size="sm"
            onClick={() => clearCacheMutation.mutate()}
            loading={clearCacheMutation.isPending}
          >
            <Trash2 size={13} />
            Clear Cache
          </Button>
        </div>
        {cacheLoading ? (
          <div className="animate-pulse p-5 space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-8 rounded dark:bg-dark-border bg-light-border" />
            ))}
          </div>
        ) : cache && cache.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Environment</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Algorithm</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Model Path</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Memory</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Loaded At</th>
                </tr>
              </thead>
              <tbody>
                {cache.map((item, i) => (
                  <tr key={i} className="border-b last:border-b-0 dark:border-dark-border border-light-border">
                    <td className="px-5 py-3 font-mono text-xs">{item.environment_id}</td>
                    <td className="px-5 py-3 font-mono text-xs">{item.algorithm}</td>
                    <td className="px-5 py-3 font-mono text-xs truncate max-w-[200px]">{item.model_path}</td>
                    <td className="px-5 py-3 font-mono text-xs">{item.memory_mb.toFixed(1)} MB</td>
                    <td className="px-5 py-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {new Date(item.loaded_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">No cached models</p>
          </div>
        )}
      </Card>
    </div>
  );
}
