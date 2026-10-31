import type { VisualizationOf } from '../../lib/learning-visualization'

/** Source-specific static comparisons for three Java flow concepts. */
export function JavaLegacyFlowEditorial({ data }: { data: VisualizationOf<'static-flow'> }) {
  const source = data.labels[0]
  const kind = source === '같은 builder에 append 누적' ? 'builder'
    : source === 'InputStream: bytes' ? 'charset'
    : source === 'write A · B · C' ? 'buffer' : null
  if (!kind) return null

  const captions = {
    builder: ['동일한 가변 builder', '값을 추출하는 시점', '독립된 String 결과'],
    charset: ['바이트 입력', '문자 디코딩 경계', '문자 처리'],
    buffer: ['작은 출력 요청', 'Java 출력 버퍼', '하위 출력 계층'],
  } as const
  const snippets = {
    builder: ['builder.append(...)', 'builder.toString()', 'String snapshot'],
    charset: ['InputStream · byte', 'InputStreamReader · Charset', 'Reader · char'],
    buffer: ['write(A), write(B), write(C)', 'buffered output', 'flush()'],
  } as const
  const caveats = {
    builder: 'toString()의 결과는 builder의 실시간 뷰가 아닙니다. 이후 append로 같은 builder를 수정해도 이미 얻은 String은 바뀌지 않습니다.',
    charset: 'InputStreamReader가 지정된 Charset으로 바이트를 디코딩합니다. 모든 Reader에 변환기가 있는 것은 아니며, UTF-16 코드 단위와 문자열의 물리적 저장 구조는 다릅니다.',
    buffer: 'flush는 버퍼의 데이터를 하위 계층으로 넘깁니다. 디스크 영구 저장이나 원격 애플리케이션의 수신 완료를 보장하지 않습니다.',
  } as const

  return <section className="java-ed-legacy java-ed-static-flow" aria-label={data.title}>
    <div className="java-ed-legacy-flow" role="list">
      {data.labels.map((label, i) => <div role="listitem" key={i}>
        <span className="java-editorial-kicker">{captions[kind][i] ?? '결과'}</span>
        <strong>{label}</strong>
        <code>{snippets[kind][i] ?? '—'}</code>
      </div>)}
    </div>
    <p className="java-editorial-qualification">{caveats[kind]}</p>
  </section>
}
