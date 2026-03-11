import { useState, useCallback, useEffect } from 'react'
import type { Post } from '../../../types/post'
import {
  subscribeToLikes,
  subscribeToComments,
  toggleLike as firebaseToggleLike,
  addComment as firebaseAddComment,
  type FirestoreComment,
} from '../../../services/firebasePostInteractions'
import type { FakeComment } from './usePostActions'

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'rest'
const useFirebaseInteractions = DATA_SOURCE === 'firebase'

const STORAGE_KEY = 'codeleap_post_data'

function loadFromStorage(postId: number | string): {
  likes: number
  liked: boolean
  comments: FakeComment[]
} {
  if (typeof window === 'undefined') {
    return { likes: 0, liked: false, comments: [] }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { likes: 0, liked: false, comments: [] }
    const data = JSON.parse(raw) as Record<
      string,
      { likes: number; liked: boolean; comments: FakeComment[] }
    >
    const key = String(postId)
    return data[key] ?? { likes: 0, liked: false, comments: [] }
  } catch {
    return { likes: 0, liked: false, comments: [] }
  }
}

function saveToStorage(
  postId: number | string,
  data: { likes: number; liked: boolean; comments: FakeComment[] }
): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    parsed[String(postId)] = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

export interface PostInteractionsResult {
  isLiked: boolean
  likeCount: number
  comments: FakeComment[]
  setComments: (fn: (prev: FakeComment[]) => FakeComment[]) => void
  addComment?: (text: string) => Promise<void>
  handleLike: () => void
}

function useFirestoreInteractions(
  post: Post,
  currentUserId: string | null
): PostInteractionsResult {
  const postId = typeof post.id === 'string' ? post.id : ''
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
    if (!currentUserId || currentUserId === 'local') return
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
      const author = post.username
      const authorId =
        currentUserId && currentUserId !== 'local' ? currentUserId : undefined
      await firebaseAddComment(postId, { author, authorId, text })
    },
    [postId, post.username, currentUserId]
  )

  const commentsAsFake: FakeComment[] = comments.map((c) => ({
    id: c.id,
    author: c.author,
    text: c.text,
    timestamp: c.timestamp,
  }))

  return {
    isLiked,
    likeCount,
    comments: commentsAsFake,
    setComments: () => {},
    addComment,
    handleLike,
  }
}

function useLocalInteractions(post: Post): PostInteractionsResult {
  const stored = loadFromStorage(post.id)
  const [isLiked, setIsLiked] = useState(stored.liked)
  const [likeCount, setLikeCount] = useState(stored.likes)
  const [comments, setComments] = useState<FakeComment[]>(stored.comments)

  useEffect(() => {
    saveToStorage(post.id, { likes: likeCount, liked: isLiked, comments })
  }, [post.id, likeCount, isLiked, comments])

  const handleLike = useCallback(() => {
    setIsLiked((prev) => {
      const next = !prev
      setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)))
      return next
    })
  }, [])

  return {
    isLiked,
    likeCount,
    comments,
    setComments,
    handleLike,
  }
}

export function usePostInteractions(
  post: Post,
  currentUserId: string | null
): PostInteractionsResult {
  const useFirestore =
    useFirebaseInteractions && typeof post.id === 'string' && post.id !== ''

  if (useFirestore) {
    return useFirestoreInteractions(post, currentUserId)
  }
  return useLocalInteractions(post)
}
