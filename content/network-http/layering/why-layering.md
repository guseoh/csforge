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

Network layering은 local link 전달, IP forwarding, transport delivery, application protocol처럼 서로 다른 문제를 **각각의 책임과 interface로 분리하기 위한 설계 방식**이다. 모든 기능을 하나의 protocol 안에 넣지 않고 계층별 계약으로 나누면 한 계층의 구현이 바뀌어도 다른 계층이 기대하는 interface를 유지할 수 있다.

예를 들어 application은 Ethernet frame을 직접 만들지 않고 transport/network가 제공하는 communication interface를 사용한다. 반대로 router는 HTTP message의 의미를 몰라도 IP header를 보고 packet을 다음 hop으로 전달할 수 있다.

### 계층마다 질문이 다르다

- Link: 같은 local link에서 다음 장비까지 어떻게 전달할까?
- Network: 여러 network를 지나 destination host까지 어떻게 forwarding할까?
- Transport: host 안의 어떤 endpoint와 어떤 delivery contract로 통신할까?
- Application: 전달된 bytes를 어떤 message와 의미로 해석할까?

이렇게 질문을 분리하면 장애를 분석할 때도 `어느 계층의 state와 guarantee가 깨졌는가`를 구분할 수 있다.

### 계층은 구현을 강제로 분리하는 규칙이 아니다

실제 system에서는 NIC offload, proxy, kernel stack처럼 하나의 구현이 여러 계층과 관련된 일을 수행할 수 있다. Layering의 목적은 component를 반드시 물리적으로 나누는 데 있지 않고 **각 protocol이 무엇을 책임하고 무엇을 보장하지 않는지 명확히 reasoning하는 데** 있다.

하위 계층의 성공이 상위 계층의 성공을 자동으로 의미하지도 않는다. IP packet이 destination에 도착했다고 HTTP message가 유효하다는 뜻은 아니고, HTTP 응답을 받았다고 application business operation이 성공했다는 뜻도 아니다.
