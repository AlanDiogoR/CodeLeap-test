import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '../../../store'
import { logout, setLocalUser } from '../../auth'
import { MainFeed } from '../MainFeed'
import type { Post } from '../../../types/post'

const mockPostCreated: Post = {
  id: 1,
  username: 'john',
  created_datetime: '2025-01-01T12:00:00Z',
  title: 'Hello World',
  content: 'First post content',
}

const mockPostUpdated: Post = {
  ...mockPostCreated,
  title: 'Updated Title',
  content: 'Updated content',
}

const mockRepo = {
  getAll: vi.fn(),
  getNextPage: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

vi.mock('../../../repositories', () => ({
  getPostRepository: () => mockRepo,
}))

vi.mock('../../../services/firebase', () => ({ auth: null }))

describe('Post CRUD flow integration', () => {
  beforeEach(() => {
    store.dispatch(logout())
    vi.clearAllMocks()
    mockRepo.getAll.mockResolvedValue({ results: [], next: null })
    mockRepo.create.mockResolvedValue(mockPostCreated)
    mockRepo.update.mockResolvedValue(mockPostUpdated)
  })

  it('Login -> Create Post -> Edit Post -> State updated without refetch', async () => {
    store.dispatch(setLocalUser({ displayName: 'john' }))

    render(
      <Provider store={store}>
        <MainFeed />
      </Provider>
    )

    await waitFor(() => {
      expect(mockRepo.getAll).toHaveBeenCalled()
    })

    mockRepo.getAll.mockResolvedValueOnce({
      results: [mockPostCreated],
      next: null,
    })

    const titleInput = screen.getByRole('textbox', { name: /^title$/i })
    const contentInput = screen.getByRole('textbox', { name: /^content$/i })
    const createButton = screen.getByRole('button', { name: /create/i })

    await userEvent.type(titleInput, 'Hello World')
    await userEvent.type(contentInput, 'First post content')
    await userEvent.click(createButton)

    await waitFor(() => {
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'john',
          title: 'Hello World',
          content: 'First post content',
        })
      )
    })

    expect(store.getState().posts.items).toContainEqual(
      expect.objectContaining({
        id: 1,
        title: 'Hello World',
        content: 'First post content',
      })
    )

    const editButton = screen.getByLabelText(/edit post/i)
    await userEvent.click(editButton)

    const editTitleInput = await screen.findByDisplayValue('Hello World')
    const editContentInput = screen.getByDisplayValue('First post content')
    const saveButton = screen.getByRole('button', { name: /save/i })

    await userEvent.clear(editTitleInput)
    await userEvent.type(editTitleInput, 'Updated Title')
    await userEvent.clear(editContentInput)
    await userEvent.type(editContentInput, 'Updated content')
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Updated Title',
          content: 'Updated content',
        })
      )
    })

    expect(mockRepo.getAll).toHaveBeenCalledTimes(1)

    const updatedPost = store.getState().posts.items.find((p) => p.id === 1)
    expect(updatedPost?.title).toBe('Updated Title')
    expect(updatedPost?.content).toBe('Updated content')
  })
})
