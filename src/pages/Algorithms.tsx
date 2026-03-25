import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cpu } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { apiClient, getItems } from '../api/client';
import type { Algorithm } from '../types';

export default function Algorithms() {
  const [envFilter, setEnvFilter] = useState('');
  const [detail, setDetail] = useState<Algorithm | null>(null);

  const { data: algorithms, isLoading } = useQuery({
    queryKey: ['algorithms', envFilter],
    queryFn: async () => {
      if (envFilter) {
        const res = await apiClient.get(`/algorithms/compatible/${envFilter}`);
        return getItems<Algorithm>(res.data);
      }
      const res = await apiClient.get('/algorithms/');
      return getItems<Algorithm>(res.data);
    },
  });

  const fetchDetail = useCallback(async (name: string) => {
    try {
      const res = await apiClient.get<Algorithm>(`/algorithms/${name}`);
      setDetail(res.data);
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Algorithms</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Available RL algorithms and their configurations
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
          >
            <option value="">All Environments</option>
            <option value="CartPole-v1">CartPole-v1</option>
            <option value="LunarLander-v2">LunarLander-v2</option>
            <option value="MountainCar-v0">MountainCar-v0</option>
            <option value="Acrobot-v1">Acrobot-v1</option>
            <option value="Pendulum-v1">Pendulum-v1</option>
            <option value="MountainCarContinuous-v0">MountainCarContinuous-v0</option>
          </select>
        </div>
      </div>

      {detail && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">{detail.name} — Detail</h3>
            <Button variant="ghost" size="sm" onClick={() => setDetail(null)}>Close</Button>
          </div>
          <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mb-3">{String(detail.description)}</p>
          {detail.hyperparameters_schema && Object.keys(detail.hyperparameters_schema).length > 0 && (
            <div className="p-2 rounded-[var(--radius-input)] dark:bg-dark-bg bg-light-bg">
              <p className="text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary mb-1">Hyperparameters Schema</p>
              <pre className="text-xs font-mono dark:text-dark-text text-light-text overflow-x-auto">
                {JSON.stringify(detail.hyperparameters_schema, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-1/2 rounded dark:bg-dark-border bg-light-border" />
                <div className="h-3 w-3/4 rounded dark:bg-dark-border bg-light-border" />
              </div>
            </Card>
          ))}
        </div>
      ) : algorithms && algorithms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {algorithms.map((algo) => (
            <Card key={algo.name}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[var(--radius-btn)] bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Cpu size={18} className="text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{algo.name}</h3>
                    {algo.category && <Badge variant="accent">{algo.category}</Badge>}
                  </div>
                  <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mb-3">
                    {String(algo.description)}
                  </p>
                  {algo.supported_spaces && algo.supported_spaces.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {algo.supported_spaces.map((s: string) => (
                        <Badge key={s} variant="default">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {algo.hyperparameters_schema && Object.keys(algo.hyperparameters_schema).length > 0 && (
                    <div className="p-2 rounded-[var(--radius-input)] dark:bg-dark-bg bg-light-bg">
                      <p className="text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary mb-1">
                        Hyperparameters
                      </p>
                      <pre className="text-xs font-mono dark:text-dark-text text-light-text overflow-x-auto">
                        {JSON.stringify(algo.hyperparameters_schema, null, 2)}
                      </pre>
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => fetchDetail(algo.name)}>
                    View Detail
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              {envFilter ? 'No compatible algorithms for this environment' : 'No algorithms available'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
