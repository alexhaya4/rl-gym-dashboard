# RL Gym Dashboard — Frontend Implementation Contract

Generated: 2026-03-26
Build status: **PASS** (tsc + vite, 0 errors)

---

## Infrastructure

### Client (`src/api/client.ts`)

- **Base URL**: `${VITE_API_URL || 'http://localhost:8000'}/api/v1`
- **Default header**: `Content-Type: application/json`
- **Auth interceptor**: Attaches `Authorization: Bearer <token>` from zustand auth store on every request
- **401 interceptor**: Calls `logout()` and redirects to `/login` on any 401 response
- **`getItems<T>(data)`**: Utility that extracts an array from either a plain `T[]` response or a paginated `{ items: T[], total }` response
- **`getWsUrl(path)`**: Builds a WebSocket URL by replacing `http` with `ws` in the base URL, appending `?token=<jwt>` for auth

### Auth Store (`src/store/authStore.ts`)

- Zustand store with `persist` middleware (localStorage key: `rl-gym-auth`)
- State: `token: string | null`, `user: User | null`, `isAuthenticated: boolean`
- Actions: `setToken(token)`, `setAuth(token, user)`, `logout()`, `setUser(user)`

### Routing (`src/App.tsx`)

| Route | Page | Auth Required |
|-------|------|---------------|
| `/login` | Login | No |
| `/` (index) | Dashboard | Yes |
| `/environments` | Environments | Yes |
| `/training` | Training | Yes |
| `/experiments` | Experiments | Yes |
| `/benchmarks` | Benchmarks | Yes |
| `/models` | Models | Yes |
| `/ab-testing` | ABTesting | Yes |
| `/algorithms` | Algorithms | Yes |
| `*` | Redirect to `/` | — |

All protected routes are wrapped in `<ProtectedRoute>` which checks `isAuthenticated`. All pages are lazy-loaded with `React.lazy`.

---

## API Layer (`src/api/*.ts`)

### `src/api/auth.ts`

| Method | HTTP | Path | Request | Response |
|--------|------|------|---------|----------|
| `login(data)` | POST | `/auth/login` | `application/x-www-form-urlencoded` body with `username`, `password` (via `URLSearchParams`) | `AuthTokens` |
| `register(data)` | POST | `/auth/register` | JSON body: `{ username, email, password }` | `User` |
| `me()` | GET | `/auth/me` | None | `User` |

### `src/api/environments.ts`

| Method | HTTP | Path | Request | Response |
|--------|------|------|---------|----------|
| `list()` | GET | `/environments/` | None | `Environment[]` |
| `available()` | GET | `/environments/available` | None | `Record<string, string>[]` |
| `get(envKey)` | GET | `/environments/${envKey}` | None | `Environment` |
| `create(data)` | POST | `/environments/` | JSON body: `{ environment_id, render_mode }` | `Environment` |
| `delete(envKey)` | DELETE | `/environments/${envKey}` | None | `void` (204) |
| `reset(envKey)` | POST | `/environments/${envKey}/reset` | None | `ResetResult` |
| `step(envKey, action)` | POST | `/environments/${envKey}/step` | JSON body: `{ action }` (int or number[]) | `StepResult` |

### `src/api/experiments.ts`

| Method | HTTP | Path | Request | Response |
|--------|------|------|---------|----------|
| `list(page?, pageSize?)` | GET | `/experiments` | Query: `{ page, page_size }` (defaults: 1, 100) | `Experiment[]` (extracted via `getItems`) |
| `get(id)` | GET | `/experiments/${id}` | None | `Experiment` |
| `create(data)` | POST | `/experiments` | JSON body: `{ name, environment_id, algorithm, hyperparameters?, total_timesteps? }` | `Experiment` |
| `update(id, data)` | PATCH | `/experiments/${id}` | JSON body: `Partial<ExperimentCreate>` | `Experiment` |
| `delete(id)` | DELETE | `/experiments/${id}` | None | `void` (204) |

### `src/api/training.ts`

