import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, RotateCcw, StepForward } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { environmentsApi } from '../api/environments';
import type { EnvironmentCreate, StepResult, ResetResult } from '../types';

const statusVariant = (s: string) => {
  switch (s) {
    case 'active': return 'success' as const;
    case 'ready': return 'info' as const;
    case 'error': return 'error' as const;
    default: return 'default' as const;
  }
};

export default function Environments() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [stepResult, setStepResult] = useState<{ envKey: string; data: StepResult | ResetResult; type: 'step' | 'reset' } | null>(null);
  const [form, setForm] = useState<EnvironmentCreate>({
    environment_id: 'CartPole-v1',
    render_mode: null,
  });

  const { data: environments, isLoading } = useQuery({
    queryKey: ['environments'],
    queryFn: () => environmentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: EnvironmentCreate) => environmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setModalOpen(false);
      setForm({ environment_id: 'CartPole-v1', render_mode: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (envKey: string) => environmentsApi.delete(envKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['environments'] }),
  });

  const resetMutation = useMutation({
    mutationFn: (envKey: string) => environmentsApi.reset(envKey),
    onSuccess: (data, envKey) => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setStepResult({ envKey, data, type: 'reset' });
    },
  });

  const stepMutation = useMutation({
    mutationFn: ({ envKey, action }: { envKey: string; action: number }) => environmentsApi.step(envKey, action),
    onSuccess: (data, { envKey }) => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setStepResult({ envKey, data, type: 'step' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Environments</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Manage your RL training environments
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          New Environment
        </Button>
      </div>

      {stepResult && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">
              {stepResult.type === 'reset' ? 'Reset' : 'Step'} Result — <span className="font-mono text-accent">{stepResult.envKey}</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setStepResult(null)}>Close</Button>
          </div>
          <pre className="text-xs font-mono dark:bg-dark-bg bg-light-bg p-3 rounded-[var(--radius-card)] overflow-x-auto">
            {JSON.stringify(stepResult.data, null, 2)}
          </pre>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded dark:bg-dark-border bg-light-border" />
                <div className="h-3 w-1/2 rounded dark:bg-dark-border bg-light-border" />
                <div className="h-3 w-full rounded dark:bg-dark-border bg-light-border" />
              </div>
            </Card>
          ))}
        </div>
      ) : environments && environments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {environments.map((env) => (
            <Card key={env.env_key} hover>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm font-mono">{env.environment_id}</h3>
                  <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-0.5">
                    Key: {env.env_key}
                  </p>
                </div>
                <Badge variant={statusVariant(env.status)}>{env.status}</Badge>
              </div>
              <div className="space-y-1.5 text-xs dark:text-dark-text-secondary text-light-text-secondary font-mono">
                {env.observation_space && <p>Obs: {JSON.stringify(env.observation_space)}</p>}
                {env.action_space && <p>Act: {JSON.stringify(env.action_space)}</p>}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t dark:border-dark-border border-light-border">
                <Button variant="ghost" size="sm" onClick={() => resetMutation.mutate(env.env_key)} loading={resetMutation.isPending}>
                  <RotateCcw size={14} />
                  Reset
                </Button>
                <Button variant="ghost" size="sm" onClick={() => stepMutation.mutate({ envKey: env.env_key, action: 0 })} loading={stepMutation.isPending}>
                  <StepForward size={14} />
                  Step
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(env.env_key)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              No environments yet. Create your first one!
            </p>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Environment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
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
              Render Mode
            </label>
            <select
              value={form.render_mode ?? ''}
              onChange={(e) => setForm({ ...form, render_mode: e.target.value || null })}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            >
              <option value="">None</option>
              <option value="human">human</option>
              <option value="rgb_array">rgb_array</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
