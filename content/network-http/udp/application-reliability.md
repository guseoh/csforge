---
kind: concept
contentKey: network-http.core.udp.application-reliability
topicContentKey: network-http.core.udp
slug: application-reliability
title: "UDP 위에서 신뢰성을 만드는 비용"
summary: "sequence·ACK·timeout·retry를 상위 protocol이 추가할 때 필요한 상태와 trade-off를 설명한다."
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
---
# UDP 위에서 신뢰성을 만드는 비용

UDP는 loss recovery와 ordering을 제공하지 않지만, 필요하다면 상위 protocol이 그 기능을 직접 만들 수 있다. 가장 단순한 형태에서도 sender는 message나 sequence를 식별하고, receiver는 무엇을 받았는지 ACK로 알려 주며, sender는 일정 시간 응답이 없으면 다시 보내는 상태를 관리해야 한다.

여기에 순서 보장이 필요하면 out-of-order message를 임시로 보관하고 missing sequence가 채워질 때까지 기다리는 규칙이 추가된다. duplicate를 허용할 수 없다면 이미 처리한 identifier를 기억해야 하고, retry가 몰리지 않게 하려면 rate control과 backoff도 필요하다. 즉 reliability를 높일수록 protocol state와 memory, timer, failure recovery가 늘어난다.

### ACK가 없다는 사실만으로 loss 원인을 알 수는 없다

sender가 ACK를 받지 못한 이유는 원래 datagram이 유실되었기 때문일 수도 있고, receiver가 처리한 뒤 보낸 ACK만 유실되었기 때문일 수도 있다. 그래서 단순 retry는 duplicate delivery를 만들 수 있다. protocol은 같은 message를 다시 받았을 때 어떻게 식별하고 처리할지 정의해야 한다.

```text
Sender                         Receiver
  | ---- message seq=17 ------> | 처리 완료
  | <------ ACK seq=17 -----X   | ACK 유실
  |         timeout             |
  | ---- retry seq=17 --------> | duplicate 식별 후 재적용 방지
```

Timeout은 receiver가 처리하지 않았다는 증거가 아니다. 같은 sequence를 다시 보낼 수 있게 하는 규칙과 receiver의 duplicate 처리 규칙이 함께 있어야 retry가 안전해진다.

반대로 모든 message에 이런 비용이 필요한 것도 아니다. 최신 상태만 중요하다면 오래된 sequence를 버리고 새 상태를 계속 보내는 방식이 더 적합할 수 있다. UDP 위 reliability는 `TCP를 다시 구현해야 한다`가 아니라 **application 목적에 필요한 일부 보장만 선택해서 설계할 수 있지만, 선택한 보장의 상태와 실패 처리도 직접 책임져야 한다**는 의미다.

QUIC처럼 이 책임을 체계적으로 구현하면 결과적으로 별도의 transport protocol이 된다. raw UDP가 단순하다는 사실과 UDP 위 protocol 전체가 단순하다는 사실은 구분해야 한다.