| Method | HTTP | Path | Request | Response |
|--------|------|------|---------|----------|
| `start(data)` | POST | `/training/` | JSON body: `{ environment_id, algorithm?, total_timesteps?, hyperparameters?, n_envs?, experiment_name? }` | `TrainingSession` |
| `list()` | GET | `/training/` | None | `TrainingSession[]` |
| `get(experimentId)` | GET | `/training/${experimentId}` | None | `TrainingSession` |
| `job(experimentId)` | GET | `/training/${experimentId}/job` | None | `TrainingJob` |
| `result(experimentId)` | GET | `/training/${experimentId}/result` | None | `TrainingResult` |
| `stop(experimentId)` | POST | `/training/${experimentId}/stop` | None | `TrainingSession` |

### `src/api/benchmarks.ts`

| Method | HTTP | Path | Request | Response |
|--------|------|------|---------|----------|
| `run(data)` | POST | `/benchmarks/run` | JSON body: `{ environments: string[], algorithms: string[], total_timesteps?, n_eval_episodes? }` | `BenchmarkRunResponse` |
| `environments()` | GET | `/benchmarks/environments` | None | `string[]` (extracted from `{ environments }`) |
| `algorithms()` | GET | `/benchmarks/algorithms` | None | `{ name, description }[]` (extracted from `{ algorithms }`) |

### Inline API calls (no dedicated api module)

These endpoints are called directly via `apiClient` from within page components:

**Models page (`Models.tsx`):**

| Action | HTTP | Path | Request | Response |
|--------|------|------|---------|----------|
| List registry | GET | `/registry/` | None | `{ items: RegistryEntry[], total }` via `getItems` |
| Register model | POST | `/registry/register` | Query params: `{ model_version_id: int, environment_id, algorithm }`, body: `null` | `RegistryEntry` |
| Promote model | POST | `/registry/${id}/promote` | JSON body: `{ model_version_id, target_stage }` | `RegistryEntry` |

**A/B Testing page (`ABTesting.tsx`):**

| Action | HTTP | Path | Request | Response |
|--------|------|------|---------|----------|
| List tests | GET | `/ab-testing/` | None | `{ items: ABTest[], total }` via `getItems` |
| Create test | POST | `/ab-testing/` | JSON body: `ABTestCreate` (all 9 fields) | `ABTest` |
| Run test | POST | `/ab-testing/${id}/run` | None | `ABTest` |
| Stop test | POST | `/ab-testing/${id}/stop` | None | `ABTest` |
| Get statistics | GET | `/ab-testing/${id}/statistics` | None | `ABTestStatistics` |

**Algorithms page (`Algorithms.tsx`):**

| Action | HTTP | Path | Request | Response |
|--------|------|------|---------|----------|
| List all | GET | `/algorithms/` | Query: `{ skip: 0, limit: 100 }` | `list[dict]` via `getItems` |
| List compatible | GET | `/algorithms/compatible/${envId}` | None | `list[dict]` via `getItems` |
| Get detail | GET | `/algorithms/${name}` | None | `Algorithm` (dict) |

---

## Pages (`src/pages/*.tsx`)

### Login (`Login.tsx`)

**Data fetched:** None on load.

**Actions:**
| Action | Trigger | API Call |
|--------|---------|----------|
| Sign in | Form submit (login mode) | `authApi.login({ username, password })` then `authApi.me()` |
| Register + sign in | Form submit (register mode) | `authApi.register({ username, email, password })` then `authApi.login()` then `authApi.me()` |
| Toggle mode | "Sign up" / "Sign in" link | N/A (local state toggle) |
| Toggle theme | Sun/Moon icon button | N/A (theme store) |

**Data displayed:** Error messages from API `detail` field. Login/register form.

**Post-auth flow:** Sets token via `setToken()`, fetches user via `me()`, calls `setAuth(token, user)`, navigates to `/`.

---

### Dashboard (`Dashboard.tsx`)

**Data fetched:**
| Query Key | API Call | Refetch |
|-----------|----------|---------|
| `['environments']` | `environmentsApi.list()` | Default (30s stale) |
| `['experiments']` | `experimentsApi.list()` | Default |
| `['training']` | `trainingApi.list()` | Default |

