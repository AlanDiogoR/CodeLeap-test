import { sanitizeHtml } from '../utils/sanitize'

const MENTION_REGEX = /@(\w+)/g

interface FormattedTextProps {
  text: string
  className?: string
}

export function FormattedText({ text, className = '' }: FormattedTextProps) {
  const safe = sanitizeHtml(text)
  const parts: (string | { type: 'mention'; username: string })[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const re = new RegExp(MENTION_REGEX.source, 'g')
  while ((match = re.exec(safe)) !== null) {
    if (match.index > lastIndex) {
      parts.push(safe.slice(lastIndex, match.index))
    }
    parts.push({ type: 'mention', username: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < safe.length) {
    parts.push(safe.slice(lastIndex))
  }

  if (parts.length === 0) return <span className={className}>{safe}</span>

  return (
    <span className={className}>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <span
            key={i}
            className="cursor-pointer font-bold text-primary hover:underline"
          >
            @{part.username}
          </span>
        )
      )}
    </span>
  )
}
