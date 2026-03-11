import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { FormattedText } from '../../../components/FormattedText'
import type { FakeComment } from '../hooks/usePostActions'

interface CommentSectionProps {
  comments: FakeComment[]
  setComments: (fn: (prev: FakeComment[]) => FakeComment[]) => void
  addComment?: (text: string) => Promise<void>
  currentUsername: string
  expanded: boolean
  onToggle: () => void
  commentCount: number
}

export function CommentSection({
  comments,
  setComments,
  addComment,
  currentUsername,
  expanded,
  onToggle,
  commentCount,
}: CommentSectionProps) {
  const [commentInput, setCommentInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAddComment(e: FormEvent) {
    e.preventDefault()
    const trimmed = commentInput.trim()
    if (!trimmed) return
    if (addComment) {
      setIsSubmitting(true)
      try {
        await addComment(trimmed)
        setCommentInput('')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setComments((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          author: currentUsername,
          text: trimmed,
          timestamp: Date.now(),
        },
      ])
      setCommentInput('')
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-muted transition-colors hover:text-primary"
        aria-label={expanded ? 'Hide comments' : 'Show comments'}
        aria-expanded={expanded}
      >
        <CommentIcon />
        <span className="text-sm font-medium">{commentCount}</span>
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg bg-background px-3 py-2"
                    >
                      <div className="flex items-baseline gap-2 text-sm">
                        <span className="font-medium text-foreground">
                          @{c.author}
                        </span>
                        <span className="text-xs text-muted">
                          {formatDistanceToNow(c.timestamp, {
                            addSuffix: true,
                            locale: enUS,
                          })}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-foreground">
                        <FormattedText text={c.text} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-8 flex-1 rounded-lg border border-border bg-background-card px-3 py-2 text-sm placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Comment input"
                  maxLength={512}
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim() || isSubmitting}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-inverse transition-transform hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function CommentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
