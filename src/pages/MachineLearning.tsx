import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Trash2, Play } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { mlApi } from '../api/ml';
import { datasetsApi } from '../api/datasets';
import type { MLTrainRequest, MLTrainResponse, MLPredictResponse } from '../types';

const TASK_TYPES = ['classification', 'regression', 'clustering', 'dimensionality_reduction'];

export default function MachineLearning() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'train' | 'models'>('train');

  // Train state
  const [datasetId, setDatasetId] = useState<number | ''>('');
  const [taskType, setTaskType] = useState('classification');
  const [algorithm, setAlgorithm] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [testSplit, setTestSplit] = useState(0.2);
  const [hyperparamsText, setHyperparamsText] = useState('{}');
  const [trainResult, setTrainResult] = useState<MLTrainResponse | null>(null);

  // Predict state
  const [predictModelId, setPredictModelId] = useState<number | ''>('');
  const [featuresText, setFeaturesText] = useState('');
  const [predictResult, setPredictResult] = useState<MLPredictResponse | null>(null);

  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsApi.list(),
  });

  const { data: mlAlgorithms } = useQuery({
    queryKey: ['ml-algorithms'],
    queryFn: () => mlApi.getAlgorithms(),
  });

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['ml-models'],
    queryFn: () => mlApi.listModels(),
  });

  const selectedDataset = datasets?.find((d) => d.id === datasetId);
  const filteredAlgorithms = mlAlgorithms?.[taskType] ?? [];

  const trainMutation = useMutation({
    mutationFn: (data: MLTrainRequest) => mlApi.train(data),
    onSuccess: (data) => {
      setTrainResult(data);
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
    },
  });

  const predictMutation = useMutation({
    mutationFn: () => {
      const rows = featuresText
        .trim()
        .split('\n')
        .map((line) => line.split(',').map(Number));
      return mlApi.predict({ model_id: predictModelId as number, features: rows });
    },
    onSuccess: (data) => setPredictResult(data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mlApi.deleteModel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ml-models'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Machine Learning</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Train and evaluate ML models on your datasets
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b dark:border-dark-border border-light-border">
        {(['train', 'models'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer capitalize ${
              tab === t
                ? 'border-accent text-accent'
                : 'border-transparent dark:text-dark-text-secondary text-light-text-secondary hover:text-accent/70'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'train' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Train form */}
          <Card>
            <h2 className="text-base font-semibold mb-4">Train Model</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                let hp: Record<string, unknown> = {};
                try { hp = JSON.parse(hyperparamsText); } catch { /* keep empty */ }
                trainMutation.mutate({
                  dataset_id: datasetId as number,
                  algorithm,
                  target_column: targetColumn || undefined,
                  hyperparameters: Object.keys(hp).length > 0 ? hp : undefined,
                  test_split: testSplit,
                  task_type: taskType,
                });
              }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Dataset</label>
                <select
                  value={datasetId}
                  onChange={(e) => {
                    setDatasetId(Number(e.target.value));
                    setTargetColumn('');
                  }}
                  className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                  required
                >
                  <option value="">Select dataset...</option>
                  {datasets?.map((ds) => (
                    <option key={ds.id} value={ds.id}>{ds.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => {
                    setTaskType(e.target.value);
                    setAlgorithm('');
                  }}
                  className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                  required
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Algorithm</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                  required
                >
                  <option value="">Select algorithm...</option>
                  {filteredAlgorithms.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {selectedDataset?.columns && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Target Column</label>
                  <select
                    value={targetColumn}
                    onChange={(e) => setTargetColumn(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                  >
                    <option value="">None (unsupervised)</option>
                    {selectedDataset.columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                  Test Split: {testSplit}
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={0.5}
                  step={0.05}
                  value={testSplit}
                  onChange={(e) => setTestSplit(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Hyperparameters (JSON)</label>
                <textarea
                  value={hyperparamsText}
                  onChange={(e) => setHyperparamsText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm font-mono rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                />
              </div>

              <Button type="submit" loading={trainMutation.isPending} className="w-full" disabled={!datasetId || !algorithm}>
                <Brain size={16} />
                Train Model
              </Button>

              {trainMutation.isError && (
                <p className="text-sm text-red-500">
                  {(trainMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Training failed'}
                </p>
              )}
            </form>
          </Card>

          {/* Results panel */}
          <Card>
            <h2 className="text-base font-semibold mb-4">Training Results</h2>
            {trainResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">Model ID</p>
                    <p className="font-mono font-bold">{trainResult.model_id}</p>
                  </div>
                  <div>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">Algorithm</p>
                    <p className="font-mono">{trainResult.algorithm}</p>
                  </div>
                  <div>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">Training Time</p>
                    <p className="font-mono">{trainResult.training_time_seconds.toFixed(2)}s</p>
                  </div>
                  <div>
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">NaN Rows Dropped</p>
                    <p className="font-mono">{trainResult.nan_rows_dropped}</p>
                  </div>
                </div>

                {/* Metrics table */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Metrics</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(trainResult.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between px-3 py-1.5 rounded dark:bg-dark-hover bg-light-hover">
                        <span className="dark:text-dark-text-secondary text-light-text-secondary">{key}</span>
                        <span className="font-mono font-medium">{typeof value === 'number' ? value.toFixed(4) : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature importance chart */}
                {trainResult.feature_importance && trainResult.feature_importance.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Feature Importance</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trainResult.feature_importance} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dark-border)" />
                          <XAxis type="number" stroke="var(--color-dark-text-secondary)" fontSize={10} />
                          <YAxis
                            dataKey="feature"
                            type="category"
                            width={100}
                            stroke="var(--color-dark-text-secondary)"
                            fontSize={10}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--color-dark-card)',
                              border: '1px solid var(--color-dark-border)',
                              borderRadius: 'var(--radius-card)',
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="importance" fill="#d97757" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary text-center py-8">
                Train a model to see results
              </p>
            )}
          </Card>
        </div>
      )}

      {tab === 'models' && (
        <div className="space-y-6">
          {/* Models list */}
          {modelsLoading ? (
            <Card padding="none">
              <div className="animate-pulse p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
                ))}
              </div>
            </Card>
          ) : models && models.length > 0 ? (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-dark-border border-light-border">
                      <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">ID</th>
                      <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Algorithm</th>
                      <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Task</th>
                      <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Metrics</th>
                      <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Created</th>
                      <th className="text-right px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr key={model.id} className="border-b last:border-b-0 dark:border-dark-border border-light-border dark:hover:bg-dark-hover/50 hover:bg-light-hover/50">
                        <td className="px-5 py-3 font-mono text-xs">{model.id}</td>
                        <td className="px-5 py-3 font-medium">{model.name}</td>
                        <td className="px-5 py-3 font-mono text-xs">{model.algorithm}</td>
                        <td className="px-5 py-3">
                          <Badge variant="accent">{model.task_type}</Badge>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">
                          {Object.entries(model.metrics).slice(0, 2).map(([k, v]) => (
                            <span key={k} className="mr-2">{k}: {typeof v === 'number' ? v.toFixed(3) : String(v)}</span>
                          ))}
                        </td>
                        <td className="px-5 py-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                          {new Date(model.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(model.id)}>
                            <Trash2 size={13} />
                          </Button>
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
                <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">No models yet</p>
              </div>
            </Card>
          )}

          {/* Predict section */}
          <Card>
            <h2 className="text-base font-semibold mb-4">Predict</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (predictModelId) predictMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Model</label>
                <select
                  value={predictModelId}
                  onChange={(e) => setPredictModelId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                  required
                >
                  <option value="">Select model...</option>
                  {models?.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.algorithm})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                  Features (CSV, one row per line)
                </label>
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={4}
                  placeholder="1.0,2.0,3.0&#10;4.0,5.0,6.0"
                  className="w-full px-3 py-2 text-sm font-mono rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                  required
                />
              </div>

              <Button type="submit" loading={predictMutation.isPending} disabled={!predictModelId || !featuresText.trim()}>
                <Play size={16} />
                Predict
              </Button>
            </form>

            {predictResult && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold">Results ({predictResult.inference_time_ms.toFixed(1)} ms)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">Row</th>
                        <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">Prediction</th>
                        {predictResult.probabilities && (
                          <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">Probabilities</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {predictResult.predictions.map((pred, i) => (
                        <tr key={i} className="border-t dark:border-dark-border border-light-border">
                          <td className="px-3 py-1.5 font-mono">{i + 1}</td>
                          <td className="px-3 py-1.5 font-mono font-bold">{String(pred)}</td>
                          {predictResult.probabilities && (
                            <td className="px-3 py-1.5 font-mono">
                              [{predictResult.probabilities[i]?.map((p) => p.toFixed(3)).join(', ')}]
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
