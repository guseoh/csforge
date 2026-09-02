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

handshake가 성공해도 server application이 request를 처리했거나 authentication이 끝났다는 뜻은 아니다. SYN backlog, accept queue, listener worker와 application readiness가 각각 다른 경계이므로 connect 성공 직후에도 이후 protocol 단계나 application 처리에서 실패할 수 있다.

### DNS → TCP → TLS는 한 cold-path 예이지 모든 request의 고정 순서가 아니다

hostname을 처음 resolve하고 새 HTTPS connection을 만드는 전형적인 cold path에서는 `DNS resolution → TCP connect → TLS handshake → HTTP exchange`처럼 관찰할 수 있다. 하지만 이것을 HTTP request마다 반드시 반복되는 protocol 순서로 외우면 안 된다. 이미 resolve된 address를 재사용하거나 IP literal로 접속할 수 있고, connection pool의 established socket을 재사용하면 새 TCP handshake 자체가 없다. 여러 address 후보를 병렬·교차 시도하는 client 전략도 있을 수 있다.

따라서 TCP connect timeout은 **새 TCP connection을 실제로 시도하는 경우의 transport 단계 timeout**으로 보고, DNS resolution·TLS handshake·HTTP request/response deadline과 별도 경계로 측정한다.

connection pool이 established socket을 재사용하면 handshake 비용을 피할 수 있지만, idle timeout이나 peer FIN/RST로 stale connection이 된 경우에는 새 connection 생성 또는 request retry가 필요할 수 있다. 이때 request replay의 안전성은 TCP가 아니라 HTTP method와 application idempotency 계약에서 판단한다.
