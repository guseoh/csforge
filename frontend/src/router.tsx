import { Link, Outlet, createRootRoute, createRoute, createRouter, lazyRouteComponent } from '@tanstack/react-router'
import { SearchPalette } from './components/SearchPalette'
import { parseLearningSearch } from './lib/learning-search'
import { parseQuizSearch } from './lib/quiz-search'
import { parseWrongNoteSearch } from './lib/wrong-note-search'
import { parseReviewSearch } from './lib/review-search'
import { parseSearchSearch } from './lib/search-search'

const AreaPage = lazyRouteComponent(() => import('./pages/AreaPage'), 'AreaPage')
const ConceptPage = lazyRouteComponent(() => import('./pages/ConceptPage'), 'ConceptPage')
const LearningPage = lazyRouteComponent(() => import('./pages/LearningPage'), 'LearningPage')
const QuizResultPage = lazyRouteComponent(() => import('./pages/QuizResultPage'), 'QuizResultPage')
const QuizSessionPage = lazyRouteComponent(() => import('./pages/QuizSessionPage'), 'QuizSessionPage')
const QuizSetupPage = lazyRouteComponent(() => import('./pages/QuizSetupPage'), 'QuizSetupPage')
const WrongNotesPage = lazyRouteComponent(() => import('./pages/WrongNotesPage'), 'WrongNotesPage')
const WrongNoteDetailPage = lazyRouteComponent(() => import('./pages/WrongNoteDetailPage'), 'WrongNoteDetailPage')
const ReviewPage = lazyRouteComponent(() => import('./pages/ReviewPage'), 'ReviewPage')
const ImportPage = lazyRouteComponent(() => import('./pages/ImportPage'), 'ImportPage')
const SearchPage = lazyRouteComponent(() => import('./pages/SearchPage'), 'SearchPage')
const DashboardPage = lazyRouteComponent(() => import('./pages/DashboardPage'), 'DashboardPage')

const navigation = [
  { to: '/', label: 'Dashboard' },
  { to: '/learning', label: 'Learning' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/wrong-notes', label: 'Wrong Notes' },
  { to: '/review', label: 'Review' },
  { to: '/search', label: 'Search' },
  { to: '/settings/import', label: 'Import' },
] as const

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">CSForge</Link>
        <div className="topbar-actions">
          <SearchPalette />
          <span className="environment-badge">LOCAL</span>
        </div>
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
                activeOptions={{ exact: item.to === '/' }}
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
const wrongNotesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wrong-notes', validateSearch: (search) => parseWrongNoteSearch(search), component: WrongNotesPage })
const wrongNoteDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wrong-notes/$questionId', component: WrongNoteDetailPage })
const reviewRoute = createRoute({ getParentRoute: () => rootRoute, path: '/review', validateSearch: (search) => parseReviewSearch(search), component: ReviewPage })
const searchRoute = createRoute({ getParentRoute: () => rootRoute, path: '/search', validateSearch: (search) => parseSearchSearch(search), component: SearchPage })
const importRoute = createRoute({ getParentRoute: () => rootRoute, path: '/settings/import', component: ImportPage })

const routeTree = rootRoute.addChildren([
  indexRoute,
  learningRoute,
  areaRoute,
  conceptRoute,
  quizRoute,
  quizSessionRoute,
  quizResultRoute,
  wrongNotesRoute,
  wrongNoteDetailRoute,
  reviewRoute,
  searchRoute,
  importRoute,
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
