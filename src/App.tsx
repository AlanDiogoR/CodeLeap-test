import { type ReactElement } from 'react'
import { useAppSelector } from './store/hooks'
import { LoginModal } from './features/auth'
import { Header } from './components/layout'
import { MainFeed } from './features/posts'

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
      <main className="mx-auto max-w-3xl px-4 py-6 sm:p-6">
        <MainFeed />
      </main>
    </div>
  )
}

export default App
