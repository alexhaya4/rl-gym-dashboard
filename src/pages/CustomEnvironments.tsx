import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { customEnvironmentsApi } from '../api/customEnvironments';
import type { CustomEnvironment } from '../types';

export default function CustomEnvironments() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    entry_point: '',
    description: '',
    source_code: '',
  });

  const { data: environments, isLoading } = useQuery({
    queryKey: ['custom-environments'],
    queryFn: () => customEnvironmentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; entry_point: string; description?: string; source_code: string }) =>
      customEnvironmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-environments'] });
      setModalOpen(false);
      setForm({ name: '', entry_point: '', description: '', source_code: '' });
    },
  });

  const validateMutation = useMutation({
    mutationFn: (id: number) => customEnvironmentsApi.validate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-environments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customEnvironmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-environments'] });
      setConfirmDelete(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Custom Environments</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Create and manage custom RL environments
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          New Environment
        </Button>
      </div>

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
      ) : environments && environments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {environments.map((env: CustomEnvironment) => (
            <Card key={env.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{env.name}</h3>
                  <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-0.5 font-mono">
                    {env.entry_point}
                  </p>
                </div>
                <Badge variant={env.is_validated ? 'success' : 'warning'}>
                  {env.is_validated ? 'Validated' : 'Unvalidated'}
                </Badge>
              </div>
              {env.description && (
                <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mb-3">
                  {env.description}
                </p>
              )}
              {env.validation_error && (
                <div className="flex items-start gap-2 p-2 rounded-[var(--radius-card)] bg-red-500/10 mb-3">
                  <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400 font-mono">{env.validation_error}</p>
                </div>
              )}
              <div className="flex gap-2 pt-3 border-t dark:border-dark-border border-light-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => validateMutation.mutate(env.id)}
                  loading={validateMutation.isPending}
                >
                  <CheckCircle size={14} />
                  Validate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(env.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              No custom environments yet. Create your first one!
            </p>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Custom Environment" maxWidth="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              name: form.name,
              entry_point: form.entry_point,
              source_code: form.source_code,
              description: form.description || undefined,
            });
          }}
          className="space-y-4"
        >
          <Input
            label="Name"
            placeholder="MyCustomEnv-v0"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Entry Point"
            placeholder="my_module:MyCustomEnv"
            value={form.entry_point}
            onChange={(e) => setForm({ ...form, entry_point: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="A short description of the environment"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
              Source Code
            </label>
            <textarea
              value={form.source_code}
              onChange={(e) => setForm({ ...form, source_code: e.target.value })}
              placeholder="import gymnasium as gym&#10;&#10;class MyCustomEnv(gym.Env):&#10;    ..."
              rows={12}
              required
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border font-mono dark:bg-[#0d1117] dark:border-dark-border dark:text-dark-text bg-[#f6f8fa] border-light-border text-light-text focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200 resize-y"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Confirm Delete"
      >
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mb-4">
          Are you sure you want to delete this custom environment? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => confirmDelete !== null && deleteMutation.mutate(confirmDelete)}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
