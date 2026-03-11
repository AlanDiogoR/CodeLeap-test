import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from './store'
import { logout, setLocalUser } from './features/auth/authSlice'
import App from './App'

vi.mock('./services/firebase', () => ({ auth: null }))
vi.mock('./features/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./features/auth')>()
  return {
    ...actual,
    LoginModal: () => <h1>Welcome to CodeLeap Network</h1>,
  }
})
vi.mock('./features/posts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./features/posts')>()
  return {
    ...actual,
    MainFeed: () => <h2>What&apos;s on your mind?</h2>,
  }
})
vi.mock('./repositories', () => ({
  getPostRepository: () => ({
    getAll: vi.fn().mockResolvedValue({ results: [], next: null }),
    getNextPage: vi.fn().mockResolvedValue({ results: [], next: null }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }),
}))

beforeEach(() => {
  window.history.pushState({}, '', '/')
  store.dispatch(logout())
})

describe('App', () => {
  it('shows LoginModal when user is null', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    expect(
      await screen.findByRole('heading', { name: /welcome to codeleap network/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /logout/i })
    ).not.toBeInTheDocument()
  })

  it('shows protected app shell when user exists', async () => {
    store.dispatch(setLocalUser({ displayName: 'john' }))
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    expect(
      screen.queryByRole('heading', { name: /welcome to codeleap network/i })
    ).not.toBeInTheDocument()
    expect(await screen.findByRole('main')).toBeInTheDocument()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})
