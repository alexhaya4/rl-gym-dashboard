import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search, List } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { experimentsApi } from '../api/experiments';
import type { ExperimentCreate } from '../types';

const statusVariant = (s: string) => {
  switch (s) {
    case 'completed': return 'success' as const;
    case 'running': return 'info' as const;
    case 'failed': return 'error' as const;
    case 'cancelled': return 'warning' as const;
    default: return 'default' as const;
  }
};

export default function Experiments() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState<ExperimentCreate>({
    name: '',
    environment_id: 'CartPole-v1',
    algorithm: 'PPO',
    hyperparameters: {},
    total_timesteps: 10000,
  });

  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => experimentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: ExperimentCreate) => experimentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => experimentsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['experiments'] }),
  });

  const [episodes, setEpisodes] = useState<{ id: number; data: Record<string, unknown>[] } | null>(null);

  const fetchEpisodes = useCallback(async (experimentId: number) => {
    try {
      const data = await experimentsApi.episodes(experimentId);
      setEpisodes({ id: experimentId, data });
    } catch { /* may not be available */ }
  }, []);

  const filtered = experiments?.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(filter.toLowerCase()) ||
      exp.algorithm.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Experiments</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Track and manage your experiments
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          New Experiment
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-dark-text-secondary text-light-text-secondary" />
          <input
            type="text"
            placeholder="Search experiments..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
        >
          <option value="all">All Status</option>
          <option value="created">Created</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Episodes panel */}
      {episodes && (
        <Card padding="none">
          <div className="flex items-center justify-between p-5 border-b dark:border-dark-border border-light-border">
            <h3 className="text-sm font-semibold">Episodes — Experiment <span className="font-mono text-accent">{episodes.id}</span></h3>
            <Button variant="ghost" size="sm" onClick={() => setEpisodes(null)}>Close</Button>
          </div>
          {episodes.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-dark-border border-light-border">
                    {Object.keys(episodes.data[0]).map((key) => (
                      <th key={key} className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {episodes.data.map((ep, i) => (
                    <tr key={i} className="border-b last:border-b-0 dark:border-dark-border border-light-border">
                      {Object.values(ep).map((val, j) => (
                        <td key={j} className="px-5 py-3 font-mono text-xs">
                          {typeof val === 'number' ? val.toFixed(2) : String(val ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">No episodes recorded</p>
            </div>
          )}
        </Card>
      )}

      {isLoading ? (
        <Card padding="none">
          <div className="animate-pulse p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
            ))}
          </div>
        </Card>
      ) : filtered && filtered.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Algorithm</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Mean Reward</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Created</th>
                  <th className="text-right px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => (
                  <tr key={exp.id} className="border-b last:border-b-0 dark:border-dark-border border-light-border dark:hover:bg-dark-hover/50 hover:bg-light-hover/50">
                    <td className="px-5 py-3">
                      <p className="font-medium">{exp.name}</p>
                      <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">{exp.environment_id}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{exp.algorithm}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant(exp.status)}>{exp.status}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {exp.mean_reward?.toFixed(2) ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {new Date(exp.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => fetchEpisodes(exp.id)}>
                          <List size={13} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(exp.id)} className="text-red-500">
                          <Trash2 size={13} />
                        </Button>
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
              {filter || statusFilter !== 'all' ? 'No matching experiments' : 'No experiments yet'}
            </p>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Experiment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Algorithm</label>
            <select
              value={form.algorithm}
              onChange={(e) => setForm({ ...form, algorithm: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              required
            >
              {['PPO', 'A2C', 'DQN', 'SAC', 'TD3', 'DDPG', 'TQC', 'TRPO', 'ARS', 'RecurrentPPO'].map((alg) => (
                <option key={alg} value={alg}>{alg}</option>
              ))}
            </select>
          </div>
          <Input label="Total Timesteps" type="number" value={form.total_timesteps} onChange={(e) => setForm({ ...form, total_timesteps: Number(e.target.value) })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
