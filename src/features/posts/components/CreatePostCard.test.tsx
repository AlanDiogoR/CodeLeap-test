import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '../../../store'
import { setUsername } from '../../auth/authSlice'
import { CreatePostCard } from './CreatePostCard'

function renderWithStore() {
  return render(
    <Provider store={store}>
      <CreatePostCard />
    </Provider>
  )
}

describe('CreatePostCard', () => {
  beforeEach(() => {
    store.dispatch(setUsername('john'))
  })

  it('renders title and form fields', () => {
    renderWithStore()
    expect(
      screen.getByRole('heading', { name: /what's on your mind/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /^title$/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /^content$/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('Create button is disabled when fields are empty', () => {
    renderWithStore()
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('Create button is disabled when only title is filled', async () => {
    const user = userEvent.setup()
    renderWithStore()
    await user.type(screen.getByRole('textbox', { name: /^title$/i }), 'Hello')
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled()
  })

  it('Create button is enabled when both fields are filled', async () => {
    const user = userEvent.setup()
    renderWithStore()
    await user.type(screen.getByRole('textbox', { name: /^title$/i }), 'Hello')
    await user.type(
      screen.getByRole('textbox', { name: /^content$/i }),
      'World'
    )
    expect(screen.getByRole('button', { name: /create/i })).toBeEnabled()
  })
})
