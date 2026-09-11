import { Link, Outlet, createRootRoute, createRoute, createRouter, lazyRouteComponent } from '@tanstack/react-router'
import { SearchPalette } from './components/SearchPalette'
import { defaultLearningSearch, parseLearningSearch } from './lib/learning-search'
import { defaultQuizSearch, parseQuizSearch } from './lib/quiz-search'
import { defaultWrongNoteSearch, parseWrongNoteSearch } from './lib/wrong-note-search'
import { parseReviewSearch } from './lib/review-search'
import { defaultSearchSearch, parseSearchSearch } from './lib/search-search'

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

const headerNavigation = [
  { to: '/learning', label: '학습', search: defaultLearningSearch },
  { to: '/quiz', label: '문제', search: defaultQuizSearch },
  { to: '/wrong-notes', label: '오답 노트', search: defaultWrongNoteSearch },
  { to: '/review', label: '복습', search: { page: 0, due: 'ALL' } },
  { to: '/search', label: '검색', search: defaultSearchSearch },
] as const

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">CF</span><span>CSForge</span></Link>
          <nav className="topbar-nav" aria-label="주요 학습 메뉴">
            {headerNavigation.map((item) => (
              <Link
                key={item.to}
                className="topbar-nav-link"
                activeProps={{ className: 'topbar-nav-link active' }}
                to={item.to}
                search={item.search}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar-actions">
            <SearchPalette />
            <span className="environment-badge">LOCAL</span>
          </div>
        </div>
      </header>
      <div className="content-layout">
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
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
