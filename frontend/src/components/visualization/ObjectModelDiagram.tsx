import { useState } from 'react'
import type { VisualizationOf } from '../../lib/learning-visualization'
import { defensiveCopyFrames, dispatchFrames, initializationFrames } from '../../lib/object-model-models'
import { DiagramArrow, DiagramCanvas, DiagramControls, DiagramNode } from './DiagramPrimitives'

type Example = VisualizationOf<'java-object-model'>['example']

function StaticObjectDiagram({ example }: { example: Example }) {
  switch (example) {
    case 'static-members': return <DiagramCanvas label="Member 클래스의 totalCount는 2로 공유되고 객체 a/b의 name은 각각 kim/lee입니다." width={640} height={360}>
      <DiagramNode x={180} y={24} width={280} height={86} lines={['Member 클래스', 'static totalCount = 2']} />
      <DiagramNode x={24} y={218} width={264} lines={['Member a', 'name = "kim"']} />
      <DiagramNode x={352} y={218} width={264} lines={['Member b', 'name = "lee"']} />
      <DiagramArrow x1={156} y1={218} x2={250} y2={110} dashed /><DiagramArrow x1={484} y1={218} x2={390} y2={110} dashed />
      <text x={24} y={330}>점선: 같은 클래스 상태 공유 · 메모리 배치가 아닙니다.</text>
    </DiagramCanvas>
    case 'inheritance': return <DiagramCanvas label="CardPayment는 Payment의 하위 타입입니다. Report는 FileUtil의 기능에 협력할 수 있지만 상속의 근거가 되지는 않습니다." width={640} height={340}>
      <DiagramNode x={24} y={38} width={224} lines={['CardPayment', '하위 타입']} /><DiagramNode x={392} y={38} width={224} lines={['Payment', '상위 계약']} />
      <DiagramArrow x1={248} y1={72} x2={392} y2={72} /><text x={278} y={52}>extends</text>
      <DiagramNode x={24} y={196} width={224} lines={['Report', '보고서 책임']} /><DiagramNode x={392} y={196} width={224} lines={['FileUtil', '파일 기능']} />
      <DiagramArrow x1={248} y1={230} x2={392} y2={230} dashed /><text x={278} y={210}>기능 사용</text>
      <text x={24} y={302}>실선: 하위→상위 타입 · 점선: 협력 호출, is-a를 만들지 않음</text>
    </DiagramCanvas>
    case 'composition': return <DiagramCanvas label="OrderService는 DiscountPolicy에 위임하고 FixedDiscountPolicy와 RateDiscountPolicy는 그 계약을 구현합니다." width={680} height={390}>
      <DiagramNode x={24} y={32} width={256} lines={['OrderService', '협력 객체 참조 보유']} /><DiagramNode x={400} y={32} width={256} lines={['DiscountPolicy', 'discount(order) 계약']} />
      <DiagramArrow x1={280} y1={66} x2={400} y2={66} dashed /><text x={310} y={46}>위임</text>
      <DiagramNode x={24} y={234} width={256} lines={['FixedDiscountPolicy', '정액 할인 구현']} /><DiagramNode x={400} y={234} width={256} lines={['RateDiscountPolicy', '비율 할인 구현']} />
      <DiagramArrow x1={196} y1={234} x2={460} y2={100} /><DiagramArrow x1={528} y1={234} x2={528} y2={100} />
      <text x={276} y={142}>implements</text>
      <text x={24} y={356}>실선: 구현→계약 타입 · 점선: 객체의 위임 호출</text>
    </DiagramCanvas>
    case 'casting': return <DiagramCanvas label="실제 Dog를 Dog로 좁히면 같은 객체를 얻고 실제 Cat을 Dog로 좁히면 ClassCastException입니다." width={680} height={340}>
      <DiagramNode x={24} y={36} width={280} lines={['Animal animal', '실제 Dog 객체']} /><DiagramNode x={400} y={36} width={256} lines={['(Dog) animal 성공', '같은 Dog 객체']} />
      <DiagramArrow x1={304} y1={70} x2={400} y2={70} /><text x={330} y={48}>검사</text>
      <DiagramNode x={24} y={188} width={280} lines={['Animal other', '실제 Cat 객체']} /><DiagramNode x={400} y={188} width={256} lines={['(Dog) other 실패', 'ClassCastException']} />
      <DiagramArrow x1={304} y1={222} x2={400} y2={222} /><text x={330} y={200}>검사</text>
      <text x={24} y={306}>화살표: 타입 검사 결과 · 객체 생성/타입 변경이 아닙니다.</text>
    </DiagramCanvas>
    default: return null
  }
}

