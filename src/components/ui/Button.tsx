import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'danger' | 'success' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, { base: string; disabled: string }> =
  {
    primary: {
      base: 'bg-primary text-inverse hover:opacity-90',
      disabled:
        'bg-primary-disabled text-inverse cursor-not-allowed opacity-70',
    },
    danger: {
      base: 'bg-danger text-inverse hover:opacity-90',
      disabled: 'bg-muted text-inverse cursor-not-allowed opacity-70',
    },
    success: {
      base: 'bg-success text-inverse hover:opacity-90',
      disabled: 'bg-muted text-inverse cursor-not-allowed opacity-70',
    },
    ghost: {
      base: 'bg-transparent text-inverse border border-inverse hover:opacity-90',
      disabled: 'bg-transparent text-inverse/70 cursor-not-allowed opacity-70',
    },
  }

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading
  const styles = variantStyles[variant]
  const styleClasses = isDisabled ? styles.disabled : styles.base

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-8 px-4 rounded-lg text-base font-bold
        transition-all duration-200 disabled:pointer-events-none
        hover:scale-105 active:scale-[0.98]
        ${styleClasses} ${className}
      `.trim()}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
