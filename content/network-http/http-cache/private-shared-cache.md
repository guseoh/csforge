---
kind: concept
contentKey: network-http.core.http-cache.private-shared-cache
topicContentKey: network-http.core.http-cache
slug: private-shared-cache
title: "Private and Shared Cache"
summary: "사용자별 private cache와 여러 사용자가 공유하는 shared cache의 저장·재사용 보안 경계를 비교한다."
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

private cache는 하나의 user agent가 사용하는 cache이고, shared cache는 proxy·CDN처럼 여러 user agent의 request를 만족시키기 위해 response를 저장하는 cache다. browser cache와 CDN object store를 단순히 같은 위치의 cache라고 생각하면 안 된다. freshness 규칙은 공유할 수 있어도 **누가 저장된 representation을 재사용할 수 있는지**라는 보안 경계가 다르다.

`Cache-Control: private`는 unqualified 형태에서 shared cache가 response를 저장하지 못하게 하지만 private cache의 저장은 허용할 수 있다. `no-store`는 private/shared cache 모두에 더 강한 저장 금지 contract를 적용한다. `s-maxage`는 shared cache의 freshness lifetime을 따로 지정하고, `public`은 다른 조건 때문에 shared cache 저장이 금지될 response도 명시적으로 cacheable하게 만들 수 있다.

특히 request에 `Authorization` header가 있으면 RFC 9111에서 **shared cache는 원칙적으로 그 response를 subsequent request에 재사용하면 안 된다.** response에 `public`, `s-maxage`, `must-revalidate`처럼 authenticated response의 shared caching을 명시적으로 허용하는 directive가 있을 때만 해당 directive의 요구사항에 따라 공유할 수 있다. 이것은 구현 관행이 아니라 normative shared-cache boundary다.

반대로 `Set-Cookie` response header가 있다는 사실 자체는 HTTP caching을 금지하지 않는다. cacheable response에 `Set-Cookie`가 있어도 cache가 저장·재사용할 수 있으므로, 개인화되거나 민감한 representation이면 server가 적절한 `private`/`no-store` 정책과 representation variation을 직접 지정해야 한다. Cookie나 tenant identity가 representation을 바꾼다면 URL만으로 shared cache key를 구성하지 말고 실제 선택 경계를 cache policy에 반영한다.

`Vary`는 지정된 request header 값이 다른 stored response를 선택하지 못하도록 secondary cache-key 역할을 하지만 authorization policy를 자동으로 만들어 주거나 이미 잘못 저장된 entry를 제거하지 않는다. 개인 데이터에 필요한 cache boundary를 먼저 정한 뒤 `Vary`를 representation negotiation에 맞게 사용한다.

### Backend 연결

Dashboard와 personal review response는 private 또는 no-store를 기본 후보로 검토하고, 공개 curriculum처럼 사용자별 상태와 무관한 versioned representation만 shared cache 후보로 분리한다. Spring filter, reverse proxy와 CDN의 cache key·Authorization 처리·Cookie variation을 integration test하고, 잘못 공유된 object가 발견되면 header 수정만 하지 말고 purge와 노출 범위 확인도 함께 수행한다.
