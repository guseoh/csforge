/**
 * Fixed, reviewable Network Pilot cases. Sequence values and state transitions
 * belong to TypeScript, never a content-authored SVG/HTML payload.
 */
export const networkCoreExamples = [
  'http-over-tcp',
  'dns-iterative',
  'tcp-teardown',
  'tcp-sliding-window',
] as const

export type NetworkCoreExample = typeof networkCoreExamples[number]

export const teardownMessages = [
  { from: 'client', title: 'FIN · 송신 방향 종료', description: '클라이언트의 FIN' },
  { from: 'server', title: 'ACK · FIN 확인', description: '서버의 FIN 확인 응답' },
  { from: 'server', title: 'FIN · 반대 방향 종료', description: '서버의 FIN' },
  { from: 'client', title: 'ACK · 마지막 FIN 확인', description: '클라이언트의 마지막 ACK' },
] as const

/** RFC 9293 normal four-segment close, with transport send and receive separated. */
export function tcpTeardownFrames() {
  return [
    { client: 'ESTABLISHED', server: 'ESTABLISHED', sent: 0, active: -1, title: '양방향 통신', explanation: '두 방향 모두 데이터 전송이 가능합니다.' },
    { client: 'FIN-WAIT-1', server: 'ESTABLISHED', sent: 1, active: 0, title: '클라이언트 FIN 전송 중', explanation: '클라이언트가 송신 방향을 닫는 FIN을 전송했습니다. 서버는 아직 수신하지 않았습니다.' },
    { client: 'FIN-WAIT-1', server: 'CLOSE-WAIT', sent: 2, active: 1, title: '서버 FIN 수신 및 ACK 전송 중', explanation: '서버는 FIN을 받고 CLOSE-WAIT입니다. 반대 방향 데이터 송신은 여전히 가능합니다.' },
    { client: 'FIN-WAIT-2', server: 'CLOSE-WAIT', sent: 2, active: -1, title: '클라이언트 ACK 수신', explanation: '클라이언트는 FIN에 대한 ACK를 받아 FIN-WAIT-2로 전이합니다. 서버는 아직 송신할 수 있습니다.' },
    { client: 'FIN-WAIT-2', server: 'LAST-ACK', sent: 3, active: 2, title: '서버 FIN 전송 중', explanation: '서버가 자신의 송신 방향을 종료하고 마지막 ACK를 기다립니다.' },
    { client: 'TIME-WAIT', server: 'LAST-ACK', sent: 4, active: 3, title: '클라이언트 마지막 ACK 전송 중', explanation: '클라이언트는 서버 FIN을 받고 ACK를 보낸 뒤 TIME-WAIT로 들어갑니다. 서버는 아직 ACK를 받지 않았습니다.' },
    { client: 'TIME-WAIT', server: 'CLOSED', sent: 4, active: -1, title: '서버가 마지막 ACK 수신', explanation: '서버는 CLOSED로 전이합니다. 클라이언트는 지연 세그먼트와 마지막 ACK 재전송 가능성 때문에 TIME-WAIT에 남습니다.' },
    { client: 'CLOSED', server: 'CLOSED', sent: 4, active: -1, title: 'TIME-WAIT 종료', explanation: '예제의 TIME-WAIT 대기 시간이 지난 뒤 클라이언트도 CLOSED로 전이합니다. 구체적인 대기 정책은 구현에 따라 달라질 수 있습니다.' },
  ] as const
}
