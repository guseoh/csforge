---
kind: concept
contentKey: network-http.core.udp.application-reliability
topicContentKey: network-http.core.udp
slug: application-reliability
title: "UDP 위에 신뢰성 구현하기"
summary: "순서 번호·확인 응답(ACK)·타임아웃·재전송을 상위 프로토콜이 추가할 때 필요한 상태와 중복 처리·혼잡 제어 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
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
    relationNote: "UDP 위에서 확인 응답(ACK)·재전송·중복 제거 같은 신뢰성 기능을 직접 구현할 때 추가되는 프로토콜 책임을 확인한다."
---
# UDP 위에 신뢰성 구현하기

UDP에는 기본 ACK, 재전송, 순서 보장, 중복 제거가 없습니다. 상위 프로토콜에서 필요한 보장만 선택하여 메시지 ID, 확인 응답, 타이머 등의 규칙을 정의할 수 있습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "UDP 위에 신뢰성 구현하기",
  "description": "개념의 기술적 관계와 상태를 검증된 고정 예제로 보여줍니다.",
  "example": "application-reliability"
}
```

그림에서 수신 측은 메시지 17의 처리를 완료했지만 상위 프로토콜의 ACK가 유실됩니다. 송신자는 타임아웃만으로 요청이 유실된 것인지 응답만 유실된 것인지 구분할 수 없습니다. 같은 ID를 다시 받았을 때 수신 측이 기존 처리 상태를 확인하고 확인 응답을 재전송하는 정책이 필요합니다.

### 신뢰성의 비용

순서 보장에는 선도착 데이터를 임시 저장할 상태가 필요합니다. 재전송에는 타이머와 복구 규칙이, 중복 효과 방지에는 메시지 ID와 처리 상태를 일관되게 관리할 정책이 필요합니다. 경로 혼잡을 악화시키지 않도록 혼잡 제어도 설계해야 합니다.

최신 위치 데이터와 파일 전송은 요구하는 보장이 다릅니다. 전자는 오래된 메시지를 버릴 수 있지만 후자는 누락 구간을 복구해야 할 수 있습니다. QUIC은 이러한 책임을 UDP 위에 구현한 별도의 전송 프로토콜입니다. 상위 ACK를 구현했다고 외부 업무 효과까지 정확히 한 번 실행되는 것은 아닙니다.
