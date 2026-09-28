---
kind: concept
contentKey: network-http.core.udp.application-reliability
topicContentKey: network-http.core.udp
slug: application-reliability
title: "UDP 위에 신뢰성 구현하기"
summary: "시퀀스·ACK·타임아웃·재전송을 상위 프로토콜이 추가할 때 필요한 상태와 중복 처리·혼잡 제어 비용을 설명한다."
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
    relationNote: "UDP 위에서 ACK·재전송·중복 제거 같은 신뢰성을 직접 구현할 때 추가되는 프로토콜 책임을 확인한다."
---
# UDP 위에 신뢰성 구현하기

UDP 자체는 손실 복구와 순서 보장을 제공하지 않지만, 상위 프로토콜이 필요한 기능을 직접 추가할 수 있다. 가장 단순한 재전송만 구현해도 **메시지를 식별할 번호, 수신 여부를 알리는 ACK, 기다릴 시간, 재전송 규칙**이 필요하다.

```text
송신 측
메시지 #17 전송
      ↓
ACK #17 대기
  ├─ ACK 도착 → 완료
  └─ timeout → 재전송 여부 판단
```

여기에 순서 보장까지 필요하면 먼저 도착한 뒤쪽 메시지를 임시로 보관하고 빠진 번호가 채워질 때까지 기다리는 규칙이 추가된다. 중복 적용을 막으려면 이미 처리한 메시지 식별자를 기억해야 한다. 다수 송신자가 동시에 재시도할 수 있다면 재시도 간격과 혼잡 제어도 필요하다.

즉 신뢰성을 하나씩 추가할수록 **연결 상태·메모리·타이머·복구 규칙**도 함께 늘어난다.

### 타임아웃은 상대가 처리하지 않았다는 증거가 아니다

가장 중요한 실패 경계 중 하나다. 송신 측이 ACK를 못 받았다고 하자.

```text
송신 측                         수신 측
  | ---- message #17 ----------> | 처리 성공
  | <------- ACK #17 -------X    | ACK만 유실
  |          timeout             |
  | ---- message #17 재전송 ---> | 중복 메시지
```

송신 측에서는 `메시지가 유실된 경우`와 `상대가 이미 처리했지만 ACK만 유실된 경우`를 timeout 하나만으로 구분할 수 없다. 따라서 같은 메시지를 재전송할 수 있게 하려면 수신 측도 **동일한 논리 메시지를 식별하고 중복 적용을 막을 규칙**을 가져야 한다.

이 구조는 HTTP POST 재시도의 idempotency key 문제와도 비슷하다. 통신 실패는 실제 업무 효과가 발생하지 않았다는 증거가 아니므로, 안전한 재시도에는 논리 연산을 식별할 상태가 필요하다.

### 모든 UDP 사용 사례에 강한 신뢰성이 필요한 것은 아니다

최신 위치·게임 상태처럼 오래된 값은 버려도 되는 경우에는 모든 메시지를 순서대로 복구하는 것이 오히려 불필요한 지연을 만들 수 있다. 이런 프로토콜은 번호를 이용해 오래된 메시지를 버리되 누락 메시지를 끝까지 재전송하지 않을 수 있다.

반대로 파일 조각처럼 빠진 데이터가 있으면 결과를 사용할 수 없는 경우에는 손실 복구와 재조립이 훨씬 중요하다.

따라서 UDP 위 신뢰성을 설계한다는 것은 `TCP를 무조건 다시 구현한다`는 뜻이 아니다. **사용 사례에 필요한 보장만 선택할 수 있지만, 선택한 보장의 상태·재시도·중복 처리·혼잡 제어를 상위 프로토콜이 직접 책임진다는 뜻**이다.

QUIC처럼 이 책임을 체계적으로 구현하면 결국 UDP 위에 별도의 완성된 전송 프로토콜이 만들어진다. `raw UDP가 단순하다`와 `UDP 위에 만든 전체 프로토콜도 단순하다`는 같은 말이 아니다.
