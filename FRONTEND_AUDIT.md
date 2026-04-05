# Frontend Audit Report

**Date:** 2026-04-05
**Scope:** Full frontend vs. backend API contract audit across 31 modules (155+ endpoints)

---

## Summary Table

| # | Module | API Client | Page | Route | Sidebar | Status |
|---|--------|-----------|------|-------|---------|--------|
| 1 | Auth | `src/api/auth.ts` | `Login.tsx` | `/login` | N/A | **PARTIAL** |
| 2 | Environments | `src/api/environments.ts` | `Environments.tsx` | `/environments` | Yes | **IMPLEMENTED** |
| 3 | Training | `src/api/training.ts` | `Training.tsx` | `/training` | Yes | **IMPLEMENTED** |
| 4 | Experiments | `src/api/experiments.ts` | `Experiments.tsx` | `/experiments` | Yes | **PARTIAL** |
| 5 | Benchmarks | `src/api/benchmarks.ts` | `Benchmarks.tsx` | `/benchmarks` | Yes | **IMPLEMENTED** |
| 6 | Model Versions | (inline in `Models.tsx`) | `Models.tsx` | `/models` | Yes | **PARTIAL** |
| 7 | Model Registry | (inline in `Models.tsx`) | `Models.tsx` | `/models` | Yes | **PARTIAL** |
| 8 | A/B Testing | (inline in `ABTesting.tsx`) | `ABTesting.tsx` | `/ab-testing` | Yes | **PARTIAL** |
| 9 | Algorithms | (inline in pages) | `Algorithms.tsx` | `/algorithms` | Yes | **IMPLEMENTED** |
| 10 | Inference | `src/api/inference.ts` | `Inference.tsx` | `/inference` | Yes | **IMPLEMENTED** |
| 11 | Video | `src/api/video.ts` | `Videos.tsx` | `/videos` | Yes | **PARTIAL** |
| 12 | Datasets | `src/api/datasets.ts` | `Datasets.tsx` | `/datasets` | Yes | **PARTIAL** |
| 13 | ML Training | `src/api/ml.ts` | `MachineLearning.tsx` | `/ml` | Yes | **IMPLEMENTED** |
| 14 | Distributed Training | `src/api/distributed.ts` | `DistributedTraining.tsx` | `/distributed` | Yes | **IMPLEMENTED** |
| 15 | Comparison | - | - | - | - | **MISSING** |
| 16 | Artifacts | - | - | - | - | **MISSING** |
| 17 | Multi-Agent | - | - | - | - | **MISSING** |
| 18 | Optimization/Optuna | - | - | - | - | **MISSING** |
| 19 | PBT | - | - | - | - | **MISSING** |
| 20 | Pipelines | - | - | - | - | **MISSING** |
| 21 | Organizations | - | - | - | - | **MISSING** |
| 22 | OAuth | - | - | - | - | **MISSING** |
| 23 | RBAC | - | - | - | - | **MISSING** |
| 24 | Billing | - | - | - | - | **MISSING** |
| 25 | Vec Environments | - | - | - | - | **MISSING** |
| 26 | Evaluation | - | - | - | - | **MISSING** |
| 27 | Audit Logs | - | - | - | - | **MISSING** |
| 28 | Custom Environments | - | - | - | - | **MISSING** |
| 29 | WebSocket | (used in `Training.tsx`) | N/A | N/A | N/A | **IMPLEMENTED** |
| 30 | Health & Metrics | - | - | - | - | **MISSING** |
| 31 | Status | - | - | - | - | **MISSING** |

**Totals:** 8 IMPLEMENTED, 6 PARTIAL, 15 MISSING, 2 N/A (WebSocket/Health used as supporting features)

---

## Detailed Module Analysis

### 1. Auth — PARTIAL

