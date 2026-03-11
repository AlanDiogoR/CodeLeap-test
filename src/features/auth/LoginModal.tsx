import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
} from 'firebase/auth'
import { useAppDispatch } from '../../store/hooks'
import { setUser, setLocalUser } from './authSlice'
import { auth } from '../../services/firebase'

const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'rest'
import { Button, Input, Modal } from '../../components/ui'
import {
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX,
  SANITIZE_REGEX,
} from '../../constants/validation'

export function LoginModal() {
  const [username, setUsernameInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [useUsernameFallback, setUseUsernameFallback] = useState(false)
  const submitLockRef = useRef(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const trimmed = username.trim()
  const isUsernameValid =
    trimmed.length > 0 &&
    trimmed.length <= USERNAME_MAX_LENGTH &&
    USERNAME_REGEX.test(trimmed)

  const useFirebaseAuth = Boolean(auth) && !useUsernameFallback

  async function handleGoogleSignIn() {
    if (!auth || googleLoading) return
    setError(null)
    setGoogleLoading(true)
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider())
      const u = credential.user
      dispatch(
        setUser({
          uid: u.uid,
          displayName: u.displayName ?? u.email ?? 'User',
          photoURL: u.photoURL ?? null,
          email: u.email ?? null,
        })
      )
      navigate('/')
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      const isConfigError =
        code === 'auth/configuration-not-found' ||
        code === 'auth/invalid-api-key' ||
        code === 'auth/operation-not-allowed'
      if (isConfigError) {
        setError(
          'Google Sign-in is not configured in Firebase. Use username login below.'
        )
        setUseUsernameFallback(true)
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to sign in with Google'
        )
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isUsernameValid || submitLockRef.current) return
    const sanitized = trimmed.replace(SANITIZE_REGEX, '')
    if (sanitized.length === 0) {
      setError('Invalid characters in username')
      return
    }
    submitLockRef.current = true
    if (DATA_SOURCE === 'firebase' && useUsernameFallback && auth) {
      try {
        const credential = await signInAnonymously(auth)
        dispatch(
          setUser({
            uid: credential.user.uid,
            displayName: sanitized,
            photoURL: null,
            email: null,
          })
        )
        navigate('/')
      } catch {
        setError('Unable to sign in. Enable Anonymous auth in Firebase Console.')
      } finally {
        submitLockRef.current = false
      }
      return
    }
    if (auth) {
      dispatch(
        setUser({
          uid: 'local',
          displayName: sanitized,
          photoURL: null,
          email: null,
        })
      )
    } else {
      dispatch(setLocalUser({ displayName: sanitized }))
    }
    navigate('/')
    submitLockRef.current = false
  }

  return (
    <Modal open closable={false} title="Welcome to CodeLeap network!">
      <div className="mt-4 flex flex-col gap-4">
        {useFirebaseAuth ? (
          <>
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}
          </>
        ) : (
          <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4">
            <Input
              label="Please enter your username"
              placeholder="John doe"
              value={username}
              onChange={(e) => {
                setUsernameInput(e.target.value)
                setError(null)
              }}
              maxLength={USERNAME_MAX_LENGTH}
              autoComplete="username"
              autoFocus
              error={error ?? undefined}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!isUsernameValid}>
                ENTER
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
