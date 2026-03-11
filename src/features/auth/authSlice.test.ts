import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authReducer, setLocalUser, logout } from './authSlice'

vi.mock('../../services/firebase', () => ({ auth: null }))

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

  it('sets initial state with null user when localStorage is empty', () => {
    const state = authReducer(undefined, { type: 'unknown' })
    expect(state.user).toBeNull()
    expect(state.initialized).toBe(true)
  })

  it('setLocalUser updates state and persists to localStorage', () => {
    const state = authReducer(undefined, setLocalUser({ displayName: 'john' }))
    expect(state.user).toEqual({
      uid: 'local',
      displayName: 'john',
      photoURL: null,
      email: null,
    })
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'codeleap_local_user',
      expect.any(String)
    )
  })

  it('logout clears user', () => {
    const stateWithUser = authReducer(
      undefined,
      setLocalUser({ displayName: 'john' })
    )
    const state = authReducer(stateWithUser, logout())
    expect(state.user).toBeNull()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'codeleap_local_user'
    )
  })
})
