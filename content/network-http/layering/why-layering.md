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

network layering은 local link 전달, network routing, process endpoint와 transport delivery, application message semantics를 서로 다른 책임으로 나누는 설계 모델이다. 각 계층은 아래 계층이 제공하는 interface를 사용하고 자신의 header·state·failure를 관리하므로, 예를 들어 Ethernet link가 바뀌어도 IP와 HTTP가 정한 계약을 유지하면 application protocol 전체를 다시 만들 필요가 없다.

계층은 실제 장비나 process가 반드시 한 계층씩 독립 실행된다는 뜻이 아니다. NIC offload, proxy termination, kernel stack처럼 한 구현이 여러 계층의 일을 최적화하거나 경계를 가로지를 수 있지만, reasoning할 때 `어떤 주소를 보고`, `어떤 delivery를 보장하며`, `어느 state가 실패했는가`를 분리하게 해 준다. 반대로 계층을 섞으면 TCP retransmission을 HTTP retry로 중복 보정하거나 DNS success를 application health로 잘못 해석할 수 있다.

### 계약은 독립적이지만 end-to-end 결과는 조합된다

하위 계층의 성공이 상위 계층의 성공을 자동으로 증명하지 않는다. transport가 bytes를 전달해도 HTTP parser가 유효한 message를 만들지 못할 수 있고, HTTP response를 받아도 business transaction이 commit되지 않을 수 있다. 따라서 장애 분석과 timeout 설계에서는 각 계층의 상태와 경계를 연결하되 하나의 `network error`로 합치지 않는다.

HTTP client timeout, TCP retransmission, DNS TTL, application retry는 서로 다른 clock과 실패 원인을 가진다. backend는 계층별 deadline과 재시도 책임을 정의하고, 어느 계층에서 이미 작업이 실행되었는지 모호한 경우 idempotency와 결과 조회로 중복 effect를 제어한다.

