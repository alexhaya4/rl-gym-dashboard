import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../../components/Layout/Sidebar';

function renderSidebar(collapsed = false) {
  return render(
    <BrowserRouter>
      <Sidebar collapsed={collapsed} onToggle={() => {}} />
    </BrowserRouter>
  );
}

const expectedItems = [
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
  { label: 'Billing', href: '/billing' },
  { label: 'Access Control', href: '/rbac' },
  { label: 'Audit Logs', href: '/audit-logs' },
  { label: 'System Status', href: '/system-status' },
];

describe('Sidebar', () => {
  it('renders all navigation items', () => {
    renderSidebar();
    for (const item of expectedItems) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('navigation links have correct hrefs', () => {
    renderSidebar();
    for (const item of expectedItems) {
      const link = screen.getByText(item.label).closest('a');
      expect(link).toHaveAttribute('href', item.href);
    }
  });

  it('hides labels when collapsed', () => {
    renderSidebar(true);
    for (const item of expectedItems) {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    }
  });

  it('renders 27 navigation links', () => {
    renderSidebar();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(expectedItems.length);
  });
});
