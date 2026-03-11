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
    render(<PostItem post={mockPost} currentUser={{ uid: 'local', displayName:"other" }} />)
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
        currentUser={{ uid: 'local', displayName:"john" }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/delete post/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/edit post/i)).toBeInTheDocument()
  })

  it('hides edit and delete when currentUsername differs', () => {
    render(<PostItem post={mockPost} currentUser={{ uid: 'local', displayName:"other" }} />)
    expect(screen.queryByLabelText(/delete post/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/edit post/i)).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(
      <PostItem post={mockPost} currentUser={{ uid: 'local', displayName:"john" }} onDelete={onDelete} />
    )
    await user.click(screen.getByLabelText(/delete post/i))
    expect(onDelete).toHaveBeenCalledWith(mockPost)
  })

  it('shows comment button with count', () => {
    render(<PostItem post={mockPost} currentUser={{ uid: 'local', displayName:"other" }} />)
    const commentBtn = screen.getByLabelText(/show comments/i)
    expect(commentBtn).toBeInTheDocument()
    expect(commentBtn).toHaveTextContent('0')
  })
})
