import { createSlice } from '@reduxjs/toolkit'

const USERNAME_KEY = 'codeleap_username'

function loadUsername(): string | null {
  try {
    return localStorage.getItem(USERNAME_KEY)
  } catch {
    return null
  }
}

function saveUsername(username: string | null): void {
  try {
    if (username) {
      localStorage.setItem(USERNAME_KEY, username)
    } else {
      localStorage.removeItem(USERNAME_KEY)
    }
  } catch {
    // ignore
  }
}

interface AuthState {
  username: string | null
}

const initialState: AuthState = {
  username: loadUsername(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsername: (state, { payload }: { payload: string | null }) => {
      state.username = payload
      saveUsername(payload)
    },
    logout: (state) => {
      state.username = null
      saveUsername(null)
    },
  },
})

export const { setUsername, logout } = authSlice.actions
export const authReducer = authSlice.reducer
