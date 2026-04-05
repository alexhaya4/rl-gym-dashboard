import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center dark:bg-dark-bg bg-light-bg">
          <div className="text-center space-y-4 max-w-md px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 flex items-center justify-center">
              <span className="text-red-400 text-2xl font-bold">!</span>
            </div>
            <h1 className="text-xl font-semibold dark:text-dark-text text-light-text">
              Something went wrong
            </h1>
            <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-accent text-white rounded-[var(--radius-btn)] hover:bg-accent-hover transition-colors cursor-pointer text-sm font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
