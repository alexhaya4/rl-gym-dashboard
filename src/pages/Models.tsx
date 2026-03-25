import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { apiClient, getItems } from '../api/client';
import type { RegistryEntry } from '../types';

const stageVariant = (s: string) => {
  switch (s) {
    case 'production': return 'success' as const;
    case 'staging': return 'warning' as const;
    case 'development': return 'info' as const;
    case 'archived': return 'default' as const;
    default: return 'default' as const;
  }
};

const STAGES = ['development', 'staging', 'production', 'archived'] as const;

export default function Models() {
  const queryClient = useQueryClient();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({ model_version_id: '', environment_id: 'CartPole-v1', algorithm: 'PPO' });

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await apiClient.get('/registry/');
      return getItems<RegistryEntry>(res.data);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { model_version_id: string; environment_id: string; algorithm: string }) => {
      const res = await apiClient.post('/registry/register', null, {
        params: {
          model_version_id: Number(data.model_version_id),
          environment_id: data.environment_id,
          algorithm: data.algorithm,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setRegisterOpen(false);
      setRegisterForm({ model_version_id: '', environment_id: 'CartPole-v1', algorithm: 'PPO' });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async ({ id, target_stage, model_version_id }: { id: number; target_stage: string; model_version_id: number }) => {
      const res = await apiClient.post(`/registry/${id}/promote`, {
        model_version_id,
        target_stage,
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['models'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Models</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Model registry with deployment stages
          </p>
        </div>
        <Button onClick={() => setRegisterOpen(true)}>
          <Plus size={16} />
          Register Model
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded dark:bg-dark-border bg-light-border" />
                <div className="h-3 w-1/2 rounded dark:bg-dark-border bg-light-border" />
              </div>
            </Card>
          ))}
        </div>
      ) : models && models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card key={model.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[var(--radius-btn)] bg-accent/15 flex items-center justify-center">
                    <Package size={16} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{model.name}</h3>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">{model.algorithm} — {model.environment_id}</p>
                  </div>
                </div>
                <Badge variant={stageVariant(model.stage)}>{model.stage}</Badge>
              </div>
              <div className="space-y-1 text-xs">
                {model.mean_reward != null && (
                  <div className="flex justify-between">
                    <span className="dark:text-dark-text-secondary text-light-text-secondary">Mean Reward</span>
                    <span className="font-mono">{model.mean_reward.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="dark:text-dark-text-secondary text-light-text-secondary">Version ID</span>
                  <span className="font-mono">{model.model_version_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-dark-text-secondary text-light-text-secondary">Current</span>
                  <span className="font-mono">{model.is_current ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t dark:border-dark-border border-light-border">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      promoteMutation.mutate({
                        id: model.id,
                        target_stage: e.target.value,
                        model_version_id: model.model_version_id,
                      });
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-2 py-1 text-xs rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                >
                  <option value="" disabled>Promote to...</option>
                  {STAGES.filter((s) => s !== model.stage).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-3">
                Created {new Date(model.created_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">No models registered yet</p>
          </div>
        </Card>
      )}

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title="Register Model">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            registerMutation.mutate(registerForm);
          }}
          className="space-y-4"
        >
          <Input label="Model Version ID" value={registerForm.model_version_id} onChange={(e) => setRegisterForm({ ...registerForm, model_version_id: e.target.value })} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Environment ID</label>
            <select
              value={registerForm.environment_id}
              onChange={(e) => setRegisterForm({ ...registerForm, environment_id: e.target.value })}
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
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Algorithm</label>
            <select
              value={registerForm.algorithm}
              onChange={(e) => setRegisterForm({ ...registerForm, algorithm: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              required
            >
              {['PPO', 'A2C', 'DQN', 'SAC', 'TD3', 'DDPG', 'TQC', 'TRPO', 'ARS', 'RecurrentPPO'].map((alg) => (
                <option key={alg} value={alg}>{alg}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setRegisterOpen(false)}>Cancel</Button>
            <Button type="submit" loading={registerMutation.isPending}>Register</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
