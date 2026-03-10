import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchPosts,
  fetchNextPage,
  deletePost,
  updatePost,
  setSortOrder,
} from '../slice/postSlice'
import { selectSortedPosts } from '../selectors/postSelectors'
import type { Post } from '../../../types/post'
import type { SortOrder } from '../slice/postSlice'
import { PostItem } from './PostItem'
import { DeleteConfirmModal } from './modals/DeleteConfirmModal'
import { EditPostModal } from './modals/EditPostModal'
import { FeedbackState } from '../../../components/ui'
import { formatErrorForUI } from '../../../utils/errorHandler'
import type { ApiError } from '../../../types/api'

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } },
  item: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
}

interface PostListProps {
  searchQuery?: string
}

export function PostList({ searchQuery = '' }: PostListProps) {
  const dispatch = useAppDispatch()
  const { status, pagination, error, sortOrder } = useAppSelector(
    (state) => state.posts
  )
  const sortedItems = useAppSelector(selectSortedPosts)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return sortedItems
    const q = searchQuery.toLowerCase()
    return sortedItems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    )
  }, [sortedItems, searchQuery])
  const username = useAppSelector((state) => state.auth.username)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const [editTarget, setEditTarget] = useState<Post | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void dispatch(fetchPosts())
  }, [dispatch])

  useEffect(() => {
    if (status === 'failed' && error && sortedItems.length > 0) {
      toast.error(error)
    }
  }, [status, error, sortedItems.length])

  async function handleDelete(post: Post) {
    setDeleteTarget(post)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await dispatch(deletePost(deleteTarget))
    setIsDeleting(false)
    setDeleteTarget(null)
    if (deletePost.fulfilled.match(result)) {
      toast.success('Post deleted successfully!')
    }
    if (deletePost.rejected.match(result)) {
      toast.error(formatErrorForUI(result.payload as ApiError))
    }
  }

  function handleEdit(post: Post) {
    setEditTarget(post)
  }

  async function handleSaveEdit(title: string, content: string) {
    if (!editTarget) return
    setIsUpdating(true)
    const result = await dispatch(
      updatePost({ id: editTarget.id, payload: { title, content } })
    )
    setIsUpdating(false)
    setEditTarget(null)
    if (updatePost.fulfilled.match(result)) {
      toast.success('Post updated successfully!')
    }
    if (updatePost.rejected.match(result)) {
      toast.error(formatErrorForUI(result.payload as ApiError))
    }
  }

  const loadMore = useCallback(() => {
    if (pagination.next && status !== 'loading') {
      void dispatch(fetchNextPage(pagination.next))
    }
  }, [dispatch, pagination.next, status])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && pagination.hasMore) loadMore()
      },
      { rootMargin: '100px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, pagination.hasMore])

  if (status === 'loading' && sortedItems.length === 0) {
    return <PostListSkeleton />
  }

  if (status === 'failed' && sortedItems.length === 0) {
    return (
      <FeedbackState
        variant="error"
        message={error ?? 'Error loading posts'}
        onRetry={async () => {
          const result = await dispatch(fetchPosts())
          if (fetchPosts.rejected.match(result)) {
            toast.error(formatErrorForUI(result.payload as ApiError))
          }
        }}
      />
    )
  }

  if (sortedItems.length === 0) {
    return (
      <FeedbackState
        variant="empty"
        message="No posts yet. Create the first one!"
      />
    )
  }

  if (!username) return null

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Feed
          </h2>
          <SortDropdown
            value={sortOrder}
            onChange={(v) => dispatch(setSortOrder(v as SortOrder))}
          />
        </div>
        {filteredItems.length === 0 ? (
          <FeedbackState
            variant="empty"
            message="No posts match your search."
          />
        ) : (
          <>
            <motion.div
              variants={stagger.container}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((post) => (
                  <motion.div key={post.id} variants={stagger.item}>
                    <PostItem
                      post={post}
                      currentUsername={username}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {pagination.hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-4">
                <span
                  className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                  aria-hidden
                />
              </div>
            )}
          </>
        )}
      </div>
      <DeleteConfirmModal
        post={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
      <EditPostModal
        post={editTarget}
        onSave={handleSaveEdit}
        onCancel={() => setEditTarget(null)}
        isLoading={isUpdating}
      />
    </>
  )
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOrder
  onChange: (v: SortOrder) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOrder)}
      className="rounded-lg border border-border bg-background-card px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="Sort posts"
    >
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
    </select>
  )
}

function PostListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-border-dark bg-background-card"
        >
          <div className="flex min-h-[70px] items-center px-6 py-5">
            <div className="h-8 w-1/2 rounded bg-primary/20" />
          </div>
          <div className="min-h-[120px] space-y-2 px-6 py-4">
            <div className="flex justify-between">
              <div className="h-5 w-24 rounded bg-muted/30" />
              <div className="h-5 w-28 rounded bg-muted/30" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-full rounded bg-muted/30" />
              <div className="h-5 w-3/4 rounded bg-muted/30" />
              <div className="h-5 w-2/3 rounded bg-muted/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