**API Client:** `src/api/auth.ts`
**Page:** `src/pages/Login.tsx`
**Route:** `/login` (public)

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `POST /auth/register` | `authApi.register()` | OK |
| `POST /auth/login` | `authApi.login()` | OK |
| `POST /auth/logout` | — | **MISSING** |
| `GET /auth/me` | `authApi.me()` | OK |

**Content-Type:** Login correctly uses `application/x-www-form-urlencoded` for OAuth2PasswordRequestForm. OK.

**Missing:** `logout` endpoint function. Frontend only clears local auth state via `useAuthStore.getState().logout()` but never calls the backend logout endpoint.

---

### 2. Environments — IMPLEMENTED

**API Client:** `src/api/environments.ts`
**Page:** `src/pages/Environments.tsx`
**Route:** `/environments` | **Sidebar:** Yes

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `GET /environments/available` | `environmentsApi.available()` | OK |
| `POST /environments/` | `environmentsApi.create()` | OK |
| `GET /environments/` | `environmentsApi.list()` | OK |
| `GET /environments/{env_key}` | `environmentsApi.get()` | OK |
| `POST /environments/{env_key}/reset` | `environmentsApi.reset()` | OK |
| `POST /environments/{env_key}/step` | `environmentsApi.step()` | OK |
| `DELETE /environments/{env_key}` | `environmentsApi.delete()` | OK |

---

### 3. Training — IMPLEMENTED

**API Client:** `src/api/training.ts`
**Page:** `src/pages/Training.tsx`
**Route:** `/training` | **Sidebar:** Yes

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `POST /training/` | `trainingApi.start()` | OK |
| `GET /training/` | `trainingApi.list()` | OK |
| `GET /training/{experimentId}` | `trainingApi.get()` | OK |
| `GET /training/{experimentId}/job` | `trainingApi.job()` | OK |
| `GET /training/{experimentId}/result` | `trainingApi.result()` | OK |

---

### 4. Experiments — PARTIAL

**API Client:** `src/api/experiments.ts`
**Page:** `src/pages/Experiments.tsx`
**Route:** `/experiments` | **Sidebar:** Yes

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `POST /experiments` | `experimentsApi.create()` | OK |
| `GET /experiments` | `experimentsApi.list()` | OK |
| `GET /experiments/{id}` | `experimentsApi.get()` | OK |
| `PATCH /experiments/{id}` | `experimentsApi.update()` | OK |
| `DELETE /experiments/{id}` | `experimentsApi.delete()` | OK |
| `GET /experiments/{id}/episodes` | — | **MISSING** |

**Missing:** `episodes` endpoint not exposed in API client or page.

---

### 5. Benchmarks — IMPLEMENTED

**API Client:** `src/api/benchmarks.ts`
**Page:** `src/pages/Benchmarks.tsx`
**Route:** `/benchmarks` | **Sidebar:** Yes

All 3 endpoints covered.

---

### 6. Model Versions — PARTIAL

**API Client:** No dedicated file. Inline `apiClient` calls in `Models.tsx`.
**Page:** `src/pages/Models.tsx` (combined with Registry)

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `GET /models/experiments/{id}` | — | **MISSING** |
| `GET /models/{version_id}` | — | **MISSING** |
| `GET /models/{version_id}/download` | — | **MISSING** |
| `DELETE /models/{version_id}` | — | **MISSING** |

**Note:** Models page only covers the Registry module. Model Versions endpoints are entirely absent.

---

### 7. Model Registry — PARTIAL

**API Client:** Inline `apiClient` calls in `Models.tsx`
**Page:** `src/pages/Models.tsx`

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `POST /registry/register` | `apiClient.post('/registry/register', ...)` | OK |
| `GET /registry/` | `apiClient.get('/registry/')` | OK |
| `GET /registry/production/{env}/{alg}` | — | **MISSING** |
| `POST /registry/{id}/promote` | `apiClient.post('/registry/{id}/promote', ...)` | OK |
| `POST /registry/rollback/{env}/{alg}` | — | **MISSING** |
| `GET /registry/{id}/compare` | — | **MISSING** |

