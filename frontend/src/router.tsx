import { Link, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'

const navigation = [
  { to: '/', label: 'Dashboard' },
  { to: '/learning', label: 'Learning' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/wrong-notes', label: 'Wrong Notes' },
  { to: '/review', label: 'Review' },
  { to: '/search', label: 'Search' },
] as const

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          CSForge
        </Link>
        <span className="environment-badge">LOCAL</span>
      </header>
      <div className="content-layout">
        <aside className="sidebar" aria-label="Primary navigation">
          <p className="eyebrow">Study workspace</p>
          <nav>
            {navigation.map((item) => (
              <Link
                key={item.to}
                className="nav-link"
                activeProps={{ className: 'nav-link active' }}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function DashboardPage() {
  return (
    <section className="page-card">
      <p className="eyebrow">Welcome to your local workspace</p>
      <h1>Build your CS learning loop.</h1>
      <p className="lead">
        The development skeleton is ready. Learning content, quizzes, review, and search will arrive in later tasks.
      </p>
      <div className="status-grid">
        <div className="status-card">
          <span className="status-label">Backend</span>
          <strong>Ready for setup</strong>
        </div>
        <div className="status-card">
          <span className="status-label">Content</span>
          <strong>Nothing imported yet</strong>
        </div>
      </div>
    </section>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page-card">
      <p className="eyebrow">Coming in a later task</p>
      <h1>{title}</h1>
      <p className="lead">This navigation entry is reserved for the CSForge learning flow.</p>
    </section>
  )
}

function LearningPage() {
  return <PlaceholderPage title="Learning" />
}

function QuizPage() {
  return <PlaceholderPage title="Quiz" />
}

function WrongNotesPage() {
  return <PlaceholderPage title="Wrong Notes" />
}

function ReviewPage() {
  return <PlaceholderPage title="Review" />
}

function SearchPage() {
  return <PlaceholderPage title="Search" />
}

function LoadingPage() {
  return <p className="route-message">Loading workspace…</p>
}

function RouteErrorPage() {
  return <p className="route-message error">Something went wrong while loading this page.</p>
}

function NotFoundPage() {
  return <p className="route-message">This page does not exist.</p>
}

const rootRoute = createRootRoute({
  component: AppLayout,
  pendingComponent: LoadingPage,
  errorComponent: RouteErrorPage,
  notFoundComponent: NotFoundPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const learningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learning',
  component: LearningPage,
})

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quiz',
  component: QuizPage,
})

const wrongNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wrong-notes',
  component: WrongNotesPage,
})

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
})

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  learningRoute,
  quizRoute,
  wrongNotesRoute,
  reviewRoute,
  searchRoute,
])

export const router = createRouter({
  routeTree,
  defaultPendingComponent: LoadingPage,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
