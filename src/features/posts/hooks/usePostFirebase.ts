import { useState, useCallback, useEffect } from 'react'
import type { Post } from '../../../types/post'
import {
  subscribeToLikes,
  subscribeToComments,
  toggleLike as firebaseToggleLike,
  addComment as firebaseAddComment,
  type FirestoreComment,
} from '../../../services/firebasePostInteractions'
import type { Comment, CurrentUser, UsePostResult } from './usePost'

export function usePostFirebase(
  post: Post,
  currentUser: CurrentUser
): UsePostResult {
  const postId = typeof post.id === 'string' ? post.id : ''
  const currentUserId =
    currentUser.uid !== 'local' ? currentUser.uid : null

  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setCommentsState] = useState<FirestoreComment[]>([])

  useEffect(() => {
    if (!postId) return
    const unsub = subscribeToLikes(postId, currentUserId, (count, liked) => {
      setLikeCount(count)
      setIsLiked(liked)
    })
    return unsub
  }, [postId, currentUserId])

  useEffect(() => {
    if (!postId) return
    const unsub = subscribeToComments(postId, setCommentsState)
    return unsub
  }, [postId])

  const handleLike = useCallback(async () => {
    if (!currentUserId) return
    try {
      const liked = await firebaseToggleLike(postId, currentUserId)
      setIsLiked(liked)
      setLikeCount((c) => (liked ? c + 1 : Math.max(0, c - 1)))
    } catch {
      // ignore
    }
  }, [postId, currentUserId])

  const addComment = useCallback(
    async (text: string) => {
      await firebaseAddComment(postId, {
        author: currentUser.displayName,
        authorId: currentUserId ?? undefined,
        text,
      })
    },
    [postId, currentUser.displayName, currentUserId]
  )

  const commentsAsComment: Comment[] = comments.map((c) => ({
    id: c.id,
    author: c.author,
    text: c.text,
    timestamp: c.timestamp,
  }))

  return {
    isLiked,
    likeCount,
    comments: commentsAsComment,
    setComments: () => {},
    addComment,
    handleLike,
  }
}
