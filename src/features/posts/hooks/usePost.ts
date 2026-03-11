import type { Post } from '../../../types/post'
import { usePostLocal } from './usePostLocal'
import { usePostFirebase } from './usePostFirebase'

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'rest'

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

export function usePost(post: Post, currentUser: CurrentUser): UsePostResult {
  const useFirestore =
    DATA_SOURCE === 'firebase' &&
    typeof post.id === 'string' &&
    post.id !== ''

  const firebaseResult = usePostFirebase(post, currentUser)
  const localResult = usePostLocal(post)

  return useFirestore ? firebaseResult : localResult
}
