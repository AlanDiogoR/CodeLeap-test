import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../features/auth'
import { auth } from '../../services/firebase'
import { Button } from '../ui'

export function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        showLogoutConfirm &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowLogoutConfirm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLogoutConfirm])

  async function handleLogout() {
    if (auth) {
      try {
        await signOut(auth)
      } catch {
        // fallback: clear state anyway
      }
    }
    dispatch(logout())
    setShowLogoutConfirm(false)
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between bg-primary/95 px-4 backdrop-blur-md sm:h-20 sm:px-6">
      <h1 className="text-xl font-bold text-inverse sm:text-2xl">
        CodeLeap Network
      </h1>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
        >
          Logout
        </Button>
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 flex w-40 flex-col gap-2 rounded-lg bg-background-card p-2 shadow-xl"
            >
              <p className="px-2 py-1 text-sm text-muted">
                Leave session?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-lg px-2 py-1 text-sm font-medium text-muted transition-colors hover:bg-muted/20"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-lg bg-danger px-2 py-1 text-sm font-medium text-inverse transition-transform hover:scale-105"
                  aria-label="Confirm logout"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
