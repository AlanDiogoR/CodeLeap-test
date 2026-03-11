import { useState, useCallback, useEffect } from 'react'
import type { Post } from '../../../types/post'

export interface FakeComment {
  id: string
  author: string
  text: string
  timestamp: number
}

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

export function usePostActions(post: Post) {
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
