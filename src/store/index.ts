import { configureStore } from '@reduxjs/toolkit'
import { postReducer } from '../features/posts/slice/postSlice'
import { authReducer } from '../features/auth'

export const store = configureStore({
  reducer: {
    posts: postReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
