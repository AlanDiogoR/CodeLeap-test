import { createSlice } from '@reduxjs/toolkit'
import { auth } from '../../services/firebase'

export interface AuthUser {
  uid: string
  displayName: string
  photoURL: string | null
  email: string | null
}

const LOCAL_USER_KEY = 'codeleap_local_user'

function loadLocalUser(): AuthUser | null {
  if (auth) return null
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      'uid' in parsed &&
      typeof (parsed as AuthUser).uid === 'string' &&
      'displayName' in parsed &&
      typeof (parsed as AuthUser).displayName === 'string'
    ) {
      return parsed as AuthUser
    }
    return null
  } catch {
    return null
  }
}

function saveLocalUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(LOCAL_USER_KEY)
    }
  } catch {
    // ignore
  }
}

interface AuthState {
  user: AuthUser | null
  initialized: boolean
}

const initialState: AuthState = {
  user: auth ? null : loadLocalUser(),
  initialized: !auth,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, { payload }: { payload: AuthUser | null }) => {
      state.user = payload
      if (!auth && payload) saveLocalUser(payload)
      else if (!auth) saveLocalUser(null)
    },
    setLocalUser: (state, { payload }: { payload: { displayName: string } }) => {
      if (auth) return
      const user: AuthUser = {
        uid: 'local',
        displayName: payload.displayName,
        photoURL: null,
        email: null,
      }
      state.user = user
      saveLocalUser(user)
    },
    logout: (state) => {
      state.user = null
      if (!auth) saveLocalUser(null)
    },
    setAuthInitialized: (state, { payload }: { payload: boolean }) => {
      state.initialized = payload
    },
  },
})

export const { setUser, setLocalUser, logout, setAuthInitialized } =
  authSlice.actions
export const authReducer = authSlice.reducer
