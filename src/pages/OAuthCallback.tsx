import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { oauthApi } from '../api/oauth';
import { useAuthStore } from '../store/authStore';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Missing code or state parameter');
      return;
    }

    const provider = state.startsWith('google') ? 'google' : 'github';

    const handleCallback = async () => {
      try {
        const callbackFn = provider === 'google'
          ? oauthApi.googleCallback
          : oauthApi.githubCallback;
        const result = await callbackFn(code, state);
        setToken(result.access_token);
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/15 flex items-center justify-center">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-sm text-red-400">{error}</p>
          <Link
            to="/login"
            className="text-sm text-accent hover:underline"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 mx-auto text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
            Completing authentication...
          </p>
        </div>
      )}
    </div>
  );
}
