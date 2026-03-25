# RL Gym Dashboard

A production-grade React dashboard for the [RL Gym API](https://github.com/alexhaya4/rl-gym-api) platform. Built with React 19 and TypeScript, featuring a design language inspired by Claude.ai — clean typography, warm accent tones, and a polished dark/light mode.

**Live Demo:** https://rl-gym-dashboard-production.up.railway.app
**Backend API Docs:** https://rl-gym-api-production.up.railway.app/docs

<!-- ![Dashboard Screenshot](docs/screenshot.png) -->

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| State | Zustand (auth, theme) |
| Data Fetching | React Query (TanStack Query) |
| Animation | Framer Motion |
| HTTP | Axios |

## Features

- **JWT Authentication** — Login, register, and persistent session management
- **Environment Management** — Create, reset, step, and delete Gymnasium environments
- **Training with Live WebSocket Metrics** — Start training jobs with real-time reward/loss charts
- **Experiment Tracking** — Create, search, filter, and delete experiments
- **Benchmarking with Charts** — Run multi-environment, multi-algorithm benchmarks with bar chart visualization
- **Model Registry with Stage Promotion** — Register models, promote across development/staging/production/archived stages
- **A/B Testing with Statistical Significance** — Create and run A/B tests with t-test/Mann-Whitney, view p-values and effect sizes
- **Algorithm Reference with Compatibility Filtering** — Browse all supported RL algorithms, filter by environment compatibility
- **Dark/Light Mode Toggle** — System-aware theme with manual override

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/alexhaya4/rl-gym-dashboard.git
cd rl-gym-dashboard
npm install
```

### Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000
```

This points to your running instance of the [RL Gym API](https://github.com/alexhaya4/rl-gym-api) backend.

### Development

```bash
npm run dev
```

Opens at http://localhost:5173 by default.

### Build

```bash
npm run build
```

Outputs to `dist/`. The build runs TypeScript type-checking (`tsc -b`) followed by the Vite production bundler.

## Deployment

This project is deployed on [Railway](https://railway.app) using Nixpacks. The only required environment variable is:

```
VITE_API_URL=https://your-api-domain.com
```

Railway auto-detects the Vite project and runs `npm run build` + serves the `dist/` directory.

## Project Structure

```
src/
├── api/                # API client modules (auth, environments, experiments, training, benchmarks)
│   ├── client.ts       # Axios instance, interceptors, WebSocket URL builder
│   ├── auth.ts         # Login, register, me
│   ├── environments.ts # CRUD, reset, step
│   ├── experiments.ts  # CRUD with pagination
│   ├── training.ts     # Start, list, job status, results
│   └── benchmarks.ts   # Run benchmarks, list environments/algorithms
├── components/
│   ├── Layout/         # Sidebar, Header, Layout shell
│   └── UI/             # Badge, Button, Card, Input, Modal
├── pages/
│   ├── Login.tsx       # Auth (login + register)
│   ├── Dashboard.tsx   # Overview stats and recent activity
│   ├── Environments.tsx
│   ├── Training.tsx    # Live WebSocket metrics chart
│   ├── Experiments.tsx
│   ├── Benchmarks.tsx  # Multi-select form + bar charts
│   ├── Models.tsx      # Registry with stage promotion
│   ├── ABTesting.tsx   # Statistical test results
│   └── Algorithms.tsx  # Compatibility filtering
├── store/
│   ├── authStore.ts    # Zustand auth state (persisted)
│   └── themeStore.ts   # Zustand theme state (persisted)
├── types/
│   └── index.ts        # All TypeScript interfaces matching backend schemas
├── App.tsx             # Router, lazy loading, protected routes
└── main.tsx            # Entry point
```

## API Contract Reference

See [FRONTEND_CONTRACT.md](FRONTEND_CONTRACT.md) for a complete mapping of every frontend API call, page action, and type definition against the backend contract.

## Related

- **Backend:** [alexhaya4/rl-gym-api](https://github.com/alexhaya4/rl-gym-api) — FastAPI backend with Gymnasium, Stable-Baselines3, Arq workers, and PostgreSQL

## Author

**Alex Odhiambo Haya**

## License

[MIT](LICENSE)
