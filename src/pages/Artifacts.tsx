import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { artifactsApi } from '../api/artifacts';

const typeVariant = (t: string) => {
  switch (t) {
    case 'model': return 'accent' as const;
    case 'dataset': return 'info' as const;
    case 'checkpoint': return 'warning' as const;
    case 'log': return 'default' as const;
    default: return 'default' as const;
  }
};

export default function Artifacts() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'model',
    uri: '',
    description: '',
    experiment_id: '',
  });

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ['artifacts'],
    queryFn: () => artifactsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      artifactsApi.create({
        name: form.name,
        type: form.type,
        uri: form.uri,
        description: form.description || undefined,
        experiment_id: form.experiment_id ? Number(form.experiment_id) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      setModalOpen(false);
      setForm({ name: '', type: 'model', uri: '', description: '', experiment_id: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => artifactsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artifacts'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Artifacts</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Manage models, datasets, checkpoints, and logs
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          New Artifact
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="animate-pulse space-y-3">
            <div className="h-32 rounded dark:bg-dark-border bg-light-border" />
          </div>
        </Card>
      ) : artifacts && artifacts.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider w-8" />
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">URI</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Experiment</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider">Created</th>
                  <th className="text-left px-5 py-3 text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider w-16" />
                </tr>
              </thead>
              <tbody>
                {artifacts.map((a) => (
                  <>
                    <tr
                      key={a.id}
                      className="border-b dark:border-dark-border border-light-border cursor-pointer dark:hover:bg-dark-hover hover:bg-light-hover"
                      onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                    >
                      <td className="px-5 py-3">
                        {expandedId === a.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </td>
                      <td className="px-5 py-3 font-medium">{a.name}</td>
                      <td className="px-5 py-3"><Badge variant={typeVariant(a.type)}>{a.type}</Badge></td>
                      <td className="px-5 py-3 font-mono text-xs max-w-[200px] truncate">{a.uri}</td>
                      <td className="px-5 py-3 font-mono text-xs">{a.experiment_id ?? '—'}</td>
                      <td className="px-5 py-3 text-xs dark:text-dark-text-secondary text-light-text-secondary">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(a.id);
                          }}
                          className="text-red-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                    {expandedId === a.id && (
                      <tr key={`${a.id}-detail`} className="border-b dark:border-dark-border border-light-border">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="dark:text-dark-text-secondary text-light-text-secondary">ID:</span>{' '}
                              <span className="font-mono font-bold">{a.id}</span>
                            </div>
                            <div>
                              <span className="dark:text-dark-text-secondary text-light-text-secondary">Name:</span>{' '}
                              <span className="font-bold">{a.name}</span>
                            </div>
                            <div>
                              <span className="dark:text-dark-text-secondary text-light-text-secondary">Type:</span>{' '}
                              <Badge variant={typeVariant(a.type)}>{a.type}</Badge>
                            </div>
                            <div>
                              <span className="dark:text-dark-text-secondary text-light-text-secondary">URI:</span>{' '}
                              <span className="font-mono">{a.uri}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="dark:text-dark-text-secondary text-light-text-secondary">Description:</span>{' '}
                              <span>{a.description || '—'}</span>
                            </div>
                            <div>
                              <span className="dark:text-dark-text-secondary text-light-text-secondary">Experiment ID:</span>{' '}
                              <span className="font-mono">{a.experiment_id ?? '—'}</span>
                            </div>
                            <div>
                              <span className="dark:text-dark-text-secondary text-light-text-secondary">Created:</span>{' '}
                              <span>{new Date(a.created_at).toLocaleString()}</span>
                            </div>
                          </div>
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
            <Package size={32} className="mx-auto mb-3 dark:text-dark-text-secondary text-light-text-secondary" />
            <p className="dark:text-dark-text-secondary text-light-text-secondary">No artifacts yet</p>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Artifact">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
              required
            >
              <option value="model">Model</option>
              <option value="dataset">Dataset</option>
              <option value="checkpoint">Checkpoint</option>
              <option value="log">Log</option>
            </select>
          </div>
          <Input label="URI" value={form.uri} onChange={(e) => setForm({ ...form, uri: e.target.value })} required placeholder="s3://bucket/path or /local/path" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Experiment ID" type="number" value={form.experiment_id} onChange={(e) => setForm({ ...form, experiment_id: e.target.value })} placeholder="Optional" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
