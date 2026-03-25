import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitBranch, CheckCircle2, XCircle, Plus, Play, Square, BarChart3 } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { apiClient, getItems } from '../api/client';
import type { ABTest, ABTestCreate, ABTestStatistics } from '../types';

const statusVariant = (s: string) => {
  switch (s) {
    case 'completed': return 'success' as const;
    case 'running': return 'info' as const;
    case 'draft': return 'default' as const;
    default: return 'default' as const;
  }
};

export default function ABTesting() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ABTestCreate>({
    name: '',
    description: '',
    environment_id: 'CartPole-v1',
    model_version_a_id: 0,
    model_version_b_id: 0,
    traffic_split_a: 0.5,
    n_eval_episodes_per_model: 100,
    significance_level: 0.05,
    statistical_test: 'ttest',
  });

  const { data: tests, isLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const res = await apiClient.get('/ab-testing/');
      return getItems<ABTest>(res.data);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ABTestCreate) => {
      const res = await apiClient.post('/ab-testing/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      setModalOpen(false);
      setForm({ name: '', description: '', environment_id: 'CartPole-v1', model_version_a_id: 0, model_version_b_id: 0, traffic_split_a: 0.5, n_eval_episodes_per_model: 100, significance_level: 0.05, statistical_test: 'ttest' });
    },
  });

  const runMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/ab-testing/${id}/run`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ab-tests'] }),
  });

  const stopMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/ab-testing/${id}/stop`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ab-tests'] }),
  });

  const [statistics, setStatistics] = useState<{ id: number; data: ABTestStatistics } | null>(null);

  const fetchStatistics = useCallback(async (id: number) => {
    try {
      const res = await apiClient.get<ABTestStatistics>(`/ab-testing/${id}/statistics`);
      setStatistics({ id, data: res.data });
    } catch { /* may not be available */ }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">A/B Testing</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Compare model performance with statistical significance
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          New A/B Test
        </Button>
      </div>

      {statistics && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Statistics — <span className="font-mono text-accent">{statistics.id}</span></h3>
            <Button variant="ghost" size="sm" onClick={() => setStatistics(null)}>Close</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div><span className="dark:text-dark-text-secondary text-light-text-secondary">Model A Mean Reward:</span> <span className="font-mono font-bold">{statistics.data.model_a_mean_reward?.toFixed(2) ?? '—'}</span></div>
            <div><span className="dark:text-dark-text-secondary text-light-text-secondary">Model B Mean Reward:</span> <span className="font-mono font-bold">{statistics.data.model_b_mean_reward?.toFixed(2) ?? '—'}</span></div>
            <div><span className="dark:text-dark-text-secondary text-light-text-secondary">p-value:</span> <span className="font-mono">{statistics.data.p_value?.toFixed(4) ?? '—'}</span></div>
            <div><span className="dark:text-dark-text-secondary text-light-text-secondary">Model A Episodes:</span> <span className="font-mono">{statistics.data.model_a_n_episodes}</span></div>
            <div><span className="dark:text-dark-text-secondary text-light-text-secondary">Model B Episodes:</span> <span className="font-mono">{statistics.data.model_b_n_episodes}</span></div>
            <div>
              <span className="dark:text-dark-text-secondary text-light-text-secondary">Significant:</span>{' '}
              <span className={`font-mono font-bold ${statistics.data.is_significant ? 'text-emerald-400' : 'text-amber-400'}`}>
                {statistics.data.is_significant ? 'Yes' : 'No'}
              </span>
            </div>
            {statistics.data.winner && (
              <div><span className="dark:text-dark-text-secondary text-light-text-secondary">Winner:</span> <span className="font-mono font-bold">{statistics.data.winner}</span></div>
            )}
            {statistics.data.effect_size != null && (
              <div><span className="dark:text-dark-text-secondary text-light-text-secondary">Effect Size:</span> <span className="font-mono">{statistics.data.effect_size.toFixed(4)}</span></div>
            )}
            <div><span className="dark:text-dark-text-secondary text-light-text-secondary">Confidence:</span> <span className="font-mono">{(statistics.data.confidence_level * 100).toFixed(1)}%</span></div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <div className="animate-pulse space-y-3">
            <div className="h-32 rounded dark:bg-dark-border bg-light-border" />
          </div>
        </Card>
      ) : tests && tests.length > 0 ? (
        <div className="space-y-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--radius-btn)] bg-accent/15 flex items-center justify-center">
                    <GitBranch size={18} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{test.name}</h3>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {test.description || `${test.n_eval_episodes_per_model} episodes/model — ${test.statistical_test}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {test.status === 'draft' && (
                    <Button variant="ghost" size="sm" onClick={() => runMutation.mutate(test.id)}>
                      <Play size={13} />
                      Run
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <Button variant="ghost" size="sm" onClick={() => stopMutation.mutate(test.id)} className="text-red-500">
                      <Square size={13} />
                      Stop
                    </Button>
                  )}
                  {test.status === 'completed' && (
                    <Button variant="ghost" size="sm" onClick={() => fetchStatistics(test.id)}>
                      <BarChart3 size={13} />
                      Statistics
                    </Button>
                  )}
                  <Badge variant={statusVariant(test.status)}>{test.status}</Badge>
                </div>
              </div>

              {test.statistics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-[var(--radius-card)] dark:bg-dark-bg bg-light-bg">
                      <p className="text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary mb-1">Model A</p>
                      <p className="text-lg font-bold font-mono">{test.statistics.model_a_mean_reward?.toFixed(2) ?? '—'}</p>
                      <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                        {test.statistics.model_a_n_episodes} episodes
                      </p>
                    </div>
                    <div className="p-3 rounded-[var(--radius-card)] dark:bg-dark-bg bg-light-bg">
                      <p className="text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary mb-1">Model B</p>
                      <p className="text-lg font-bold font-mono">{test.statistics.model_b_mean_reward?.toFixed(2) ?? '—'}</p>
                      <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                        {test.statistics.model_b_n_episodes} episodes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-[var(--radius-card)] border dark:border-dark-border border-light-border">
                    {test.statistics.is_significant ? (
                      <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-amber-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {test.statistics.is_significant ? 'Statistically Significant' : 'Not Significant'}
                        {test.statistics.winner && ` — Winner: ${test.statistics.winner}`}
                      </p>
                      <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                        p-value: {test.statistics.p_value?.toFixed(4) ?? '—'} | effect size: {test.statistics.effect_size?.toFixed(4) ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
                  Results pending...
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">No A/B tests yet</p>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create A/B Test">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Environment ID</label>
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
          <Input label="Model Version A ID" type="number" value={form.model_version_a_id} onChange={(e) => setForm({ ...form, model_version_a_id: Number(e.target.value) })} required />
          <Input label="Model Version B ID" type="number" value={form.model_version_b_id} onChange={(e) => setForm({ ...form, model_version_b_id: Number(e.target.value) })} required />
          <Input label="Traffic Split A" type="number" step="0.01" min="0.1" max="0.9" value={form.traffic_split_a} onChange={(e) => setForm({ ...form, traffic_split_a: parseFloat(e.target.value) })} required />
          <Input label="N Eval Episodes Per Model" type="number" value={form.n_eval_episodes_per_model} onChange={(e) => setForm({ ...form, n_eval_episodes_per_model: Number(e.target.value) })} required />
          <Input label="Significance Level" type="number" step="0.01" value={form.significance_level} onChange={(e) => setForm({ ...form, significance_level: parseFloat(e.target.value) })} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Statistical Test</label>
            <select
              value={form.statistical_test}
              onChange={(e) => setForm({ ...form, statistical_test: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            >
              <option value="ttest">T-Test</option>
              <option value="mann_whitney">Mann-Whitney U</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
