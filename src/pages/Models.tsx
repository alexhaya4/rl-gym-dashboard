import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Download, Trash2, RotateCcw, GitCompare } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { registryApi } from '../api/registry';
import { modelsApi } from '../api/models';
import type { RegistryEntry, ModelVersionResponse } from '../types';

const stageVariant = (s: string) => {
  switch (s) {
    case 'production':
      return 'success' as const;
    case 'staging':
      return 'warning' as const;
    case 'development':
      return 'info' as const;
    case 'archived':
      return 'default' as const;
    default:
      return 'default' as const;
  }
};

const STAGES = ['development', 'staging', 'production', 'archived'] as const;

export default function Models() {
  const queryClient = useQueryClient();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    model_version_id: '',
    environment_id: 'CartPole-v1',
    algorithm: 'PPO',
  });
  const [versions, setVersions] = useState<{
    experimentId: number;
    data: ModelVersionResponse[];
  } | null>(null);
  const [comparison, setComparison] = useState<{
    id: number;
    data: Record<string, unknown>;
  } | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<RegistryEntry | null>(null);
  const [rollbackComment, setRollbackComment] = useState('');

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: () => registryApi.list(),
  });

  const registerMutation = useMutation({
    mutationFn: (data: { model_version_id: string; environment_id: string; algorithm: string }) =>
      registryApi.register({
        model_version_id: Number(data.model_version_id),
        environment_id: data.environment_id,
        algorithm: data.algorithm,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setRegisterOpen(false);
      setRegisterForm({ model_version_id: '', environment_id: 'CartPole-v1', algorithm: 'PPO' });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: ({
      id,
      target_stage,
      model_version_id,
    }: {
      id: number;
      target_stage: string;
      model_version_id: number;
    }) => registryApi.promote(id, { model_version_id, target_stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['models'] }),
  });

  const rollbackMutation = useMutation({
    mutationFn: ({
      envId,
      algorithm,
      comment,
    }: {
      envId: string;
      algorithm: string;
      comment?: string;
    }) => registryApi.rollback(envId, algorithm, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setRollbackTarget(null);
      setRollbackComment('');
    },
  });

  const deleteVersionMutation = useMutation({
    mutationFn: (versionId: number) => modelsApi.delete(versionId),
    onSuccess: () => {
      if (versions) {
        modelsApi
          .listByExperiment(versions.experimentId)
          .then((data) => setVersions({ experimentId: versions.experimentId, data }));
      }
    },
  });

  const fetchVersions = useCallback(async (experimentId: number) => {
    try {
      const data = await modelsApi.listByExperiment(experimentId);
      setVersions({ experimentId, data });
    } catch {
      /* ignore */
    }
  }, []);

  const fetchComparison = useCallback(async (registryId: number) => {
    try {
      const data = await registryApi.compare(registryId);
      setComparison({ id: registryId, data });
    } catch {
      /* ignore */
    }
  }, []);

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

      {/* Comparison card */}
      {comparison && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Comparison — <span className="font-mono text-accent">{comparison.id}</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setComparison(null)}>
              Close
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {Object.entries(comparison.data).map(([key, value]) => (
              <div key={key}>
                <span className="dark:text-dark-text-secondary text-light-text-secondary">
                  {key}:
                </span>{' '}
                <span className="font-mono font-medium">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Model versions card */}
      {versions && (
        <Card padding="none">
          <div className="flex items-center justify-between p-5 border-b dark:border-dark-border border-light-border">
            <h3 className="text-sm font-semibold">
              Model Versions — Experiment{' '}
              <span className="font-mono text-accent">{versions.experimentId}</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setVersions(null)}>
              Close
            </Button>
          </div>
          {versions.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-dark-border border-light-border">
                    <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Version
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Algorithm
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Mean Reward
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {versions.data.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b last:border-b-0 dark:border-dark-border border-light-border"
                    >
                      <td className="px-5 py-3 font-mono text-xs">{v.id}</td>
                      <td className="px-5 py-3 font-mono text-xs">v{v.version}</td>
                      <td className="px-5 py-3 font-mono text-xs">{v.algorithm}</td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {v.mean_reward?.toFixed(2) ?? '—'}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {v.file_size_bytes
                          ? `${(v.file_size_bytes / 1024 / 1024).toFixed(2)} MB`
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                        {new Date(v.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => modelsApi.download(v.id)}
                          >
                            <Download size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => deleteVersionMutation.mutate(v.id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
                No versions found
              </p>
            </div>
          )}
        </Card>
      )}

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
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {model.algorithm} — {model.environment_id}
                    </p>
                  </div>
                </div>
                <Badge variant={stageVariant(model.stage)}>{model.stage}</Badge>
              </div>
              <div className="space-y-1 text-xs">
                {model.mean_reward != null && (
                  <div className="flex justify-between">
                    <span className="dark:text-dark-text-secondary text-light-text-secondary">
                      Mean Reward
                    </span>
                    <span className="font-mono">{model.mean_reward.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="dark:text-dark-text-secondary text-light-text-secondary">
                    Version ID
                  </span>
                  <span className="font-mono">{model.model_version_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-dark-text-secondary text-light-text-secondary">
                    Current
                  </span>
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
                  <option value="" disabled>
                    Promote to...
                  </option>
                  {STAGES.filter((s) => s !== model.stage).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRollbackTarget(model)}
                  title="Rollback"
                >
                  <RotateCcw size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchComparison(model.id)}
                  title="Compare"
                >
                  <GitCompare size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchVersions(model.model_version_id)}
                  title="Versions"
                >
                  <Package size={13} />
                </Button>
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
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              No models registered yet
            </p>
          </div>
        </Card>
      )}

      {/* Register Modal */}
      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title="Register Model">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            registerMutation.mutate(registerForm);
          }}
          className="space-y-4"
        >
          <Input
            label="Model Version ID"
            value={registerForm.model_version_id}
            onChange={(e) => setRegisterForm({ ...registerForm, model_version_id: e.target.value })}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Environment ID
            </label>
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
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Algorithm
            </label>
            <select
              value={registerForm.algorithm}
              onChange={(e) => setRegisterForm({ ...registerForm, algorithm: e.target.value })}
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
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setRegisterOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={registerMutation.isPending}>
              Register
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rollback Modal */}
      <Modal
        open={rollbackTarget != null}
        onClose={() => {
          setRollbackTarget(null);
          setRollbackComment('');
        }}
        title="Rollback Model"
      >
        {rollbackTarget && (
          <div className="space-y-4">
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
              Rollback{' '}
              <span className="font-mono font-medium">
                {rollbackTarget.environment_id}/{rollbackTarget.algorithm}
              </span>{' '}
              to the previous production version?
            </p>
            <Input
              label="Comment (optional)"
              value={rollbackComment}
              onChange={(e) => setRollbackComment(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setRollbackTarget(null);
                  setRollbackComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={rollbackMutation.isPending}
                onClick={() =>
                  rollbackMutation.mutate({
                    envId: rollbackTarget.environment_id,
                    algorithm: rollbackTarget.algorithm,
                    comment: rollbackComment || undefined,
                  })
                }
              >
                Rollback
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