**Actions:** None (read-only overview page).

**Data displayed:**
- 5 stat cards: Environments count, Experiments count, Active Training (status=running), Completed (status=completed), Total Sessions
- Recent Experiments list (first 5): `name`, `algorithm`, `status` badge
- Active Training Sessions list (running, first 5): `experiment_id`, `algorithm`, `environment_id`, `total_timesteps`, `status` badge

---

### Environments (`Environments.tsx`)

**Data fetched:**
| Query Key | API Call |
|-----------|----------|
| `['environments']` | `environmentsApi.list()` |

**Actions:**
| Action | Trigger | API Call |
|--------|---------|----------|
| Create environment | Modal form submit | `environmentsApi.create({ environment_id, render_mode })` |
| Reset environment | "Reset" button per card | `environmentsApi.reset(env_key)` |
| Step environment | "Step" button per card | `environmentsApi.step(env_key, 0)` (hardcoded action=0) |
| Delete environment | "Delete" button per card | `environmentsApi.delete(env_key)` |

**Data displayed per environment card:**
- `environment_id`, `env_key`, `status` badge
- `observation_space` and `action_space` as JSON
- Step/Reset result shown as raw JSON in a collapsible card

**Create form fields:** `environment_id` (select from 6 hardcoded options), `render_mode` (None/human/rgb_array)

---

### Training (`Training.tsx`)

**Data fetched:**
| Query Key | API Call | Refetch |
|-----------|----------|---------|
| `['training']` | `trainingApi.list()` | Every 5000ms |

**Actions:**
| Action | Trigger | API Call |
|--------|---------|----------|
| Start training | Modal form submit | `trainingApi.start(data)` |
| Stop training | "Stop" button per running/queued row | `trainingApi.stop(experiment_id)` |
| View live metrics | "Live" button per running/queued row | WebSocket connection |
| View job status | "Job" button per running/queued row | `trainingApi.job(experiment_id)` |
| View result | "Result" button per completed row | `trainingApi.result(experiment_id)` |

**Data displayed in session table:**
- `experiment_id`, `environment_id`, `algorithm`, `status` badge, `total_timesteps`, `mean_reward`, `elapsed_time`

**Start training form fields:**
- `environment_id` (select, 6 options), `algorithm` (select, 10 options: PPO/A2C/DQN/SAC/TD3/DDPG/TQC/TRPO/ARS/RecurrentPPO)
- `total_timesteps` (number), `n_envs` (number), `experiment_name` (text, optional), learning rate (number, optional, injected into `hyperparameters.learning_rate`)

**Job info panel:** `id` (first 12 chars), `status`, `enqueued_at`, `started_at`, `error`, `completed_at`

**Result info panel:** `mean_reward`, `std_reward`, `total_timesteps`, `elapsed_time`, `algorithm`, `model_path`, `completed_at`

**WebSocket connection:**
- URL: `ws://<base>/api/v1/ws/training/${experimentId}?token=<jwt>`
- Message format expected (`WsMetric`):
  ```
  { type, experiment_id, timestep, episode_reward, loss, entropy, learning_rate, n_episodes, timestamp }
  ```
- Messages with `type === 'connected'` are skipped
- Last 100 messages are kept in state
- Chart: Recharts `LineChart` with XAxis=`timestep`, lines for `episode_reward` (orange) and `loss` (blue)

---

### Experiments (`Experiments.tsx`)

**Data fetched:**
| Query Key | API Call |
|-----------|----------|
| `['experiments']` | `experimentsApi.list()` (page=1, pageSize=100) |

**Actions:**
| Action | Trigger | API Call |
|--------|---------|----------|
| Create experiment | Modal form submit | `experimentsApi.create({ name, environment_id, algorithm, hyperparameters, total_timesteps })` |
| Delete experiment | Trash icon per row | `experimentsApi.delete(id)` |

**Client-side filtering:** Text search on `name`/`algorithm`, status dropdown filter (all/created/running/completed/failed).

