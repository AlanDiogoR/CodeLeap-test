import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '../../store'
import { logout } from './authSlice'
import { LoginModal } from './LoginModal'

function renderWithStore() {
  return render(
    <Provider store={store}>
      <LoginModal />
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

  it('dispatches setUsername on ENTER when input has content', async () => {
    const user = userEvent.setup()
    renderWithStore()
    await user.type(
      screen.getByRole('textbox', { name: /please enter your username/i }),
      'john'
    )
    await user.click(screen.getByRole('button', { name: /enter/i }))
    expect(store.getState().auth.username).toBe('john')
  })
})
