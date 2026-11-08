import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LearningVisualization } from './components/visualization/LearningVisualization'
import { networkAreaExamples, networkAreaSpecs } from './lib/network-area-model'
import './learning-visualization.css'
import './heap-index-explorer-preview.css'
import './study-visual-pilots-preview.css'

const groups = [
  { title: '계층 · 링크 · IP 라우팅 · NAT', ids: networkAreaExamples.slice(0, 13) },
  { title: 'DNS · TCP · UDP · TLS', ids: networkAreaExamples.slice(13, 24) },
  { title: '요청 전달 · HTTP 의미·상태', ids: networkAreaExamples.slice(24, 36) },
  { title: 'HTTP 버전 · 캐시 · 프록시', ids: networkAreaExamples.slice(36, 49) },
] as const

function NetworkAreaPreview() {
  const [theme, setTheme] = useState<'dark'|'light'>('dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme',theme)
    return () => document.documentElement.removeAttribute('data-theme')
  },[theme])
  return <main className="heap-explorer-preview" data-heap-theme={theme} data-network-preview-theme={theme}>
    <header className="heap-explorer-preview__toolbar">
      <span>Network & HTTP · 나머지 49개 도식 (전체 53개 중)</span>
      <button type="button" onClick={() => setTheme(s => s==='dark'?'light':'dark')}>
        {theme==='dark'?'라이트로 보기':'다크로 보기'}
      </button>
    </header>
    <div className="heap-explorer-preview__content study-pilots">
      <p className="study-pilots__intro">각 그림은 개념에 맞는 고정 구조·전후 비교·상태 경계를 표현합니다. 콘텐츠에서 SVG 코드나 임의 노드를 전달하지 않습니다.</p>
      <nav className="study-pilots__nav" aria-label="주제별 도식 이동">
        {groups.map((group,i)=><a href={'#network-group-'+i} key={i}>{group.title}</a>)}
      </nav>
      {groups.map((group,i)=><section key={i} id={'network-group-'+i}>
        <h2>{group.title}</h2>
        {group.ids.map((id,j)=>{
          const spec=networkAreaSpecs[id]
          return <section className="study-pilots__section" key={id} data-network-example={id} id={'network-'+id}>
            <h3>{i+1}-{j+1}. {spec.title}</h3>
            <LearningVisualization source={JSON.stringify({
              version:1,type:'network-area',example:id,title:spec.title,
              description:'학습 목적에 맞는 개념 관계를 고정 예제로 보여줍니다.',
            })}/>
          </section>
        })}
      </section>)}
    </div>
  </main>
}

createRoot(document.getElementById('root')!).render(<NetworkAreaPreview/>)