**Data displayed per experiment row:**
- `name`, `environment_id`, `algorithm`, `status` badge, `mean_reward`, `created_at`

**Create form fields:** `name` (text), `environment_id` (select, 6 options), `algorithm` (select, 10 options), `total_timesteps` (number)

---

### Benchmarks (`Benchmarks.tsx`)

**Data fetched:** None on load (results are in-memory from the last run).

**Actions:**
| Action | Trigger | API Call |
|--------|---------|----------|
| Run benchmark | Modal form submit | `benchmarksApi.run({ environments, algorithms, total_timesteps, n_eval_episodes })` |

**Data displayed (after a run):**
- Summary: `total_combinations`, `completed_at`
- Bar chart: `mean_reward` per algorithm/environment combination (Recharts `BarChart`)
- Results table: `environment_id`, `algorithm`, `mean_reward`, `std_reward`, `training_time_seconds`

**Run form fields:**
- `environments` (multi-select with add/remove chips, select from 6 options)
- `algorithms` (multi-select with add/remove chips, select from 10 options)
- `total_timesteps` (number, default 5000)
- `n_eval_episodes` (number, default 5)

---

### Models (`Models.tsx`)

**Data fetched:**
| Query Key | API Call |
|-----------|----------|
| `['models']` | `GET /registry/` via `apiClient`, extracted with `getItems` |

**Actions:**
| Action | Trigger | API Call |
|--------|---------|----------|
| Register model | Modal form submit | `POST /registry/register` with query params `{ model_version_id, environment_id, algorithm }` |
| Promote model | Stage select dropdown per card | `POST /registry/${id}/promote` with body `{ model_version_id, target_stage }` |

**Data displayed per model card:**
- `name`, `algorithm`, `environment_id`, `stage` badge (development/staging/production/archived)
- `mean_reward`, `model_version_id`, `is_current` (Yes/No), `created_at`

**Register form fields:** `model_version_id` (text input), `environment_id` (select, 6 options), `algorithm` (select, 10 options)

**Promote dropdown:** Filters out the current stage, offers remaining stages from `['development', 'staging', 'production', 'archived']`

---

### A/B Testing (`ABTesting.tsx`)

**Data fetched:**
| Query Key | API Call |
|-----------|----------|
| `['ab-tests']` | `GET /ab-testing/` via `apiClient`, extracted with `getItems` |

**Actions:**
| Action | Trigger | API Call |
|--------|---------|----------|
| Create test | Modal form submit | `POST /ab-testing/` with `ABTestCreate` body |
| Run test | "Run" button (draft status only) | `POST /ab-testing/${id}/run` |
| Stop test | "Stop" button (running status only) | `POST /ab-testing/${id}/stop` |
| View statistics | "Statistics" button (completed only) | `GET /ab-testing/${id}/statistics` |

**Data displayed per test card:**
- `name`, `description` (or fallback: episodes/model count + test type), `status` badge
- If `test.statistics` populated inline: Model A/B mean rewards, episode counts, significance indicator, winner, p-value, effect size

**Statistics panel (from separate fetch):**
- `model_a_mean_reward`, `model_b_mean_reward`, `p_value`, `model_a_n_episodes`, `model_b_n_episodes`, `is_significant`, `winner`, `effect_size`, `confidence_level`

**Create form fields (all 9 contract fields):**
- `name` (text), `description` (text, optional), `environment_id` (select, 6 options)
- `model_version_a_id` (number), `model_version_b_id` (number)
- `traffic_split_a` (number, step 0.01, range 0.1-0.9)
- `n_eval_episodes_per_model` (number, default 100)
- `significance_level` (number, step 0.01, default 0.05)
- `statistical_test` (select: ttest / mann_whitney)

---

### Algorithms (`Algorithms.tsx`)

**Data fetched:**
| Query Key | API Call |
|-----------|----------|
| `['algorithms', envFilter]` | `GET /algorithms/` (all) or `GET /algorithms/compatible/${envFilter}` (filtered) |

