import { type ReactElement } from 'react'
import { useAppSelector } from './store/hooks'
import { LoginModal } from './features/auth'
import { Header } from './components/layout'

function App(): ReactElement {
  const username = useAppSelector((state) => state.auth.username)

  if (username === null) {
    return (
      <div className="min-h-screen bg-background">
        <LoginModal />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-border-dark bg-background-card p-6">
          <p className="text-muted">Feed de posts (em breve)</p>
        </div>
      </main>
    </div>
  )
}

export default App
