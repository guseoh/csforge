---
kind: concept
contentKey: network-http.core.http-cache.freshness
topicContentKey: network-http.core.http-cache
slug: freshness
title: "응답 신선도(Freshness)"
summary: "HTTP 캐시가 저장된 응답의 현재 나이와 신선도 수명을 비교해 신선도(신선함·오래됨)를 판단하고, stale-while-revalidate 같은 제한적 오래된 응답 사용 규칙을 적용하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc5861"
    title: "HTTP Cache-Control Extensions for Stale Content"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "stale-while-revalidate와 stale-if-error가 오래된 응답의 제한적 재사용을 허용하는 조건을 확인한다."
    displayOrder: 2
---
# 응답 신선도(Freshness)

HTTP 캐시가 응답을 저장했다고 해서 언제까지 원본 서버에 묻지 않고 사용할 수 있는지는 자동으로 정해지지 않는다. 캐시는 저장된 응답의 **현재 나이(current age)**와 **신선도 수명(freshness lifetime)**을 비교해 응답이 신선한지 오래됐는지 판단한다.

신선도 수명은 `Cache-Control: max-age`나 `Expires` 같은 메타데이터에서 결정될 수 있다. 현재 나이는 원본에서 응답이 생성된 뒤 지난 시간과 중간 캐시에 머문 시간 등을 반영하므로 단순히 `내 캐시에 저장한 시각부터 N초`와 완전히 같은 개념은 아니다.

```text
current age < freshness lifetime
  → 신선한 응답

current age >= freshness lifetime
  → 오래된 응답
```

신선한 응답은 다른 캐시 조건이 허용한다면 원본 서버의 검증 없이 재사용할 수 있다. 반대로 오래된 응답은 일반적으로 검증자(validator)를 이용해 재검증하거나 새 표현을 받아야 한다.

### 오래된 응답도 곧바로 폐기할 필요는 없다

오래된 응답이 되었다고 저장 본문을 즉시 버려야 하는 것은 아니다. `ETag`나 `Last-Modified` 같은 검증자가 있다면 조건부 요청으로 원본에 현재 표현이 바뀌었는지 확인할 수 있다.

```text
저장된 응답 + ETag
      ↓ 오래됨
If-None-Match로 재검증
      ↓
변경 없음 → 304 + 기존 본문 재사용
변경 있음 → 새 응답으로 교체
```

304는 **조건부 요청에 사용할 수 있는 검증자가 있고 조건 평가 결과가 맞을 때** 가능한 결과다. 검증자가 없다고 해서 캐시가 304를 임의로 기대할 수 있는 것은 아니며, 그 경우 새 표현을 받는 일반 요청이 필요할 수 있다.

### stale-while-revalidate는 오래된 응답을 잠시 제공하면서 뒤에서 재검증할 수 있게 한다

RFC 5861의 `stale-while-revalidate` 지시어는 응답이 기본 신선도 수명을 지난 뒤에도 지정된 시간 동안 캐시가 오래된 응답을 먼저 제공하면서 뒤에서 다시 확인할 수 있게 한다.

```http
Cache-Control: max-age=60, stale-while-revalidate=30
```

```text
0~59초
→ fresh, 일반 재사용 가능

60~89초
→ 오래됐지만 `stale-while-revalidate` 허용 범위 안
→ 기존 응답을 제공하면서 재검증 가능

90초 이후
→ 오래된 응답을 허용하는 기간도 종료
```

검증자가 있으면 백그라운드 요청을 조건부 요청으로 보내 304를 받을 수 있고, 표현이 바뀌었다면 새 200 응답으로 저장 항목을 교체할 수 있다. 검증자가 없다면 새 표현을 다시 받아야 할 수 있다.

이 기능은 지연을 줄이는 데 유용하지만 **프로토콜이 오래된 응답을 허용한다고 해서 업무적으로 그 데이터가 허용되는 것은 아니다.** 가격, 재고, 권한처럼 오래된 값의 영향이 큰 데이터는 HTTP 캐시 허용 시간보다 더 엄격한 도메인 정책이 필요할 수 있다.

### 신선한 응답도 업무 데이터가 반드시 최신이라는 뜻은 아니다

HTTP에서 신선한(fresh) 응답은 **캐시 정책상 원본 서버에 다시 확인하지 않고 재사용할 수 있는 상태**라는 뜻이다. 데이터베이스 값과 완전히 같다는 보장, 가격이나 권한의 업무적 유효성, 저장 내구성까지 의미하지 않는다.

핵심은 **현재 나이와 신선도 수명을 비교해 응답이 신선한지 오래됐는지 판단하고, 오래된 응답은 검증자와 명시적인 stale 허용 지시어가 있을 때 제한적으로 재사용할 수 있다는 점**이다.
