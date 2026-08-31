---
kind: concept
contentKey: java.core.time-numeric.duration-period
topicContentKey: java.core.time-numeric
slug: duration-period
title: "Duration and Period"
summary: "시간 기반 Duration과 날짜 기반 Period의 계산 차이를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Duration.html"
    title: "Java SE 25 API: Duration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: seconds·nanos 기반 시간량 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Period.html"
    title: "Java SE 25 API: Period"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: year·month·day 기반 날짜량 확인
---
# Duration and Period

## 쉬운 진입

“90분 뒤”와 “한 달 뒤”는 모두 시간 차이처럼 보이지만 의미가 다르다. `Duration`은 초와
나노초 기반 양이고 `Period`는 년·월·일 기반 calendar 양이다.

## 정확한 메커니즘

```java
Instant start = Instant.parse("2026-01-01T00:00:00Z");
Instant end = start.plus(Duration.ofHours(24));
LocalDate nextMonth = LocalDate.of(2026, 1, 31).plus(Period.ofMonths(1));
```

calendar의 월 길이와 zone/DST가 있는 날짜 계산은 단순 초 덧셈과 같지 않다. `Duration`을
LocalDate에 무조건 적용할 수 없고, `Period`를 Instant의 timeline 차이로 해석할 수 없다.
어떤 type이 연산을 지원하는지도 API 계약에 따른다.

## 실전·면접 연결

타임아웃·경과 시간은 `Duration`, 생일·청구일·반복 일정은 `Period`와 zone-aware date가
자연스럽다. “하루”가 정확히 24시간인지 calendar 날짜 하나인지 먼저 업무 언어로 확정한다.

## 흔한 오해

- `Period.ofDays(1)`과 `Duration.ofHours(24)`는 모든 zone에서 같은 결과가 아니다.
- Period의 month를 고정된 초 수로 바꿀 수 없다.
- Duration은 formatting이나 timezone을 스스로 결정하지 않는다.
