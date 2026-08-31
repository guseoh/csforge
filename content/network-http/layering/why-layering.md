---
kind: concept
contentKey: network-http.core.layering.why-layering
topicContentKey: network-http.core.layering
slug: why-layering
title: "Why Layering"
summary: "network 기능을 계층으로 나누는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Why Layering

network layering은 link delivery, IP routing, transport reliability, application semantics를 서로 다른 책임으로 분리한다. 한 계층의 구현을 바꿔도 상위 계층이 계약을 지키면 전체 protocol을 다시 만들지 않아도 된다.

계층은 실제 packet이 반드시 독립 프로세스로 실행된다는 뜻이 아니라 reasoning과 interface의 경계다. 장애를 조사할 때 “어느 계층이 책임지는 상태인가”를 먼저 구분하면 잘못된 retry와 중복 보정을 줄일 수 있다.

### Backend 연결

HTTP client timeout, TCP retransmission, DNS TTL, application retry는 서로 다른 clock과 실패 원인을 가진다. 하나의 global retry로 합치지 않고 계층별 deadline을 설계한다.

