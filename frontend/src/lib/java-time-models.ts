import type { RelationScene } from './java-pattern-models'

// Fixed dates verified with Java 25 and tzdb 2026b; no browser zone rules are used.
export const javaTimeExamples = ['instant-zones', 'zone-dst', 'duration-period'] as const
export const javaTimeScenes: Record<typeof javaTimeExamples[number], readonly RelationScene[]> = {
  'instant-zones': [{ title: '같은 Instant의 지역별 표현', lanes: [], note: '화살표는 같은 순간의 표현 변환입니다. Java 25·tzdb 2026b의 2026-08-31 예제이며 뉴욕은 이 날짜에 -04:00입니다. Zone 없는 LocalDateTime만으로는 순간을 확정하지 못합니다.', graph: {
    nodes: [{ id: 'instant', column: 0, row: 1, lines: ['Instant', '2026-08-31T05:00:00Z'] }, { id: 'seoul', column: 1, row: 0, lines: ['Asia/Seoul', '2026-08-31 14:00', '+09:00'] }, { id: 'newYork', column: 1, row: 2, lines: ['America/New_York', '2026-08-31 01:00', '-04:00'] }], edges: [{ from: 'instant', to: 'seoul', label: '같은 순간' }, { from: 'instant', to: 'newYork', label: '같은 순간' }],
  } }],
  'zone-dst': [
    { title: 'Paris의 gap: 유효 offset 0개', lanes: [], note: 'Java 25·tzdb 2026b에서 2026-03-29 02:30은 Europe/Paris의 한 시간 gap 안에 있습니다. ofStrict는 거부하며 아직 어느 Instant도 선택한 상태가 아닙니다.', graph: {
      nodes: [{ id: 'local', column: 0, row: 0, lines: ['Europe/Paris', '2026-03-29 02:30'] }, { id: 'offsets', column: 1, row: 0, lines: ['getValidOffsets', '[] · 유효 offset 없음'], active: true }], edges: [{ from: 'local', to: 'offsets', label: '규칙 조회' }],
    } },
    { title: 'gap의 기본 atZone 정책', lanes: [], note: '같은 gap 입력에 atZone을 적용한 결과입니다. gap 길이 한 시간만큼 앞으로 이동해 03:30+02:00이 됩니다. 다음 유효 시각의 시작인 03:00으로 맞추는 규칙이 아닙니다.', graph: {
      nodes: [{ id: 'local', column: 0, row: 0, lines: ['입력', '2026-03-29 02:30'] }, { id: 'resolved', column: 1, row: 0, lines: ['atZone 결과', '2026-03-29 03:30', '+02:00'], active: true }], edges: [{ from: 'local', to: 'resolved', label: 'gap 길이 보정' }],
    } },
    { title: '별도 날짜의 overlap: 유효 offset 2개', lanes: [], note: '다른 날짜인 2026-10-25 02:30은 Europe/Paris에서 두 번 나타납니다. 두 후보의 Instant가 한 시간 다르므로 offset 선택 정책이 필요합니다. gap 다음에 이어지는 시간 순서가 아닌 비교 예제입니다.', graph: {
      nodes: [{ id: 'local', column: 0, row: 1, lines: ['Europe/Paris', '2026-10-25 02:30'] }, { id: 'earlier', column: 1, row: 0, lines: ['첫 번째 발생 · +02:00', 'Instant 00:30Z'] }, { id: 'later', column: 1, row: 2, lines: ['두 번째 발생 · +01:00', 'Instant 01:30Z'] }], edges: [{ from: 'local', to: 'earlier', label: '유효 후보 1' }, { from: 'local', to: 'later', label: '유효 후보 2' }],
    } },
    { title: 'overlap에서 발생 순서를 선택', lanes: [], note: '이 입력의 atZone은 먼저 발생한 +02:00을 선택합니다. withLaterOffsetAtOverlap()으로 +01:00의 나중 발생을 선택할 수 있습니다. earlier/later는 offset 숫자의 대소가 아닌 시간축의 발생 순서입니다.', graph: {
      nodes: [{ id: 'earlier', column: 0, row: 0, lines: ['withEarlierOffsetAtOverlap', '02:30+02:00 · 00:30Z'] }, { id: 'later', column: 1, row: 0, lines: ['withLaterOffsetAtOverlap', '02:30+01:00 · 01:30Z'], active: true }], edges: [{ from: 'earlier', to: 'later', label: '나중 발생 선택' }],
    } },
  ],
  'duration-period': [{ title: 'DST를 건너는 24시간과 달력 하루', lanes: [], note: 'Europe/Paris·tzdb 2026b의 고정 예제입니다. Duration은 정확히 24시간, Period는 달력 하루를 더합니다. 이 날짜의 달력 하루는 경과 시간 23시간이며 모든 지역·날짜의 보장이 아닙니다.', graph: {
    nodes: [{ id: 'start', column: 0, row: 1, lines: ['공통 시작 · Paris', '2026-03-28 09:00', '+01:00'] }, { id: 'duration', column: 1, row: 0, lines: ['Duration.ofHours(24)', '2026-03-29 10:00+02:00', '경과 24시간'] }, { id: 'period', column: 1, row: 2, lines: ['Period.ofDays(1)', '2026-03-29 09:00+02:00', '경과 23시간'] }], edges: [{ from: 'start', to: 'duration', label: '초 기반 덧셈' }, { from: 'start', to: 'period', label: '달력 기반 덧셈' }],
  } }],
}
