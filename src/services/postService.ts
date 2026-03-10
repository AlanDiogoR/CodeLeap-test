import { api } from './api'
import { sanitizeText } from '../utils/sanitize'
import type { Post, CreatePostPayload, UpdatePostPayload } from '../types/post'

function sanitizePayload<T extends { title?: string; content?: string }>(
  payload: T
): T {
  return {
    ...payload,
    ...(payload.title != null && { title: sanitizeText(payload.title) }),
    ...(payload.content != null && { content: sanitizeText(payload.content) }),
  }
}

export interface ListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Post[]
}

export const postService = {
  async getAll(): Promise<ListResponse> {
    const { data } = await api.get<ListResponse | Post[]>('')
    if (Array.isArray(data))
      return { count: data.length, next: null, previous: null, results: data }
    return {
      count: data.count ?? 0,
      next: data.next ?? null,
      previous: data.previous ?? null,
      results: data.results ?? [],
    }
  },

  async getPage(url: string): Promise<ListResponse> {
    const { data } = await api.get<ListResponse>(url)
    return {
      count: data.count ?? 0,
      next: data.next ?? null,
      previous: data.previous ?? null,
      results: data.results ?? [],
    }
  },

  async create(payload: CreatePostPayload): Promise<Post> {
    const sanitized = sanitizePayload(payload)
    const { data } = await api.post<Post>('', sanitized)
    return data
  },

  async update(id: number, payload: UpdatePostPayload): Promise<Post> {
    const sanitized = sanitizePayload(payload)
    const { data } = await api.patch<Post>(`${id}/`, sanitized)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${id}/`)
  },
}
