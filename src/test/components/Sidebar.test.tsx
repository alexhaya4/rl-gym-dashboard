import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../../components/Layout/Sidebar';
import { useAuthStore } from '../../store/authStore';

function renderSidebar(collapsed = false) {
  return render(
    <BrowserRouter>
      <Sidebar collapsed={collapsed} onToggle={() => {}} />
    </BrowserRouter>
  );
}

const publicItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Environments', href: '/environments' },
  { label: 'Vec Environments', href: '/vec-environments' },
  { label: 'Custom Envs', href: '/custom-environments' },
  { label: 'Training', href: '/training' },
  { label: 'Distributed', href: '/distributed' },
  { label: 'Multi-Agent', href: '/multi-agent' },
  { label: 'Experiments', href: '/experiments' },
  { label: 'Comparison', href: '/comparison' },
  { label: 'Evaluation', href: '/evaluation' },
  { label: 'Benchmarks', href: '/benchmarks' },
  { label: 'Optimization', href: '/optimization' },
  { label: 'PBT', href: '/pbt' },
  { label: 'Models', href: '/models' },
  { label: 'A/B Testing', href: '/ab-testing' },
  { label: 'Algorithms', href: '/algorithms' },
  { label: 'Inference', href: '/inference' },
  { label: 'Videos', href: '/videos' },
  { label: 'Datasets', href: '/datasets' },
  { label: 'Machine Learning', href: '/ml' },
  { label: 'Artifacts', href: '/artifacts' },
  { label: 'Pipelines', href: '/pipelines' },
  { label: 'Organizations', href: '/organizations' },
  { label: 'Audit Logs', href: '/audit-logs' },
  { label: 'System Status', href: '/system-status' },
];

const adminOnlyItems = [
  { label: 'Billing', href: '/billing' },
  { label: 'Access Control', href: '/rbac' },
];

describe('Sidebar', () => {
  beforeEach(() => {
    useAuthStore.setState({ role: null, permissions: [] });
  });

  it('renders public navigation items for non-admin', () => {
    renderSidebar();
    for (const item of publicItems) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('hides admin-only items for non-admin', () => {
    renderSidebar();
    for (const item of adminOnlyItems) {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    }
  });

  it('shows admin-only items for admin role', () => {
    useAuthStore.setState({ role: 'admin', permissions: [] });
    renderSidebar();
    for (const item of [...publicItems, ...adminOnlyItems]) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('navigation links have correct hrefs', () => {
    renderSidebar();
    for (const item of publicItems) {
      const link = screen.getByText(item.label).closest('a');
      expect(link).toHaveAttribute('href', item.href);
    }
  });

  it('hides labels when collapsed', () => {
    renderSidebar(true);
    for (const item of publicItems) {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    }
  });

  it('renders 25 links for non-admin', () => {
    renderSidebar();
    expect(screen.getAllByRole('link')).toHaveLength(publicItems.length);
  });

  it('renders 27 links for admin', () => {
    useAuthStore.setState({ role: 'admin', permissions: [] });
    renderSidebar();
    expect(screen.getAllByRole('link')).toHaveLength(publicItems.length + adminOnlyItems.length);
  });
});
