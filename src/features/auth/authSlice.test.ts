import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authReducer, setUsername, logout } from './authSlice'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

vi.stubGlobal('localStorage', mockLocalStorage)

describe('authSlice', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  it('sets initial state with null username when localStorage is empty', () => {
    const state = authReducer(undefined, { type: 'unknown' })
    expect(state.username).toBeNull()
  })

  it('setUsername updates state and persists to localStorage', () => {
    const state = authReducer(undefined, setUsername('john'))
    expect(state.username).toBe('john')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'codeleap_username',
      'john'
    )
  })

  it('logout clears username', () => {
    const stateWithUser = authReducer(undefined, setUsername('john'))
    const state = authReducer(stateWithUser, logout())
    expect(state.username).toBeNull()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'codeleap_username'
    )
  })
})
