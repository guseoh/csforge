---
kind: concept
contentKey: network-http.core.tcp.retransmission
topicContentKey: network-http.core.tcp
slug: retransmission
title: "TCP Retransmission"
summary: "loss나 timeout 뒤 segment를 다시 보내 reliable stream을 유지하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Retransmission

TCP sender는 ACK가 기대 시간 안에 오지 않거나 duplicate ACK 등 loss 신호가 있으면 segment를 retransmit한다. receiver는 sequence를 이용해 중복 bytes를 제거하고 stream을 한 번만 상위 계층에 전달한다.

retransmission은 network loss를 숨기지만 latency를 늘리고, application timeout과 겹치면 같은 request가 중복 실행될 수 있다. TCP가 전송을 재시도해도 endpoint가 죽었거나 route가 끊긴 경우 영원히 복구하지 않는다.

### Backend 연결

HTTP request timeout 뒤 즉시 재전송하면 이전 TCP flow가 아직 진행 중일 수 있다. POST와 side effect를 idempotency key로 보호하고 connection error와 server response를 구분한다.
