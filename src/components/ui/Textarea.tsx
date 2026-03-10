import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s/g, '-')
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-base text-foreground font-normal"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : undefined}
          className={`
            min-h-[74px] w-full px-3 py-2 rounded-lg text-sm resize-none
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
            id={`${textareaId}-error`}
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

Textarea.displayName = 'Textarea'
