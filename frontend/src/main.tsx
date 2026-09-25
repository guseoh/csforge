import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { ApiRequestError } from './lib/http'
import { ToastProvider } from './components/toast/ToastProvider'
import { ThemeProvider } from './components/ThemeProvider'
import './styles.css'
import './search.css'
import './dashboard.css'
import './learning.css'
import './concept.css'
import './quiz.css'
import './wrong-note.css'
import './review.css'
import './import.css'
import './learning-detail.css'
import './learning-workspace.css'
import './concept-reading-guide.css'
import './quiz-setup-guide.css'
import './quiz-session-focus.css'
import './daily-loop-guide.css'
import './search-guide.css'
import './learning-content.css'
import './auth.css'
import './ui-refresh.css'
import './foundation.css'
import './header-search.css'
import './home.css'
import './concept-reader.css'
import './density.css'
import './step5-corrections.css'
import './step6-learning-area.css'
import './step6-qa-corrections.css'
import './step7-quiz.css'
import './step7-result-width.css'
import './step8-review.css'
import './step8-wrong-note-alignment.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiRequestError && (error.status === 401 || error.status === 403)) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
