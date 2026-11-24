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
    displayOrder: 1
---
# Expires와 만료 시각

Expires는 응답이 stale 상태로 간주될 시점을 HTTP 날짜로 나타냅니다. 일반적으로 캐시는 Expires와 Date의 차이로 신선도 수명을 구하고 현재 나이와 비교합니다.

```http
Date: Tue, 15 Sep 2026 10:00:00 GMT
Expires: Tue, 15 Sep 2026 10:05:00 GMT
```

이 예의 신선도 수명은 300초입니다. 캐시에 저장한 순간부터 무조건 300초를 새로 부여하는 것은 아닙니다. 응답의 현재 나이는 이전 홉에서 이미 경과한 시간도 반영합니다.

### 우선순위

공유 캐시에서 적용 가능한 s-maxage가 있으면 우선하고, max-age가 있으면 Expires보다 우선합니다. Expires가 유효하지 않으면 과거 시각으로 처리합니다. Date가 없는 경우의 계산 규칙은 RFC 9111 §4.2.1에 따릅니다.

원본에서 Expires를 수정해도 이미 저장된 응답의 수명이 소급 변경되지는 않습니다. 재검증·교체 또는 필요한 캐시 무효화로 변경을 반영해야 합니다.

stale은 본문을 즉시 삭제하라는 뜻이 아닙니다. ETag 등을 사용한 재검증이 가능할 수 있습니다. HTTP 신선도와 쿠폰·세션 등의 업무 만료 시점도 별개입니다.
