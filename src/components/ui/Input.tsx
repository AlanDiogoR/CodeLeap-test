import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-base text-foreground font-normal"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={`
            min-h-8 w-full px-3 rounded-lg text-sm
            bg-background-card border
            placeholder:text-placeholder
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasError ? 'border-danger' : 'border-border'}
            ${className}
          `.trim()}
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-sm text-danger"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
