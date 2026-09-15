---
kind: concept
contentKey: network-http.core.http-cache.private-shared-cache
topicContentKey: network-http.core.http-cache
slug: private-shared-cache
title: "Private·Shared Cache"
summary: "하나의 user agent가 쓰는 private cache와 여러 사용자의 요청을 재사용하는 shared cache의 범위를 구분한다."
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
# Private·Shared Cache

HTTP cache는 누가 stored response를 재사용할 수 있는지에 따라 private cache와 shared cache로 나눌 수 있다. Private cache는 보통 하나의 user agent를 위해 동작하고, shared cache는 proxy나 CDN처럼 여러 user agent의 request를 만족시키기 위해 response를 저장한다.

```text
private cache
  → 한 user agent의 재사용

shared cache
  → 여러 client 사이에서 재사용 가능
```

이 차이는 개인화 response를 다룰 때 중요하다. `Cache-Control: private`는 shared cache의 저장을 막으면서 private cache의 저장은 허용할 수 있다. `no-store`는 저장 자체를 더 강하게 제한한다. Shared cache 전용 freshness를 지정할 때는 `s-maxage`를 사용할 수 있다.

Authorization이 포함된 request의 response는 shared cache에서 재사용 조건이 더 엄격하며, 명시적으로 shared caching을 허용하는 directive가 필요할 수 있다. 반대로 `Set-Cookie`가 존재한다는 사실만으로 HTTP caching이 자동 금지되는 것은 아니다.

따라서 cache policy를 정할 때는 단순히 `response를 cache할 것인가`만 볼 것이 아니라 **누가 같은 stored representation을 다시 받아도 되는가**를 먼저 정해야 한다.
