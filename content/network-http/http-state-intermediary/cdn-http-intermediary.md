---
kind: concept
contentKey: network-http.core.http-state-intermediary.cdn-http-intermediary
topicContentKey: network-http.core.http-state-intermediary
slug: cdn-http-intermediary
title: "CDN HTTP Intermediary"
summary: "edge cache와 origin fetch가 HTTP semantics를 바꾸는 지점을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# CDN HTTP Intermediary

CDN은 edge에서 client request를 받고 cache hit이면 origin까지 가지 않으며, miss나 stale이면 origin fetch 후 response를 저장할 수 있다. edge와 origin 사이에는 별도 TLS, header, cache key, timeout과 retry가 존재한다.

purge 지연, stale serving, compressed variant, signed URL과 range request가 client-visible semantics를 바꿀 수 있다. private·personalized response가 edge shared cache에 들어가지 않도록 명시적 policy를 둔다.

### Backend 연결

canonical content publish와 CDN purge를 하나의 atomic transaction으로 표현하지 않는다. purge 실패를 재시도하고, 사용자에게 현재 origin/indexing/cache 상태를 구분해 보여준다.
