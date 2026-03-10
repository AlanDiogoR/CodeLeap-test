import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../../store'

const selectItems = (state: RootState) => state.posts.items
const selectSortOrder = (state: RootState) => state.posts.sortOrder

export const selectSortedPosts = createSelector(
  [selectItems, selectSortOrder],
  (items, sortOrder) => {
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
)
