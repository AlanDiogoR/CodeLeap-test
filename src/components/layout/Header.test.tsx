import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '../../store'
import { setUsername } from '../../features/auth'
import { Header } from './Header'

function renderWithRouter() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </Provider>
  )
}

describe('Header', () => {
  it('renders title and Logout button', () => {
    store.dispatch(setUsername('john'))
    renderWithRouter()
    expect(
      screen.getByRole('heading', { name: /codeleap network/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('dispatches logout when Logout is clicked', async () => {
    store.dispatch(setUsername('john'))
    const user = userEvent.setup()
    renderWithRouter()
    await user.click(screen.getByRole('button', { name: /logout/i }))
    await user.click(screen.getByRole('button', { name: /confirm logout/i }))
    expect(store.getState().auth.username).toBeNull()
  })
})
