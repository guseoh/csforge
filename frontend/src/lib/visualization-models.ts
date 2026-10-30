import { MAX_HEAP_SIZE, type VisualizationOf } from './learning-visualization'

export function passByValueFrames(data: VisualizationOf<'java-pass-by-value'>) {
  return [
    { caller: 'A', parameter: null, a: data.initialName, b: null, code: 'replace(member); // 호출 직전', explanation: '호출자의 member에는 객체 A를 가리키는 참조 값이 들어 있습니다.' },
    { caller: 'A', parameter: 'A', a: data.initialName, b: null, code: 'static void replace(Member value)', explanation: '참조 값이 새 매개변수 value에 복사됩니다. 두 변수는 같은 객체 A를 가리킵니다. 객체 복사가 아닙니다.' },
    { caller: 'A', parameter: 'B', a: data.initialName, b: { name: null }, code: 'value = new Member();', explanation: '새 객체 B가 생기고 value만 B를 가리킵니다. member는 여전히 A를 가리킵니다. name 필드의 기본값은 null입니다.' },
    { caller: 'A', parameter: 'B', a: data.initialName, b: { name: data.replacementName }, code: `value.name = "${data.replacementName}";`, explanation: 'value를 통해 객체 B의 name만 바꿉니다. 호출자의 객체 A는 바뀌지 않습니다.' },
    { caller: 'A', parameter: null, a: data.initialName, b: { name: data.replacementName }, code: `System.out.println(member.name); // ${data.initialName}`, explanation: '호출이 끝나 매개변수는 사라집니다. member는 A를 유지합니다. B에 대한 참조가 사라졌다는 것이 즉시 GC 실행을 뜻하지는 않습니다.' },
  ] as const
}

const nextSequence = (value: number) => (value + 1) % 4_294_967_296
export function tcpHandshakeFrames(data: VisualizationOf<'tcp-handshake'>) {
  const x = data.clientIsn
  const y = data.serverIsn
  const messages = [
    { from: 'client', text: `SYN · seq=${x}` },
    { from: 'server', text: `SYN, ACK · seq=${y} · ack=${nextSequence(x)}` },
    { from: 'client', text: `ACK · seq=${nextSequence(x)} · ack=${nextSequence(y)}` },
  ] as const
  return [
    { client: 'CLOSED', server: 'LISTEN', sent: 0, active: -1, explanation: '서버는 수동 열기 후 LISTEN 상태입니다. 데이터 없는 일반적인 능동 연결 수립을 추적합니다.' },
    { client: 'SYN-SENT', server: 'LISTEN', sent: 1, active: 0, explanation: '클라이언트가 SYN을 보냈습니다. 아직 서버에 도착하지 않은 전송 중 상태입니다.' },
    { client: 'SYN-SENT', server: 'SYN-RECEIVED', sent: 2, active: 1, explanation: '서버가 SYN을 받고 SYN-ACK를 보냅니다. SYN은 시퀀스 번호 하나를 차지하므로 ack는 x+1입니다.' },
    { client: 'ESTABLISHED', server: 'SYN-RECEIVED', sent: 3, active: 2, explanation: '클라이언트는 SYN-ACK를 받고 ESTABLISHED가 됩니다. 마지막 ACK는 전송 중이므로 서버는 아직 SYN-RECEIVED입니다.' },
    { client: 'ESTABLISHED', server: 'ESTABLISHED', sent: 3, active: -1, explanation: '서버가 마지막 ACK를 받아 양쪽이 ESTABLISHED입니다. TCP 연결 성공은 TLS·HTTP·업무 처리 성공을 보장하지 않습니다.' },
  ].map((frame) => ({ ...frame, messages: messages.slice(0, frame.sent) }))
}

export interface HeapFrame {
  values: number[]
  active: number[]
  explanation: string
  settled: boolean
}

export function isMinHeap(values: readonly number[]) {
  return values.every((value, index) => index === 0 || values[Math.floor((index - 1) / 2)] <= value)
}

/** 완료 상태만 다음 조작에 사용하고 복구 중 배열도 같은 좌표·값으로 표시한다. */
export function heapOperation(initial: readonly number[], operation: { type: 'offer'; value: number } | { type: 'poll' }): HeapFrame[] {
  if (!isMinHeap(initial) || initial.length > MAX_HEAP_SIZE || initial.some((v) => !Number.isInteger(v) || Math.abs(v) > 99)) throw new Error('유효한 최소 힙이 필요합니다.')
  const values = [...initial]
  let action = operation.type === 'offer' ? `offer(${operation.value})` : 'poll()'
  const frames: HeapFrame[] = []
  const record = (explanation: string, active: number[] = [], settled = false) => frames.push({ values: [...values], active, explanation, settled })
  const swap = (a: number, b: number) => {
    const left = values[a]
    const right = values[b]
    ;[values[a], values[b]] = [right, left]
    record(`배열[${a}]=${left} ↔ 배열[${b}]=${right} 교환`, [a, b])
  }
  if (operation.type === 'offer') {
    if (!Number.isInteger(operation.value) || Math.abs(operation.value) > 99 || values.length >= MAX_HEAP_SIZE) throw new Error('삽입 범위를 확인하세요.')
    values.push(operation.value)
    let index = values.length - 1
    record(`offer(${operation.value}): 배열 끝 [${index}]에 추가. 힙 성질 복구를 시작합니다.`, [index])
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      record(`비교: 부모 [${parent}]=${values[parent]}, 자식 [${index}]=${values[index]}`, [parent, index])
      if (values[parent] <= values[index]) break
      swap(parent, index)
      index = parent
    }
  } else if (values.length === 0) {
    record('poll() → null: 빈 큐입니다.', [], true)
    return frames
  } else {
    const removed = values[0]
    action = `poll() → ${removed}`
    const last = values.pop()!
    if (values.length > 0) values[0] = last
    record(`poll() → ${removed}: 헤드를 제거하고 마지막 값을 루트로 옮깁니다. 힙 성질 복구를 시작합니다.`, values.length ? [0] : [])
    let index = 0
    while (index * 2 + 1 < values.length) {
      let child = index * 2 + 1
      const right = child + 1
      if (right < values.length) {
        record(`비교: 자식 [${child}]=${values[child]}, [${right}]=${values[right]}. 더 작은 자식을 선택합니다.`, [child, right])
        if (values[right] < values[child]) child = right
      }
      record(`비교: 부모 [${index}]=${values[index]}, 선택한 자식 [${child}]=${values[child]}`, [index, child])
      if (values[index] <= values[child]) break
      swap(index, child)
      index = child
    }
  }
  record(`${action} 완료: [${values.join(', ')}]. 모든 부모 ≤ 자식. 배열 전체가 정렬됐다는 뜻은 아닙니다.`, [], true)
  return frames
}

export function buildMinHeap(input: readonly number[]) {
  return input.reduce<number[]>((heap, value) => heapOperation(heap, { type: 'offer', value }).at(-1)!.values, [])
}

export function heapDiagramSize(count: number) {
  const levels = count === 0 ? 1 : Math.floor(Math.log2(count)) + 1
  return { width: Math.max(320, 2 ** (levels - 1) * 90), height: levels * 88 + 12 }
}

export function heapPosition(index: number, width = 720) {
  const level = Math.floor(Math.log2(index + 1))
  return { x: (index - (2 ** level - 1) + 0.5) * (width / 2 ** level), y: 46 + level * 88 }
}
