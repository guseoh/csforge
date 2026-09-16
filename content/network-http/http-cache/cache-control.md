---
kind: concept
contentKey: network-http.core.http-cache.cache-control
topicContentKey: network-http.core.http-cache
slug: cache-control
title: "Cache-Control"
summary: "max-age·no-cache·no-store·must-revalidate 같은 directive가 저장·freshness·재사용 조건을 제어하는 방식을 설명한다."
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

`Cache-Control`은 HTTP cache가 response를 저장하고 재사용할 때 적용할 policy를 directive로 전달한다. Directive마다 담당하는 질문이 다르기 때문에 `cache한다 / 안 한다` 하나로 단순화하면 의미를 잃는다.

`max-age=N`은 response의 freshness lifetime을 정한다. `no-cache`는 저장을 금지하는 지시가 아니라, stored response를 다른 request에 재사용하기 전에 successful validation을 요구한다. `no-store`는 request 또는 response를 의도적으로 저장하지 않도록 요구한다.

`must-revalidate`는 response가 stale해진 뒤 origin validation 없이 재사용하지 못하도록 제한한다. Shared cache에서는 `s-maxage`로 별도의 freshness lifetime을 지정할 수 있다.

```text
max-age       → 얼마나 오래 fresh한가
no-cache      → 재사용 전에 validation 필요
no-store      → 저장하지 않음
must-revalidate → stale 상태에서 임의 재사용 금지
```

Request와 response 양쪽에 Cache-Control이 나타날 수 있으며 directive 의미도 context에 따라 달라질 수 있다. 또한 `private`, `public` 같은 directive는 누가 stored response를 공유해서 사용할 수 있는지에 영향을 준다.

핵심은 **Cache-Control이 storage 여부, freshness와 stale reuse를 서로 다른 directive로 제어하는 HTTP cache contract**라는 점이다.
