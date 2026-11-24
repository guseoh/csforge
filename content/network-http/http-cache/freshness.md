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

HTTP 캐시는 응답의 현재 나이(current age)와 신선도 수명(freshness lifetime)을 비교합니다. 현재 나이가 수명보다 작으면 fresh이고 그 이상이면 stale입니다. 수명은 max-age, 공유 캐시의 s-maxage, Expires 등의 적용 가능한 규칙에 따라 결정합니다.

현재 나이는 이번 캐시에 저장한 뒤 경과한 시간만 뜻하지 않습니다. Date, Age, 전달 지연과 자체 저장 기간 등을 반영합니다.

### 제한적인 stale 재사용

```http
Cache-Control: max-age=60, stale-while-revalidate=30
```

![HTTP 응답의 신선도와 제한적 stale 재사용: max-age=60과 stale-while-revalidate=30 예시. 현재 나이 60초 미만은 fresh, 60~90초 미만은 조건부 stale 허용, 90초부터 해당 허용 기간 종료.](/learning/network-http/http-cache-freshness.svg)

그림에서는 현재 나이 60초 미만이 fresh입니다. 다른 조건이 허용할 때 60초부터 90초 미만까지 오래된 응답을 먼저 제공하면서 백그라운드 재검증을 수행할 수 있습니다. 90초부터 이 확장 지시어에 따른 허용 범위는 끝납니다.

ETag 같은 검증자가 있다면 조건부 요청으로 304를 받아 메타데이터를 갱신할 수 있습니다. 검증자가 없으면 일반 요청으로 새 표현을 확보해야 할 수 있습니다. 재검증 결과에 따라 신선도 상태도 다시 계산됩니다.

fresh는 캐시 정책의 판단이지 DB에서 읽은 최신 가격, 재고, 권한의 유효성을 보장하지 않습니다. 업무 데이터는 별도 정책이 필요합니다.
