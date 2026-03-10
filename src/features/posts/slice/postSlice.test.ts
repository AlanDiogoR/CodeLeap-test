import { describe, it, expect, vi, beforeEach } from 'vitest'
import { postReducer, fetchPosts, clearError } from './postSlice'
import { selectSortedPosts } from '../selectors/postSelectors'
import type { RootState } from '../../../store'

vi.mock('../../../services/postService', () => ({
  postService: {
    getAll: vi.fn(),
    getPage: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { postService } from '../../../services/postService'

const mockPost = {
  id: 1,
  username: 'john',
  created_datetime: '2025-01-01T00:00:00Z',
  title: 'Test',
  content: 'Content',
}

describe('postSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchPosts.fulfilled updates items and status', async () => {
    vi.mocked(postService.getAll).mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [mockPost],
    })
    const dispatch = vi.fn()
    await fetchPosts()(dispatch, () => ({}), undefined)
    const fulfilled = dispatch.mock.calls.find(
      (c) => c[0]?.type === 'posts/fetchPosts/fulfilled'
    )
    expect(fulfilled).toBeDefined()
    const state = postReducer(
      undefined,
      fulfilled![0] as ReturnType<typeof fetchPosts.fulfilled>
    )
    expect(state.items).toHaveLength(1)
    expect(state.status).toBe('succeeded')
    expect(state.error).toBeNull()
  })

  it('fetchPosts.rejected sets error', async () => {
    vi.mocked(postService.getAll).mockRejectedValueOnce({
      code: 'NETWORK_ERROR',
      message: 'Check your connection',
    })
    const dispatch = vi.fn()
    await fetchPosts()(dispatch, () => ({}), undefined)
    const rejected = dispatch.mock.calls.find(
      (c) => c[0]?.type === 'posts/fetchPosts/rejected'
    )
    expect(rejected).toBeDefined()
    const state = postReducer(
      undefined,
      rejected![0] as ReturnType<typeof fetchPosts.rejected>
    )
    expect(state.error).toBe('Check your connection')
    expect(state.status).toBe('failed')
  })

  it('deletePost.pending removes item optimistically', () => {
    const stateWithPosts = {
      items: [mockPost],
      status: 'succeeded' as const,
      error: null,
      pagination: { next: null, offset: 0, limit: 10, hasMore: false },
      optimisticDelete: null,
      sortOrder: 'newest' as const,
    }
    const pendingAction = {
      type: 'posts/deletePost/pending',
      meta: { arg: mockPost },
    }
    const state = postReducer(stateWithPosts, pendingAction as never)
    expect(state.items).toHaveLength(0)
    expect(state.optimisticDelete).toEqual(mockPost)
  })

  it('deletePost.rejected restores item on rollback', () => {
    const stateOptimistic = {
      items: [],
      status: 'succeeded' as const,
      error: null,
      pagination: { next: null, offset: 0, limit: 10, hasMore: false },
      optimisticDelete: mockPost,
      sortOrder: 'newest' as const,
    }
    const rejectedAction = {
      type: 'posts/deletePost/rejected',
      payload: { message: 'Error' },
      meta: { arg: mockPost },
    }
    const state = postReducer(stateOptimistic, rejectedAction as never)
    expect(state.items).toHaveLength(1)
    expect(state.optimisticDelete).toBeNull()
  })

  it('selectSortedPosts returns newest first when sortOrder is newest', () => {
    const post1 = {
      id: 1,
      username: 'a',
      created_datetime: '2025-01-01T10:00:00Z',
      title: 'First',
      content: 'A',
    }
    const post2 = {
      id: 2,
      username: 'b',
      created_datetime: '2025-01-01T12:00:00Z',
      title: 'Second',
      content: 'B',
    }
    const post3 = {
      id: 3,
      username: 'c',
      created_datetime: '2025-01-01T11:00:00Z',
      title: 'Third',
      content: 'C',
    }
    const state: RootState = {
      posts: {
        items: [post1, post2, post3],
        status: 'succeeded',
        error: null,
        pagination: { next: null, offset: 0, limit: 10, hasMore: false },
        optimisticDelete: null,
        sortOrder: 'newest',
      },
      auth: { username: 'user' },
    }
    const result = selectSortedPosts(state)
    expect(result[0].id).toBe(2)
    expect(result[1].id).toBe(3)
    expect(result[2].id).toBe(1)
  })

  it('selectSortedPosts returns oldest first when sortOrder is oldest', () => {
    const post1 = {
      id: 1,
      username: 'a',
      created_datetime: '2025-01-01T10:00:00Z',
      title: 'First',
      content: 'A',
    }
    const post2 = {
      id: 2,
      username: 'b',
      created_datetime: '2025-01-01T12:00:00Z',
      title: 'Second',
      content: 'B',
    }
    const state: RootState = {
      posts: {
        items: [post1, post2],
        status: 'succeeded',
        error: null,
        pagination: { next: null, offset: 0, limit: 10, hasMore: false },
        optimisticDelete: null,
        sortOrder: 'oldest',
      },
      auth: { username: 'user' },
    }
    const result = selectSortedPosts(state)
    expect(result[0].id).toBe(1)
    expect(result[1].id).toBe(2)
  })

  it('clearError resets error', () => {
    const stateWithError = postReducer(
      {
        items: [],
        status: 'failed',
        error: 'Something went wrong',
        pagination: {
          next: null,
          offset: 0,
          limit: 10,
          hasMore: false,
        },
        optimisticDelete: null,
        sortOrder: 'newest',
      },
      clearError()
    )
    expect(stateWithError.error).toBeNull()
  })
})
