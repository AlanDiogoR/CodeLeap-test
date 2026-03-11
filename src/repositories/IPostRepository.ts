import type { Post, CreatePostPayload, UpdatePostPayload } from '../types/post'

export interface PaginatedResult {
  results: Post[]
  next: string | null
}

export interface IPostRepository {
  getAll(): Promise<PaginatedResult>
  getNextPage(cursor: string): Promise<PaginatedResult>
  create(payload: CreatePostPayload): Promise<Post>
  update(id: number | string, payload: UpdatePostPayload): Promise<Post>
  delete(id: number | string): Promise<void>
}
