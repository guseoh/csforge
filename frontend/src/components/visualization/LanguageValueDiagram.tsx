import { useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { valueReferenceFrames } from '../../lib/language-type-models'
import { DiagramArrow, DiagramCanvas, DiagramControls, DiagramNode } from './DiagramPrimitives'

export function LanguageValueDiagram({ data }: { data: VisualizationOf<'java-value-reference'> }) {
  const [index, setIndex] = useState(0)
  const frames = valueReferenceFrames(data.example)
  const frame = frames[index]
  const objectY = (id: 'A' | 'B') => id === 'A' ? 60 : 218
  const height = data.example === 'final-list' ? 240 : 420
  return <>
    <DiagramCanvas label={`${data.title}, ${index + 1}단계. ${frame.explanation}`} width={680} height={height}>
      <text x={24} y={26}>변수와 그 안의 값</text>
      <text x={448} y={26}>객체 · 논리적 식별자 A/B</text>
      {frame.variables.map((variable, i) => {
        const y = 60 + i * 110
        return <g key={variable.name}>
          <DiagramNode x={24} y={y} width={260} height={74} lines={[variable.name, variable.value]} />
          {variable.target && <DiagramArrow x1={284} y1={y + 37} x2={432} y2={objectY(variable.target) + 44} />}
        </g>
      })}
      {frame.objects.map((object) => <DiagramNode key={object.id} x={432} y={objectY(object.id)} width={224} height={88} lines={[`객체 ${object.id}`, ...object.lines]} />)}
      <text x={24} y={height - 28}>{frame.objects.length ? '실선 화살표: 참조 관계 · 물리 주소/배치가 아닙니다.' : '원시 값은 변수에 각각 저장됩니다. 객체 참조 화살표가 없습니다.'}</text>
    </DiagramCanvas>
    <p className="diagram-code"><code>{frame.code}</code></p>
    <p className="diagram-status" role="status" aria-live="polite">{frame.explanation}</p>
    {frames.length > 1 && <DiagramControls index={index} count={frames.length} onChange={setIndex} onReset={() => setIndex(0)} />}
  </>
}
