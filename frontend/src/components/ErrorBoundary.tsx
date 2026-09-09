import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-zinc-900 dark:text-zinc-100">
          <div className="max-w-xl w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 text-amber-500 dark:text-amber-400 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Something went wrong</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">An unexpected rendering error occurred.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 mb-5 font-mono text-xs text-red-600 dark:text-red-400 break-words">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition"
              >
                Try to recover
              </button>
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="ml-auto text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
              >
                <span>{this.state.showDetails ? 'Hide' : 'View'} Details</span>
                {this.state.showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {this.state.showDetails && this.state.errorInfo && (
              <pre className="mt-4 p-4 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-auto max-h-64 whitespace-pre-wrap border border-zinc-800">
                {this.state.error?.stack}
                {'\n\nComponent Stack:'}
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
