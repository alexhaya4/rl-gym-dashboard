import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Play, BarChart3, List } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { evaluationApi } from '../api/evaluation';

export default function Evaluation() {
  const [form, setForm] = useState({
    experiment_id: 1,
    n_episodes: 10,
    deterministic: true,
  });
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [episodeExpId, setEpisodeExpId] = useState<number | null>(null);

  const runMutation = useMutation({
    mutationFn: (data: { experiment_id: number; n_episodes: number; deterministic?: boolean }) =>
      evaluationApi.run(data),
    onSuccess: (data) => {
      setResults(data);
      setEpisodeExpId(form.experiment_id);
    },
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['evaluation-episodes', episodeExpId],
    queryFn: () => evaluationApi.episodes(episodeExpId!),
    enabled: episodeExpId !== null,
  });

  const episodeColumns = episodes && episodes.length > 0 ? Object.keys(episodes[0]) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Model Evaluation</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Evaluate trained models across episodes
        </p>
      </div>

      <Card>
        <h3 className="text-sm font-semibold mb-4">Run Evaluation</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Experiment ID"
              type="number"
              value={form.experiment_id}
              onChange={(e) => setForm({ ...form, experiment_id: Number(e.target.value) })}
              required
            />
            <Input
              label="Number of Episodes"
              type="number"
              value={form.n_episodes}
              onChange={(e) => setForm({ ...form, n_episodes: Number(e.target.value) })}
              min={1}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                Deterministic
              </label>
              <button
                type="button"
                onClick={() => setForm({ ...form, deterministic: !form.deterministic })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors self-start mt-1 ${
                  form.deterministic ? 'bg-accent' : 'dark:bg-dark-border bg-light-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.deterministic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={runMutation.isPending}>
              <Play size={16} />
              Run Evaluation
            </Button>
          </div>
        </form>
      </Card>

      {results && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-accent" />
            <h3 className="text-sm font-semibold">Evaluation Results</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(results).map(([key, value]) => (
              <div
                key={key}
                className="p-3 rounded-[var(--radius-card)] dark:bg-dark-bg bg-light-bg"
              >
                <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mb-1">
                  {key}
                </p>
                <p className="text-sm font-semibold font-mono">
                  {typeof value === 'number' ? value.toFixed(4) : JSON.stringify(value)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {episodeExpId !== null && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <List size={18} className="text-accent" />
            <h3 className="text-sm font-semibold">Episodes — Experiment {episodeExpId}</h3>
          </div>
          {episodesLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 rounded dark:bg-dark-border bg-light-border" />
              ))}
            </div>
          ) : episodes && episodes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-dark-border border-light-border">
                    {episodeColumns.map((col) => (
                      <th
                        key={col}
                        className="text-left py-2 px-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {episodes.map((ep, idx) => (
                    <tr
                      key={idx}
                      className="border-b dark:border-dark-border/50 border-light-border/50 dark:hover:bg-dark-hover hover:bg-light-hover transition-colors"
                    >
                      {episodeColumns.map((col) => (
                        <td key={col} className="py-2 px-3 font-mono text-xs">
                          {typeof ep[col] === 'number'
                            ? (ep[col] as number).toFixed(4)
                            : String(ep[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
              No episodes found.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
