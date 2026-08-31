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

RTO는 관측된 round-trip time과 variation을 바탕으로 ACK를 기다릴 상한을 정한다. 너무 짧으면 아직 오는 segment를 중복 전송하고 congestion을 키우며, 너무 길면 실제 loss recovery가 늦어진다.

RTO는 HTTP client timeout이나 user-visible deadline과 같은 값이 아니다. TCP가 재전송하는 동안 application은 더 먼저 취소할 수 있고, 그 뒤 늦은 response가 도착할 수도 있다.

### Backend 연결

connect/read/request timeout을 하나의 숫자로 설정하지 말고 전체 deadline에서 남은 시간을 전달한다. retry budget은 transport RTO와 별도로 제한한다.

