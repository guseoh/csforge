---
kind: concept
contentKey: network-http.core.layering.decapsulation
topicContentKey: network-http.core.layering
slug: decapsulation
title: "Decapsulation"
summary: "수신 host가 각 계층 header를 제거하고 상위 payload를 전달하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Decapsulation

Decapsulation은 수신 측에서 각 계층이 자신이 이해하는 header를 검사하고 제거한 뒤 payload를 상위 계층에 넘기는 과정이다. 송신 측 encapsulation을 반대 방향으로 따라간다고 볼 수 있다.

```text
link frame
  ↓ link header/trailer 검사
IP packet
  ↓ IP header 검사
transport data
  ↓ port/connection·transport state 처리
application payload
```

각 단계에서 address, protocol type, checksum이나 state가 해당 계층의 계약을 만족하지 않으면 data가 상위 계층으로 전달되지 않을 수 있다.

### Router와 destination host의 처리는 다르다

Router는 최종 application까지 decapsulation하지 않는다. Incoming link frame에서 IP packet을 얻고 IP forwarding 정보를 확인한 뒤, 다음 link에 맞는 새 frame으로 다시 encapsulate한다.

Destination host에서는 transport 계층까지 처리한 뒤 application이 해석할 bytes를 전달한다. TCP라면 packet arrival 자체가 application message 완료를 의미하지 않고, ordered byte stream을 복원한 뒤 application protocol의 framing 규칙이 message boundary를 결정한다.

Decapsulation의 핵심은 **수신 경로에서 각 계층이 자신의 header와 state만 책임지고, 성공한 payload만 다음 계층으로 넘긴다는 것**이다.
