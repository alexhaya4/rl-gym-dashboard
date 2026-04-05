import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { datasetsApi } from '../api/datasets';
import { extractError } from '../utils/extractError';

export default function Datasets() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'statistics'>('preview');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsApi.list(),
  });

  const { data: preview } = useQuery({
    queryKey: ['dataset-preview', expandedId],
    queryFn: () => datasetsApi.preview(expandedId!, 20),
    enabled: expandedId != null && activeTab === 'preview',
  });

  const { data: statistics } = useQuery({
    queryKey: ['dataset-statistics', expandedId],
    queryFn: () => datasetsApi.statistics(expandedId!),
    enabled: expandedId != null && activeTab === 'statistics',
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append('file', file!);
      formData.append('name', name);
      if (description) formData.append('description', description);
      return datasetsApi.upload(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setFile(null);
      setName('');
      setDescription('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => datasetsApi.deleteDataset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setDeleteConfirm(null);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Datasets</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Upload and manage datasets for ML training
        </p>
      </div>

      {/* Upload section */}
      <Card>
        <h2 className="text-base font-semibold mb-4">Upload Dataset</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (file && name) uploadMutation.mutate();
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              File
            </label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f && !name) setName(f.name.replace(/\.[^/.]+$/, ''));
              }}
              className="text-sm dark:text-dark-text text-light-text"
            />
          </div>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" loading={uploadMutation.isPending} disabled={!file || !name}>
            <Upload size={16} />
            Upload
          </Button>
        </form>
        {uploadMutation.isError && (
          <p className="text-sm text-red-500 mt-2">{extractError(uploadMutation.error)}</p>
        )}
      </Card>

      {/* Dataset list */}
      {isLoading ? (
        <Card padding="none">
          <div className="animate-pulse p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded dark:bg-dark-border bg-light-border" />
            ))}
          </div>
        </Card>
      ) : datasets && datasets.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Samples
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">
                    Features
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
                {datasets.map((ds) => (
                  <>
                    <tr
                      key={ds.id}
                      className="border-b dark:border-dark-border border-light-border dark:hover:bg-dark-hover/50 hover:bg-light-hover/50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === ds.id ? null : ds.id)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {expandedId === ds.id ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                          <div>
                            <p className="font-medium">{ds.name}</p>
                            {ds.description && (
                              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                                {ds.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{ds.dataset_type}</td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {ds.num_samples?.toLocaleString() ?? '—'}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{ds.num_features ?? '—'}</td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {ds.file_size_mb.toFixed(2)} MB
                      </td>
                      <td className="px-5 py-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                        {new Date(ds.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => setDeleteConfirm(ds.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </td>
                    </tr>
                    {expandedId === ds.id && (
                      <tr key={`${ds.id}-detail`}>
                        <td
                          colSpan={7}
                          className="px-5 py-4 dark:bg-dark-hover/30 bg-light-hover/30"
                        >
                          <div className="flex gap-4 mb-4">
                            <button
                              className={`text-sm font-medium pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === 'preview' ? 'border-accent text-accent' : 'border-transparent dark:text-dark-text-secondary text-light-text-secondary'}`}
                              onClick={() => setActiveTab('preview')}
                            >
                              Preview
                            </button>
                            <button
                              className={`text-sm font-medium pb-1 border-b-2 transition-colors cursor-pointer ${activeTab === 'statistics' ? 'border-accent text-accent' : 'border-transparent dark:text-dark-text-secondary text-light-text-secondary'}`}
                              onClick={() => setActiveTab('statistics')}
                            >
                              Statistics
                            </button>
                          </div>

                          {activeTab === 'preview' && preview && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr>
                                    {preview.columns.map((col) => (
                                      <th
                                        key={col}
                                        className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary"
                                      >
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {preview.rows.map((row, i) => (
                                    <tr
                                      key={i}
                                      className="border-t dark:border-dark-border border-light-border"
                                    >
                                      {preview.columns.map((col) => (
                                        <td key={col} className="px-3 py-1.5 font-mono">
                                          {String(row[col] ?? '')}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-2">
                                Showing {preview.rows.length} of {preview.total_rows} rows
                              </p>
                            </div>
                          )}

                          {activeTab === 'statistics' && statistics && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr>
                                    <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">
                                      Column
                                    </th>
                                    <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">
                                      Type
                                    </th>
                                    <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">
                                      Mean
                                    </th>
                                    <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">
                                      Std
                                    </th>
                                    <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">
                                      Min
                                    </th>
                                    <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">
                                      Max
                                    </th>
                                    <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">
                                      Nulls
                                    </th>
                                    <th className="text-left px-3 py-2 font-medium dark:text-dark-text-secondary text-light-text-secondary">
                                      Unique
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {statistics.map((stat) => (
                                    <tr
                                      key={stat.column_name}
                                      className="border-t dark:border-dark-border border-light-border"
                                    >
                                      <td className="px-3 py-1.5 font-medium">
                                        {stat.column_name}
                                      </td>
                                      <td className="px-3 py-1.5 font-mono">{stat.dtype}</td>
                                      <td className="px-3 py-1.5 font-mono">
                                        {stat.mean?.toFixed(3) ?? '—'}
                                      </td>
                                      <td className="px-3 py-1.5 font-mono">
                                        {stat.std?.toFixed(3) ?? '—'}
                                      </td>
                                      <td className="px-3 py-1.5 font-mono">
                                        {stat.min?.toFixed(3) ?? '—'}
                                      </td>
                                      <td className="px-3 py-1.5 font-mono">
                                        {stat.max?.toFixed(3) ?? '—'}
                                      </td>
                                      <td className="px-3 py-1.5 font-mono">{stat.null_count}</td>
                                      <td className="px-3 py-1.5 font-mono">{stat.unique_count}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
              No datasets yet
            </p>
          </div>
        </Card>
      )}

      {/* Delete confirm dialog */}
      <Modal
        open={deleteConfirm != null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Dataset"
      >
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mb-4">
          Are you sure you want to delete this dataset? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteConfirm != null && deleteMutation.mutate(deleteConfirm)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
