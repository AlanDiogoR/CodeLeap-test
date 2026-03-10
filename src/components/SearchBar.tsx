import { Input } from './ui'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search posts...',
  className = '',
}: SearchBarProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`sm:max-w-xs ${className}`.trim()}
      aria-label="Search posts"
    />
  )
}
