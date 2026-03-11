import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store/hooks'
import { Header } from './components/layout'
import { AuthInitializer } from './features/auth/AuthInitializer'

const LoginModal = lazy(() =>
  import('./features/auth').then((m) => ({ default: m.LoginModal }))
)

const MainFeed = lazy(() =>
  import('./features/posts').then((m) => ({ default: m.MainFeed }))
)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user)
  const initialized = useAppSelector((state) => state.auth.initialized)
  if (!initialized) return null
  if (user === null) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user)
  const initialized = useAppSelector((state) => state.auth.initialized)
  if (!initialized) return null
  if (user !== null) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 animate-pulse bg-primary/20 sm:h-20" />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:p-6">
        <div className="space-y-6">
          <div className="animate-pulse rounded-2xl border border-border-dark bg-background-card p-6">
            <div className="mb-4 h-8 w-2/3 rounded bg-muted/30" />
            <div className="mb-2 h-5 w-full rounded bg-muted/30" />
            <div className="mb-2 h-5 w-full rounded bg-muted/30" />
            <div className="h-24 w-3/4 rounded bg-muted/30" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-border-dark bg-background-card"
            >
              <div className="flex min-h-[70px] items-center px-6 py-5">
                <div className="h-8 w-1/2 rounded bg-primary/20" />
              </div>
              <div className="min-h-[120px] space-y-2 px-6 py-4">
                <div className="flex justify-between">
                  <div className="h-5 w-24 rounded bg-muted/30" />
                  <div className="h-5 w-28 rounded bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-full rounded bg-muted/30" />
                  <div className="h-5 w-3/4 rounded bg-muted/30" />
                  <div className="h-5 w-2/3 rounded bg-muted/30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthInitializer>
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
    </AuthInitializer>
  )
}

export default App
