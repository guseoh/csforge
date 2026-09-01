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

CDN은 여러 edge에 HTTP intermediary를 배치해 client 가까이에서 response를 전달하는 분산 reverse proxy/shared cache다. edge는 request의 cache key와 HTTP policy를 평가해 fresh hit이면 origin fetch 없이 response를 반환할 수 있고, miss나 revalidation이 필요하면 origin으로 별도 request를 보낸다. client-to-edge와 edge-to-origin은 별도 connection이므로 TLS, header, timeout, retry와 forwarding policy도 각각 존재한다.

CDN은 TLS termination, compression, range 처리, signed URL 검증, header rewrite와 edge function을 추가할 수 있다. 이 기능이 origin과 다른 `Content-Encoding`, `Vary`, authorization scope 또는 status를 만들면 cache key와 selected representation이 어긋날 수 있다. purge는 모든 edge의 object를 하나의 원자적 순간에 없앤다는 보장이 아니며, stale serving·in-flight response·전파 지연을 포함한 운영 policy가 필요하다. private·personalized response는 edge shared cache에 들어가지 않도록 명시적으로 제한한다.

CDN cache는 origin database의 복제본이나 application Redis cache-aside와 같은 책임을 갖지 않는다. origin에서 canonical content를 publish해도 각 edge가 새 body를 관찰하는 시점은 다를 수 있으므로 `Age`, cache status, ETag, purge 상태와 origin version을 함께 관찰한다. 공개 immutable content에는 versioned URL을 사용하면 purge 의존성을 줄일 수 있지만, 이전 object의 보존과 첫 요청의 cache miss 비용은 남는다.

### Backend 연결

canonical content publish와 CDN purge를 하나의 atomic transaction으로 표현하지 않는다. purge 실패를 재시도하고 edge별 상태를 관측하며, 사용자에게 현재 origin·Elasticsearch indexing·CDN cache 상태를 구분해 보여준다. 개인화 API response는 공개 curriculum edge object와 별도의 cache scope와 test fixture로 검증한다.
