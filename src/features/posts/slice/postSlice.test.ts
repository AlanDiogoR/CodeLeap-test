import { describe, it, expect, vi, beforeEach } from 'vitest'
import { postReducer, fetchPosts, clearError } from './postSlice'

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
