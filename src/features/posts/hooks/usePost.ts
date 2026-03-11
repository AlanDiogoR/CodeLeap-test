import { useState, useCallback, useEffect } from 'react'
import type { Post } from '../../../types/post'
import {
  subscribeToLikes,
  subscribeToComments,
  toggleLike as firebaseToggleLike,
  addComment as firebaseAddComment,
  type FirestoreComment,
} from '../../../services/firebasePostInteractions'

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'rest'
const STORAGE_KEY = 'codeleap_post_data'

export interface Comment {
  id: string
  author: string
  text: string
  timestamp: number
}

export interface CurrentUser {
  uid: string
  displayName: string
}

export interface UsePostResult {
  isLiked: boolean
  likeCount: number
  comments: Comment[]
  setComments: (fn: (prev: Comment[]) => Comment[]) => void
  addComment?: (text: string) => Promise<void>
  handleLike: () => void
}

function loadFromStorage(postId: number | string): {
  likes: number
  liked: boolean
  comments: Comment[]
} {
  if (typeof window === 'undefined') {
    return { likes: 0, liked: false, comments: [] }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { likes: 0, liked: false, comments: [] }
    const data = JSON.parse(raw) as Record<
      string,
      { likes: number; liked: boolean; comments: Comment[] }
    >
    const key = String(postId)
    return data[key] ?? { likes: 0, liked: false, comments: [] }
  } catch {
    return { likes: 0, liked: false, comments: [] }
  }
}

function saveToStorage(
  postId: number | string,
  data: { likes: number; liked: boolean; comments: Comment[] }
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

function useFirestoreMode(
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

function useLocalMode(post: Post): UsePostResult {
  const stored = loadFromStorage(post.id)
  const [isLiked, setIsLiked] = useState(stored.liked)
  const [likeCount, setLikeCount] = useState(stored.likes)
  const [comments, setComments] = useState<Comment[]>(stored.comments)

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

export function usePost(post: Post, currentUser: CurrentUser): UsePostResult {
  const useFirestore =
    DATA_SOURCE === 'firebase' &&
    typeof post.id === 'string' &&
    post.id !== ''

  if (useFirestore) {
    return useFirestoreMode(post, currentUser)
  }
  return useLocalMode(post)
}