---

### 8. A/B Testing — PARTIAL

**API Client:** Inline `apiClient` calls in `ABTesting.tsx`
**Page:** `src/pages/ABTesting.tsx`

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `POST /ab-testing/` | `apiClient.post('/ab-testing/', ...)` | OK |
| `GET /ab-testing/` | `apiClient.get('/ab-testing/')` | OK |
| `GET /ab-testing/{id}` | — | **MISSING** |
| `POST /ab-testing/{id}/run` | `apiClient.post('/ab-testing/{id}/run')` | OK |
| `POST /ab-testing/{id}/stop` | `apiClient.post('/ab-testing/{id}/stop')` | OK |
| `GET /ab-testing/{id}/results` | — | **MISSING** |
| `GET /ab-testing/{id}/statistics` | `apiClient.get('/ab-testing/{id}/statistics')` | OK |

---

### 9. Algorithms — IMPLEMENTED

**API Client:** Inline `apiClient` calls in `Algorithms.tsx` and other pages
**Page:** `src/pages/Algorithms.tsx`

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `GET /algorithms/` | `apiClient.get('/algorithms/')` | OK |
| `GET /algorithms/{name}` | `apiClient.get('/algorithms/{name}')` | OK |
| `GET /algorithms/compatible/{env}` | `apiClient.get('/algorithms/compatible/{env}')` | OK |

---

### 10. Inference — IMPLEMENTED

**API Client:** `src/api/inference.ts`
**Page:** `src/pages/Inference.tsx`

All 4 endpoints covered with correct paths and methods.

---

### 11. Video — PARTIAL

**API Client:** `src/api/video.ts`
**Page:** `src/pages/Videos.tsx`

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `POST /video/record` | `videoApi.record()` | OK |
| `GET /video/{id}/status` | `videoApi.getStatus()` | OK |
| `GET /video/{id}/download` | `videoApi.getDownloadUrl()` | OK |
| `GET /video/` | `videoApi.list()` | OK |
| `DELETE /video/{id}` | `videoApi.deleteVideo()` | OK |

**BUG — Wrong response types:**
- Backend `POST /video/record` returns `VideoStatus` (status_code=202), but frontend declares return type as `VideoResponse`
- Backend `GET /video/` returns `list[VideoStatus]`, but frontend declares `VideoResponse[]`
- The `VideoResponse` type in frontend (with `num_episodes`, `total_reward`, `duration_seconds`, `file_size_mb`) does **not** match what the backend actually returns from these endpoints. The backend only returns `{video_id, status, progress, error}`.
- The Videos page tries to render `v.num_episodes`, `v.total_reward`, `v.duration_seconds`, `v.file_size_mb` — these fields will all be `undefined` at runtime.
- `VideoStatus.progress` is 0-100 on backend but frontend treats it as 0-1 (multiplies by 100).

---

### 12. Datasets — PARTIAL

**API Client:** `src/api/datasets.ts`
**Page:** `src/pages/Datasets.tsx`

| Backend Endpoint | Frontend Function | Status |
|-----------------|-------------------|--------|
| `POST /datasets/` (trajectory) | — | **MISSING** |
| `POST /datasets/upload` | `datasetsApi.upload()` | OK |
| `GET /datasets/` | `datasetsApi.list()` | OK |
| `GET /datasets/{id}` | `datasetsApi.get()` | **BUG** (see below) |
| `GET /datasets/file/{id}` | — | **MISSING** |
| `GET /datasets/file/{id}/preview` | `datasetsApi.preview()` | **BUG** — wrong path |
| `GET /datasets/file/{id}/statistics` | `datasetsApi.statistics()` | **BUG** — wrong path |
| `POST /datasets/{id}/episodes` | — | **MISSING** |
| `GET /datasets/{id}/episodes` | — | **MISSING** |
| `GET /datasets/{id}/stats` | — | **MISSING** |
| `GET /datasets/{id}/export` | — | **MISSING** |
| `POST /datasets/{id}/collect` | — | **MISSING** |
| `DELETE /datasets/{id}` | `datasetsApi.deleteDataset()` | OK |

