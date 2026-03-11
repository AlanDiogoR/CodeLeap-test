import { api } from '../services/api'
import { sanitizeText } from '../utils/sanitize'
import type { IPostRepository, PaginatedResult } from './IPostRepository'
import type { Post, CreatePostPayload, UpdatePostPayload } from '../types/post'
import { apiPostSchema, listResponseSchema } from '../schemas/postSchema'
import type { ApiError } from '../types/api'

function sanitizePayload<T extends { title?: string; content?: string }>(
  payload: T
): T {
  return {
    ...payload,
    ...(payload.title != null && { title: sanitizeText(payload.title) }),
    ...(payload.content != null && { content: sanitizeText(payload.content) }),
  }
}

function parseApiPost(raw: unknown): Post {
  const parsed = apiPostSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error('Invalid post data from API')
  }
  const p = parsed.data
  return {
    id: p.id,
    username: p.username,
    created_datetime: p.created_datetime,
    title: p.title,
    content: p.content,
  }
}

export class RestPostRepository implements IPostRepository {
  async getAll(): Promise<PaginatedResult> {
    const { data } = await api.get<unknown>('')
    const parsed = listResponseSchema.safeParse(data)
    if (parsed.success) {
      return {
        results: parsed.data.results.map(parseApiPost),
        next: parsed.data.next ?? null,
      }
    }
    if (Array.isArray(data)) {
      return {
        results: data.map(parseApiPost),
        next: null,
      }
    }
    throw { code: 'UNKNOWN', message: 'Invalid API response' } as ApiError
  }

  async getNextPage(url: string): Promise<PaginatedResult> {
    const { data } = await api.get<unknown>(url)
    const parsed = listResponseSchema.safeParse(data)
    if (!parsed.success) {
      throw { code: 'UNKNOWN', message: 'Invalid API response' } as ApiError
    }
    return {
      results: parsed.data.results.map(parseApiPost),
      next: parsed.data.next ?? null,
    }
  }

  async create(payload: CreatePostPayload): Promise<Post> {
    const sanitized = sanitizePayload(payload)
    const { data } = await api.post<unknown>('', {
      username: sanitized.username,
      title: sanitized.title,
      content: sanitized.content,
    })
    return parseApiPost(data)
  }

  async update(
    id: number | string,
    payload: UpdatePostPayload
  ): Promise<Post> {
    const sanitized = sanitizePayload(payload)
    const { data } = await api.patch<unknown>(`${id}/`, sanitized)
    return parseApiPost(data)
  }

  async delete(id: number | string): Promise<void> {
    await api.delete(`${id}/`)
  }
}