**Actions:**
| Action | Trigger | API Call |
|--------|---------|----------|
| Filter by environment | Select dropdown | Re-fetches with compatible endpoint |
| View detail | "View Detail" button per card | `GET /algorithms/${name}` |

**Data displayed per algorithm card:**
- `name`, `description`, `category` badge (if present), `supported_spaces` badges (if present)
- `hyperparameters_schema` as formatted JSON (if present)

**Detail panel:** `name`, `description`, `hyperparameters_schema` as formatted JSON

---

## Types (`src/types/index.ts`)

### Auth

```typescript
interface User {
  id: number; username: string; email: string;
  is_active: boolean; created_at: string;
}
interface AuthTokens { access_token: string; token_type: string; }
interface LoginRequest { username: string; password: string; }
interface RegisterRequest { username: string; email: string; password: string; }
```

### Environments

```typescript
interface Environment {
  env_key: string; environment_id: string;
  observation_space: Record<string, unknown>;
  action_space: Record<string, unknown>;
  status: string;
}
interface EnvironmentCreate { environment_id: string; render_mode?: string | null; }
interface StepResult {
  observation: number[]; reward: number;
  terminated: boolean; truncated: boolean;
  info: Record<string, unknown>;
}
interface ResetResult { observation: number[]; info: Record<string, unknown>; }
```

### Experiments

```typescript
interface Experiment {
  id: number; name: string; environment_id: string;
  algorithm: string; hyperparameters: Record<string, unknown>;
  status: string; total_timesteps: number; user_id: number;
  created_at: string; updated_at: string | null;
  completed_at: string | null; mean_reward: number | null;
  std_reward: number | null; metrics_summary: Record<string, unknown> | null;
}
interface ExperimentCreate {
  name: string; environment_id: string; algorithm: string;
  hyperparameters?: Record<string, unknown>; total_timesteps?: number;
}
```

### Training

```typescript
interface TrainingSession {
  experiment_id: number; status: string; environment_id: string;
  algorithm: string; total_timesteps: number;
  job_id: string | null; elapsed_time: number | null;
  mean_reward: number | null; std_reward: number | null;
}
interface TrainingJob {
  id: string; experiment_id: number | null; status: string;
  result: Record<string, unknown> | null; error: string | null;
  enqueued_at: string; started_at: string | null; completed_at: string | null;
}
interface TrainingResult {
  experiment_id: number; status: string; environment_id: string;
  algorithm: string; total_timesteps: number;
  job_id: string | null; elapsed_time: number | null;
  mean_reward: number | null; std_reward: number | null;
  model_path: string | null; completed_at: string | null;
}
interface TrainingStart {
  environment_id: string; algorithm?: string; total_timesteps?: number;
  hyperparameters?: Record<string, unknown>;
  n_envs?: number; experiment_name?: string;
}
```

### Benchmarks

```typescript
interface BenchmarkRunRequest {
  environments: string[]; algorithms: string[];
  total_timesteps?: number; n_eval_episodes?: number;
}
interface BenchmarkResult {
  environment_id: string; algorithm: string;
  mean_reward: number; std_reward: number;
  training_time_seconds: number; total_timesteps: number;
}
interface BenchmarkRunResponse {
  benchmark_id: string; results: BenchmarkResult[];
  total_combinations: number; completed_at: string;
}
```

### Model Registry

```typescript
interface RegistryEntry {
  id: number; name: string; environment_id: string;
  algorithm: string; stage: string; model_version_id: number;
  previous_production_id: number | null; mean_reward: number | null;
  promoted_by: number | null; promotion_comment: string | null;
  is_current: boolean; created_at: string; updated_at: string;
}
interface ModelVersionResponse {
  id: number; experiment_id: number; version: number;
  storage_path: string; storage_backend: string;
  algorithm: string; total_timesteps: number | null;
  mean_reward: number | null; file_size_bytes: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string; download_url: string | null;
}
```

### A/B Testing

