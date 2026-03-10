import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPosts, fetchNextPage, deletePost, updatePost } from './postSlice'
import type { Post } from '../../types/post'
import { PostItem } from './PostItem'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { EditPostModal } from './EditPostModal'

export function PostList() {
  const dispatch = useAppDispatch()
  const { items, status, pagination } = useAppSelector((state) => state.posts)
  const username = useAppSelector((state) => state.auth.username)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const [editTarget, setEditTarget] = useState<Post | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void dispatch(fetchPosts())
  }, [dispatch])

  async function handleDelete(post: Post) {
    setDeleteTarget(post)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    await dispatch(deletePost(deleteTarget.id))
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  function handleEdit(post: Post) {
    setEditTarget(post)
  }

  async function handleSaveEdit(title: string, content: string) {
    if (!editTarget) return
    setIsUpdating(true)
    await dispatch(
      updatePost({ id: editTarget.id, payload: { title, content } })
    )
    setIsUpdating(false)
    setEditTarget(null)
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

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border-dark bg-background-card p-12 text-center">
        <p className="text-muted">Nenhum post ainda. Crie o primeiro!</p>
      </div>
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
          <div className="h-16 bg-primary/20" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-1/3 rounded bg-muted/30" />
            <div className="h-4 w-full rounded bg-muted/30" />
            <div className="h-4 w-2/3 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  )
}
