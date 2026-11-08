import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LearningVisualization } from './components/visualization/LearningVisualization'
import './learning-visualization.css'
import './heap-index-explorer-preview.css'
import './study-visual-pilots-preview.css'

const examples = [
  { id: 'handshake', title: '01. TCP 3-Way Handshake', type: 'tcp-handshake', clientIsn: 100, serverIsn: 300 },
  { id: 'http', title: '02. HTTP Request / Response over TCP', type: 'network-core', example: 'http-over-tcp' },
  { id: 'dns', title: '03. DNS Resolution Flow', type: 'network-core', example: 'dns-iterative' },
  { id: 'teardown', title: '04. TCP Termination / TIME_WAIT', type: 'network-core', example: 'tcp-teardown' },
  { id: 'window', title: '05. TCP Sliding Window', type: 'network-core', example: 'tcp-sliding-window' },
] as const

function NetworkPilotPreview() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    return () => document.documentElement.removeAttribute('data-theme')
  }, [theme])
  return <main className="heap-explorer-preview" data-heap-theme={theme} data-network-preview-theme={theme}>
    <header className="heap-explorer-preview__toolbar">
      <span>Network Pilot Pack · 5개 Concept Reader 시각화</span>
      <button type="button" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? '라이트로 보기' : '다크로 보기'}
      </button>
    </header>
    <div className="heap-explorer-preview__content study-pilots">
      <nav className="study-pilots__nav" aria-label="시각화 이동">
        {examples.map(item => <a key={item.id} href={'#' + item.id}>{item.title}</a>)}
      </nav>
      {examples.map(item => <section className="study-pilots__section" key={item.id} id={item.id}>
        <h2>{item.title}</h2>
        <LearningVisualization source={JSON.stringify({
          version: 1,
          title: item.title,
          description: '네트워크 계층·상태의 기술 의미를 살펴봅니다.',
          ...('clientIsn' in item ? { type: item.type, clientIsn: item.clientIsn, serverIsn: item.serverIsn } : { type: item.type, example: item.example }),
        })} />
      </section>)}
    </div>
  </main>
}

createRoot(document.getElementById('root')!).render(<NetworkPilotPreview />)
