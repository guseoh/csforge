---
kind: concept
contentKey: network-http.core.tcp.rto
topicContentKey: network-http.core.tcp
slug: rto
title: "Retransmission Timeout"
summary: "RTT 관측으로 retransmission timeout을 정해 premature·late retry를 줄이는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6298"
    title: "Computing TCP's Retransmission Timer"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP timeout과 retransmission 판단을 확인한다."
    displayOrder: 1
---
# Retransmission Timeout

RTO(retransmission timeout)는 TCP가 보낸 data에 대한 ACK를 얼마 동안 기다린 뒤 loss를 의심하고 재전송할지를 정하는 transport timer다. 구현은 관측한 RTT와 변동성에 안전 여유를 두어 추정하며, RTT가 달라지는 path에 고정된 짧은 값을 적용하면 아직 도착 중인 segment를 중복 전송할 수 있고 너무 긴 값은 recovery를 늦춘다. 재전송으로 오염된 RTT sample을 그대로 새 RTT로 사용하지 않는 규칙도 필요하다.

RTO는 HTTP client timeout이나 user-visible deadline과 같은 값이 아니다. TCP가 RTO에 따라 재전송하는 동안 application deadline이 먼저 만료되어 socket을 취소할 수 있고, 그 뒤 늦은 response가 도착하거나 이미 server side effect가 발생했을 가능성도 있다. RTO가 길다고 connection이 healthy하다는 뜻도 아니다.

Backend는 DNS, connect, TLS, write, read와 전체 request deadline을 분리해 측정하고, 각 단계에 남은 시간을 전달한다. application retry budget과 transport RTO를 하나의 숫자로 합치지 않아야 retry storm과 user-visible latency를 함께 제어할 수 있다.

