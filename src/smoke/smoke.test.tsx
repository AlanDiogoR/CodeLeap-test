/**
 * Smoke test suite – critical user flows
 * Covers: Auth, CRUD (owner), Likes, Comments, Infinite Scroll
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '../store'
import { logout, setLocalUser } from '../features/auth'
import App from '../App'
import { MainFeed } from '../features/posts'

const mockRepo = {
  getAll: vi.fn(),
  getNextPage: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

vi.mock('../repositories', () => ({ getPostRepository: () => mockRepo }))
vi.mock('../services/firebase', () => ({ auth: null }))

beforeEach(() => {
  store.dispatch(logout())
  vi.clearAllMocks()
  mockRepo.getAll.mockResolvedValue({ results: [], next: null })
})

describe('Smoke: Auth', () => {
  it('shows login when unauthenticated', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /welcome to codeleap network/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('textbox', { name: /please enter your username/i })
      ).toBeInTheDocument()
    })
  })

  it('redirects to feed after login', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    await user.type(
      screen.getByRole('textbox', { name: /please enter your username/i }),
      'john'
    )
    await user.click(screen.getByRole('button', { name: /enter/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /codeleap network/i })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('heading', { name: /what's on your mind/i })
    ).toBeInTheDocument()
  })
})

describe('Smoke: CRUD (owner)', () => {
  beforeEach(() => {
    store.dispatch(setLocalUser({ displayName: 'john' }))
    mockRepo.create.mockResolvedValue({
      id: 1,
      username: 'john',
      created_datetime: new Date().toISOString(),
      title: 'My Post',
      content: 'Post content',
    })
    mockRepo.update.mockResolvedValue({
      id: 1,
      username: 'john',
      created_datetime: new Date().toISOString(),
      title: 'Updated Title',
      content: 'Updated content',
    })
  })

  it('creates post and shows in feed', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={store}>
        <MainFeed />
      </Provider>
    )

    await waitFor(() => expect(mockRepo.getAll).toHaveBeenCalled())

    await user.type(screen.getByRole('textbox', { name: /^title$/i }), 'My Post')
    await user.type(
      screen.getByRole('textbox', { name: /^content$/i }),
      'Post content'
    )
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(mockRepo.create).toHaveBeenCalled())
    expect(store.getState().posts.items).toContainEqual(
      expect.objectContaining({ title: 'My Post', content: 'Post content' })
    )
  })

  it('owner sees edit and delete buttons', async () => {
    mockRepo.getAll.mockResolvedValue({
      results: [
        {
          id: 1,
          username: 'john',
          created_datetime: new Date().toISOString(),
          title: 'My Post',
          content: 'Content',
        },
      ],
      next: null,
    })

    render(
      <Provider store={store}>
        <MainFeed />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/edit post my post/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/delete post my post/i)).toBeInTheDocument()
    })
  })

  it('edit post updates state', async () => {
    const user = userEvent.setup()
    mockRepo.getAll.mockResolvedValue({
      results: [
        {
          id: 1,
          username: 'john',
          created_datetime: new Date().toISOString(),
          title: 'Original',
          content: 'Content',
        },
      ],
      next: null,
    })
    mockRepo.update.mockResolvedValue({
      id: 1,
      username: 'john',
      created_datetime: new Date().toISOString(),
      title: 'Updated Title',
      content: 'Updated content',
    })

    render(
      <Provider store={store}>
        <MainFeed />
      </Provider>
    )

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /original/i })).toBeInTheDocument()
    )

    await user.click(screen.getByLabelText(/edit post original/i))

    const titleInput = await screen.findByDisplayValue('Original')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() =>
      expect(mockRepo.update).toHaveBeenCalledWith(1, expect.any(Object))
    )
    const updatedPost = store.getState().posts.items.find((p) => p.id === 1)
    expect(updatedPost?.title).toBe('Updated Title')
  })
})

describe('Smoke: Likes', () => {
  it('like button toggles state', async () => {
    const user = userEvent.setup()
    store.dispatch(setLocalUser({ displayName: 'john' }))
    mockRepo.getAll.mockResolvedValue({
      results: [
        {
          id: 1,
          username: 'john',
          created_datetime: new Date().toISOString(),
          title: 'Post',
          content: 'Content',
        },
      ],
      next: null,
    })

    render(
      <Provider store={store}>
        <MainFeed />
      </Provider>
    )

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /^post$/i })).toBeInTheDocument()
    )

    const likeBtn = screen.getByLabelText(/like post/i)
    await user.click(likeBtn)

    await waitFor(() => {
      expect(screen.getByLabelText(/unlike post/i)).toBeInTheDocument()
    })
  })
})

describe('Smoke: Comments', () => {
  it('adds comment and shows in list', async () => {
    const user = userEvent.setup()
    store.dispatch(setLocalUser({ displayName: 'john' }))
    mockRepo.getAll.mockResolvedValue({
      results: [
        {
          id: 1,
          username: 'john',
          created_datetime: new Date().toISOString(),
          title: 'Post',
          content: 'Content',
        },
      ],
      next: null,
    })

    render(
      <Provider store={store}>
        <MainFeed />
      </Provider>
    )

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /^post$/i })).toBeInTheDocument()
    )

    await user.click(screen.getByLabelText(/show comments/i))
    const commentInput = screen.getByPlaceholderText(/write a comment/i)
    await user.type(commentInput, 'My first comment')
    await user.click(screen.getByRole('button', { name: /^post$/i }))

    await waitFor(() => {
      expect(screen.getByText(/my first comment/i)).toBeInTheDocument()
      const commentItem = screen.getByText(/my first comment/i).closest('li')
      expect(commentItem).not.toBeNull()
      expect(
        within(commentItem as HTMLElement).getByText(/^@john$/i)
      ).toBeInTheDocument()
    })
  })
})

describe('Smoke: Infinite Scroll', () => {
  it('shows hasMore and sentinel when pagination returns next cursor', async () => {
    store.dispatch(setLocalUser({ displayName: 'john' }))
    mockRepo.getAll.mockResolvedValue({
      results: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        username: 'john',
        created_datetime: new Date().toISOString(),
        title: `Post ${i + 1}`,
        content: `Content ${i + 1}`,
      })),
      next: 'cursor-page-2',
    })

    render(
      <Provider store={store}>
        <MainFeed />
      </Provider>
    )

    await waitFor(() => expect(mockRepo.getAll).toHaveBeenCalled())
    expect(store.getState().posts.pagination.hasMore).toBe(true)
    expect(store.getState().posts.pagination.next).toBe('cursor-page-2')

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^post 1$/i })
      ).toBeInTheDocument()
    })
  })

})
