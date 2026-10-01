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

`Cache-Control`은 HTTP 캐시가 응답을 **저장할 수 있는지, 얼마나 오래 신선하다고 볼지, 언제 원본 서버에 다시 확인해야 하는지**를 여러 지시어로 나누어 표현한다. 그래서 `캐시한다 / 캐시하지 않는다` 두 가지로만 이해하면 중요한 차이를 놓치게 된다.

### max-age는 신선도 수명을 정한다

`max-age=N`은 응답의 신선도 수명을 초 단위로 정한다. 현재 나이(current age)가 이 수명 안이면 다른 제약이 없는 한 캐시는 원본 서버에 다시 묻지 않고 응답을 재사용할 수 있다.

```http
Cache-Control: max-age=60
```

응답의 현재 나이가 60초보다 작으면 일반적으로 신선한 상태다.

### no-cache는 저장 금지가 아니라 재사용 전 검증 요구다

`no-cache`는 이름 때문에 `저장하지 말라`고 오해하기 쉽지만, 핵심은 **저장된 응답을 다른 요청에 재사용하기 전에 원본 서버에서 성공적으로 검증하라**는 의미다.

ETag 같은 검증자가 있다면 다음처럼 저장된 본문을 유지하면서 재검증할 수 있다.

```text
저장된 응답 + ETag
      ↓
재사용 전에 If-None-Match로 검증
      ↓
변경 없음 → 304 + 기존 본문 재사용
```

### no-store는 저장 자체를 제한한다

`no-store`는 캐시가 요청이나 응답을 의도적으로 저장하지 않도록 요구한다. 따라서 `no-cache`와 `no-store`를 모두 `캐시하지 않는다`라고 외우면 **저장은 가능하지만 매번 검증해야 하는 경우**와 **저장 자체를 제한하는 경우**를 구분하지 못한다.

### must-revalidate는 오래된 응답의 임의 재사용을 제한한다

`must-revalidate`는 응답이 오래된 상태가 된 뒤 원본 서버와의 검증 없이 임의로 재사용하는 것을 제한한다. 공유 캐시에는 `s-maxage`를 사용해 개인 캐시와 다른 신선도 수명을 지정할 수 있다.

```text
max-age          → 신선한 상태가 유지되는 기간
no-cache         → 재사용 전에 원본 검증 필요
no-store         → 저장 자체를 제한
must-revalidate  → 오래된 응답을 검증 없이 재사용하지 못하게 제한
s-maxage         → 공유 캐시에 적용할 별도 신선도 수명
```

### 캐시 정책은 정보 노출 경계이기도 하다

요청과 응답 양쪽에 `Cache-Control`이 나타날 수 있고 같은 이름의 지시어라도 적용 맥락을 확인해야 한다. `private`, `public` 같은 지시어는 저장된 응답을 누가 공유해 사용할 수 있는지에도 영향을 준다.

예를 들어 로그인 사용자마다 내용이 다른 응답에 무심코 `public`을 붙이면 공유 캐시가 한 사용자의 응답을 다른 사용자 요청에 재사용하는 정보 노출로 이어질 수 있다.

따라서 캐시 정책은 단순 성능 옵션이 아니라 **누가 어떤 응답을 저장하고, 얼마 동안 어떤 조건으로 재사용해도 되는지 정하는 HTTP 계약**으로 다뤄야 한다.
