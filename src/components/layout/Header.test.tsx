import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '../../store'
import { setUsername } from '../../features/auth'
import { Header } from './Header'

describe('Header', () => {
  it('renders title and Logout button', () => {
    store.dispatch(setUsername('john'))
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    )
    expect(
      screen.getByRole('heading', { name: /codeleap network/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('dispatches logout when Logout is clicked', async () => {
    store.dispatch(setUsername('john'))
    const user = userEvent.setup()
    render(
      <Provider store={store}>
        <Header />
      </Provider>
    )
    await user.click(screen.getByRole('button', { name: /logout/i }))
    expect(store.getState().auth.username).toBeNull()
  })
})
