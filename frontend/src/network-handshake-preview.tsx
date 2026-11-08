import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LearningVisualization } from './components/visualization/LearningVisualization'
import './learning-visualization.css'
import './heap-index-explorer-preview.css'

const source = JSON.stringify({
  version: 1,
  type: 'tcp-handshake',
  title: 'TCP 연결 수립의 메시지와 양쪽 상태',
  description: 'SYN은 시퀀스 번호 하나를 차지합니다. 마지막 ACK는 서버가 받은 뒤 ESTABLISHED로 전이합니다.',
  clientIsn: 100,
  serverIsn: 300,
})

function NetworkHandshakePreview() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    return () => document.documentElement.removeAttribute('data-theme')
  }, [theme])
  return <main className="heap-explorer-preview" data-heap-theme={theme} data-network-preview-theme={theme}>
    <div className="heap-explorer-preview__toolbar">
      <span>Network Pilot N-01 · TCP 3-Way Handshake</span>
      <button type="button" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? '라이트로 보기' : '다크로 보기'}
      </button>
    </div>
    <div className="heap-explorer-preview__content">
      <LearningVisualization source={source} />
    </div>
  </main>
}

createRoot(document.getElementById('root')!).render(<NetworkHandshakePreview />)
