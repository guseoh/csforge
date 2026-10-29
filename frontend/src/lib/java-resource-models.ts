import type { RelationScene } from './java-pattern-models'

export const javaResourceExamples = ['throwable-tree', 'exception-boundary', 'exception-cause', 'failure-atomicity', 'resource-suppressed', 'resource-ownership'] as const
export const javaResourceScenes: Record<typeof javaResourceExamples[number], readonly RelationScene[]> = {
  'throwable-tree': [{ title: '예외의 처리·선언 검사 범위', lanes: [], note: '화살표는 상위 타입에서 하위 타입으로 향합니다. Error와 RuntimeException의 하위 타입은 unchecked이며 그 밖의 Throwable 타입은 checked입니다. 심각도나 복구 가능성의 순위가 아닙니다.', graph: {
    nodes: [{ id: 'throwable', column: 1, row: 0, lines: ['Throwable', '검사 분류의 기준'] }, { id: 'error', column: 0, row: 1, lines: ['Error', 'unchecked'] }, { id: 'exception', column: 2, row: 1, lines: ['Exception'] }, { id: 'runtime', column: 1, row: 2, lines: ['RuntimeException', 'unchecked'] }, { id: 'checked', column: 2, row: 2, lines: ['그 밖의 Exception', 'checked · 예: IOException'] }],
    edges: [{ from: 'throwable', to: 'error', label: '하위 타입' }, { from: 'throwable', to: 'exception', label: '하위 타입' }, { from: 'exception', to: 'runtime', label: '하위 타입' }, { from: 'exception', to: 'checked', label: '하위 타입' }],
  } }],
  'exception-boundary': [{ title: '예외 전파와 경계별 책임', lanes: [], note: '화살표는 실패가 전달되는 방향입니다. 서비스가 실제 복구·의미 변환을 할 때만 catch하며 모든 계층에 catch가 필요한 것은 아닙니다. HTTP 표현은 API 경계가 맡습니다.', graph: {
    nodes: [{ id: 'repository', column: 0, row: 0, lines: ['Repository', '낮은 수준 실패'] }, { id: 'service', column: 1, row: 0, lines: ['Application Service', '복구·의미 변환 또는 전파'] }, { id: 'api', column: 2, row: 0, lines: ['API Boundary', 'status · error body'] }, { id: 'client', column: 2, row: 1, lines: ['Client', '외부 실패 응답 수신'] }],
    edges: [{ from: 'repository', to: 'service', label: '실패 전파' }, { from: 'service', to: 'api', label: '실패 전파' }, { from: 'api', to: 'client', label: '응답 변환' }],
  } }],
  'exception-cause': [{ title: '호출 순서와 다른 원인 참조', lanes: [], note: '화살표는 getCause()로 따라가는 원인 참조입니다. new ImportException(message, e)가 IOException을 보존하며 메시지만 복사하면 이 참조는 생기지 않습니다.', graph: {
    nodes: [{ id: 'import', column: 0, row: 0, lines: ['ImportException', '가져오기 실패 의미'] }, { id: 'io', column: 1, row: 0, lines: ['IOException', '원래 I/O 실패'] }], edges: [{ from: 'import', to: 'io', label: 'cause' }],
  } }],
  'failure-atomicity': [
    { title: '안전하지 않은 이체: 변경 전', lanes: [], note: 'source=100, target=50에서 30을 옮기는 고정 예제입니다. 각 상자는 현재 잔액이며 다음 단계에서 source부터 변경합니다.', graph: {
      nodes: [{ id: 'source', column: 0, row: 0, lines: ['source', 'balance = 100'] }, { id: 'target', column: 1, row: 0, lines: ['target', 'balance = 50'] }], edges: [],
    } },
    { title: 'source 변경 뒤 target 입금 실패', lanes: [], note: 'source를 70으로 바꾼 뒤 target.deposit(30)이 실패한 경로입니다. Java 예외만으로 source의 변경을 되돌리지 않습니다.', graph: {
      nodes: [{ id: 'source', column: 0, row: 0, lines: ['source', 'balance = 70'], active: true }, { id: 'target', column: 1, row: 0, lines: ['target', '실패 · balance = 50'] }], edges: [],
    } },
    { title: '별도 대안: 불변 Money로 임시 결과 계산', lanes: [], note: '이체의 자동 복구가 아닌 별도 대안입니다. current=100, price=30인 불변 Money 예제에서 next=130을 계산하며 current는 아직 100입니다.', graph: {
      nodes: [{ id: 'current', column: 0, row: 0, lines: ['current', 'Money(100) 유지'] }, { id: 'next', column: 1, row: 0, lines: ['next', 'Money(130) · 검증 전'] }], edges: [],
    } },
    { title: '검증 실패 경로: 기존 값 유지', lanes: [], note: 'validateLimit(next)가 실패한 경로입니다. current = next를 실행하지 않아 기존 Money(100)를 유지합니다. 외부 부수 효과나 가변 원소의 얕은 복사까지 롤백하는 기법은 아닙니다.', graph: {
      nodes: [{ id: 'current', column: 0, row: 0, lines: ['current', 'Money(100) 유지'], active: true }, { id: 'next', column: 1, row: 0, lines: ['next', '검증 실패 · 반영 안 함'] }], edges: [],
    } },
    { title: '대조: 검증 성공 경로', lanes: [], note: '앞 단계의 실패 이후 계속 실행한 것이 아니라, 검증이 성공한 다른 경로입니다. 이때만 current = next를 실행해 130을 반영합니다.', graph: {
      nodes: [{ id: 'current', column: 0, row: 0, lines: ['current', 'Money(130)로 교체'], active: true }, { id: 'next', column: 1, row: 0, lines: ['next', '검증 성공'] }], edges: [{ from: 'current', to: 'next', label: '같은 값 참조' }],
    } },
  ],
  'resource-suppressed': [
    { title: '자원은 선언 순서로 획득', lanes: [], note: '두 자원의 초기화가 모두 성공한 예제입니다. first를 연 뒤 second를 열며 종료 시에는 역순으로 close합니다.', graph: {
      nodes: [{ id: 'first', column: 0, row: 0, lines: ['first', '열림 · 획득 순서 1'] }, { id: 'second', column: 1, row: 0, lines: ['second', '열림 · 획득 순서 2'] }], edges: [{ from: 'first', to: 'second', label: '획득 순서' }],
    } },
    { title: '본문에서 WorkException 발생', lanes: [], note: '본문 예외가 주 예외가 됩니다. 정상 반환하지 못해도 이미 획득한 자원들의 정리를 시도합니다.', graph: {
      nodes: [{ id: 'work', column: 0, row: 0, lines: ['WorkException', '주 예외'], active: true }, { id: 'first', column: 1, row: 0, lines: ['first', '아직 열림'] }, { id: 'second', column: 1, row: 1, lines: ['second', '다음 close 대상'] }], edges: [],
    } },
    { title: 'second.close 실패를 억제 예외로 보존', lanes: [], note: 'second의 close 실패가 본문 예외를 덮어쓰지 않습니다. close를 시도했다는 사실과 실제 자원이 성공적으로 닫혔다는 사실은 다릅니다.', graph: {
      nodes: [{ id: 'work', column: 0, row: 0, lines: ['WorkException', '주 예외 유지'] }, { id: 'secondFailure', column: 1, row: 0, lines: ['second close 실패', 'suppressed[0]'], active: true }, { id: 'first', column: 0, row: 1, lines: ['first', '다음 close 대상'] }], edges: [{ from: 'work', to: 'secondFailure', label: 'suppressed' }],
    } },
    { title: 'first.close도 시도한 뒤 주 예외 전파', lanes: [], note: 'first.close까지 실패한 경로입니다. 억제가 활성화된 서로 다른 예외를 가정하며 suppressed 순서는 second, first입니다. 본문이 정상이었다면 첫 close 실패가 주 예외가 됩니다.', graph: {
      nodes: [{ id: 'work', column: 0, row: 0, lines: ['WorkException', '최종 전파되는 주 예외'], active: true }, { id: 'secondFailure', column: 1, row: 0, lines: ['second close 실패', 'suppressed[0]'] }, { id: 'firstFailure', column: 1, row: 1, lines: ['first close 실패', 'suppressed[1]'] }], edges: [{ from: 'work', to: 'secondFailure', label: 'suppressed[0]' }, { from: 'work', to: 'firstFailure', label: 'suppressed[1]' }],
    } },
  ],
  'resource-ownership': [{ title: '획득·종료 책임과 빌린 사용 범위', lanes: [], note: '이 API는 소유자가 open/close하고 borrower는 빌려 쓴다는 계약입니다. 실선은 수명 관리, 점선은 사용 호출입니다. 다른 API에서 소유권을 이전한다면 그 계약을 따라야 합니다.', graph: {
    nodes: [{ id: 'owner', column: 0, row: 0, lines: ['소유자', '획득과 종료 책임'] }, { id: 'resource', column: 1, row: 0, lines: ['OutputStream', '소유자가 수명 관리'] }, { id: 'borrower', column: 1, row: 1, lines: ['write(out)의 borrower', '사용 후 임의 close 안 함'] }], edges: [{ from: 'owner', to: 'resource', label: 'open / close' }, { from: 'borrower', to: 'resource', label: '빌린 사용', dashed: true }],
  } }],
}
