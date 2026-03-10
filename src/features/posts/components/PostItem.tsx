import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { FormattedText } from '../../../components/FormattedText'
import type { Post } from '../../../types/post'

interface FakeComment {
  id: string
  author: string
  text: string
  timestamp: number
}

interface PostItemProps {
  post: Post
  currentUsername: string
  onEdit?: (post: Post) => void
  onDelete?: (post: Post) => void
}

export function PostItem({
  post,
  currentUsername,
  onEdit,
  onDelete,
}: PostItemProps) {
  const isOwner = post.username === currentUsername
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<FakeComment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const relativeTime = formatDistanceToNow(new Date(post.created_datetime), {
    addSuffix: true,
    locale: enUS,
  })

  function handleLike() {
    setIsLiked((prev) => !prev)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  function handleAddComment(e: FormEvent) {
    e.preventDefault()
    const trimmed = commentInput.trim()
    if (!trimmed) return
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

  function handleToggleComments() {
    setShowComments((prev) => !prev)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-border-dark bg-background-card"
    >
      <header className="flex min-h-[70px] items-center justify-between gap-4 bg-primary px-4 py-5 sm:px-6">
        <h3 className="text-xl font-bold text-inverse sm:text-2xl">
          {post.title}
        </h3>
        {isOwner && (onEdit || onDelete) && (
          <div className="flex gap-3">
            {onDelete && (
              <motion.button
                type="button"
                onClick={() => onDelete(post)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-inverse transition-colors hover:brightness-110"
                aria-label={`Delete post ${post.title}`}
              >
                <DeleteIcon />
              </motion.button>
            )}
            {onEdit && (
              <motion.button
                type="button"
                onClick={() => onEdit(post)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-inverse transition-colors hover:brightness-110"
                aria-label={`Edit post ${post.title}`}
              >
                <EditIcon />
              </motion.button>
            )}
          </div>
        )}
      </header>
      <div className="min-h-[120px] space-y-2 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-base text-muted sm:text-lg">
          <span>@{post.username}</span>
          <span>{relativeTime}</span>
        </div>
        <div className="whitespace-pre-wrap text-base text-foreground sm:text-lg">
          <FormattedText text={post.content} />
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <motion.button
            type="button"
            onClick={handleLike}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
              isLiked
                ? 'text-danger'
                : 'text-muted hover:text-danger/80'
            }`}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            <motion.span
              animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <HeartIcon filled={isLiked} />
            </motion.span>
            {likeCount > 0 && (
              <span className="text-sm font-medium">{likeCount}</span>
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={handleToggleComments}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-muted transition-colors hover:text-primary"
            aria-label={showComments ? 'Hide comments' : 'Show comments'}
            aria-expanded={showComments}
          >
            <CommentIcon />
            <span className="text-sm font-medium">{comments.length}</span>
          </motion.button>
        </div>
        <AnimatePresence>
          {showComments && (
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
                    disabled={!commentInput.trim()}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-inverse transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    Post
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
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
