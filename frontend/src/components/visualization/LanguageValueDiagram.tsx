import { useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { valueReferenceFrames } from '../../lib/language-type-models'
import { DiagramArrow, DiagramCanvas, DiagramControls, DiagramNode } from './DiagramPrimitives'
import { JavaValueContractEditorial } from './JavaValueContractEditorial'

export function LanguageValueDiagram({ data }: { data: VisualizationOf<'java-value-reference'> }) {
  const [index, setIndex] = useState(0)
  const frames = valueReferenceFrames(data.example)
  if (data.example !== 'assignment-copy') return <JavaValueContractEditorial data={data} />
  const frame = frames[index]
  const objectY = (id: 'A' | 'B') => id === 'A' ? 60 : 218
  const primitive = frame.objects.length === 0
  const variableBottom = primitive
    ? 60 + 74
    : frame.variables.length > 0 ? 60 + (frame.variables.length - 1) * 110 + 74 : 0
  const objectBottom = frame.objects.reduce((bottom, object) => Math.max(bottom, objectY(object.id) + 88), 0)
  const height = Math.max(192, Math.max(variableBottom, objectBottom) + 58)
  return <div className="java-desktop-fit">
    <DiagramCanvas label={`${data.title}, ${index + 1}단계. ${frame.explanation}`} width={680} height={height}>
      <text x={24} y={26}>{primitive ? '원시 값 · 변수별 독립된 값' : '변수와 그 안의 참조 값'}</text>
      {!primitive && <text x={448} y={26}>객체 · 논리적 식별자 A/B</text>}
      {frame.variables.map((variable, i) => {
        const y = primitive ? 60 : 60 + i * 110
        const x = primitive ? (frame.variables.length === 1 ? 210 : 55 + i * 310) : 24
        return <g key={variable.name}>
          <DiagramNode x={x} y={y} width={260} height={74} lines={[variable.name, variable.value]} />
          {variable.target && <DiagramArrow x1={284} y1={y + 37} x2={432} y2={objectY(variable.target) + 44} />}
        </g>
      })}
      {frame.objects.map((object) => <DiagramNode key={object.id} x={432} y={objectY(object.id)} width={224} height={88} lines={[`객체 ${object.id}`, ...object.lines]} />)}
      <text x={24} y={height - 28}>{frame.objects.length ? '실선 화살표: 참조 관계 · 물리 주소/배치가 아닙니다.' : '원시 값은 변수에 각각 저장됩니다. 객체 참조 화살표가 없습니다.'}</text>
    </DiagramCanvas>
    <p className="diagram-code"><code>{frame.code}</code></p>
    <p className="diagram-status" role="status" aria-live="polite">{frame.explanation}</p>
    {frames.length > 1 && <DiagramControls index={index} count={frames.length} onChange={setIndex} onReset={() => setIndex(0)} />}
  </div>
}
