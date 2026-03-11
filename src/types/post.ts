export interface Post {
  id: number | string
  username: string
  created_datetime: string
  title: string
  content: string
  authorId?: string
  imageUrl?: string
}

export interface CreatePostPayload {
  username: string
  title: string
  content: string
  authorId?: string
  imageUrl?: string
}

export interface UpdatePostPayload {
  title: string
  content: string
  imageUrl?: string
}

export interface PaginatedPosts {
  results: Post[]
  next: string | null
}