**BUG — Wrong API paths (CRITICAL):**
- Frontend calls `GET /datasets/{id}/preview` — backend endpoint is `GET /datasets/file/{id}/preview`
- Frontend calls `GET /datasets/{id}/statistics` — backend endpoint is `GET /datasets/file/{id}/statistics`
- Frontend calls `GET /datasets/{id}` for file datasets — should be `GET /datasets/file/{id}`
- These will return 404 or hit the wrong trajectory-dataset endpoint.

**BUG — Upload Content-Type:**
- Frontend sets `headers: { 'Content-Type': undefined as unknown as string }` which is a workaround. Should simply omit the Content-Type header entirely and let axios set `multipart/form-data` with the boundary automatically. The cast is fragile.

---

### 13. ML Training — IMPLEMENTED

**API Client:** `src/api/ml.ts`
**Page:** `src/pages/MachineLearning.tsx`

All 6 endpoints covered with correct paths and methods.

---

### 14. Distributed Training — IMPLEMENTED

**API Client:** `src/api/distributed.ts`
**Page:** `src/pages/DistributedTraining.tsx`

All 5 endpoints covered with correct paths and methods.

---

### 15. Comparison — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** compare, diff, lineage, tags, export (5 total)

---

### 16. Artifacts — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** create, list, get, delete, lineage (5 total)

---

### 17. Multi-Agent — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** environments, train, list, get, agents (5 total)

---

### 18. Optimization/Optuna — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** run, list, get, history, spaces (5 total)

---

### 19. PBT — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** create, list, get, members, best (5 total)

---

### 20. Pipelines — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** health, run, search, list, get (5 total)

---

### 21. Organizations — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** create, list, get, add member, remove member, usage (6 total)

---

### 22. OAuth — MISSING

No API client, page, or integration. Login page has no "Sign in with Google/GitHub" buttons.

**Missing endpoints:** google login, google callback, github login, github callback, accounts, delete account (6 total)

---

### 23. RBAC — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** my-permissions, check, assign, roles (4 total)

---

### 24. Billing — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** plans, subscription, checkout, webhook, cancel (5 total)

---

### 25. Vec Environments — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** create, list, get, reset, step, delete (6 total)

---

### 26. Evaluation — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** run, episodes (2 total)

---

### 27. Audit Logs — MISSING

No API client, page, route, or sidebar entry.

**Missing endpoints:** list, me, get (3 total)

---

### 28. Custom Environments — MISSING

No API client, page, route, or sidebar entry. The `CustomEnvironment` type exists in `src/types/index.ts` but is unused.

**Missing endpoints:** create, list, get, validate, delete (5 total)

---

### 29. WebSocket — IMPLEMENTED

Used in `Training.tsx` via `getWsUrl('/ws/training/{experimentId}')`. Handles real-time training metrics streaming.

---

### 30. Health & Metrics — MISSING

No frontend integration. These are typically monitoring endpoints, but could be surfaced in a status page.

**Missing endpoints:** GET /health, GET /metrics (2 total)

---

### 31. Status — MISSING

No frontend integration.

**Missing endpoints:** GET /status, GET /status/grpc (2 total)

---

## Bugs Found

### CRITICAL

1. **Datasets: Wrong API paths** (`src/api/datasets.ts:24-33`)
   - `preview()` calls `/datasets/${id}/preview` — should be `/datasets/file/${id}/preview`
   - `statistics()` calls `/datasets/${id}/statistics` — should be `/datasets/file/${id}/statistics`
   - `get()` calls `/datasets/${id}` for file datasets — should be `/datasets/file/${id}`
   - Impact: Preview and Statistics tabs on Datasets page will 404.

