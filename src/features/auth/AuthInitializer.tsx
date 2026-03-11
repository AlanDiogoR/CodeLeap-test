import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useAppDispatch } from '../../store/hooks'
import { setUser, setAuthInitialized } from './authSlice'
import { auth } from '../../services/firebase'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!auth) {
      dispatch(setAuthInitialized(true))
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName ?? firebaseUser.email ?? 'User',
            photoURL: firebaseUser.photoURL ?? null,
            email: firebaseUser.email ?? null,
          })
        )
      } else {
        dispatch(setUser(null))
      }
      dispatch(setAuthInitialized(true))
    })

    return () => unsubscribe()
  }, [dispatch])

  return <>{children}</>
}
