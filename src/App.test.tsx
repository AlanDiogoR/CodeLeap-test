import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from './store'
import { logout, setLocalUser } from './features/auth'
import App from './App'

vi.mock('./services/firebase', () => ({ auth: null }))

beforeEach(() => {
  store.dispatch(logout())
})

describe('App', () => {
  it('shows LoginModal when user is null', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    expect(
      screen.getByRole('heading', { name: /welcome to codeleap network/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /logout/i })
    ).not.toBeInTheDocument()
  })

  it('shows Header and feed when user exists', () => {
    store.dispatch(setLocalUser({ displayName: 'john' }))
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    expect(
      screen.getByRole('heading', { name: /codeleap network/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /what's on your mind/i })
    ).toBeInTheDocument()
  })
})
