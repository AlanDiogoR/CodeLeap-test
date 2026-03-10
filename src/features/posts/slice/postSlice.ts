import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { postService } from '../../../services/postService'
import type {
  Post,
  CreatePostPayload,
  UpdatePostPayload,
} from '../../../types/post'
import type { ApiError } from '../../../types/api'

export type PostStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface PaginationState {
  next: string | null
  offset: number
  limit: number
  hasMore: boolean
}

export type SortOrder = 'newest' | 'oldest'

interface PostsState {
  items: Post[]
  status: PostStatus
  error: string | null
  pagination: PaginationState
  optimisticDelete: Post | null
  sortOrder: SortOrder
}

const initialPagination = {
  next: null,
  offset: 0,
  limit: 10,
  hasMore: false,
}

const initialState: PostsState = {
  items: [],
  status: 'idle',
  error: null,
  pagination: initialPagination,
  optimisticDelete: null,
  sortOrder: 'newest',
}

export const fetchPosts = createAsyncThunk<
  { results: Post[]; next: string | null },
  void,
  { rejectValue: ApiError }
>('posts/fetchPosts', async (_, { rejectWithValue }) => {
  try {
    const res = await postService.getAll()
    return { results: res.results, next: res.next }
  } catch (error) {
    return rejectWithValue(error as ApiError)
  }
})

export const fetchNextPage = createAsyncThunk<
  { results: Post[]; next: string | null },
  string,
  { rejectValue: ApiError }
>('posts/fetchNextPage', async (url, { rejectWithValue }) => {
  try {
    const res = await postService.getPage(url)
    return { results: res.results, next: res.next }
  } catch (error) {
    return rejectWithValue(error as ApiError)
  }
})

export const createPost = createAsyncThunk<
  Post,
  CreatePostPayload,
  { rejectValue: ApiError }
>('posts/createPost', async (payload, { rejectWithValue }) => {
  try {
    return await postService.create(payload)
  } catch (error) {
    return rejectWithValue(error as ApiError)
  }
})

export const updatePost = createAsyncThunk<
  Post,
  { id: number; payload: UpdatePostPayload },
  { rejectValue: ApiError }
>('posts/updatePost', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await postService.update(id, payload)
  } catch (error) {
    return rejectWithValue(error as ApiError)
  }
})

export const deletePost = createAsyncThunk<
  number,
  Post,
  { rejectValue: ApiError }
>('posts/deletePost', async (post, { rejectWithValue }) => {
  try {
    await postService.delete(post.id)
    return post.id
  } catch (error) {
    return rejectWithValue(error as ApiError)
  }
})

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSortOrder: (state, { payload }: { payload: SortOrder }) => {
      state.sortOrder = payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, { payload }) => {
        state.status = 'succeeded'
        state.items = payload.results.sort(
          (a, b) =>
            new Date(b.created_datetime).getTime() -
            new Date(a.created_datetime).getTime()
        )
        state.pagination.next = payload.next
        state.pagination.hasMore = Boolean(payload.next)
        state.error = null
      })
      .addCase(fetchPosts.rejected, (state, { payload }) => {
        state.status = 'failed'
        state.error = payload?.message ?? 'Failed to load posts'
      })
      .addCase(createPost.pending, (state) => {
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, { payload }) => {
        state.items.unshift(payload)
        state.error = null
      })
      .addCase(createPost.rejected, (state, { payload }) => {
        state.error = payload?.message ?? 'Failed to create post'
      })
      .addCase(updatePost.pending, (state) => {
        state.error = null
      })
      .addCase(updatePost.fulfilled, (state, { payload }) => {
        const index = state.items.findIndex((p) => p.id === payload.id)
        if (index !== -1) state.items[index] = payload
        state.error = null
      })
      .addCase(updatePost.rejected, (state, { payload }) => {
        state.error = payload?.message ?? 'Failed to update post'
      })
      .addCase(deletePost.pending, (state, { meta }) => {
        const post = meta.arg
        state.optimisticDelete = post
        state.items = state.items.filter((p) => p.id !== post.id)
        state.error = null
      })
      .addCase(deletePost.fulfilled, (state) => {
        state.optimisticDelete = null
        state.error = null
      })
      .addCase(deletePost.rejected, (state, { payload, meta }) => {
        const post = meta.arg
        if (state.optimisticDelete?.id === post.id) {
          state.items.unshift(post)
          state.items.sort(
            (a, b) =>
              new Date(b.created_datetime).getTime() -
              new Date(a.created_datetime).getTime()
          )
        }
        state.optimisticDelete = null
        state.error = payload?.message ?? 'Failed to delete post'
      })
      .addCase(fetchNextPage.pending, (state) => {
        state.pagination.hasMore = false
      })
      .addCase(fetchNextPage.fulfilled, (state, { payload }) => {
        const sorted = payload.results.sort(
          (a, b) =>
            new Date(b.created_datetime).getTime() -
            new Date(a.created_datetime).getTime()
        )
        const ids = new Set(state.items.map((p) => p.id))
        const newItems = sorted.filter((p) => !ids.has(p.id))
        state.items.push(...newItems)
        state.items.sort(
          (a, b) =>
            new Date(b.created_datetime).getTime() -
            new Date(a.created_datetime).getTime()
        )
        state.pagination.next = payload.next
        state.pagination.hasMore = Boolean(payload.next)
      })
      .addCase(fetchNextPage.rejected, (state, { payload }) => {
        state.pagination.hasMore = Boolean(state.pagination.next)
        state.error = payload?.message ?? 'Failed to load more posts'
      })
  },
})

export const { clearError, setSortOrder } = postSlice.actions
export const postReducer = postSlice.reducer
