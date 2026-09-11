import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { ToastProvider } from './components/toast/ToastProvider'
import './styles.css'
import './search.css'
import './dashboard.css'
import './learning.css'
import './concept.css'
import './quiz.css'
import './wrong-note.css'
import './review.css'
import './import.css'
import './learning-guide.css'
import './concept-reading-guide.css'
import './quiz-setup-guide.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)
