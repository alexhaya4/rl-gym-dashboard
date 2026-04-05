import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GitCompare, Download, Tag, GitBranch, ArrowRightLeft } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { experimentsApi } from '../api/experiments';
import { comparisonApi } from '../api/comparison';

export default function Comparison() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [diffA, setDiffA] = useState<number | ''>('');
  const [diffB, setDiffB] = useState<number | ''>('');
  const [lineageId, setLineageId] = useState<number | ''>('');
  const [tagExpId, setTagExpId] = useState<number | ''>('');
  const [tagInput, setTagInput] = useState('');
  const [exportId, setExportId] = useState<number | ''>('');
  const [exportFormat, setExportFormat] = useState('json');

  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => experimentsApi.list(),
  });

  const compareMutation = useMutation({
    mutationFn: (ids: number[]) => comparisonApi.compare(ids),
  });

  const diffMutation = useMutation({
    mutationFn: ({ a, b }: { a: number; b: number }) => comparisonApi.diff(a, b),
  });

  const lineageMutation = useMutation({
    mutationFn: (id: number) => comparisonApi.lineage(id),
  });

  const tagsMutation = useMutation({
    mutationFn: ({ id, tags }: { id: number; tags: string[] }) => comparisonApi.setTags(id, tags),
  });

  const exportMutation = useMutation({
    mutationFn: ({ id, format }: { id: number; format: string }) =>
      comparisonApi.exportExperiment(id, format),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `experiment-${exportId}.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const toggleExperiment = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Experiment Comparison</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Compare, diff, and analyze experiments
        </p>
      </div>

      {/* Select experiments */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <GitCompare size={18} className="text-accent" />
          <h3 className="text-sm font-semibold">Select Experiments to Compare</h3>
        </div>
        {isLoading ? (
          <div className="animate-pulse h-20 rounded dark:bg-dark-border bg-light-border" />
        ) : experiments && experiments.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {experiments.map((exp) => (
              <label
                key={exp.id}
                className="flex items-center gap-3 p-2 rounded-[var(--radius-btn)] dark:hover:bg-dark-hover hover:bg-light-hover cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(exp.id)}
                  onChange={() => toggleExperiment(exp.id)}
                  className="accent-[var(--color-accent)]"
                />
                <span className="font-mono text-xs">{exp.id}</span>
                <span className="text-sm">{exp.name}</span>
                <Badge variant={exp.status === 'completed' ? 'success' : 'default'}>
                  {exp.status}
                </Badge>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            No experiments found
          </p>
        )}
        <div className="mt-4">
          <Button
            onClick={() => compareMutation.mutate(selectedIds)}
            disabled={selectedIds.length < 2}
            loading={compareMutation.isPending}
          >
            <GitCompare size={16} />
            Compare ({selectedIds.length} selected)
          </Button>
        </div>
      </Card>

      {/* Comparison results */}
      {compareMutation.data && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Comparison Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Key
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(compareMutation.data).map(([key, value]) => (
                  <tr
                    key={key}
                    className="border-b last:border-b-0 dark:border-dark-border border-light-border"
                  >
                    <td className="px-4 py-2 font-mono text-xs">{key}</td>
                    <td className="px-4 py-2 font-mono text-xs">{JSON.stringify(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Diff section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft size={18} className="text-accent" />
          <h3 className="text-sm font-semibold">Diff Two Experiments</h3>
        </div>
        <div className="flex items-end gap-3">
          <Input
            label="Experiment A"
            type="number"
            value={diffA}
            onChange={(e) => setDiffA(e.target.value ? Number(e.target.value) : '')}
            placeholder="ID"
          />
          <Input
            label="Experiment B"
            type="number"
            value={diffB}
            onChange={(e) => setDiffB(e.target.value ? Number(e.target.value) : '')}
            placeholder="ID"
          />
          <Button
            onClick={() => {
              if (diffA !== '' && diffB !== '') diffMutation.mutate({ a: diffA, b: diffB });
            }}
            disabled={diffA === '' || diffB === ''}
            loading={diffMutation.isPending}
          >
            Diff
          </Button>
        </div>
        {diffMutation.data && (
          <div className="mt-4 p-3 rounded-[var(--radius-card)] dark:bg-dark-bg bg-light-bg">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(diffMutation.data, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      {/* Lineage section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={18} className="text-accent" />
          <h3 className="text-sm font-semibold">Experiment Lineage</h3>
        </div>
        <div className="flex items-end gap-3">
          <Input
            label="Experiment ID"
            type="number"
            value={lineageId}
            onChange={(e) => setLineageId(e.target.value ? Number(e.target.value) : '')}
            placeholder="ID"
          />
          <Button
            onClick={() => {
              if (lineageId !== '') lineageMutation.mutate(lineageId);
            }}
            disabled={lineageId === ''}
            loading={lineageMutation.isPending}
          >
            Show Lineage
          </Button>
        </div>
        {lineageMutation.data && (
          <div className="mt-4 p-3 rounded-[var(--radius-card)] dark:bg-dark-bg bg-light-bg">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(lineageMutation.data, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      {/* Tags section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Tag size={18} className="text-accent" />
          <h3 className="text-sm font-semibold">Set Tags</h3>
        </div>
        <div className="flex items-end gap-3">
          <Input
            label="Experiment ID"
            type="number"
            value={tagExpId}
            onChange={(e) => setTagExpId(e.target.value ? Number(e.target.value) : '')}
            placeholder="ID"
          />
          <Input
            label="Tags (comma-separated)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
          <Button
            onClick={() => {
              if (tagExpId !== '') {
                const tags = tagInput
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean);
                tagsMutation.mutate({ id: tagExpId, tags });
              }
            }}
            disabled={tagExpId === '' || !tagInput.trim()}
            loading={tagsMutation.isPending}
          >
            Set Tags
          </Button>
        </div>
        {tagsMutation.data && (
          <div className="mt-3">
            <Badge variant="success">Tags updated</Badge>
          </div>
        )}
      </Card>

      {/* Export section */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Download size={18} className="text-accent" />
          <h3 className="text-sm font-semibold">Export Experiment</h3>
        </div>
        <div className="flex items-end gap-3">
          <Input
            label="Experiment ID"
            type="number"
            value={exportId}
            onChange={(e) => setExportId(e.target.value ? Number(e.target.value) : '')}
            placeholder="ID"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <Button
            onClick={() => {
              if (exportId !== '') exportMutation.mutate({ id: exportId, format: exportFormat });
            }}
            disabled={exportId === ''}
            loading={exportMutation.isPending}
          >
            <Download size={16} />
            Export
          </Button>
        </div>
      </Card>
    </div>
  );
}
