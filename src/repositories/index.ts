import type { IPostRepository } from './IPostRepository'
import { RestPostRepository } from './RestPostRepository'
import { FirebasePostRepository } from './FirebasePostRepository'

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'rest'

let _instance: IPostRepository | null = null

export function getPostRepository(): IPostRepository {
  if (!_instance) {
    _instance =
      DATA_SOURCE === 'firebase'
        ? new FirebasePostRepository()
        : new RestPostRepository()
  }
  return _instance
}

export function setPostRepository(repo: IPostRepository): void {
  _instance = repo
}

export { RestPostRepository, FirebasePostRepository }
export type { IPostRepository, PaginatedResult } from './IPostRepository'
