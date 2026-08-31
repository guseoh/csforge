---
kind: concept
contentKey: network-http.core.http-cache.intermediary-cache
topicContentKey: network-http.core.http-cache
slug: intermediary-cache
title: "Intermediary Cache"
summary: "proxy/CDN cache가 origin과 client 사이에서 freshness를 판단하는 경계를 설명한다."
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
# Intermediary Cache

intermediary cache는 client와 origin 사이에서 response를 저장하고 freshness·validator·request directive에 따라 origin fetch를 생략하거나 재검증한다. CDN과 reverse proxy가 각자 cache key, purge, stale serving, compression variant를 가질 수 있다.

origin이 새 content를 commit했다고 모든 edge가 동시에 바뀌지 않는다. cache invalidation, versioned URL, surrogate key와 사용자 scope를 조합해 전파 지연을 관리한다.

### Backend 연결

canonical PostgreSQL 변경과 Elasticsearch/cache projection의 완료 시점을 분리한다. stale search result를 허용할지, 사용자에게 indexing status를 보여줄지 명시한다.
