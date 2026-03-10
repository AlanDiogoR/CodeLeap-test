import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostItem } from './PostItem'

const mockPost = {
  id: 1,
  username: 'john',
  created_datetime: '2025-01-01T12:00:00Z',
  title: 'Test Post',
  content: 'Line 1\nLine 2',
}

describe('PostItem', () => {
  it('renders post title and content', () => {
    render(<PostItem post={mockPost} currentUsername="other" />)
    expect(
      screen.getByRole('heading', { name: 'Test Post' })
    ).toBeInTheDocument()
    expect(screen.getByText(/@john/)).toBeInTheDocument()
    expect(screen.getByText(/Line 1/)).toBeInTheDocument()
    expect(screen.getByText(/Line 2/)).toBeInTheDocument()
  })

  it('shows edit and delete buttons when currentUsername matches', () => {
    render(
      <PostItem
        post={mockPost}
        currentUsername="john"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/excluir post/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/editar post/i)).toBeInTheDocument()
  })

  it('hides edit and delete when currentUsername differs', () => {
    render(<PostItem post={mockPost} currentUsername="other" />)
    expect(screen.queryByLabelText(/excluir post/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/editar post/i)).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(
      <PostItem post={mockPost} currentUsername="john" onDelete={onDelete} />
    )
    await user.click(screen.getByLabelText(/excluir post/i))
    expect(onDelete).toHaveBeenCalledWith(mockPost)
  })
})
