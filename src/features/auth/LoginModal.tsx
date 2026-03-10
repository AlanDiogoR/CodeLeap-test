import { useState, type FormEvent } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { setUsername } from './authSlice'
import { Button, Input, Modal } from '../../components/ui'

export function LoginModal() {
  const [username, setUsernameInput] = useState('')
  const dispatch = useAppDispatch()

  const isUsernameValid = username.trim().length > 0

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isUsernameValid) return
    dispatch(setUsername(username.trim()))
  }

  return (
    <Modal open closable={false} title="Welcome to CodeLeap network!">
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <Input
          label="Please enter your username"
          placeholder="John doe"
          value={username}
          onChange={(e) => setUsernameInput(e.target.value)}
          autoComplete="username"
          autoFocus
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
