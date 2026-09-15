---
kind: concept
contentKey: network-http.core.http-cache.expires
topicContentKey: network-http.core.http-cache
slug: expires
title: "Expires"
summary: "Expires가 response freshness의 absolute expiry time을 표현하고 Cache-Control과 어떤 우선순위를 갖는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Expires

`Expires`는 stored response를 언제부터 stale로 판단할지 absolute HTTP-date로 표현한다. Cache는 response의 `Date`와 age 계산을 함께 사용해 freshness lifetime을 결정한다.

예를 들어 다음과 같이 response가 특정 시각까지만 fresh하다고 표현할 수 있다.

```text
Date:    Tue, 15 Sep 2026 10:00:00 GMT
Expires: Tue, 15 Sep 2026 10:05:00 GMT
```

이 방식은 absolute clock에 의존하므로 origin과 intermediary의 clock 차이를 고려해야 한다. 상대적인 freshness lifetime을 표현할 때는 `Cache-Control: max-age`가 더 직접적이다.

같은 response에 유효한 `Cache-Control: max-age`가 있다면 freshness 계산에서 max-age가 Expires보다 우선한다. 따라서 둘을 함께 보낼 수는 있지만 recipient가 임의로 둘 중 하나를 고르는 것은 아니다.

Expires 시각이 지났다는 것은 response가 stale해졌다는 뜻이지 stored body가 즉시 삭제된다는 뜻은 아니다. Cache는 이후 validator를 이용해 revalidation하거나 다른 cache directive에 따라 처리할 수 있다. **Expires는 HTTP response의 freshness metadata이지 application data 자체의 업무 만료 시각을 정의하는 field가 아니다.**
