import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store/hooks'
import { Header } from './components/layout'

const LoginModal = lazy(() =>
  import('./features/auth').then((m) => ({ default: m.LoginModal }))
)

const MainFeed = lazy(() =>
  import('./features/posts').then((m) => ({ default: m.MainFeed }))
)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const username = useAppSelector((state) => state.auth.username)
  if (username === null) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const username = useAppSelector((state) => state.auth.username)
  if (username !== null) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <span
        className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-label="Loading"
      />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div className="min-h-screen bg-background">
                  <LoginModal />
                </div>
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background">
                  <Header />
                  <main className="mx-auto max-w-3xl px-4 py-6 sm:p-6">
                    <MainFeed />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/feed" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
