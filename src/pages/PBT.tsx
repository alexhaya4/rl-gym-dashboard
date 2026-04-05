import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Play, Trophy, Eye } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { pbtApi } from '../api/pbt';
import type { PBTMember } from '../types';

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

export default function PBT() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    environment_id: 'CartPole-v1',
    algorithm: 'PPO',
    n_population: 8,
    total_timesteps: 100000,
  });
  const [membersModal, setMembersModal] = useState<{
    id: number;
    members: PBTMember[];
    best: PBTMember | null;
  } | null>(null);

  const { data: pbtList, isLoading } = useQuery({
    queryKey: ['pbt-list'],
    queryFn: () => pbtApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      pbtApi.create({
        environment_id: form.environment_id,
        algorithm: form.algorithm,
        n_population: form.n_population,
        total_timesteps: form.total_timesteps,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pbt-list'] }),
  });

  const fetchMembers = useCallback(async (id: number) => {
    const [members, best] = await Promise.all([
      pbtApi.members(id),
      pbtApi.best(id).catch(() => null),
    ]);
    setMembersModal({ id, members, best });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Population-Based Training</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Evolutionary hyperparameter optimization with population scheduling
        </p>
      </div>

      {/* Create form */}
      <Card>
        <h3 className="text-sm font-semibold mb-4">Create PBT Run</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
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
            label="Population Size"
            type="number"
            min={4}
            max={32}
            value={form.n_population}
            onChange={(e) => setForm({ ...form, n_population: Number(e.target.value) })}
            required
          />
          <Input
            label="Total Timesteps"
            type="number"
            min={1000}
            value={form.total_timesteps}
            onChange={(e) => setForm({ ...form, total_timesteps: Number(e.target.value) })}
            required
          />
          <Button type="submit" loading={createMutation.isPending}>
            <Play size={16} />
            Create PBT Run
          </Button>
        </form>
      </Card>

      {/* PBT list */}
      <Card>
        <h3 className="text-sm font-semibold mb-4">PBT Runs</h3>
        {isLoading ? (
          <div className="animate-pulse h-20 rounded dark:bg-dark-border bg-light-border" />
        ) : pbtList && pbtList.length > 0 ? (
          <div className="space-y-3">
            {pbtList.map((pbt) => (
              <div
                key={pbt.id}
                className="flex items-center justify-between p-3 rounded-[var(--radius-card)] border dark:border-dark-border border-light-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[var(--radius-btn)] bg-accent/15 flex items-center justify-center">
                    <Layers size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {pbt.environment_id} — {pbt.algorithm}
                    </p>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      Pop: {pbt.n_population} &middot; Gen: {pbt.generation} &middot; Best:{' '}
                      {pbt.best_reward?.toFixed(2) ?? '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(pbt.status)}>{pbt.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => fetchMembers(pbt.id)}>
                    <Eye size={14} />
                    Members
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            No PBT runs yet
          </p>
        )}
      </Card>

      {/* Members modal */}
      {membersModal && (
        <Modal
          open={true}
          onClose={() => setMembersModal(null)}
          title={`PBT ${membersModal.id} — Members`}
          maxWidth="max-w-2xl"
        >
          {membersModal.best && (
            <div className="mb-4 p-3 rounded-[var(--radius-card)] border-2 border-amber-500/40 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-amber-400" />
                <span className="text-sm font-semibold">Best Member</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="dark:text-dark-text-secondary text-light-text-secondary">
                    Index:
                  </span>{' '}
                  <span className="font-mono font-bold">{membersModal.best.member_index}</span>
                </div>
                <div>
                  <span className="dark:text-dark-text-secondary text-light-text-secondary">
                    Mean Reward:
                  </span>{' '}
                  <span className="font-mono font-bold">
                    {membersModal.best.mean_reward?.toFixed(2) ?? '—'}
                  </span>
                </div>
                <div>
                  <span className="dark:text-dark-text-secondary text-light-text-secondary">
                    Generation:
                  </span>{' '}
                  <span className="font-mono">{membersModal.best.generation}</span>
                </div>
                <div>
                  <span className="dark:text-dark-text-secondary text-light-text-secondary">
                    Params:
                  </span>{' '}
                  <span className="font-mono">
                    {JSON.stringify(membersModal.best.hyperparameters)}
                  </span>
                </div>
              </div>
            </div>
          )}
          {membersModal.members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-dark-border border-light-border">
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Index
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Mean Reward
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Generation
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Best
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {membersModal.members.map((m) => (
                    <tr
                      key={m.id}
                      className={`border-b last:border-b-0 dark:border-dark-border border-light-border ${
                        m.is_best ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-mono text-xs">{m.member_index}</td>
                      <td className="px-4 py-2 font-mono text-xs">
                        {m.mean_reward?.toFixed(2) ?? '—'}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">{m.generation}</td>
                      <td className="px-4 py-2">
                        <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        {m.is_best && <Trophy size={14} className="text-amber-400" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary text-center py-4">
              No members data available
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
