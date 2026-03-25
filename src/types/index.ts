export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface Environment {
  env_key: string;
  environment_id: string;
  observation_space: Record<string, unknown>;
  action_space: Record<string, unknown>;
  status: string;
}

export interface EnvironmentCreate {
  environment_id: string;
  render_mode?: string | null;
}

export interface StepResult {
  observation: number[];
  reward: number;
  terminated: boolean;
  truncated: boolean;
  info: Record<string, unknown>;
}

export interface ResetResult {
  observation: number[];
  info: Record<string, unknown>;
}

export interface Experiment {
  id: number;
  name: string;
  environment_id: string;
  algorithm: string;
  hyperparameters: Record<string, unknown>;
  status: string;
  total_timesteps: number;
  user_id: number;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  mean_reward: number | null;
  std_reward: number | null;
  metrics_summary: Record<string, unknown> | null;
}

export interface ExperimentCreate {
  name: string;
  environment_id: string;
  algorithm: string;
  hyperparameters?: Record<string, unknown>;
  total_timesteps?: number;
}

export interface TrainingSession {
  experiment_id: number;
  status: string;
  environment_id: string;
  algorithm: string;
  total_timesteps: number;
  job_id: string | null;
  elapsed_time: number | null;
  mean_reward: number | null;
  std_reward: number | null;
}

export interface TrainingJob {
  id: string;
  experiment_id: number | null;
  status: string;
  result: Record<string, unknown> | null;
  error: string | null;
  enqueued_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface TrainingResult {
  experiment_id: number;
  status: string;
  environment_id: string;
  algorithm: string;
  total_timesteps: number;
  job_id: string | null;
  elapsed_time: number | null;
  mean_reward: number | null;
  std_reward: number | null;
  model_path: string | null;
  completed_at: string | null;
}

export interface TrainingStart {
  environment_id: string;
  algorithm?: string;
  total_timesteps?: number;
  hyperparameters?: Record<string, unknown>;
  n_envs?: number;
  experiment_name?: string;
}

export interface BenchmarkRunRequest {
  environments: string[];
  algorithms: string[];
  total_timesteps?: number;
  n_eval_episodes?: number;
}

export interface BenchmarkResult {
  environment_id: string;
  algorithm: string;
  mean_reward: number;
  std_reward: number;
  training_time_seconds: number;
  total_timesteps: number;
}

export interface BenchmarkRunResponse {
  benchmark_id: string;
  results: BenchmarkResult[];
  total_combinations: number;
  completed_at: string;
}

export interface RegistryEntry {
  id: number;
  name: string;
  environment_id: string;
  algorithm: string;
  stage: string;
  model_version_id: number;
  previous_production_id: number | null;
  mean_reward: number | null;
  promoted_by: number | null;
  promotion_comment: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModelVersionResponse {
  id: number;
  experiment_id: number;
  version: number;
  storage_path: string;
  storage_backend: string;
  algorithm: string;
  total_timesteps: number | null;
  mean_reward: number | null;
  file_size_bytes: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  download_url: string | null;
}

export interface ABTest {
  id: number;
  name: string;
  description: string | null;
  environment_id: string;
  model_version_a_id: number;
  model_version_b_id: number;
  traffic_split_a: number;
  status: string;
  n_eval_episodes_per_model: number;
  significance_level: number;
  winner: string | null;
  p_value: number | null;
  test_statistic: number | null;
  statistical_test: string;
  user_id: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  statistics: ABTestStatistics | null;
}

export interface ABTestCreate {
  name: string;
  description?: string | null;
  environment_id: string;
  model_version_a_id: number;
  model_version_b_id: number;
  traffic_split_a?: number;
  n_eval_episodes_per_model?: number;
  significance_level?: number;
  statistical_test?: string;
}

export interface ABTestStatistics {
  model_a_mean_reward: number | null;
  model_a_std_reward: number | null;
  model_a_n_episodes: number;
  model_b_mean_reward: number | null;
  model_b_std_reward: number | null;
  model_b_n_episodes: number;
  p_value: number | null;
  test_statistic: number | null;
  is_significant: boolean;
  winner: string | null;
  confidence_level: number;
  effect_size: number | null;
}

export interface ABTestResultResponse {
  id: number;
  ab_test_id: number;
  model_variant: string;
  episode_number: number;
  total_reward: number;
  episode_length: number | null;
  created_at: string;
}

export interface CustomEnvironment {
  id: number;
  name: string;
  description: string | null;
  entry_point: string;
  is_validated: boolean;
  validation_error: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  observation_space_spec: Record<string, unknown> | null;
  action_space_spec: Record<string, unknown> | null;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

export interface Algorithm {
  name: string;
  description: string;
  category?: string;
  hyperparameters_schema?: Record<string, unknown>;
  supported_spaces?: string[];
  [key: string]: unknown;
}

export interface DashboardStats {
  total_environments: number;
  total_experiments: number;
  active_training: number;
  completed_training: number;
  total_models: number;
  recent_experiments: Experiment[];
}

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
