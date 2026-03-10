import { useEffect, useRef, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchPosts,
  fetchNextPage,
  deletePost,
  updatePost,
} from '../slice/postSlice'
import type { Post } from '../../../types/post'
import { PostItem } from './PostItem'
import { DeleteConfirmModal } from './modals/DeleteConfirmModal'
import { EditPostModal } from './modals/EditPostModal'
import { FeedbackState } from '../../../components/ui'
import { formatErrorForUI } from '../../../utils/errorHandler'
import type { ApiError } from '../../../types/api'

export function PostList() {
  const dispatch = useAppDispatch()
  const { items, status, pagination, error } = useAppSelector(
    (state) => state.posts
  )
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
    if (status === 'failed' && error && items.length > 0) {
      toast.error(error)
    }
  }, [status, error, items.length])

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

  if (status === 'loading' && items.length === 0) {
    return <PostListSkeleton />
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <FeedbackState
        variant="error"
        message={error ?? 'Error loading posts'}
        action={
          <button
            type="button"
            onClick={async () => {
              const result = await dispatch(fetchPosts())
              if (fetchPosts.rejected.match(result)) {
                toast.error(formatErrorForUI(result.payload as ApiError))
              }
            }}
            className="rounded-lg bg-primary px-4 py-2 font-bold text-inverse hover:opacity-90"
          >
            Try again
          </button>
        }
      />
    )
  }

  if (items.length === 0) {
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
        {items.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            currentUsername={username}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {pagination.hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-4">
            <span
              className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
              aria-hidden
            />
          </div>
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
