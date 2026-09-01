---
kind: concept
contentKey: network-http.core.http-cache.private-shared-cache
topicContentKey: network-http.core.http-cache
slug: private-shared-cache
title: "Private and Shared Cache"
summary: "사용자별 cache와 여러 사용자가 공유하는 cache의 안전 경계를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Private and Shared Cache

private cache는 보통 하나의 user agent 또는 한 사용자 context가 사용하는 cache이고, shared cache는 proxy·CDN처럼 여러 client의 요청이 같은 저장 entry를 재사용하는 cache다. browser memory/disk cache와 CDN object store를 같은 위치의 cache로 생각하면 안 된다. 두 cache는 같은 HTTP freshness 규칙을 적용할 수 있지만, 다른 사용자가 entry를 볼 수 있는지라는 보안 경계가 다르다.

`Cache-Control: private`는 response를 shared cache가 저장·재사용하지 않도록 제한하지만 private cache의 저장까지 금지하지는 않는다. `no-store`는 cache 종류와 관계없이 저장하지 않도록 하는 더 강한 지시이고, `s-maxage`는 shared cache에 적용할 lifetime을 별도로 줄 수 있다. `Vary`는 지정한 request header가 다르면 서로 다른 representation을 저장하게 하지만, cookie·authorization·tenant를 자동으로 안전하게 분리하거나 이미 잘못 저장된 entry를 지우지는 않는다.

Authorization이 붙은 요청, Cookie로 개인화된 response, `Set-Cookie`를 포함한 response는 shared cache가 기본적으로 조심스럽게 다루며, 명시적인 재사용 허용과 완전한 variation이 없으면 공유하지 않는 편이 안전하다. cache key에 URL만 넣고 사용자 identity를 생략하면 첫 사용자의 dashboard가 다음 사용자에게 제공될 수 있다. 반대로 공개 immutable content를 모두 private로 만들면 안전성은 높아져도 shared cache의 이점을 잃으므로, representation의 scope를 먼저 분류해야 한다.

### Backend 연결

Dashboard와 personal review response는 private 또는 no-store를 기본 후보로 검토하고, 공개 curriculum은 versioned representation만 shared cache 후보로 분리한다. Spring filter, reverse proxy, CDN이 서로 다른 cache key를 만들 수 있으므로, cache hit가 다른 사용자·tenant 데이터를 반환하지 않는 integration test와 이미 저장된 object의 purge 절차를 함께 검증한다.
