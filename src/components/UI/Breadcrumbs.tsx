import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const labelMap: Record<string, string> = {
  environments: 'Environments',
  'vec-environments': 'Vec Environments',
  'custom-environments': 'Custom Envs',
  training: 'Training',
  distributed: 'Distributed',
  'multi-agent': 'Multi-Agent',
  experiments: 'Experiments',
  comparison: 'Comparison',
  evaluation: 'Evaluation',
  benchmarks: 'Benchmarks',
  optimization: 'Optimization',
  pbt: 'PBT',
  models: 'Models',
  'ab-testing': 'A/B Testing',
  algorithms: 'Algorithms',
  inference: 'Inference',
  videos: 'Videos',
  datasets: 'Datasets',
  ml: 'Machine Learning',
  artifacts: 'Artifacts',
  pipelines: 'Pipelines',
  organizations: 'Organizations',
  billing: 'Billing',
  rbac: 'Access Control',
  'audit-logs': 'Audit Logs',
  'system-status': 'System Status',
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs mb-4 flex-wrap">
      <Link
        to="/"
        className="dark:text-dark-text-secondary text-light-text-secondary hover:text-accent transition-colors"
      >
        Dashboard
      </Link>
      {segments.map((segment, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = labelMap[segment] ?? segment;
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight
              size={12}
              className="dark:text-dark-text-secondary text-light-text-secondary"
            />
            {isLast ? (
              <span className="dark:text-dark-text text-light-text font-medium">{label}</span>
            ) : (
              <Link
                to={path}
                className="dark:text-dark-text-secondary text-light-text-secondary hover:text-accent transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
