import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HeapIndexExplorer } from './components/visualization/HeapIndexExplorer'
import { JavaPassByValueStudyVisual } from './components/visualization/JavaPassByValueStudyVisual'
import { TcpSlidingWindowStudyVisual } from './components/visualization/TcpSlidingWindowStudyVisual'
import './heap-index-explorer-preview.css'
import './study-visual-pilots-preview.css'

function StudyVisualPilotPreview() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  return <div className="heap-explorer-preview" data-heap-theme={theme}>
    <header className="heap-explorer-preview__toolbar">
      <span>CS 학습 시각화 · 독립 품질 검증</span>
      <button type="button" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? '라이트로 보기' : '다크로 보기'}
      </button>
    </header>
    <main className="heap-explorer-preview__content study-pilots">
      <p className="study-pilots__intro">트리·배열 관계, 참조값 복사, TCP 윈도우 이동을 각 개념에 맞게 표현합니다.</p>
      <nav aria-label="학습 시각화 예제 이동" className="study-pilots__nav">
        <a href="#heap-pilot">Heap</a>
        <a href="#java-pilot">Java Pass-by-Value</a>
        <a href="#tcp-pilot">TCP Sliding Window</a>
      </nav>
      <section id="heap-pilot" className="study-pilots__section" aria-labelledby="heap-pilot-title">
        <h2 id="heap-pilot-title">01. Heap — 트리와 배열</h2>
        <HeapIndexExplorer />
      </section>
      <section id="java-pilot" className="study-pilots__section" aria-labelledby="java-pilot-title">
        <h2 id="java-pilot-title">02. Java — Pass-by-Value</h2>
        <JavaPassByValueStudyVisual />
      </section>
      <section id="tcp-pilot" className="study-pilots__section" aria-labelledby="tcp-pilot-title">
        <h2 id="tcp-pilot-title">03. TCP — Sliding Window</h2>
        <TcpSlidingWindowStudyVisual />
      </section>
    </main>
  </div>
}

createRoot(document.getElementById('root')!).render(<StudyVisualPilotPreview />)
