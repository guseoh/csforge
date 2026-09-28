---
kind: concept
contentKey: network-http.core.http-cache.expires
topicContentKey: network-http.core.http-cache
slug: expires
title: "Expires와 만료 시각"
summary: "Expires가 응답의 신선도 만료 시각을 HTTP-date로 표현하고 Date와 함께 신선도 수명을 계산하며 Cache-Control의 max-age가 우선하는 규칙을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Expires와 Date를 이용한 신선도 수명 계산, 현재 나이 계산, max-age 우선순위를 확인한다."
    displayOrder: 1
---
# Expires와 만료 시각

`Expires`는 저장된 응답을 **언제부터 오래된(stale) 응답으로 판단할지** 절대 HTTP 날짜 형식으로 알려 주는 응답 필드다. 다만 캐시가 자신의 현재 시각과 `Expires`만 단순 비교하는 것이 핵심은 아니다. RFC 9111의 기본 계산에서는 원본 서버가 보낸 `Date`와 `Expires`의 차이로 신선도 수명(freshness lifetime)을 구한다.

```text
Date:    Tue, 15 Sep 2026 10:00:00 GMT
Expires: Tue, 15 Sep 2026 10:05:00 GMT

신선도 수명 = Expires - Date = 5분
```

이렇게 두 값을 같은 응답에서 함께 사용하면 캐시와 원본 서버의 시계가 조금 다르더라도 `Expires`의 절대 시각만 직접 비교하는 것보다 시계 차이의 영향을 줄일 수 있다. 실제 재사용 가능 여부는 이 신선도 수명과 응답의 현재 나이(current age)를 비교해 판단한다.

```text
current age < freshness lifetime
  → fresh

current age >= freshness lifetime
  → stale
```

### max-age가 있으면 Expires보다 우선한다

같은 응답에 유효한 `Cache-Control: max-age`가 있으면 캐시는 `Expires`보다 `max-age`를 우선해 신선도 수명을 정한다. `max-age`는 응답 생성 시각을 기준으로 한 상대적인 재사용 시간을 직접 표현하므로 현대 HTTP 캐시 정책에서 더 명확하게 사용하기 쉽다.

| 응답 필드 | 표현 방식 | 신선도 수명 계산에서의 역할 |
| --- | --- | --- |
| `Expires` | 절대 HTTP 날짜 | 보통 `Expires - Date`로 수명을 계산 |
| `Cache-Control: max-age=N` | 상대 시간(초) | 존재하면 `Expires`보다 우선 |

`Expires` 값이 유효하지 않거나 `Date`보다 이르거나 같다면 캐시는 응답을 이미 오래된 것으로 취급할 수 있다. 따라서 서버는 `Date`, `Expires`, `Cache-Control`을 서로 모순되게 생성하지 않아야 한다.

### 새 헤더를 배포해도 이미 저장된 응답이 자동으로 바뀌지는 않는다

캐시가 이미 이전 응답을 저장했다면 나중에 원본 서버의 `Expires`나 `Cache-Control` 설정을 바꿨다고 해서 그 저장 항목의 메타데이터가 즉시 소급 변경되는 것은 아니다. 기존 항목이 재검증되거나 새 응답으로 교체되어야 새 정책이 반영된다. 긴 캐시 수명을 잘못 배포했다면 CDN 무효화(purge)나 버전이 포함된 URL 같은 별도 운영 조치가 필요할 수 있다.

### Expires는 업무 데이터의 만료 시각이 아니다

`Expires`가 지났다는 것은 HTTP 캐시 관점에서 원본 확인 없이 재사용할 수 있는 신선한 기간이 끝났다는 뜻이지, 저장된 응답 본문을 즉시 삭제해야 한다는 뜻은 아니다. 검증자(validator)가 있으면 조건부 재검증을 수행할 수 있다.

또한 `Expires`는 쿠폰 만료, 세션 만료, 데이터베이스 보존 기간 같은 **업무 규칙의 만료 시각을 정의하지 않는다.** HTTP 캐시 재사용 정책과 도메인 유효 기간은 별도로 설계해야 한다.

핵심은 **`Expires`가 절대 HTTP 날짜를 전달하더라도 신선도 수명은 `Date`와의 차이를 바탕으로 계산하며, 유효한 `max-age`가 있으면 그것이 우선한다는 점**이다.
