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

intermediary cache는 client와 origin 사이에서 HTTP response를 저장하는 shared cache다. 요청이 들어오면 cache는 URI와 `Vary`로 선택한 key를 찾고, entry가 fresh하면 origin까지 요청을 전달하지 않고 반환할 수 있다. miss이면 origin에서 response를 받아 저장하고, stale entry이면 `If-None-Match`나 `If-Modified-Since`로 revalidation을 수행해 304일 때 기존 body를 갱신해 재사용하거나, 변경된 200 response로 교체한다.

여러 intermediary가 있으면 browser, reverse proxy, CDN edge가 각자 별도 entry와 age를 가질 수 있다. `Cache-Control`, request directive, `Vary`, authorization과 representation variant가 각 단계의 저장·재사용 여부에 영향을 주며, reverse proxy라는 역할이 있다고 해서 반드시 cache가 있는 것은 아니다. 반대로 cache purge를 실행해도 이미 다른 edge에 복제된 entry, 진행 중인 요청, stale 제공 정책까지 자동으로 하나의 원자적 상태가 되는 것은 아니다.

origin의 canonical data가 바뀌었다는 사실과 모든 intermediary가 새 response를 관찰했다는 사실은 다르다. 운영자는 `Age`, cache hit/miss 헤더, ETag, edge별 cache 상태를 확인하고, public immutable content에는 versioned URL을 사용하거나 필요할 때 purge와 짧은 lifetime을 조합한다. 이 HTTP intermediary cache는 애플리케이션 내부 Redis cache-aside와 다른 계층이므로, 한쪽을 비웠다고 다른 쪽의 entry도 사라진다고 가정하지 않는다.

### Backend 연결

CSForge에서 PostgreSQL canonical content의 commit, Elasticsearch projection 반영, HTTP intermediary cache의 revalidation은 서로 다른 완료 시점이다. stale search result를 허용할지와 공개 curriculum response를 언제 purge할지는 각각의 contract로 정하고, HTTP cache hit가 DB 또는 Elasticsearch의 현재 상태를 직접 확인했다는 뜻으로 표시하지 않는다.
