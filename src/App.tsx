import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout/Layout';
import { useAuthStore } from './store/authStore';
import { lazy, Suspense, type ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Environments = lazy(() => import('./pages/Environments'));
const Training = lazy(() => import('./pages/Training'));
const Experiments = lazy(() => import('./pages/Experiments'));
const Benchmarks = lazy(() => import('./pages/Benchmarks'));
const Models = lazy(() => import('./pages/Models'));
const ABTesting = lazy(() => import('./pages/ABTesting'));
const Algorithms = lazy(() => import('./pages/Algorithms'));
const Inference = lazy(() => import('./pages/Inference'));
const Videos = lazy(() => import('./pages/Videos'));
const Datasets = lazy(() => import('./pages/Datasets'));
const MachineLearning = lazy(() => import('./pages/MachineLearning'));
const DistributedTraining = lazy(() => import('./pages/DistributedTraining'));
const Comparison = lazy(() => import('./pages/Comparison'));
const Artifacts = lazy(() => import('./pages/Artifacts'));
const MultiAgent = lazy(() => import('./pages/MultiAgent'));
const Optimization = lazy(() => import('./pages/Optimization'));
const PBT = lazy(() => import('./pages/PBT'));
const Pipelines = lazy(() => import('./pages/Pipelines'));
const Organizations = lazy(() => import('./pages/Organizations'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const RBAC = lazy(() => import('./pages/RBAC'));
const Billing = lazy(() => import('./pages/Billing'));
const VecEnvironments = lazy(() => import('./pages/VecEnvironments'));
const Evaluation = lazy(() => import('./pages/Evaluation'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const CustomEnvironments = lazy(() => import('./pages/CustomEnvironments'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="environments" element={<Environments />} />
              <Route path="training" element={<Training />} />
              <Route path="experiments" element={<Experiments />} />
              <Route path="benchmarks" element={<Benchmarks />} />
              <Route path="models" element={<Models />} />
              <Route path="ab-testing" element={<ABTesting />} />
              <Route path="algorithms" element={<Algorithms />} />
              <Route path="inference" element={<Inference />} />
              <Route path="videos" element={<Videos />} />
              <Route path="datasets" element={<Datasets />} />
              <Route path="ml" element={<MachineLearning />} />
              <Route path="distributed" element={<DistributedTraining />} />
              <Route path="comparison" element={<Comparison />} />
              <Route path="artifacts" element={<Artifacts />} />
              <Route path="multi-agent" element={<MultiAgent />} />
              <Route path="optimization" element={<Optimization />} />
              <Route path="pbt" element={<PBT />} />
              <Route path="pipelines" element={<Pipelines />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="rbac" element={<RBAC />} />
              <Route path="billing" element={<Billing />} />
              <Route path="vec-environments" element={<VecEnvironments />} />
              <Route path="evaluation" element={<Evaluation />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="custom-environments" element={<CustomEnvironments />} />
              <Route path="system-status" element={<SystemStatus />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
