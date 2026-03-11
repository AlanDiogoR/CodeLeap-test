import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Error boundary - fallback UI shown; optionally log to external service
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center"
          role="alert"
        >
          <p className="text-lg font-medium text-foreground">
            Something went wrong.
          </p>
          <p className="text-sm text-muted">
            Please refresh the page or try again later.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-6 py-3 font-bold text-inverse transition-transform hover:scale-105"
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
