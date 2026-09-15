---
kind: concept
contentKey: network-http.core.udp.delivery-order-guarantee
topicContentKey: network-http.core.udp
slug: delivery-order-guarantee
title: "UDP의 전달·순서 보장 경계"
summary: "UDP가 delivery·ordering·duplicate 제거를 보장하지 않는 이유와 그 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# UDP의 전달·순서 보장 경계

UDP는 datagram을 IP 위에 실어 전달하지만, 송신 이후 각 datagram이 목적지에 도착했는지를 확인하는 ACK나 재전송 상태를 유지하지 않는다. 그래서 network congestion, route 변화, buffer 부족 같은 이유로 datagram이 유실되어도 UDP 자체가 다시 보내지 않는다.

도착 순서도 보장하지 않는다. `D1 → D2 → D3` 순서로 보냈더라도 서로 다른 queueing 지연이나 path 변화 때문에 `D1 → D3 → D2`처럼 관찰될 수 있다. 또한 network나 중간 장비의 동작으로 duplicate가 생겨도 UDP 계층은 message ID를 기준으로 중복을 제거하지 않는다.

### 어떤 보장이 필요한지는 상위 protocol이 결정한다

모든 UDP 사용자가 TCP와 같은 신뢰성을 다시 만들어야 하는 것은 아니다. 음성·영상이나 최신 상태 전송처럼 오래된 datagram을 뒤늦게 복구하는 것보다 현재 데이터를 계속 보내는 편이 나은 workload도 있다. 이런 경우 일부 loss와 reorder를 허용하는 것이 protocol 목표에 더 맞을 수 있다.

반대로 모든 message를 놓치지 않아야 한다면 sequence number, acknowledgement, timeout, retransmission과 duplicate detection 같은 메커니즘을 상위 protocol이 추가해야 한다. 그 순간 UDP가 단순하다는 장점 대신 더 많은 상태와 복구 규칙을 application protocol이 책임진다.

핵심은 UDP를 `빠르지만 불안정한 TCP`로 이해하는 것이 아니다. UDP는 **datagram 전달이라는 더 얇은 계약을 제공하고, 그 위에서 필요한 신뢰성의 종류를 상위 protocol이 선택하게 하는 transport**다.
