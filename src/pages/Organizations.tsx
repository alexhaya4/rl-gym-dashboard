import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, UserMinus, Users } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { organizationsApi } from '../api/organizations';
import type { Organization } from '../types';

export default function Organizations() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [memberForm, setMemberForm] = useState({ user_id: 0, role: 'member' });

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsApi.list(),
  });

  const { data: usage } = useQuery({
    queryKey: ['org-usage', selectedOrg?.id],
    queryFn: () => organizationsApi.usage(selectedOrg!.id),
    enabled: !!selectedOrg,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setModalOpen(false);
      setForm({ name: '', slug: '' });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: { user_id: number; role: string }) =>
      organizationsApi.addMember(selectedOrg!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-usage', selectedOrg?.id] });
      setMemberForm({ user_id: 0, role: 'member' });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => organizationsApi.removeMember(selectedOrg!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-usage', selectedOrg?.id] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Organizations</h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            Manage your organizations and members
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Create Organization
        </Button>
      </div>

      {/* Selected Org Detail */}
      {selectedOrg && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-accent" />
              <h2 className="text-sm font-semibold">{selectedOrg.name}</h2>
              <Badge variant="accent">{selectedOrg.plan}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedOrg(null)}>
              Close
            </Button>
          </div>

          {/* Usage */}
          {usage && (
            <div className="mb-6">
              <h3 className="text-xs font-medium dark:text-dark-text-secondary text-light-text-secondary uppercase tracking-wider mb-2">
                Usage
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(usage).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg dark:bg-dark-bg bg-light-bg">
                    <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-lg font-semibold mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Member */}
          <div className="border-t dark:border-dark-border border-light-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users
                size={16}
                className="dark:text-dark-text-secondary text-light-text-secondary"
              />
              <h3 className="text-sm font-semibold">Members</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addMemberMutation.mutate(memberForm);
              }}
              className="flex items-end gap-3"
            >
              <Input
                label="User ID"
                type="number"
                value={memberForm.user_id || ''}
                onChange={(e) => setMemberForm({ ...memberForm, user_id: Number(e.target.value) })}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium dark:text-dark-text-secondary text-light-text-secondary">
                  Role
                </label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-[var(--radius-input)] border dark:bg-dark-input dark:border-dark-border dark:text-dark-text bg-light-input border-light-border text-light-text"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <Button type="submit" loading={addMemberMutation.isPending}>
                <Plus size={16} />
                Add
              </Button>
            </form>

            {/* Member list from usage if available */}
            {usage && Array.isArray((usage as Record<string, unknown>).members) && (
              <div className="mt-4 space-y-2">
                {(
                  (usage as Record<string, unknown>).members as Array<{
                    user_id: number;
                    role: string;
                  }>
                ).map((m) => (
                  <div
                    key={m.user_id}
                    className="flex items-center justify-between p-3 rounded-lg dark:bg-dark-bg bg-light-bg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono">User #{m.user_id}</span>
                      <Badge variant="info">{m.role}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => removeMemberMutation.mutate(m.user_id)}
                    >
                      <UserMinus size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Org List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-5 rounded dark:bg-dark-border bg-light-border w-32" />
                <div className="h-4 rounded dark:bg-dark-border bg-light-border w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : orgs && orgs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <Card key={org.id}>
              <button
                onClick={() => setSelectedOrg(org)}
                className="w-full text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{org.name}</h3>
                  <Badge variant="accent">{org.plan}</Badge>
                </div>
                <p className="text-xs font-mono dark:text-dark-text-secondary text-light-text-secondary">
                  {org.slug}
                </p>
                <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary mt-2">
                  Created {new Date(org.created_at).toLocaleDateString()}
                </p>
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              No organizations yet
            </p>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Organization">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
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
    </div>
  );
}
