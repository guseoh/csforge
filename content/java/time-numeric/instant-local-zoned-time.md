---
kind: concept
contentKey: java.core.time-numeric.instant-local-zoned-time
topicContentKey: java.core.time-numeric
slug: instant-local-zoned-time
title: "Instant, local time, and zoned time"
summary: "timeline 지점·local 표현·zone-aware 값을 구분한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Instant.html"
    title: "Java SE 25 API: Instant"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: UTC timeline point 의미 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZonedDateTime.html"
    title: "Java SE 25 API: ZonedDateTime"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: zone 기반 표현과 변환 확인
---
# Instant, local time, and zoned time

## 쉬운 진입

“언제 발생했는가”는 세계 어디서나 같은 한 점이고, “서울 사무실 달력에 몇 시로 보이는가”는
그 점을 zone으로 표현한 결과다. 반면 `LocalDateTime`은 날짜와 시각 숫자만 있어 timeline의
한 점이라고 할 수 없다.

## 정확한 메커니즘

```text
Instant 2026-01-01T00:00Z
      ├─ Asia/Seoul  -> 09:00
      └─ America/New_York -> 전날 19:00
```

`Instant`는 UTC 기준 timeline point, `LocalDateTime`은 zone/offset 없는 local 값,
`ZonedDateTime`은 local 값과 `ZoneId` 규칙을 결합한 값이다. 이벤트 발생 시각·만료 비교는
Instant가 자연스럽고, “매일 오전 9시 서울” 같은 사용자 일정은 local + ZoneId 정책으로
보관한 뒤 필요한 순간 timeline으로 해석한다.

## 실전·면접 연결

DB timestamp나 API 문자열에 어떤 의미를 저장하는지는 시스템 계약의 문제다. zone을 잃고
local 값만 저장하면 서버 위치가 바뀌었을 때 다른 순간으로 해석될 수 있다. `withZoneSameInstant`
와 `withZoneSameLocal`은 변환 의도가 다르므로 이름을 보고 선택한다.

## 흔한 오해

- `LocalDateTime`은 “시스템 기본 zone의 시간”이 아니다.
- `Instant`를 다른 zone으로 표시해도 timeline point 자체는 바뀌지 않는다.
- zone 문자열과 fixed offset은 동일한 미래 규칙을 제공하지 않는다.
