---
kind: concept
contentKey: backend.core.time-money.instant-zone
topicContentKey: backend.core.time-money
slug: instant-zone
title: "Instant와 timezone"
summary: "절대 시점과 사람이 해석하는 지역 시간을 분리해 저장·표시·예약 정책을 설계한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Instant.html"
    title: "Java SE 25 Instant"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "UTC timeline의 한 시점을 나타내는 Instant 계약을 확인한다."
---
# Instant와 timezone

`2026-08-31 09:00`만 저장하면 그 시간이 서울의 9시인지 뉴욕의 9시인지 알 수 없다. 반대로 `Instant`는 timeline의 한 지점을 명확히 표현하지만 사용자가 보는 달력 시간이나 반복 일정의 지역 규칙까지 포함하지 않는다.

### 저장하려는 것이 시점인지 지역 시간인지 먼저 구분한다

```text
2026-08-31 09:00 Asia/Seoul
           │ timezone rule 적용
           ▼
2026-08-31T00:00:00Z  ← Instant
```

주문 생성 시각, 결제 승인 시각처럼 이미 발생한 사건은 `Instant`로 저장하기 좋다. 반면 "매주 월요일 오전 9시 서울 시간에 실행" 같은 일정은 `LocalDateTime + ZoneId` 또는 해당 업무 규칙을 함께 보존해야 한다.

### timezone은 단순 offset이 아니다

`+09:00`은 특정 순간의 offset이고 `Asia/Seoul`은 지역의 시간 규칙을 나타낸다. DST를 사용하는 지역에서는 같은 지역도 날짜에 따라 offset이 달라질 수 있다.

| 값              | 표현하는 것                  |
| --------------- | ---------------------------- |
| `Instant`       | UTC timeline의 한 시점       |
| `LocalDateTime` | timezone 없는 달력 날짜/시간 |
| `ZoneId`        | 지역의 시간 규칙             |
| `ZonedDateTime` | 지역 규칙이 적용된 날짜/시간 |

### API 경계에서도 의도를 드러낸다

서버 내부 canonical timestamp를 `Instant`로 두더라도 API가 사용자 지역 시간을 받는다면 timezone을 명시적으로 받거나 계약에서 고정해야 한다. 서버 기본 timezone에 기대면 개발자 PC, CI, production에서 결과가 달라질 수 있다.

시간 오류는 계산식보다 **어떤 값을 저장했고 어떤 zone rule로 해석했는지**를 추적하는 것이 먼저다.
