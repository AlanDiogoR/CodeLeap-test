import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './api'
import { postService } from './postService'

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('postService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll returns ListResponse when API returns empty results', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { count: 0, next: null, previous: null, results: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })
    const res = await postService.getAll()
    expect(res.results).toEqual([])
    expect(res.next).toBeNull()
  })

  it('getAll returns posts from results', async () => {
    const mockPosts = [
      {
        id: 1,
        username: 'john',
        created_datetime: '2025-01-01T00:00:00Z',
        title: 'Test',
        content: 'Content',
      },
    ]
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { count: 1, next: null, previous: null, results: mockPosts },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })
    const res = await postService.getAll()
    expect(res.results).toEqual(mockPosts)
  })

  it('create sends POST with payload', async () => {
    const payload = {
      username: 'john',
      title: 'Title',
      content: 'Content',
    }
    const created = { ...payload, id: 1, created_datetime: '2025-01-01' }
    vi.mocked(api.post).mockResolvedValueOnce({
      data: created,
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {} as never,
    })
    const result = await postService.create(payload)
    expect(api.post).toHaveBeenCalledWith('', payload)
    expect(result).toEqual(created)
  })
})
