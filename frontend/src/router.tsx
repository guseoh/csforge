import { Link, Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AreaPage } from './pages/AreaPage'
import { ConceptPage } from './pages/ConceptPage'
import { LearningPage } from './pages/LearningPage'
import { parseLearningSearch } from './lib/learning-search'
import { parseQuizSearch } from './lib/quiz-search'
import { QuizResultPage } from './pages/QuizResultPage'
import { QuizSessionPage } from './pages/QuizSessionPage'
import { QuizSetupPage } from './pages/QuizSetupPage'

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
        <Link className="brand" to="/">CSForge</Link>
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
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  )
}

function DashboardPage() {
  return (
    <section className="page-card">
      <p className="eyebrow">Welcome to your local workspace</p>
      <h1>Build your CS learning loop.</h1>
      <p className="lead">Learning data is now available from the Learning navigation. Other study flows arrive in later slices.</p>
    </section>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page-card">
      <p className="eyebrow">Coming in a later slice</p>
      <h1>{title}</h1>
      <p className="lead">This navigation entry is reserved for a future CSForge learning flow.</p>
    </section>
  )
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

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: DashboardPage })

const learningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learning',
  validateSearch: (search) => parseLearningSearch(search),
  component: LearningPage,
})

const areaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learning/$areaSlug',
  validateSearch: (search) => parseLearningSearch(search),
  component: AreaPage,
})

const conceptRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/concepts/$conceptId',
  component: ConceptPage,
})

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quiz',
  validateSearch: (search) => parseQuizSearch(search),
  component: QuizSetupPage,
})
const quizSessionRoute = createRoute({ getParentRoute: () => rootRoute, path: '/quiz/$quizId', component: QuizSessionPage })
const quizResultRoute = createRoute({ getParentRoute: () => rootRoute, path: '/quiz/$quizId/result', component: QuizResultPage })
const wrongNotesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wrong-notes', component: () => <PlaceholderPage title="Wrong Notes" /> })
const reviewRoute = createRoute({ getParentRoute: () => rootRoute, path: '/review', component: () => <PlaceholderPage title="Review" /> })
const searchRoute = createRoute({ getParentRoute: () => rootRoute, path: '/search', component: () => <PlaceholderPage title="Search" /> })

const routeTree = rootRoute.addChildren([
  indexRoute,
  learningRoute,
  areaRoute,
  conceptRoute,
  quizRoute,
  quizSessionRoute,
  quizResultRoute,
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
