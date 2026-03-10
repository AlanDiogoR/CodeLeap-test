import type { RootState } from '../../../store'
import type { Post } from '../../../types/post'

export function selectSortedPosts(state: RootState): Post[] {
  const { items, sortOrder } = state.posts
  const copy = [...items]
  return sortOrder === 'newest'
    ? copy.sort(
        (a, b) =>
          new Date(b.created_datetime).getTime() -
          new Date(a.created_datetime).getTime()
      )
    : copy.sort(
        (a, b) =>
          new Date(a.created_datetime).getTime() -
          new Date(b.created_datetime).getTime()
      )
}
