---
kind: concept
contentKey: network-http.core.http-cache.cache-control
topicContentKey: network-http.core.http-cache
slug: cache-control
title: "Cache-Control"
summary: "max-age·no-cache·no-store 등 cache directive를 해석한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Cache-Control

Cache-Control은 response를 언제 저장·재사용·재검증할지 지시한다. `max-age`는 freshness lifetime을, `no-cache`는 저장 금지보다 사용 전 validation을, `no-store`는 cache 저장을 금지하는 강한 지시로 해석해야 한다.

request directive와 response directive, private/shared cache가 적용되는 방향을 구분한다. 여러 directive가 충돌하거나 proxy가 일부를 무시하는 환경에서는 안전한 기본값을 선택한다.

### Backend 연결

개인화된 review response에 public shared cache가 붙지 않도록 `private`와 Vary를 검토한다. mutable canonical content의 max-age는 reimport 전파와 맞춘다.
