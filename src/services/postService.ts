import { api } from './api'
import type { Post, CreatePostPayload, UpdatePostPayload } from '../types/post'

interface ListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Post[]
}

export const postService = {
  async getAll(): Promise<Post[]> {
    const { data } = await api.get<ListResponse | Post[]>('')
    if (Array.isArray(data)) return data
    return data.results ?? []
  },

  async create(payload: CreatePostPayload): Promise<Post> {
    const { data } = await api.post<Post>('', payload)
    return data
  },

  async update(id: number, payload: UpdatePostPayload): Promise<Post> {
    const { data } = await api.patch<Post>(`${id}/`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${id}/`)
  },
}
