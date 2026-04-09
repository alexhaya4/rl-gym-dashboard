<p align="center">
  <img src="docs/logo.svg" alt="RL Gym" width="400" />
</p>

Web dashboard for the RL Gym platform. Train RL agents, run ML models, manage datasets, and monitor experiments.

![CI](https://github.com/alexhaya4/rl-gym-dashboard/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)
![React](https://img.shields.io/badge/react-19-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Pages](https://img.shields.io/badge/pages-27-orange)

[Live Dashboard](https://dashboard.rlgymapi.com) | [Backend API](https://rlgymapi.com/docs) | [Backend Repo](https://github.com/alexhaya4/rl-gym-api)

## What it does

Dashboard for managing RL training, experiments, and models across 27 feature pages. Upload datasets and train classical ML models alongside reinforcement learning workflows. Real-time metrics via WebSocket, role-based access control, and admin-gated billing and audit pages.

## Quick start

```bash
git clone https://github.com/alexhaya4/rl-gym-dashboard.git
cd rl-gym-dashboard
npm install
npm run dev
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview stats and recent activity |
| `/environments` | Environments | Create, reset, step, delete Gymnasium envs |
| `/vec-environments` | Vec Environments | Vectorized parallel environments |
| `/custom-environments` | Custom Envs | User-uploaded Python environment definitions |
| `/training` | Training | Start training, live WebSocket metrics chart |
| `/distributed` | Distributed | Ray-backed distributed training jobs |
| `/multi-agent` | Multi-Agent | Multi-agent experiments and policies |
| `/experiments` | Experiments | Track, search, filter, delete experiments |
| `/comparison` | Comparison | Compare experiments side-by-side with diff and lineage |
| `/evaluation` | Evaluation | Run model evaluations, view per-episode metrics |
| `/benchmarks` | Benchmarks | Multi-env/multi-algo benchmark runs with charts |
| `/optimization` | Optimization | Optuna hyperparameter studies with trial history |
| `/pbt` | PBT | Population-based training experiments |
| `/models` | Models | Model registry with stage promotion and rollback |
| `/ab-testing` | A/B Testing | Statistical A/B tests with p-values and results |
| `/algorithms` | Algorithms | Algorithm reference with env compatibility filter |
| `/inference` | Inference | Live inference playground for deployed models |
| `/videos` | Videos | Record and play agent rollout videos |
| `/datasets` | Datasets | Upload datasets, preview rows, view statistics |
| `/ml` | Machine Learning | Train classical ML models, predict on features |
| `/artifacts` | Artifacts | Track experiment artifacts and lineage |
| `/pipelines` | Pipelines | Prefect pipeline runs and search |
| `/organizations` | Organizations | Manage orgs, members, and usage |
| `/billing` | Billing | Subscription plans and checkout (admin) |
| `/rbac` | Access Control | Role assignment and permissions (admin) |
| `/audit-logs` | Audit Logs | Activity logs, full logs for admins |
| `/system-status` | System Status | API, gRPC, and health monitoring |

## Tech stack

- React 19, TypeScript, Vite
- Tailwind CSS, Recharts, Zustand, React Query
- Vitest, ESLint, Prettier, Husky

## Development

```bash
npm run dev      # start dev server at localhost:5173
npm run build    # type-check and bundle for production
npm run test     # run vitest test suite
npm run lint     # run ESLint
```

## License

[MIT](LICENSE)