```typescript
interface ABTest {
  id: number; name: string; description: string | null;
  environment_id: string; model_version_a_id: number;
  model_version_b_id: number; traffic_split_a: number;
  status: string; n_eval_episodes_per_model: number;
  significance_level: number; winner: string | null;
  p_value: number | null; test_statistic: number | null;
  statistical_test: string; user_id: number;
  started_at: string | null; completed_at: string | null;
  created_at: string; updated_at: string;
  statistics: ABTestStatistics | null;
}
interface ABTestCreate {
  name: string; description?: string | null;
  environment_id: string; model_version_a_id: number;
  model_version_b_id: number; traffic_split_a?: number;
  n_eval_episodes_per_model?: number;
  significance_level?: number; statistical_test?: string;
}
interface ABTestStatistics {
  model_a_mean_reward: number | null; model_a_std_reward: number | null;
  model_a_n_episodes: number; model_b_mean_reward: number | null;
  model_b_std_reward: number | null; model_b_n_episodes: number;
  p_value: number | null; test_statistic: number | null;
  is_significant: boolean; winner: string | null;
  confidence_level: number; effect_size: number | null;
}
interface ABTestResultResponse {
  id: number; ab_test_id: number; model_variant: string;
  episode_number: number; total_reward: number;
  episode_length: number | null; created_at: string;
}
```

### Custom Environments & Organizations

```typescript
interface CustomEnvironment {
  id: number; name: string; description: string | null;
  entry_point: string; is_validated: boolean;
  validation_error: string | null; user_id: number;
  created_at: string; updated_at: string;
  observation_space_spec: Record<string, unknown> | null;
  action_space_spec: Record<string, unknown> | null;
}
interface Organization {
  id: number; name: string; slug: string;
  plan: string; is_active: boolean; created_at: string;
}
```

### Utility Types

```typescript
interface Algorithm {
  name: string; description: string;
  category?: string; hyperparameters_schema?: Record<string, unknown>;
  supported_spaces?: string[]; [key: string]: unknown;
}
interface DashboardStats {
  total_environments: number; total_experiments: number;
  active_training: number; completed_training: number;
  total_models: number; recent_experiments: Experiment[];
}
interface ApiError { detail: string; }
interface PaginatedResponse<T> {
  items: T[]; total: number; page: number; page_size: number;
}
```

---

## Missing Features

Backend endpoints that exist but have **no frontend page or UI**:

### Auth
- `POST /auth/logout` — Frontend clears local state only; never calls the server logout endpoint

### Environments
- `GET /environments/{env_key}` — API method exists in `environments.ts` but is never called from any page

### Experiments
- `PATCH /experiments/{experiment_id}` — API method `update()` exists in `experiments.ts` but is never called from any page (no edit UI)
- `GET /experiments/{experiment_id}/episodes` — No API method or UI for viewing episode history

### Models (versions)
- `GET /models/experiments/{experiment_id}` — No UI to list model versions for an experiment
- `GET /models/{version_id}` — No UI to view a single model version
- `GET /models/{version_id}/download` — No download button/link
- `DELETE /models/{version_id}` — No delete model version button

### Model Registry
- `GET /registry/production/{environment_id}/{algorithm}` — No UI to look up production model
- `POST /registry/rollback/{environment_id}/{algorithm}` — No rollback button/UI
- `GET /registry/{registry_id}/compare` — No comparison UI
- `GET /registry/` with `stage` query param — Filter by stage not exposed in UI

### A/B Testing
- `GET /ab-testing/{test_id}` — No detail view for a single test (list only)
- `GET /ab-testing/{test_id}/results` — No UI to view individual episode results with pagination

### Audit Logs
- `GET /audit/logs` — **No page exists.** Entire audit log section is unimplemented
- `GET /audit/logs/me` — Not implemented
- `GET /audit/logs/{log_id}` — Not implemented

### OAuth
- `GET /oauth/google/login` — **No page exists.** No social login buttons on the Login page
- `GET /oauth/google/callback` — Not implemented
- `GET /oauth/github/login` — Not implemented
- `GET /oauth/github/callback` — Not implemented
- `GET /oauth/accounts` — Not implemented
- `DELETE /oauth/accounts/{provider}` — Not implemented

