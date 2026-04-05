import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, StopCircle } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { distributedApi } from '../api/distributed';
import { environmentsApi } from '../api/environments';
import { apiClient, getItems } from '../api/client';
import type { Algorithm, DistributedTrainRequest } from '../types';

const statusVariant = (s: string) => {
  switch (s) {
    case 'completed':
      return 'success' as const;
    case 'training':
      return 'info' as const;
    case 'failed':
      return 'error' as const;
    case 'queued':
    case 'initializing':
      return 'warning' as const;
    case 'cancelled':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
};

export default function DistributedTraining() {
  const queryClient = useQueryClient();
  const [envId, setEnvId] = useState('CartPole-v1');
  const [algorithm, setAlgorithm] = useState('PPO');
  const [totalTimesteps, setTotalTimesteps] = useState(50000);
  const [numWorkers, setNumWorkers] = useState(2);
  const [numEnvsPerWorker, setNumEnvsPerWorker] = useState(4);
  const [experimentName, setExperimentName] = useState('');

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

  const { data: cluster } = useQuery({
    queryKey: ['distributed-cluster'],
    queryFn: () => distributedApi.getCluster(),
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['distributed-jobs'],
    queryFn: () => distributedApi.listJobs(),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;
      const hasActive = data.some(
        (j) => j.status !== 'completed' && j.status !== 'failed' && j.status !== 'cancelled'
      );
      return hasActive ? 3000 : false;
    },
  });

  const trainMutation = useMutation({
    mutationFn: (data: DistributedTrainRequest) => distributedApi.train(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributed-jobs'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (jobId: string) => distributedApi.cancel(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['distributed-jobs'] }),
  });

  const estimatedSpeedup = Math.min(
    numWorkers * numEnvsPerWorker * 0.85,
    numWorkers * numEnvsPerWorker
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Distributed Training</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Scale training across multiple workers
        </p>
      </div>

      {/* Cluster info */}
      <Card>
        <h2 className="text-base font-semibold mb-3">Cluster Info</h2>
        {cluster ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(cluster).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                  {key}
                </p>
                <p className="font-mono font-medium">
                  {typeof value === 'boolean' ? (
                    <Badge variant={value ? 'success' : 'error'}>{value ? 'Yes' : 'No'}</Badge>
                  ) : (
                    String(value)
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            Loading cluster info...
          </p>
        )}
      </Card>

      {/* Start Training form */}
      <Card>
        <h2 className="text-base font-semibold mb-4">Start Distributed Training</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            trainMutation.mutate({
              environment_id: envId,
              algorithm,
              total_timesteps: totalTimesteps,
              num_workers: numWorkers,
              num_envs_per_worker: numEnvsPerWorker,
              experiment_name: experimentName || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                )) ??
                  ['PPO', 'A2C', 'DQN'].map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <Input
            label="Total Timesteps"
            type="number"
            value={totalTimesteps}
            onChange={(e) => setTotalTimesteps(Number(e.target.value))}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Workers: {numWorkers}
              </label>
              <input
                type="range"
                min={1}
                max={4}
                value={numWorkers}
                onChange={(e) => setNumWorkers(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Envs per Worker: {numEnvsPerWorker}
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={numEnvsPerWorker}
                onChange={(e) => setNumEnvsPerWorker(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <Input
            label="Experiment Name (optional)"
            value={experimentName}
            onChange={(e) => setExperimentName(e.target.value)}
          />

          <div className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            Total envs:{' '}
            <span className="font-mono font-medium text-accent">
              {numWorkers * numEnvsPerWorker}
            </span>
            {' | '}
            Estimated speedup:{' '}
            <span className="font-mono font-medium text-accent">
              ~{estimatedSpeedup.toFixed(1)}x
            </span>
          </div>

          <Button type="submit" loading={trainMutation.isPending} className="w-full">
            <Network size={16} />
            Start Distributed Training
          </Button>

          {trainMutation.isError && (
            <p className="text-sm text-red-500">
              {(trainMutation.error as { response?: { data?: { detail?: string } } })?.response
                ?.data?.detail || 'Training failed'}
            </p>
          )}
        </form>
      </Card>

      {/* Jobs list */}
      {jobsLoading ? (
        <Card padding="none">
          <div className="animate-pulse p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
            ))}
          </div>
        </Card>
      ) : jobs && jobs.length > 0 ? (
        <Card padding="none">
          <div className="p-5 border-b dark:border-dark-border border-light-border">
            <h2 className="text-base font-semibold">Jobs</h2>
          </div>
          <div className="divide-y dark:divide-dark-border divide-light-border">
            {jobs.map((job) => (
              <div key={job.job_id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                    <span className="font-mono text-xs">{job.job_id.slice(0, 12)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {job.elapsed_seconds.toFixed(0)}s elapsed
                    </span>
                    {(job.status === 'queued' ||
                      job.status === 'initializing' ||
                      job.status === 'training') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => cancelMutation.mutate(job.job_id)}
                        loading={cancelMutation.isPending}
                      >
                        <StopCircle size={13} />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full dark:bg-dark-border bg-light-border overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(job.progress * 100, 100)}%` }}
                  />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="dark:text-dark-text-secondary text-light-text-secondary">
                      Progress
                    </span>
                    <p className="font-mono font-medium">{(job.progress * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="dark:text-dark-text-secondary text-light-text-secondary">
                      Workers Active
                    </span>
                    <p className="font-mono font-medium">{job.num_workers_active}</p>
                  </div>
                  {job.metrics && (
                    <>
                      {job.metrics.mean_reward != null && (
                        <div>
                          <span className="dark:text-dark-text-secondary text-light-text-secondary">
                            Mean Reward
                          </span>
                          <p className="font-mono font-medium">
                            {Number(job.metrics.mean_reward).toFixed(2)}
                          </p>
                        </div>
                      )}
                      {job.metrics.fps != null && (
                        <div>
                          <span className="dark:text-dark-text-secondary text-light-text-secondary">
                            FPS
                          </span>
                          <p className="font-mono font-medium">
                            {Number(job.metrics.fps).toFixed(0)}
                          </p>
                        </div>
                      )}
                      {job.metrics.episodes != null && (
                        <div>
                          <span className="dark:text-dark-text-secondary text-light-text-secondary">
                            Episodes
                          </span>
                          <p className="font-mono font-medium">{String(job.metrics.episodes)}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {job.error && <p className="text-xs text-red-500">Error: {job.error}</p>}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
              No distributed training jobs yet
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
