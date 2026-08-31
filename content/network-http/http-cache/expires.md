---
kind: concept
contentKey: network-http.core.http-cache.expires
topicContentKey: network-http.core.http-cache
slug: expires
title: "Expires"
summary: "absolute expiry와 Cache-Control 우선순위를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Expires

Expires는 response가 stale로 간주될 절대 시각을 나타내는 오래된 freshness mechanism이다. Cache-Control의 max-age가 함께 있으면 현대 HTTP cache 규칙에서 더 구체적인 지시가 우선할 수 있으므로 두 header를 임의로 다른 값으로 만들지 않는다.

absolute clock은 client·proxy clock skew와 날짜 format 문제를 만든다. 짧은 cache lifetime이나 immutable versioned URL에는 명확한 Cache-Control을 함께 설정한다.

### Backend 연결

CDN과 browser에서 header가 다르게 해석되지 않게 response contract를 테스트한다. server clock 동기화와 stale fallback 정책도 운영 기준에 포함한다.
