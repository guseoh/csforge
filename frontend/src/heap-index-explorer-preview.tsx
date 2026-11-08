import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HeapIndexExplorer } from './components/visualization/HeapIndexExplorer'
import './heap-index-explorer-preview.css'

function HeapIndexExplorerPreview() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  return <div className="heap-explorer-preview" data-heap-theme={theme}>
    <div className="heap-explorer-preview__toolbar">
      <span>Heap Index Explorer · 개발용 시안</span>
      <button type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? '라이트로 보기' : '다크로 보기'}
      </button>
    </div>
    <main className="heap-explorer-preview__content">
      <HeapIndexExplorer />
    </main>
  </div>
}

createRoot(document.getElementById('root')!).render(<HeapIndexExplorerPreview />)
