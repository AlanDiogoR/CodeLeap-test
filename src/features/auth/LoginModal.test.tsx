import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '../../store'
import { logout } from './authSlice'
import { LoginModal } from './LoginModal'

vi.mock('../../services/firebase', () => ({ auth: null }))

function renderWithStore() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginModal />
      </MemoryRouter>
    </Provider>
  )
}

beforeEach(() => {
  store.dispatch(logout())
})

describe('LoginModal', () => {
  it('renders title and input', () => {
    renderWithStore()
    expect(
      screen.getByRole('heading', { name: /welcome to codeleap network/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /please enter your username/i })
    ).toBeInTheDocument()
  })

  it('ENTER button is disabled when input is empty', () => {
    renderWithStore()
    expect(screen.getByRole('button', { name: /enter/i })).toBeDisabled()
  })

  it('ENTER button is enabled when input has content', async () => {
    const user = userEvent.setup()
    renderWithStore()
    await user.type(
      screen.getByRole('textbox', { name: /please enter your username/i }),
      'john'
    )
    expect(screen.getByRole('button', { name: /enter/i })).toBeEnabled()
  })

  it('dispatches setLocalUser on ENTER when input has content', async () => {
    const user = userEvent.setup()
    renderWithStore()
    await user.type(
      screen.getByRole('textbox', { name: /please enter your username/i }),
      'john'
    )
    await user.click(screen.getByRole('button', { name: /enter/i }))
    expect(store.getState().auth.user?.displayName).toBe('john')
  })
})
