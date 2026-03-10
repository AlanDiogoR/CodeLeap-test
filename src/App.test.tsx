import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from './store'
import { logout, setUsername } from './features/auth'
import App from './App'

beforeEach(() => {
  store.dispatch(logout())
})

describe('App', () => {
  it('shows LoginModal when username is null', () => {
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

  it('shows Header and feed when username exists', () => {
    store.dispatch(setUsername('john'))
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    expect(
      screen.getByRole('heading', { name: /codeleap network/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/feed de posts/i)).toBeInTheDocument()
  })
})
