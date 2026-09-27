---
kind: concept
contentKey: network-http.core.http-cache.cache-control
topicContentKey: network-http.core.http-cache
slug: cache-control
title: "Cache-Control 지시어"
summary: "max-age·no-cache·no-store·must-revalidate가 저장·신선도·재사용 조건을 어떻게 나누어 제어하는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
  - url: "https://toss.tech/article/smart-web-service-cache"
    title: "웹 서비스 캐시 똑똑하게 다루기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "브라우저 HTTP 캐시와 재검증을 적용한 사례다. 지시어의 규범적 의미와 예외는 RFC 9111을 기준으로 읽는다."
    displayOrder: 2
    relationNote: "Cache-Control·validator를 활용한 브라우저 캐시 운영 사례로 보완한다. 일부 브라우저 동작을 표준 보장으로 일반화하지 않는다."
---
# Cache-Control 지시어

`Cache-Control`은 HTTP 캐시가 응답을 **저장할 수 있는지, 얼마나 오래 신선하다고 볼지, 언제 원본 서버에 다시 확인해야 하는지**를 지시어별로 나누어 표현한다. 그래서 `캐시한다 / 캐시하지 않는다` 두 가지로만 이해하면 중요한 차이를 놓치게 된다.

`max-age=N`은 응답의 freshness lifetime을 초 단위로 정한다. 현재 age가 이 범위 안이면 다른 제약이 없는 한 캐시는 원본 서버에 다시 묻지 않고 응답을 재사용할 수 있다.

`no-cache`는 이름과 달리 저장을 금지하는 지시어가 아니다. 저장된 응답을 다른 요청에 재사용하기 전에 원본 서버에서 **성공적으로 검증(validation)**해야 한다는 뜻이다. 반면 `no-store`는 요청 또는 응답을 의도적으로 저장하지 않도록 요구한다.

`must-revalidate`는 응답이 stale 상태가 된 뒤 원본 검증 없이 임의로 재사용하는 것을 제한한다. 공유 캐시에서는 `s-maxage`로 개인 캐시와 다른 freshness lifetime을 줄 수 있다.

```text
max-age          → 얼마 동안 fresh한가
no-cache         → 재사용 전에 원본 검증 필요
no-store         → 저장하지 않음
must-revalidate  → stale 상태에서 검증 없는 재사용 제한
```

요청과 응답 양쪽에 `Cache-Control`이 나타날 수 있고 같은 이름의 지시어라도 적용 맥락을 확인해야 한다. `private`, `public` 같은 지시어는 누가 저장된 응답을 공유해서 사용할 수 있는지에도 영향을 준다.

예를 들어 로그인 사용자마다 내용이 다른 응답에 무심코 `public`을 붙이면 공유 캐시가 서로 다른 사용자의 응답을 재사용하는 정보 노출로 이어질 수 있다. 따라서 캐시 정책은 성능 옵션이 아니라 **누가 어떤 응답을 얼마 동안 재사용해도 되는지 정하는 HTTP 계약**으로 다뤄야 한다.
