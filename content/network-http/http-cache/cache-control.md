---
kind: concept
contentKey: network-http.core.http-cache.cache-control
topicContentKey: network-http.core.http-cache
slug: cache-control
title: "Cache-Control"
summary: "max-age·no-cache·no-store·must-revalidate 등 cache directive를 저장·재사용 경계로 해석한다."
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

`Cache-Control`은 cache가 응답을 저장할 수 있는지, 얼마나 오래 fresh로 볼지, stale 응답을 어떤 조건에서 재사용할 수 있는지를 표현하는 HTTP 지시다. `max-age=60`은 HTTP 규칙으로 계산한 응답의 current age가 60초를 초과하면 stale이 되도록 freshness lifetime을 제공한다. 이는 local cache가 응답을 받은 시점부터 단순히 60초만 세는 timer도 아니고, stale이 되는 즉시 body를 반드시 삭제하라는 뜻도 아니다.

`no-cache`는 저장 자체를 금지하지 않는다. 다만 응답 directive의 `no-cache`가 있으면 **그 응답을 다른 요청에 재사용하기 전에 origin 검증을 성공시켜야 한다.** `no-store`는 immediate 요청과 응답의 어떤 부분도 cache가 의도적으로 저장하지 않도록 요구하며 private/shared cache 모두에 적용된다. 따라서 `max-age=0`, `no-cache`, `no-store`를 모두 “cache하지 않는다”로 뭉뚱그리면 저장 가능 여부와 재검증 contract를 잃는다.

`must-revalidate`는 더 강한 stale 재사용 제약이다. 응답이 stale이 된 뒤에는 **origin에서 성공적으로 검증하기 전까지 다시 사용해서는 안 된다.** cache가 origin에 연결할 수 없는 상황에서도 임의로 stale 응답을 제공하면 안 되며, 이 경우 cache는 error 응답을 생성해야 한다. `s-maxage`는 shared cache에서 `max-age`와 `Expires`보다 우선하는 freshness lifetime을 지정하고 shared cache에 대해 `proxy-revalidate`와 같은 stale 재검증 제약도 포함한다.

요청의 `Cache-Control`과 응답 directive도 구분한다. 요청의 `no-cache`는 client가 저장된 응답을 성공적인 검증 없이 사용하지 않기를 요청하는 의미이고, 요청 `no-store`는 해당 요청과 응답을 저장하지 말라는 의미다. `private`, `public`, `Vary`, authenticated 요청 규칙처럼 cache 범위와 representation 선택을 조정하는 계약은 private/shared cache와 함께 해석해야 한다.

### Backend 연결

개인화된 review 응답에는 `private` 또는 필요하면 `no-store`를 선택하고, 공개 curriculum처럼 공유 가능한 representation만 shared cache 후보로 삼는다. canonical content를 reimport한 직후에도 이미 저장된 HTTP 응답은 자체 freshness/revalidation contract를 따르므로, DB commit과 HTTP cache 전파를 하나의 완료 상태로 표시하지 않는다.
