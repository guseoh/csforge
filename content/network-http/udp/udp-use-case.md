---
kind: concept
contentKey: network-http.core.udp.udp-use-case
topicContentKey: network-http.core.udp
slug: udp-use-case
title: "UDP를 선택하는 경우"
summary: "메시지 독립성, 손실 허용 범위와 상위 프로토콜이 직접 제어해야 할 보장을 기준으로 UDP 선택 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc8085"
    title: "UDP Usage Guidelines"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP를 사용하는 application의 혼잡 제어·메시지 크기·신뢰성 설계 지침을 확인한다."
    displayOrder: 2
    relationNote: "UDP를 선택한 상위 프로토콜도 혼잡 제어·메시지 크기·신뢰성 정책을 직접 책임져야 한다는 점을 보충한다."
---
# UDP를 선택하는 경우

UDP를 선택하는 이유를 단순히 **`TCP보다 빠르다`**라고 설명하면 중요한 조건을 놓친다. UDP는 TCP처럼 연결 수립, 순서 있는 바이트 스트림, 재전송, 흐름 제어·혼잡 제어를 하나의 연결 계약으로 제공하지 않는다. 그만큼 기본 전송 계약이 작고, 상위 프로토콜이 **어떤 데이터는 버려도 되고 어떤 데이터는 반드시 복구해야 하는지** 직접 결정할 여지가 크다.

### 메시지 하나하나가 독립적이면 데이터그램 모델이 자연스러울 수 있다

서로 독립적인 짧은 요청·상태 갱신처럼 각 메시지를 별도 단위로 처리하고 싶다면 바이트 스트림보다 데이터그램 경계가 더 자연스러울 수 있다.

실시간 음성·영상처럼 오래된 데이터를 뒤늦게 복구하는 것보다 **최신 데이터를 제때 받는 것**이 더 중요한 경우도 있다. 예를 들어 이미 화면에 다음 프레임을 보여 주고 있는데 오래된 프레임을 재전송받기 위해 전체 흐름을 기다리는 것이 오히려 품질을 떨어뜨릴 수 있다.

| 요구 | UDP가 맞을 수 있는 이유 | 상위 프로토콜이 결정할 것 |
| --- | --- | --- |
| 독립적인 짧은 메시지 | 데이터그램 경계가 그대로 유지됨 | 손실·중복 처리 |
| 오래된 값보다 최신 값이 중요 | 모든 누락을 순서대로 복구할 필요가 없을 수 있음 | 시퀀스·시각을 이용한 오래된 값 폐기 |
| 자체 전송 프로토콜 구현 | 필요한 연결·스트림 규칙을 직접 구성 가능 | 신뢰성·순서·혼잡 제어·보안 |

### UDP 자체가 낮은 지연을 보장하는 것은 아니다

UDP를 사용해도 다음 지연은 그대로 생길 수 있다.

- 라우터와 스위치의 큐 대기
- 네트워크 경로 자체의 RTT
- 패킷 손실과 상위 계층 재시도
- 수신 애플리케이션의 처리 지연
- 너무 큰 데이터그램의 단편화·재조립 비용

따라서 `핸드셰이크가 없으니 UDP면 항상 빠르다`는 결론은 맞지 않는다. 필요한 신뢰성을 확인 응답(ACK)·재전송·순서 복원으로 다시 추가하면 그만큼 지연과 상태 비용도 생긴다.

### QUIC은 UDP의 기본 보장이 아니라 UDP 위에 만든 별도 전송 프로토콜이다

QUIC은 UDP 데이터그램을 운반 기반으로 사용하지만 그 위에서 연결 상태, 신뢰성 있는 스트림, 손실 복구, 혼잡 제어, 암호화를 직접 구현한다. QUIC이 제공하는 기능을 `UDP가 원래 제공한다`고 보면 계층을 혼동하게 된다.

UDP를 선택할 때 핵심 질문은 **메시지가 서로 독립적인가, 손실·재정렬·중복을 어느 정도 허용할 수 있는가, 필요한 신뢰성을 누가 어떤 비용으로 책임질 것인가**다. `TCP보다 빠른가` 하나만으로 결정하는 문제가 아니다.
