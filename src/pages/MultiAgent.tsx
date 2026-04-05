import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Play, Eye } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { multiAgentApi } from '../api/multiAgent';
import type { AgentPolicy } from '../types';

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

export default function MultiAgent() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    environment_id: '',
    n_agents: 2,
    total_timesteps: 100000,
    algorithms: '{}',
  });
  const [agentsModal, setAgentsModal] = useState<{ id: number; agents: AgentPolicy[] } | null>(
    null
  );

  const { data: environments, isLoading: envsLoading } = useQuery({
    queryKey: ['multi-agent-environments'],
    queryFn: () => multiAgentApi.environments(),
  });

  const { data: experiments, isLoading: expsLoading } = useQuery({
    queryKey: ['multi-agent-experiments'],
    queryFn: () => multiAgentApi.list(),
  });

  const trainMutation = useMutation({
    mutationFn: () => {
      let algorithms: Record<string, string> = {};
      try {
        algorithms = JSON.parse(form.algorithms);
      } catch {
        algorithms = {};
      }
      return multiAgentApi.train({
        environment_id: form.environment_id,
        n_agents: form.n_agents,
        total_timesteps: form.total_timesteps,
        algorithms,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['multi-agent-experiments'] }),
  });

  const fetchAgents = useCallback(async (id: number) => {
    const agents = await multiAgentApi.agents(id);
    setAgentsModal({ id, agents });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Multi-Agent Training</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Train multiple agents in cooperative and competitive environments
        </p>
      </div>

      {/* Available environments */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-accent" />
          <h3 className="text-sm font-semibold">Available Environments</h3>
        </div>
        {envsLoading ? (
          <div className="animate-pulse h-16 rounded dark:bg-dark-border bg-light-border" />
        ) : environments && environments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {environments.map((env, i) => (
              <Badge key={i} variant="accent">
                {((env as Record<string, unknown>).id as string) ??
                  ((env as Record<string, unknown>).name as string) ??
                  JSON.stringify(env)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            No environments available
          </p>
        )}
      </Card>

      {/* Train form */}
      <Card>
        <h3 className="text-sm font-semibold mb-4">Start Training</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            trainMutation.mutate();
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
              <option value="">Select environment...</option>
              {environments?.map((env, i) => {
                const envId = ((env as Record<string, unknown>).id as string) ?? String(i);
                const envName = ((env as Record<string, unknown>).name as string) ?? envId;
                return (
                  <option key={i} value={envId}>
                    {envName}
                  </option>
                );
              })}
            </select>
          </div>
          <Input
            label="Number of Agents"
            type="number"
            min={2}
            max={8}
            value={form.n_agents}
            onChange={(e) => setForm({ ...form, n_agents: Number(e.target.value) })}
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Algorithm Mapping (JSON)
            </label>
            <textarea
              value={form.algorithms}
              onChange={(e) => setForm({ ...form, algorithms: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text font-mono"
              rows={3}
              placeholder='{"agent_0": "PPO", "agent_1": "DQN"}'
            />
          </div>
          <Button type="submit" loading={trainMutation.isPending}>
            <Play size={16} />
            Start Training
          </Button>
        </form>
      </Card>

      {/* Experiments list */}
      <Card>
        <h3 className="text-sm font-semibold mb-4">Experiments</h3>
        {expsLoading ? (
          <div className="animate-pulse h-20 rounded dark:bg-dark-border bg-light-border" />
        ) : experiments && experiments.length > 0 ? (
          <div className="space-y-3">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 rounded-[var(--radius-card)] border dark:border-dark-border border-light-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[var(--radius-btn)] bg-accent/15 flex items-center justify-center">
                    <Users size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{exp.environment_id}</p>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {exp.n_agents} agents &middot; {exp.total_timesteps.toLocaleString()}{' '}
                      timesteps
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(exp.status)}>{exp.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => fetchAgents(exp.id)}>
                    <Eye size={14} />
                    Agents
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            No experiments yet
          </p>
        )}
      </Card>

      {/* Agents modal */}
      {agentsModal && (
        <Modal
          open={true}
          onClose={() => setAgentsModal(null)}
          title={`Agents — Experiment ${agentsModal.id}`}
        >
          {agentsModal.agents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-dark-border border-light-border">
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Agent ID
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Algorithm
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Mean Reward
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Episodes
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agentsModal.agents.map((agent) => (
                    <tr
                      key={agent.agent_id}
                      className="border-b last:border-b-0 dark:border-dark-border border-light-border"
                    >
                      <td className="px-4 py-2 font-mono text-xs">{agent.agent_id}</td>
                      <td className="px-4 py-2 text-xs">{agent.algorithm}</td>
                      <td className="px-4 py-2 font-mono text-xs">
                        {agent.mean_reward?.toFixed(2) ?? '—'}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">{agent.episodes_completed}</td>
                      <td className="px-4 py-2">
                        <Badge variant={statusVariant(agent.status)}>{agent.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary text-center py-4">
              No agents data available
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
