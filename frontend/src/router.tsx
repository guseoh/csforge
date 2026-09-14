import { Link, Outlet, createRootRoute, createRoute, createRouter, lazyRouteComponent, useLocation, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { SearchPalette } from './components/SearchPalette'
import { AuthGate } from './components/AuthGate'
import { getAuthSession, logout } from './lib/auth-api'
import { defaultLearningSearch, parseLearningSearch } from './lib/learning-search'
import { defaultQuizSearch, parseQuizSearch } from './lib/quiz-search'
import { defaultWrongNoteSearch, parseWrongNoteSearch } from './lib/wrong-note-search'
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
const LoginPage = lazyRouteComponent(() => import('./pages/LoginPage'), 'LoginPage')

const headerNavigation = [
  { to: '/learning', label: '학습', search: defaultLearningSearch },
  { to: '/quiz', label: '문제', search: defaultQuizSearch },
  { to: '/wrong-notes', label: '오답 노트', search: defaultWrongNoteSearch },
  { to: '/review', label: '복습', search: { page: 0, due: 'ALL' } },
] as const

function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  if (location.pathname === '/login') {
    return <main className="main-content"><Outlet /></main>
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">CF</span><span>CSForge</span></Link>
          <nav className={`topbar-nav${mobileNavOpen ? ' mobile-open' : ''}`} id="primary-navigation" aria-label="주요 학습 메뉴">
            {headerNavigation.map((item) => (
              <Link
                key={item.to}
                className="topbar-nav-link"
                activeProps={{ className: 'topbar-nav-link active' }}
                to={item.to}
                search={item.search}
                onClick={() => setMobileNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar-actions">
            <SearchPalette />
            <AuthActions />
            <button
              className="mobile-menu-toggle"
              type="button"
              aria-controls="primary-navigation"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? '주요 메뉴 닫기' : '주요 메뉴 열기'}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <span aria-hidden="true">{mobileNavOpen ? '×' : '☰'}</span>
            </button>
          </div>
        </div>
      </header>
      <div className="content-layout">
        <main className="main-content"><AuthGate><Outlet /></AuthGate></main>
      </div>
    </div>
  )
}

function AuthActions() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useQuery({ queryKey: ['auth-session'], queryFn: getAuthSession, retry: false })
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      void navigate({ to: '/login', replace: true })
    },
  })

  if (!session.data) return null
  if (session.data.mode !== 'CLOUD') return <span className="environment-badge">LOCAL</span>

  return (
    <>
      <span className="environment-badge">CLOUD</span>
      <span className="auth-email">{session.data.email}</span>
      <button
        className="text-button"
        type="button"
        disabled={logoutMutation.isPending}
        onClick={() => logoutMutation.mutate()}
      >
        로그아웃
      </button>
      {logoutMutation.isError && <span className="auth-error">로그아웃하지 못했습니다.</span>}
    </>
  )
}

function LoadingPage() {
  return <div className="route-state" role="status"><span className="route-state-mark" aria-hidden="true" />페이지를 불러오는 중입니다…</div>
}

function RouteErrorPage() {
  return <div className="route-state route-state-error" role="alert"><strong>페이지를 불러오지 못했습니다.</strong><button className="secondary-button" type="button" onClick={() => window.location.reload()}>다시 시도</button></div>
}

function NotFoundPage() {
  return <div className="route-state"><strong>요청한 페이지를 찾을 수 없습니다.</strong><Link className="secondary-button" to="/">대시보드로 이동</Link></div>
}

const rootRoute = createRootRoute({
  component: AppLayout,
  pendingComponent: LoadingPage,
  errorComponent: RouteErrorPage,
  notFoundComponent: NotFoundPage,
})

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: DashboardPage })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage })

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
  loginRoute,
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