2. **Videos: Wrong response types** (`src/api/video.ts`, `src/types/index.ts`)
   - `videoApi.record()` typed as returning `VideoResponse` but backend returns `VideoStatus`
   - `videoApi.list()` typed as returning `VideoResponse[]` but backend returns `VideoStatus[]`
   - Videos table renders `num_episodes`, `total_reward`, `duration_seconds`, `file_size_mb` — none of these fields exist on `VideoStatus`
   - Impact: Videos list table shows `undefined` for most columns.

3. **Videos: Progress scale mismatch** (`src/pages/Videos.tsx`)
   - Backend `VideoStatus.progress` is 0-100, frontend multiplies by 100 (treats as 0-1)
   - Impact: Progress displays as e.g. "5000%" instead of "50%"

### MODERATE

4. **Auth: Missing logout API call** (`src/api/auth.ts`)
   - No `authApi.logout()` function. Frontend clears local state but doesn't invalidate server-side token.

5. **Datasets: Upload Content-Type hack** (`src/api/datasets.ts:6-8`)
   - Uses `{ 'Content-Type': undefined as unknown as string }` — fragile TypeScript cast. Should delete the header or omit it to let axios auto-set multipart boundary.

6. **Experiments: Missing episodes endpoint** (`src/api/experiments.ts`)
   - `GET /experiments/{id}/episodes` not implemented in frontend.

### LOW

7. **Model Versions: No dedicated API client**
   - 4 endpoints (list by experiment, get, download, delete) have no frontend functions.

8. **A/B Testing: Missing endpoints**
   - `GET /ab-testing/{id}` (get single test) and `GET /ab-testing/{id}/results` (paginated results) not implemented.

9. **Model Registry: Missing endpoints**
   - `GET /registry/production/{env}/{alg}`, `POST /registry/rollback/{env}/{alg}`, `GET /registry/{id}/compare` not implemented.

---

## Missing Types

The following backend response schemas have no corresponding TypeScript types in `src/types/index.ts`:

- `VecEnvironmentCreate`, `VecEnvironmentResponse`, `VecStepRequest`, `VecStepResponse`, `VecResetResponse`
- `ComparisonRequest`, `ComparisonResponse`, `ExperimentDiff`, `LineageGraph`
- `ArtifactCreate`, `ArtifactResponse`, `LineageRequest`
- `MultiAgentTrainingRequest`, `MultiAgentExperimentResponse`, `AgentPolicyResponse`
- `OptimizationRequest`, `OptimizationResponse`
- `PBTRequest`, `PBTExperimentResponse`, `PBTMemberResponse`
- `PipelineRunRequest`, `PipelineRunResponse`
- `OrganizationCreate`, `OrganizationResponse`, `OrganizationMemberResponse`, `UsageResponse`
- `OAuthLoginResponse`, `OAuthTokenResponse`, `OAuthAccountResponse`
- `PermissionCheckRequest`, `PermissionCheckResponse`, `RoleAssignment`, `UserPermissionsResponse`
- `PlanInfo`, `SubscriptionResponse`, `CheckoutRequest`, `CheckoutSessionResponse`
- `EvaluationRequest`, `EvaluationResponse`
- `AuditLogResponse`, `AuditLogListResponse`
- `CustomEnvironmentCreate`, `CustomEnvironmentResponse`
- `DatasetCreate`, `DatasetEpisodeCreate`, `DatasetEpisodeResponse`, `DatasetStatsResponse`, `CollectRequest`

---

## Coverage Statistics

| Metric | Count |
|--------|-------|
| Total backend modules | 31 |
| Fully implemented | 8 (26%) |
| Partially implemented | 6 (19%) |
| Missing entirely | 15 (48%) |
| Infrastructure (WS/Health) | 2 (6%) |
| Total backend endpoints | ~155 |
| Frontend-covered endpoints | ~62 (40%) |
| Missing endpoint functions | ~93 (60%) |
| Critical bugs found | 3 |
| Moderate bugs found | 3 |
| Low-priority issues | 3 |
