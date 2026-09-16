---
kind: concept
contentKey: network-http.core.udp.udp-datagram
topicContentKey: network-http.core.udp
slug: udp-datagram
title: "UDP Datagram과 메시지 경계"
summary: "UDP가 독립된 datagram 단위로 payload를 전달하고 message boundary를 보존하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# UDP Datagram과 메시지 경계

UDP는 TCP처럼 연결을 맺고 하나의 ordered byte stream을 유지하지 않는다. 송신자는 source port, destination port와 payload를 가진 **독립된 datagram**을 보내고, 수신자는 전송 계층이 보존한 datagram 경계 단위로 데이터를 받는다. 그래서 TCP처럼 여러 `write()`의 bytes가 하나의 stream에서 합쳐지거나 나뉘는 framing 문제는 기본적으로 없다.

하지만 `datagram 경계가 보존된다`는 말은 `datagram이 반드시 도착한다`는 뜻이 아니다. UDP는 손실된 datagram을 스스로 재전송하지 않고, 먼저 보낸 datagram이 먼저 도착하도록 정렬하지도 않는다. 같은 datagram이 중복되어 도착하는 상황을 application 대신 제거하는 연결 상태도 제공하지 않는다.

### Datagram 크기는 경로와 분리해서 볼 수 없다

UDP payload가 커지면 IP packet도 커진다. 경로 MTU를 넘는 IPv4 packet은 조건에 따라 fragmentation될 수 있고, IPv6에서는 router가 중간 fragmentation을 수행하지 않는다. 여러 fragment 중 하나라도 유실되면 원래 datagram을 완성할 수 없으므로 큰 UDP datagram은 손실 비용을 키울 수 있다.

따라서 UDP는 `메시지 단위를 그대로 보낸다`는 장점이 있지만, 그 메시지 크기가 경로에서 안전하게 운반될 수 있는지는 별도로 고려해야 한다. 필요한 protocol은 적절한 datagram 크기와 fragmentation 회피 전략을 스스로 정한다.

### Connectionless는 상태가 전혀 없다는 뜻이 아니다

UDP 자체는 TCP handshake와 retransmission state를 만들지 않지만 OS는 socket, receive buffer, port binding 같은 local state를 관리한다. application도 peer 정보, sequence, timeout 같은 상태를 추가할 수 있다. 따라서 UDP의 핵심은 `상태가 없다`가 아니라 **transport가 connection-oriented reliability와 ordered stream을 제공하지 않는다는 것**이다.
