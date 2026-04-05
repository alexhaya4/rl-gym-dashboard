import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { authApi } from '../api/auth';
import { oauthApi } from '../api/oauth';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await authApi.register({ username, email, password });
      }
      const tokens = await authApi.login({ username, password });
      useAuthStore.getState().setToken(tokens.access_token);
      const user = await authApi.me();
      setAuth(tokens.access_token, user);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg ?? (isRegister ? 'Registration failed' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-dark-bg bg-light-bg relative">
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-[var(--radius-btn)] dark:text-dark-text-secondary dark:hover:bg-dark-hover text-light-text-secondary hover:bg-light-hover transition-colors cursor-pointer"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">RL</span>
          </div>
          <h1 className="text-2xl font-semibold dark:text-dark-text text-light-text">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
            {isRegister ? 'Sign up for RL Gym Platform' : 'Sign in to RL Gym Platform'}
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border dark:bg-dark-card dark:border-dark-border bg-light-card border-light-border p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
            {isRegister && (
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            )}
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" className="w-full" loading={loading}>
              {isRegister ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t dark:border-dark-border border-light-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 dark:bg-dark-card bg-light-card dark:text-dark-text-secondary text-light-text-secondary">
                  or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  try {
                    const { authorization_url } = await oauthApi.googleLogin();
                    window.location.href = authorization_url;
                  } catch {
                    setError('Google login unavailable');
                  }
                }}
              >
                Google
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  try {
                    const { authorization_url } = await oauthApi.githubLogin();
                    window.location.href = authorization_url;
                  } catch {
                    setError('GitHub login unavailable');
                  }
                }}
              >
                GitHub
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