### RBAC
- `GET /rbac/my-permissions` — **No page exists.** Entire RBAC section is unimplemented
- `POST /rbac/check` — Not implemented
- `POST /rbac/assign` — Not implemented
- `GET /rbac/roles` — Not implemented

### Custom Environments
- `POST /custom-environments` — **No page exists.** Entire custom environments section is unimplemented
- `GET /custom-environments` — Not implemented
- `GET /custom-environments/{env_id}` — Not implemented
- `DELETE /custom-environments/{env_id}` — Not implemented
- `POST /custom-environments/{env_id}/validate` — Not implemented

### Organizations
- `POST /organizations` — **No page exists.** Entire organizations section is unimplemented
- `GET /organizations` — Not implemented
- `GET /organizations/{org_id}` — Not implemented
- `POST /organizations/{org_id}/members` — Not implemented
- `DELETE /organizations/{org_id}/members/{user_id}` — Not implemented
- `GET /organizations/{org_id}/usage` — Not implemented

### Global
- `GET /health` — No health check indicator in the UI
- `GET /metrics` — Not applicable for frontend

---

## Known Issues

### 1. Training stop endpoint does not exist in backend contract
- **Location:** `src/api/training.ts:30-33`, `src/pages/Training.tsx:105-108,275-278`
- **Issue:** `trainingApi.stop()` calls `POST /training/${experimentId}/stop` which is not defined in the API contract. The "Stop" button on running/queued training sessions will return a 404 at runtime.
- **Severity:** Runtime error (silently caught by mutation error handler)

### 2. Algorithms page sends spurious query params
- **Location:** `src/pages/Algorithms.tsx:21`
- **Issue:** `GET /algorithms/` is called with `{ params: { skip: 0, limit: 100 } }` but the backend defines no query parameters for this endpoint. These params are silently ignored by FastAPI.
- **Severity:** Cosmetic (no functional impact)

### 3. Algorithms response shape mismatch handled by getItems
- **Location:** `src/pages/Algorithms.tsx:19,22`
- **Issue:** `GET /algorithms/` returns `list[dict]` (a plain array), but the code runs it through `getItems()`. This works because `getItems` handles arrays, but the code was likely written expecting a paginated `{ items, total }` response.
- **Severity:** None (works correctly)

### 4. Environment step action is hardcoded
- **Location:** `src/pages/Environments.tsx:57`
- **Issue:** The "Step" button always sends `action: 0`. There is no UI for the user to choose an action value. This is fine for testing but limits usability.
- **Severity:** UX limitation

### 5. Benchmark results are not persisted
- **Location:** `src/pages/Benchmarks.tsx:33`
- **Issue:** Benchmark results are stored only in component state (`lastResult`). Navigating away from the page loses the results. There is no API to fetch historical benchmark runs.
- **Severity:** UX limitation

### 6. DashboardStats type is unused
- **Location:** `src/types/index.ts:268-275`
- **Issue:** The `DashboardStats` interface is defined but never used. The Dashboard page computes stats from individual API calls instead.
- **Severity:** Dead code

### 7. ModelVersionResponse type is used only for type definition
- **Location:** `src/types/index.ts:161-174`
- **Issue:** The type is defined but never referenced in any API call or page component. No model version endpoints are implemented in the frontend.
- **Severity:** Dead code (ready for future use)

### 8. ABTestResultResponse type is unused
- **Location:** `src/types/index.ts:226-234`
- **Issue:** The type is defined but never used in any page. The individual episode results endpoint (`GET /ab-testing/{id}/results`) is not implemented.
- **Severity:** Dead code (ready for future use)

### 9. CustomEnvironment and Organization types are unused
- **Location:** `src/types/index.ts:236-257`
- **Issue:** Types are defined but no pages or API calls use them. The corresponding backend sections have no frontend implementation.
- **Severity:** Dead code (ready for future use)

### 10. No error boundary
- **Issue:** The app has no React error boundary. An unhandled rendering error in any page will crash the entire app.
- **Severity:** Resilience gap
