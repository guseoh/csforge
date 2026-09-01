---
kind: concept
contentKey: network-http.core.tcp.three-way-handshake
topicContentKey: network-http.core.tcp
slug: three-way-handshake
title: "TCP Three-Way Handshake"
summary: "SYN·SYN-ACK·ACK로 양 endpoint의 초기 sequence와 연결 상태를 합의하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Three-Way Handshake

TCP three-way handshake는 client와 server가 서로의 initial sequence number와 양방향 control state를 확인한 뒤 established state로 들어가기 위한 교환이다. client가 SYN을 보내면 server는 자신의 SYN과 client sequence를 확인하는 ACK를 함께 보내고, client의 마지막 ACK가 도착하면 일반적인 data exchange를 시작한다. 이 교환은 단순히 두 host가 존재한다는 신호보다 더 구체적인 transport state 합의다.

handshake가 성공해도 server application이 request를 처리했거나 authentication이 끝났다는 뜻은 아니다. SYN backlog, accept queue, listener worker와 application readiness가 각각 다른 경계이므로 connect 성공 직후 request가 거부될 수 있다. SYN retransmission과 TCP connect timeout은 DNS 이후이면서 TLS·HTTP request timeout보다 앞선 단계다.

Backend latency를 DNS resolution, route/connect, TLS handshake, request write, response processing으로 나눠 측정한다. connection pool이 established socket을 재사용하면 handshake를 생략할 수 있지만, idle timeout이나 peer FIN으로 stale connection이 된 경우에는 retry와 request replay의 안전성을 별도로 판단한다.
