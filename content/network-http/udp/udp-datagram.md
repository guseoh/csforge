---
kind: concept
contentKey: network-http.core.udp.udp-datagram
topicContentKey: network-http.core.udp
slug: udp-datagram
title: "UDP 데이터그램과 메시지 경계"
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
  - url: "https://www.rfc-editor.org/rfc/rfc8085"
    title: "UDP Usage Guidelines"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP를 사용하는 application의 혼잡 제어·메시지 크기·신뢰성 설계 지침을 확인한다."
    displayOrder: 2
    relationNote: "경로 MTU를 넘는 UDP datagram과 IP fragmentation 회피 지침을 보충한다."
---
# UDP 데이터그램과 메시지 경계

UDP는 TCP처럼 연결을 맺고 하나의 ordered byte stream을 유지하지 않는다. 송신자는 source port, destination port와 payload를 가진 **독립된 datagram**을 보내고, 수신자는 전송 계층이 보존한 datagram 경계 단위로 데이터를 받는다. 그래서 TCP처럼 여러 `write()`의 bytes가 하나의 stream에서 합쳐지거나 나뉘는 framing 문제는 기본적으로 없다.

하지만 `datagram 경계가 보존된다`는 말은 `datagram이 반드시 도착한다`는 뜻이 아니다. UDP는 손실된 datagram을 스스로 재전송하지 않고, 먼저 보낸 datagram이 먼저 도착하도록 정렬하지도 않는다. 같은 datagram이 중복되어 도착하는 상황을 application 대신 제거하는 연결 상태도 제공하지 않는다.

| 성질 | UDP가 제공하는 것 | 별도로 고려할 것 |
| --- | --- | --- |
| Message 경계 | 수신한 datagram을 개별 단위로 전달 | datagram이 반드시 도착하는 것은 아님 |
| 순서와 중복 | 별도의 순서 복원·중복 제거 보장은 없음 | 필요한 경우 application protocol에서 정의 |
| 크기 | 하나의 datagram에 담긴 payload를 그대로 운반 | path MTU를 넘어 IP fragmentation을 유발하지 않도록 제한 |

### Datagram 크기는 경로와 분리해서 볼 수 없다

UDP payload가 커지면 IP packet도 커진다. 경로 MTU를 넘는 IPv4 packet은 조건에 따라 fragmentation될 수 있고, IPv6에서는 router가 중간 fragmentation을 수행하지 않는다. 여러 fragment 중 하나라도 유실되면 원래 datagram을 완성할 수 없으므로 큰 UDP datagram은 손실 비용을 키울 수 있다.

따라서 UDP는 `메시지 단위를 그대로 보낸다`는 장점이 있지만, datagram 크기는 경로의 MTU와 함께 정해야 한다. RFC 8085는 IP fragmentation에 기대지 않도록 권고하며, application은 PMTUD 또는 PLPMTUD로 사용 가능한 크기를 찾거나 보수적인 크기를 택할 수 있다. 하나의 논리적 메시지를 여러 datagram으로 나눌 필요가 있다면, 조각 식별·재조립과 손실 시 동작을 application protocol이 정의해야 한다.

### Connectionless는 상태가 전혀 없다는 뜻이 아니다

UDP 자체는 TCP handshake와 retransmission state를 만들지 않지만 OS는 socket, receive buffer, port binding 같은 local state를 관리한다. application도 peer 정보, sequence, timeout 같은 상태를 추가할 수 있다. 따라서 UDP의 핵심은 `상태가 없다`가 아니라 **transport가 connection-oriented reliability와 ordered stream을 제공하지 않는다는 것**이다.
