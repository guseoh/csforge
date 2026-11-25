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

UDP는 TCP의 연결 수립과 순서 있는 신뢰성 스트림을 기본 제공하지 않으므로 상위 프로토콜이 사용 사례에 맞는 전달 정책을 정의하기 좋습니다.

| 요구사항 | 선택 이유 | 추가로 필요한 정책 |
| --- | --- | --- |
| 독립적인 짧은 메시지 | 데이터그램 경계 유지 | 유실과 중복 처리 |
| 최신 상태 우선 | 오래된 값의 복구 생략 가능 | 순서·시간 정보 |
| 사용자 정의 전송 | 필요한 보장 선택 | 신뢰성·혼잡 제어·보안 |

예를 들어 실시간 위치 갱신에서는 이전 값이 늦게 도착했을 때 버리는 것이 적합할 수 있습니다. 반대로 파일 전송에는 모든 데이터의 복구가 필요할 수 있습니다. DNS도 UDP뿐 아니라 TCP 등의 전송을 사용하며 큰 응답이나 특정 조건에서는 전송 방식이 달라집니다.

### 지연과 비용

UDP에서도 경로 RTT, 큐 대기, 손실, 단편화, 수신 앱의 처리 지연이 발생합니다. 필요한 신뢰성을 상위에서 구현하면 추가 상태와 복구 비용이 생깁니다. QUIC의 신뢰성 스트림과 암호화, 혼잡 제어는 UDP 자체의 기능이 아니라 QUIC이 제공하는 계약입니다.
