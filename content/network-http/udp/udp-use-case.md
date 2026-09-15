---
kind: concept
contentKey: network-http.core.udp.udp-use-case
topicContentKey: network-http.core.udp
slug: udp-use-case
title: "UDP를 선택하는 경우"
summary: "loss tolerance, message independence와 상위 protocol 제어 요구를 기준으로 UDP 선택 이유를 설명한다."
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
---
# UDP를 선택하는 경우

UDP를 선택하는 이유는 단순히 `TCP보다 빠르기 때문`이라고 정리하기 어렵다. UDP는 connection setup, ordered byte stream, retransmission과 congestion-control state를 TCP처럼 transport 자체에서 제공하지 않는다. 그만큼 기본 계약이 작고, application protocol이 어떤 data는 버리고 어떤 data는 복구할지 더 직접 결정할 수 있다.

이 특성은 서로 독립적인 짧은 message, 일부 loss를 허용할 수 있는 실시간 media, local discovery나 multicast처럼 stream connection과 다른 전달 형태가 필요한 경우에 잘 맞을 수 있다. 오래된 frame을 늦게 복구하는 것보다 새 frame을 보내는 편이 중요한 workload에서는 강한 ordered delivery가 오히려 지연을 늘릴 수 있다.

### UDP 자체가 낮은 지연 시간을 보장하지는 않는다

UDP를 사용해도 queueing, routing, packet loss와 receiver 처리 지연은 그대로 존재한다. reliability가 필요하다면 application protocol이 ACK·retransmission·ordering·rate control을 추가해야 하고, 그렇게 추가한 메커니즘은 다시 latency와 상태 비용을 만든다.

QUIC이 대표적인 예다. QUIC은 UDP datagram을 기반으로 하지만 reliable stream, congestion control, encryption 같은 기능을 별도의 transport protocol로 구현한다. 따라서 QUIC의 보장을 `UDP가 원래 제공하는 기능`으로 이해하면 안 된다.

UDP가 적합한지는 결국 **message가 독립적인가, loss와 reorder를 어느 정도 허용할 수 있는가, 어떤 신뢰성을 상위 protocol이 직접 제어해야 하는가**로 판단한다. handshake가 없다는 한 가지 특성만으로 선택하지 않는다.
