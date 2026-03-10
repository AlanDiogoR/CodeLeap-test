import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { setUsername } from './authSlice'
import { Button, Input, Modal } from '../../components/ui'
import {
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX,
  SANITIZE_REGEX,
} from '../../constants/validation'

export function LoginModal() {
  const [username, setUsernameInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const submitLockRef = useRef(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const trimmed = username.trim()
  const isUsernameValid =
    trimmed.length > 0 &&
    trimmed.length <= USERNAME_MAX_LENGTH &&
    USERNAME_REGEX.test(trimmed)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isUsernameValid || submitLockRef.current) return
    const sanitized = trimmed.replace(SANITIZE_REGEX, '')
    if (sanitized.length === 0) {
      setError('Invalid characters in username')
      return
    }
    submitLockRef.current = true
    dispatch(setUsername(sanitized))
    submitLockRef.current = false
    navigate('/')
  }

  return (
    <Modal open closable={false} title="Welcome to CodeLeap network!">
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
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
    </Modal>
  )
}
