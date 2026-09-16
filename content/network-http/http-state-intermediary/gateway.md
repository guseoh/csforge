---
kind: concept
contentKey: network-http.core.http-state-intermediary.gateway
topicContentKey: network-http.core.http-state-intermediary
slug: gateway
title: "Gateway"
summary: "client와 upstream 사이에서 protocol·routing·policy boundary를 형성하는 gateway의 역할을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Gateway

Gateway는 client와 upstream 사이의 경계에서 request를 받아 다른 protocol endpoint나 backend로 전달하는 intermediary 역할을 가리킨다. Reverse proxy와 같은 제품 위에 구현될 수도 있지만, gateway라는 이름은 특히 routing, protocol translation이나 edge policy 같은 경계 기능을 강조할 때 자주 사용된다.

예를 들어 external HTTP request를 내부 gRPC call로 바꾸거나, 여러 backend 중 하나를 선택해 요청을 전달할 수 있다. 이런 경우 client-facing request와 upstream request는 동일한 wire message가 아니며, gateway가 둘 사이의 변환 책임을 갖는다.

```text
client request
    ↓
gateway
    ├─ route 선택
    ├─ protocol / message 변환 가능
    └─ upstream request
```

Gateway가 authentication, rate limit, cache 같은 정책을 함께 수행할 수 있지만 그 기능들이 HTTP gateway의 보편적 필수 조건은 아니다. 또한 gateway가 request를 upstream에 성공적으로 전달했다는 사실이 backend의 domain operation까지 성공했다는 뜻도 아니다.

따라서 gateway를 이해할 때는 제품 이름보다 **어느 connection과 protocol을 종료하고, 무엇을 변환하며, 어느 지점에서 다음 hop을 새로 만드는가**를 보는 것이 중요하다.
