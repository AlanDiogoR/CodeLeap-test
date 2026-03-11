import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { FormattedText } from '../../../components/FormattedText'
import { ImageWithSkeleton } from '../../../components/ImageWithSkeleton'
import { DeleteIcon, EditIcon, HeartIcon } from '../../../components/icons'
import { CommentSection } from './CommentSection'
import { usePostInteractions } from '../hooks/usePostInteractions'
import { sanitizeHtml } from '../../../utils/sanitize'
import type { Post } from '../../../types/post'

interface CurrentUser {
  uid: string
  displayName: string
}

interface PostItemProps {
  post: Post
  currentUser: CurrentUser
  onEdit?: (post: Post) => void
  onDelete?: (post: Post) => void
}

export function PostItem({
  post,
  currentUser,
  onEdit,
  onDelete,
}: PostItemProps) {
  const isOwner =
    post.authorId != null
      ? post.authorId === currentUser.uid
      : post.username === currentUser.displayName
  const [showComments, setShowComments] = useState(false)
  const {
    isLiked,
    likeCount,
    comments,
    setComments,
    addComment,
    handleLike,
  } = usePostInteractions(post, currentUser.uid)

  const relativeTime = formatDistanceToNow(new Date(post.created_datetime), {
    addSuffix: true,
    locale: enUS,
  })
  const safeTitle = sanitizeHtml(post.title)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-border-dark bg-background-card"
    >
      <header className="flex min-h-[70px] items-center justify-between gap-4 bg-primary px-4 py-5 sm:px-6">
        <h3 className="text-xl font-bold text-inverse sm:text-2xl">
          {safeTitle}
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
                aria-label={`Delete post ${safeTitle}`}
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
                aria-label={`Edit post ${safeTitle}`}
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
        {post.imageUrl && (
          <div className="overflow-hidden rounded-xl">
            <ImageWithSkeleton
              src={post.imageUrl}
              alt=""
              className="max-h-80 w-full object-cover"
            />
          </div>
        )}
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
          <CommentSection
            comments={comments}
            setComments={setComments}
            addComment={addComment}
            currentUsername={currentUser.displayName}
            expanded={showComments}
            onToggle={() => setShowComments((p) => !p)}
            commentCount={comments.length}
          />
        </div>
      </div>
    </motion.article>
  )
}