function InitializationDiagram({ index }: { index: number }) {
  const f = initializationFrames[index]
  return <DiagramCanvas label={`${f.location}. ${f.explanation}`} width={680} height={414}>
    <DiagramNode x={24} y={24} width={280} lines={['Child()', 'this("kim")로 위임']} active={index === 1 || index === 7} />
    <DiagramNode x={24} y={160} width={280} lines={['Child(String name)', 'super()로 상위 생성자 연결']} active={index === 2 || index >= 4 && index <= 6} />
    <DiagramNode x={24} y={296} width={280} lines={['Parent()', '상위 초기화 경로']} active={index === 3} />
    <DiagramArrow x1={164} y1={92} x2={164} y2={160} /><DiagramArrow x1={164} y1={228} x2={164} y2={296} />
    <DiagramNode x={376} y={24} width={280} height={90} lines={['생성 중인 Child 객체 하나', '필드 name = ' + (f.name === 'null' ? 'null' : JSON.stringify(f.name))]} />
    <DiagramNode x={376} y={160} width={280} height={90} lines={['현재 위치', f.location]} active />
    <DiagramNode x={376} y={296} width={280} lines={[`필드 초기화 식: ${f.fields}회`, `초기화 블록: ${f.blocks}회`]} />
    <text x={24} y={394}>화살표: 생성자 위임 경로 · 반환 후 원래 후반부를 계속합니다.</text>
  </DiagramCanvas>
}

function DispatchDiagram({ index }: { index: number }) {
  const f = dispatchFrames[index]
  return <DiagramCanvas label={`${f.phase}. ${f.explanation}`} width={680} height={370}>
    <DiagramNode x={24} y={32} width={280} lines={['선언 타입 Animal', 'sound() 호출 검사']} active={index === 0} />
    <DiagramNode x={400} y={32} width={256} lines={['실제 객체 Dog', 'sound() 재정의']} active={index === 1} />
    <DiagramArrow x1={304} y1={66} x2={400} y2={66} />
    <DiagramNode x={200} y={204} width={280} height={90} lines={['Dog.sound() 실행', `결과: ${f.result}`]} active={index === 2} />
    <DiagramArrow x1={528} y1={100} x2={390} y2={204} />
    <text x={24} y={344}>화살표: 선택 순서 · vtable이나 JVM 내부 배치가 아닙니다.</text>
  </DiagramCanvas>
}

function DefensiveCopyDiagram({ index }: { index: number }) {
  const f = defensiveCopyFrames[index]
  return <DiagramCanvas label={`복사 ${index + 1}단계. ${f.explanation}`} width={680} height={440}>
    <DiagramNode x={24} y={26} width={250} height={90} lines={['original → L1', ...(f.shared ? ['shared → 같은 L1'] : []), f.expanded ? '원소 참조 [M, N]' : '원소 참조 [M]']} />
    {f.copied && <DiagramNode x={406} y={26} width={250} height={90} lines={['copy → L2', '수정 불가능한 목록 [M]', f.rejected ? 'add 거부 · 상태 유지' : '원소 참조만 복사']} active={f.rejected} />}
    <DiagramNode x={410} y={260} width={246} height={90} lines={['공유 원소 M', 'MutableMember', `name = "${f.member}"`]} active={index === 4} />
    <DiagramArrow x1={274} y1={100} x2={410} y2={286} />
    {f.copied && <DiagramArrow x1={532} y1={116} x2={532} y2={260} />}
    {f.expanded && <><DiagramNode x={24} y={260} width={250} height={90} lines={['원본에만 추가된 N', 'name = "lee"']} /><DiagramArrow x1={149} y1={116} x2={149} y2={260} /></>}
    <text x={24} y={404}>화살표: 원소 참조 · 목록 구조 분리와 원소 공유를 구별합니다.</text>
    <text x={24} y={426}>L1/L2: 논리적 목록 구조 · 물리 배치/할당 횟수 아님</text>
  </DiagramCanvas>
}

export function ObjectModelDiagram({ data }: { data: VisualizationOf<'java-object-model'> }) {
  const [index, setIndex] = useState(0)
  const frames = data.example === 'initialization' ? initializationFrames : data.example === 'dispatch' ? dispatchFrames : data.example === 'defensive-copy' ? defensiveCopyFrames : null
  if (!frames) return <StaticObjectDiagram example={data.example} />
  const f = frames[index]
  return <>
    {data.example === 'initialization' ? <InitializationDiagram index={index} /> : data.example === 'dispatch' ? <DispatchDiagram index={index} /> : <DefensiveCopyDiagram index={index} />}
    <p className="diagram-code"><code>{f.code}</code></p>
    <p className="diagram-status" role="status" aria-live="polite">{f.explanation}</p>
    <DiagramControls index={index} count={frames.length} onChange={setIndex} onReset={() => setIndex(0)} />
    {data.example === 'initialization' && <details><summary>현재까지 누적 출력</summary><ol>{initializationFrames[index].output.map((line, i) => <li key={i}><code>{line}</code></li>)}</ol></details>}
  </>
}
