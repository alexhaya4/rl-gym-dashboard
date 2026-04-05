import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, RotateCcw, Play } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { vecEnvironmentsApi } from '../api/vecEnvironments';

const statusVariant = (s: string) => {
  switch (s) {
    case 'active':
      return 'success' as const;
    case 'ready':
      return 'info' as const;
    case 'error':
      return 'error' as const;
    default:
      return 'default' as const;
  }
};

export default function VecEnvironments() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    environment_id: 'CartPole-v1',
    n_envs: 4,
    use_subprocess: false,
  });
  const [showCreate, setShowCreate] = useState(false);
  const [actionInputs, setActionInputs] = useState<Record<string, string>>({});
  const [stepResults, setStepResults] = useState<Record<string, unknown> | null>(null);

  const { data: vecEnvs, isLoading } = useQuery({
    queryKey: ['vec-environments'],
    queryFn: () => vecEnvironmentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { environment_id: string; n_envs: number; use_subprocess?: boolean }) =>
      vecEnvironmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vec-environments'] });
      setShowCreate(false);
      setForm({ environment_id: 'CartPole-v1', n_envs: 4, use_subprocess: false });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (vecKey: string) => vecEnvironmentsApi.reset(vecKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vec-environments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (vecKey: string) => vecEnvironmentsApi.delete(vecKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vec-environments'] }),
  });

  const stepMutation = useMutation({
    mutationFn: ({ vecKey, actions }: { vecKey: string; actions: unknown[] }) =>
      vecEnvironmentsApi.step(vecKey, actions),
    onSuccess: (data) => setStepResults(data),
  });

  const handleStep = (vecKey: string) => {
    try {
      const actions = JSON.parse(actionInputs[vecKey] || '[]');
      if (Array.isArray(actions)) {
        stepMutation.mutate({ vecKey, actions });
      }
    } catch {
      // invalid JSON
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vectorized Environments</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Manage parallel vectorized environments
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus size={16} />
          New Vec Environment
        </Button>
      </div>

      {showCreate && (
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold mb-3">Create Vectorized Environment</h3>
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
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Number of Envs: {form.n_envs}
              </label>
              <input
                type="range"
                min={1}
                max={32}
                value={form.n_envs}
                onChange={(e) => setForm({ ...form, n_envs: Number(e.target.value) })}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs dark:text-dark-text-secondary text-light-text-secondary">
                <span>1</span>
                <span>32</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Use Subprocess
              </label>
              <button
                type="button"
                onClick={() => setForm({ ...form, use_subprocess: !form.use_subprocess })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.use_subprocess ? 'bg-accent' : 'dark:bg-dark-border bg-light-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.use_subprocess ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Card>
      )}

      {stepResults && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Step Results</h3>
            <Button variant="ghost" size="sm" onClick={() => setStepResults(null)}>
              Close
            </Button>
          </div>
          <pre className="text-xs font-mono dark:bg-dark-bg bg-light-bg p-3 rounded-[var(--radius-card)] overflow-x-auto">
            {JSON.stringify(stepResults, null, 2)}
          </pre>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded dark:bg-dark-border bg-light-border" />
                <div className="h-3 w-1/2 rounded dark:bg-dark-border bg-light-border" />
              </div>
            </Card>
          ))}
        </div>
      ) : vecEnvs && vecEnvs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vecEnvs.map((env) => {
            const key = String(env.key ?? env.vec_key ?? '');
            const envId = String(env.env_id ?? env.environment_id ?? '');
            const nEnvs = env.n_envs ?? 0;
            const status = String(env.status ?? 'unknown');
            return (
              <Card key={key} hover>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm font-mono">{envId}</h3>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-0.5">
                      Key: {key}
                    </p>
                  </div>
                  <Badge variant={statusVariant(status)}>{status}</Badge>
                </div>
                <div className="text-xs dark:text-dark-text-secondary text-light-text-secondary font-mono mb-3">
                  n_envs: {String(nEnvs)}
                </div>
                <div className="space-y-2 border-t dark:border-dark-border border-light-border pt-3">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetMutation.mutate(key)}
                      loading={resetMutation.isPending}
                    >
                      <RotateCcw size={14} />
                      Reset
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(key)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        label="Actions (JSON array)"
                        placeholder="[0, 1, 0, 1]"
                        value={actionInputs[key] || ''}
                        onChange={(e) =>
                          setActionInputs({ ...actionInputs, [key]: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStep(key)}
                      loading={stepMutation.isPending}
                    >
                      <Play size={14} />
                      Step
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              No vectorized environments yet. Create your first one!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
