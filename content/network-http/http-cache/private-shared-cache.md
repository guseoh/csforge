---
kind: concept
contentKey: network-http.core.http-cache.private-shared-cache
topicContentKey: network-http.core.http-cache
slug: private-shared-cache
title: "개인 캐시와 공유 캐시"
summary: "한 사용자 에이전트가 쓰는 개인 캐시와 여러 사용자의 요청을 처리하는 공유 캐시의 범위를 구분한다."
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
# 개인 캐시와 공유 캐시

HTTP 캐시는 저장된 응답을 **누가 다시 사용할 수 있는가**에 따라 개인 캐시(private cache)와 공유 캐시(shared cache)로 나눌 수 있다. 개인 캐시는 보통 하나의 사용자 에이전트를 위해 동작하고, 공유 캐시는 프록시나 CDN처럼 여러 사용자의 요청을 같은 저장 응답으로 만족시킬 수 있다.

```text
개인 캐시
  → 한 사용자 에이전트 안에서 재사용

공유 캐시
  → 여러 클라이언트 요청 사이에서 재사용 가능
```

이 차이는 로그인 사용자마다 내용이 달라지는 응답에서 특히 중요하다. `Cache-Control: private`는 공유 캐시의 저장을 제한하면서 개인 캐시의 저장은 허용할 수 있다. `no-store`는 저장 자체를 더 강하게 제한한다. 공유 캐시에만 별도 신선도 수명(freshness lifetime)을 지정할 때는 `s-maxage`를 사용할 수 있다.

`Authorization`이 포함된 요청에 대한 응답은 공유 캐시에서 재사용 조건이 더 엄격하며, 공유 캐싱을 명시적으로 허용하는 지시어가 필요한 경우가 있다. 반대로 `Set-Cookie`가 존재한다는 사실만으로 HTTP 캐싱이 자동 금지되는 것은 아니다. 실제 캐시 가능 여부는 RFC의 캐시 규칙과 응답 지시어를 함께 봐야 한다.

가장 위험한 실수는 사용자별 표현을 공유 캐시에 저장하면서 사용자·테넌트 차이를 캐시 키에서 구분하지 않는 것이다. 이 경우 단순한 ‘오래된 데이터’ 문제가 아니라 **다른 사용자의 응답이 노출되는 정보 유출**이 될 수 있다.

따라서 캐시 정책을 정할 때는 `응답을 저장할 것인가`보다 먼저 **이 저장된 표현을 다른 누가 받아도 되는가**를 판단해야 한다.
