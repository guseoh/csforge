// Audited, fixed teaching graphs. Edges describe the relation named in each scene.
export type RelationNode = { readonly id: string; readonly column: number; readonly row: number; readonly lines: readonly string[]; readonly active?: boolean }
export type RelationEdge = { readonly from: string; readonly to: string; readonly label: string; readonly dashed?: boolean }
export type RelationGraph = { readonly nodes: readonly RelationNode[]; readonly edges: readonly RelationEdge[] }
export type RelationScene = { readonly title: string; readonly lanes: readonly (readonly [string, string])[]; readonly note: string; readonly graph: RelationGraph }

export const javaPatternExamples = ['dependency-injection', 'strategy', 'adapter', 'decorator', 'proxy', 'observer', 'state'] as const
export const javaPatternScenes: Record<typeof javaPatternExamples[number], readonly RelationScene[]> = {
  'dependency-injection': [{ title: '조립과 사용의 책임', lanes: [], note: '실선은 생성·주입, 점선은 서비스가 사용하는 협력 참조입니다. Spring 컨테이너 없이도 가능한 Java 구성입니다.', graph: {
    nodes: [
      { id: 'assembly', column: 0, row: 0, lines: ['조립 코드', '구현 선택'] },
      { id: 'sender', column: 1, row: 0, lines: ['EmailSender 구현', 'new SmtpEmailSender(config)'] },
      { id: 'service', column: 0, row: 1, lines: ['OrderService', '생성자로 EmailSender 수신'] },
    ], edges: [{ from: 'assembly', to: 'sender', label: '생성' }, { from: 'assembly', to: 'service', label: '생성·주입' }, { from: 'service', to: 'sender', label: 'EmailSender 참조', dashed: true }],
  } }],
  strategy: [{ title: '선택된 정책에 계산 위임', lanes: [], note: '실선은 호출, 점선은 인터페이스 구현 관계입니다. 생성 시 정책을 정해도 Strategy이며 런타임 setter는 필수가 아닙니다.', graph: {
    nodes: [
      { id: 'calculator', column: 0, row: 0, lines: ['PriceCalculator', '주입받은 policy 사용'] },
      { id: 'policy', column: 1, row: 0, lines: ['DiscountPolicy', '할인 계산 계약'] },
      { id: 'selected', column: 1, row: 1, lines: ['선택된 정책 구현', '예: 정률 할인'] },
    ], edges: [{ from: 'calculator', to: 'policy', label: '계산 위임' }, { from: 'selected', to: 'policy', label: '구현', dashed: true }],
  } }],
  adapter: [{ title: '외부 계약을 내부 계약에 맞추기', lanes: [], note: '화살표는 호출 방향입니다. Adapter가 단위·타입·예외를 변환하며 할인 같은 업무 정책은 내부 서비스가 결정합니다.', graph: {
    nodes: [
      { id: 'service', column: 0, row: 0, lines: ['내부 서비스', 'Money 계약 사용'] },
      { id: 'adapter', column: 1, row: 0, lines: ['Adapter', '타입·단위·예외 변환'] },
      { id: 'vendor', column: 2, row: 0, lines: ['Vendor API', '외부 계약'] },
    ], edges: [{ from: 'service', to: 'adapter', label: '내부 호출' }, { from: 'adapter', to: 'vendor', label: '외부 호출' }],
  } }],
  decorator: [{ title: '중첩 순서에 따른 측정 범위', lanes: [], note: '실선은 바깥에서 안쪽으로 향하는 호출입니다. 위는 전체 재시도를 한 번 측정하고, 아래는 각 시도를 측정합니다. 반환은 역방향입니다.', graph: {
    nodes: [
      { id: 'metricsOuter', column: 0, row: 0, lines: ['Metrics', '전체 재시도 시간'] },
      { id: 'retryInner', column: 1, row: 0, lines: ['Retry', '각 시도 반복'] },
      { id: 'targetTop', column: 2, row: 0, lines: ['Target', '실제 작업'] },
      { id: 'retryOuter', column: 0, row: 1, lines: ['Retry', '각 시도 반복'] },
      { id: 'metricsInner', column: 1, row: 1, lines: ['Metrics', '시도별 시간'] },
      { id: 'targetBottom', column: 2, row: 1, lines: ['Target', '실제 작업'] },
    ], edges: [{ from: 'metricsOuter', to: 'retryInner', label: '위임' }, { from: 'retryInner', to: 'targetTop', label: '재호출 가능' }, { from: 'retryOuter', to: 'metricsInner', label: '재호출 가능' }, { from: 'metricsInner', to: 'targetBottom', label: '위임' }],
  } }],
  proxy: [{ title: '분리된 위임 프록시의 경계', lanes: [], note: '실선은 외부 호출, 점선은 target 내부 호출입니다. target.this 호출은 분리된 proxy를 다시 지나지 않습니다. 프록시 구현 방식 전체를 일반화한 그림은 아닙니다.', graph: {
    nodes: [
      { id: 'caller', column: 0, row: 0, lines: ['호출자'] },
      { id: 'proxy', column: 1, row: 0, lines: ['Proxy', '접근·지연 생성 등'] },
      { id: 'target', column: 2, row: 0, lines: ['Target', '실제 작업'] },
      { id: 'self', column: 2, row: 1, lines: ['target.this의 메서드', '분리된 proxy 우회'] },
    ], edges: [{ from: 'caller', to: 'proxy', label: '호출' }, { from: 'proxy', to: 'target', label: '위임' }, { from: 'target', to: 'self', label: '내부 호출', dashed: true }],
  } }],
  observer: [
    { title: '등록된 동기 리스너', lanes: [], note: '고정 예제는 A, B, C 순서로 순회하며 예외를 잡지 않는 발행 코드입니다. 등록 자체가 비동기 실행을 뜻하지 않습니다.', graph: {
      nodes: [{ id: 'publisher', column: 0, row: 1, lines: ['Publisher', '등록 순서 A · B · C'] }, { id: 'a', column: 1, row: 0, lines: ['A', '아직 호출 전'] }, { id: 'b', column: 1, row: 1, lines: ['B', '아직 호출 전'] }, { id: 'c', column: 1, row: 2, lines: ['C', '아직 호출 전'] }],
      edges: [{ from: 'publisher', to: 'a', label: '등록 참조' }, { from: 'publisher', to: 'b', label: '등록 참조' }, { from: 'publisher', to: 'c', label: '등록 참조' }],
    } },
    { title: 'A 호출 완료', lanes: [], note: 'A의 효과가 이미 발생했습니다. A가 끝난 뒤에야 B를 호출하는 동기 순회입니다.', graph: {
      nodes: [{ id: 'a', column: 0, row: 0, lines: ['A', '호출 완료'], active: true }, { id: 'b', column: 1, row: 0, lines: ['B', '다음 호출'] }, { id: 'c', column: 2, row: 0, lines: ['C', '아직 호출 전'] }], edges: [{ from: 'a', to: 'b', label: '다음 순서' }, { from: 'b', to: 'c', label: '예정', dashed: true }],
    } },
    { title: 'B 예외가 발행자 밖으로 전파', lanes: [], note: 'B 예외를 잡지 않아 C는 호출되지 않습니다. A의 효과는 자동으로 롤백되지 않으며 등록 목록도 예외만으로 제거되지 않습니다.', graph: {
      nodes: [{ id: 'a', column: 0, row: 0, lines: ['A', '기존 효과 유지'] }, { id: 'b', column: 1, row: 0, lines: ['B', '예외 발생'], active: true }, { id: 'c', column: 2, row: 0, lines: ['C', '미호출'] }], edges: [],
    } },
    { title: 'B를 명시적으로 등록 해제', lanes: [], note: '다음 발행 전에 remove(B)를 수행한 별도 상태입니다. 예외가 자동 해제한 것이 아니며, 동시 변경과 재진입 정책은 별도로 정해야 합니다.', graph: {
      nodes: [{ id: 'publisher', column: 0, row: 0, lines: ['Publisher', '등록 목록 A · C'] }, { id: 'a', column: 1, row: 0, lines: ['A', '등록 유지'] }, { id: 'c', column: 1, row: 1, lines: ['C', '등록 유지'] }], edges: [{ from: 'publisher', to: 'a', label: '등록 참조' }, { from: 'publisher', to: 'c', label: '등록 참조' }],
    } },
  ],
  state: [{ title: '상태 객체와 허용 전이', lanes: [], note: '실선은 허용된 상태 전이, 점선은 현재 상태 객체 참조입니다. 현재 Published에서는 다시 publish할 수 없습니다. 작은 enum 전이로 충분하면 상태 클래스 분리는 필수가 아닙니다.', graph: {
    nodes: [{ id: 'draft', column: 0, row: 0, lines: ['Draft', '작성 중'] }, { id: 'published', column: 1, row: 0, lines: ['Published', '게시됨'], active: true }, { id: 'archived', column: 2, row: 0, lines: ['Archived', '보관됨'] }, { id: 'document', column: 1, row: 1, lines: ['Document', '현재 state'] }],
    edges: [{ from: 'draft', to: 'published', label: 'publish' }, { from: 'published', to: 'draft', label: 'revise' }, { from: 'published', to: 'archived', label: 'archive' }, { from: 'document', to: 'published', label: '현재 참조', dashed: true }],
  } }],
}
