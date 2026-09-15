---
kind: concept
contentKey: network-http.core.http-cache.freshness
topicContentKey: network-http.core.http-cache
slug: freshness
title: "Freshness"
summary: "HTTP cache가 stored response의 age와 freshness lifetime을 비교해 fresh·stale을 판단하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Freshness

HTTP cache가 response를 저장했다고 해서 언제까지 origin에 묻지 않고 사용할 수 있는지는 자동으로 정해지지 않는다. Cache는 stored response의 **current age**와 **freshness lifetime**을 비교해 response가 fresh한지 stale한지 판단한다.

Freshness lifetime은 `Cache-Control: max-age`나 `Expires` 같은 metadata에서 결정될 수 있다. Current age는 origin에서 생성된 뒤의 시간과 intermediary에 머문 시간 등을 반영하므로 단순히 `내 cache에 저장한 시각부터 N초`와 완전히 같은 개념은 아니다.

```text
current age < freshness lifetime
  → fresh

current age >= freshness lifetime
  → stale
```

Fresh response는 다른 cache 조건이 허용한다면 origin validation 없이 재사용할 수 있다. 반대로 stale response는 일반적으로 validator를 사용해 revalidation하거나 새 representation을 받아야 한다. 다만 명시적인 stale-serving directive가 있다면 제한된 조건에서 stale response를 사용할 수도 있다.

여기서 fresh는 **HTTP cache policy상 재사용 가능한 상태**라는 뜻이다. Application data가 업무적으로 최신인지, database 값과 동일한지는 별도의 문제다.
