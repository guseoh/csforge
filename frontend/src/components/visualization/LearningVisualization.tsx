import { Component, type ReactNode } from 'react'
import { parseVisualization, type Visualization, type VisualizationOf } from '../../lib/learning-visualization'
import { DiagramArrow, DiagramCanvas, DiagramNode } from './DiagramPrimitives'
import { PassByValueDiagram, TcpHandshakeDiagram } from './StepDiagram'
import { HeapDiagram } from './InteractiveDiagram'

export function DiagramFallback({ description }: { description?: string }) {
  return <div className="diagram-fallback" role="note"><p>학습 도식을 표시할 수 없습니다. 본문 설명을 계속 읽어주세요.</p>{description && <p>{description}</p>}</div>
}

class DiagramErrorBoundary extends Component<{ children: ReactNode; description: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <DiagramFallback description={this.props.description} /> : this.props.children }
}

export function StaticDiagram({ data }: { data: VisualizationOf<'static-flow'> }) {
  return <DiagramCanvas label={data.description} width={480} height={data.labels.length * 114 + 12}>
    {data.labels.map((label, index) => <g key={index}>
      <DiagramNode x={100} y={index * 114 + 12} width={280} height={86} lines={Array.from(label.matchAll(/.{1,16}/gu), (m) => m[0])} />
      {index > 0 && <DiagramArrow x1={240} y1={index * 114 - 16} x2={240} y2={index * 114 + 12} />}
    </g>)}
  </DiagramCanvas>
}

const renderers = {
  'static-flow': (data: VisualizationOf<'static-flow'>) => <StaticDiagram data={data} />,
  'java-pass-by-value': (data: VisualizationOf<'java-pass-by-value'>) => <PassByValueDiagram data={data} />,
  'min-heap': (data: VisualizationOf<'min-heap'>) => <HeapDiagram data={data} />,
  'tcp-handshake': (data: VisualizationOf<'tcp-handshake'>) => <TcpHandshakeDiagram data={data} />,
}

function RegisteredDiagram({ data }: { data: Visualization }) {
  switch (data.type) {
    case 'static-flow': return renderers[data.type](data)
    case 'java-pass-by-value': return renderers[data.type](data)
    case 'min-heap': return renderers[data.type](data)
    case 'tcp-handshake': return renderers[data.type](data)
  }
}

export function LearningVisualization({ source }: { source: string }) {
  const data = parseVisualization(source)
  if (!data) return <DiagramFallback />
  return <figure className="learning-visualization">
    <figcaption><strong>{data.title}</strong><p>{data.description}</p></figcaption>
    <DiagramErrorBoundary key={source} description={data.description}><RegisteredDiagram key={source} data={data} /></DiagramErrorBoundary>
  </figure>
}
