import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../features/auth'
import { Button } from '../ui'

export function Header() {
  const dispatch = useAppDispatch()

  function handleLogout() {
    dispatch(logout())
  }

  return (
    <header className="flex h-20 items-center justify-between bg-primary px-6">
      <h1 className="text-2xl font-bold text-inverse">CodeLeap Network</h1>
      <Button variant="ghost" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  )
}
