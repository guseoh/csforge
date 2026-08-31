---
kind: concept
contentKey: java.core.time-numeric.zoneid-dst
topicContentKey: java.core.time-numeric
slug: zoneid-dst
title: "ZoneId and daylight saving time"
summary: "fixed offset과 ZoneId, DST gap·overlap을 처리한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZoneId.html"
    title: "Java SE 25 API: ZoneId"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 지역 시간대 규칙 ID 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZonedDateTime.html"
    title: "Java SE 25 API: ZonedDateTime"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: gap·overlap local time 조정 규칙 확인
---
# ZoneId and daylight saving time

## 쉬운 진입

`+09:00`은 그 순간의 고정 offset이고, `Europe/Paris` 같은 `ZoneId`는 날짜에 따라 offset이
바뀔 수 있는 지역 규칙이다. DST 전환일에는 시계가 앞으로 뛰거나 뒤로 겹치므로 local 시각을
timeline으로 바꾸는 일이 항상 일대일이지 않다.

## 정확한 메커니즘

```text
gap:    01:59 -> 03:00   존재하지 않는 02:30
overlap:02:59 -> 02:00  02:30이 두 timeline 후보
```

`ZonedDateTime.of(LocalDateTime, ZoneId)` 같은 factory의 gap/overlap 기본 조정은 API 문서를
확인하고, 사용자 예약처럼 모호성이 중요하면 `withEarlierOffsetAtOverlap` 또는
`withLaterOffsetAtOverlap` 등 명시적 정책을 선택한다. 고정 offset은 DST 규칙을 추적하지 않는다.

## 실전·면접 연결

시간대 데이터의 source와 zone 규칙 버전은 운영 환경의 중요한 입력이다. “서버 timezone을
따른다”는 숨은 기본값 대신 사용자 zone을 명시하고, gap 입력을 보정할지 거부할지 문서화한다.
OS timezone database를 Java가 어떻게 배포하는지는 runtime/JDK 배포의 문제이며 언어가
모든 변경 시점을 영원히 고정한다는 뜻은 아니다.

## 흔한 오해

- offset `+09:00`만으로 지역의 DST 미래 규칙을 알 수 없다.
- 모든 local date-time에 정확히 하나의 offset이 대응하는 것은 아니다.
- gap을 API가 조정했다고 그것이 업무적으로 올바른 예약 정책이라는 뜻은 아니다.
