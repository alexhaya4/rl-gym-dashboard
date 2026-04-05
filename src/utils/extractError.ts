/** Extract a human-readable error message from an Axios error or unknown error. */
export function extractError(err: unknown): string {
  if (!err || typeof err !== 'object') return 'An unexpected error occurred';

  const axiosErr = err as {
    response?: { status?: number; data?: { detail?: unknown } };
    message?: string;
  };

  const detail = axiosErr.response?.data?.detail;
  const status = axiosErr.response?.status;

  // 422 validation errors: detail is an array of { loc, msg, type }
  if (status === 422 && Array.isArray(detail)) {
    return detail
      .map((e: { loc?: string[]; msg?: string }) => {
        const field = e.loc?.slice(-1)[0] ?? 'field';
        return `${field}: ${e.msg ?? 'invalid'}`;
      })
      .join('; ');
  }

  // String detail from backend
  if (typeof detail === 'string') return detail;

  // Status-specific fallbacks
  if (status === 401) return 'Invalid credentials';
  if (status === 400) return (detail as string) ?? 'Bad request';
  if (status === 403) return 'Permission denied';
  if (status === 404) return 'Not found';
  if (status === 409) return 'Already exists';
  if (status && status >= 500) return 'Server error, please try again';

  // Network / generic
  if (axiosErr.message === 'Network Error') return 'Network error, check your connection';
  if (axiosErr.message) return axiosErr.message;

  return 'An unexpected error occurred';
}
