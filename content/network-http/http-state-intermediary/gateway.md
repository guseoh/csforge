---
kind: concept
contentKey: network-http.core.http-state-intermediary.gateway
topicContentKey: network-http.core.http-state-intermediary
slug: gateway
title: "Gateway"
summary: "protocol·routing·policy를 경계에서 중계하는 gateway의 역할을 설명한다."
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

gateway는 client와 upstream 사이에서 protocol translation, routing, authentication, quota, observability 같은 경계 기능을 수행한다. reverse proxy와 겹치는 구현이 있어도 gateway의 핵심은 조직 경계에서 policy와 backend contract를 중계하는 데 있다.

gateway가 body를 buffer하거나 retry하면 streaming과 side effect semantics가 달라질 수 있다. response status mapping, header allowlist, timeout budget, upstream identity를 명시한다.

### Backend 연결

CSForge API gateway가 있더라도 application validation과 domain authorization을 모두 gateway에 옮기지 않는다. canonical DB transaction과 gateway delivery status를 분리해 복구한다.
