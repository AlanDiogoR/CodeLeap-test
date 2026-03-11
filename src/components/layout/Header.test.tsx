import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '../../store'
import { setLocalUser } from '../../features/auth'
import { Header } from './Header'

vi.mock('../../services/firebase', () => ({ auth: null }))

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
    store.dispatch(setLocalUser({ displayName: 'john' }))
    renderWithRouter()
    expect(
      screen.getByRole('heading', { name: /codeleap network/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('dispatches logout when Logout is clicked', async () => {
    store.dispatch(setLocalUser({ displayName: 'john' }))
    const user = userEvent.setup()
    renderWithRouter()
    await user.click(screen.getByRole('button', { name: /logout/i }))
    await user.click(screen.getByRole('button', { name: /confirm logout/i }))
    expect(store.getState().auth.user).toBeNull()
  })
})
