import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Post } from '../../types/post'

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
  const relativeTime = formatDistanceToNow(new Date(post.created_datetime), {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <article className="overflow-hidden rounded-2xl border border-border-dark bg-background-card">
      <header className="flex items-center justify-between gap-4 bg-primary px-6 py-5">
        <h3 className="text-2xl font-bold text-inverse">{post.title}</h3>
        {isOwner && (onEdit || onDelete) && (
          <div className="flex gap-3">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(post)}
                className="text-inverse hover:opacity-80"
                aria-label={`Excluir post ${post.title}`}
              >
                <DeleteIcon />
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(post)}
                className="text-inverse hover:opacity-80"
                aria-label={`Editar post ${post.title}`}
              >
                <EditIcon />
              </button>
            )}
          </div>
        )}
      </header>
      <div className="space-y-2 px-6 py-4">
        <div className="flex justify-between text-lg text-muted">
          <span>@{post.username}</span>
          <span>{relativeTime}</span>
        </div>
        <p className="whitespace-pre-wrap text-lg text-foreground">
          {post.content}
        </p>
      </div>
    </article>
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
