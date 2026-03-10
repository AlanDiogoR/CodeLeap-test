import { useState, type ReactNode } from 'react'

interface FeedbackStateProps {
  variant: 'empty' | 'error'
  message: string
  action?: ReactNode
  onRetry?: () => Promise<void>
}

function EmptyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted/70"
      aria-hidden
    >
      <rect x="8" y="8" width="48" height="48" rx="4" />
      <path d="M20 24h24" />
      <path d="M20 32h24" />
      <path d="M20 40h16" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-danger"
      aria-hidden
    >
      <circle cx="32" cy="32" r="24" />
      <path d="M32 20v20" strokeWidth="2" />
      <circle cx="32" cy="44" r="3" fill="currentColor" />
    </svg>
  )
}

export function FeedbackState({
  variant,
  message,
  action,
  onRetry,
}: FeedbackStateProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  async function handleRetry() {
    if (!onRetry) return
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const retryButton =
    onRetry && variant === 'error' ? (
      <button
        type="button"
        onClick={handleRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-inverse transition-transform hover:scale-105 disabled:opacity-70"
      >
        {isRetrying ? (
          <>
            <span
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            Trying...
          </>
        ) : (
          'Try Again'
        )}
      </button>
    ) : (
      action
    )

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border-dark bg-background-card p-8 text-center sm:p-12"
      role={variant === 'error' ? 'alert' : undefined}
    >
      {variant === 'empty' ? <EmptyIcon /> : <ErrorIcon />}
      <p className="text-base text-muted sm:text-lg">{message}</p>
      {retryButton}
    </div>
  )
}
