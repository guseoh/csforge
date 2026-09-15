---
kind: concept
contentKey: java.core.time-numeric.zoneid-dst
topicContentKey: java.core.time-numeric
slug: zoneid-dst
title: "ZoneId와 서머타임 전환"
summary: "고정 offset과 지역 시간대 규칙을 구분하고 DST로 생기는 존재하지 않거나 중복되는 시간을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZoneId.html"
    title: "Java SE 25 API: ZoneId"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 지역 시간대 규칙을 식별하는 ZoneId 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZonedDateTime.html"
    title: "Java SE 25 API: ZonedDateTime"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: DST gap·overlap에서 local time을 해석하는 규칙 확인
---
# ZoneId와 서머타임 전환

`+01:00` 같은 offset과 `Europe/Paris` 같은 `ZoneId`는 표현하는 정보가 다릅니다. Offset은 특정 시점에서 UTC와 얼마나 차이 나는지를 나타내고, `ZoneId`는 **날짜에 따라 어떤 offset을 적용해야 하는지 결정하는 지역 시간대 규칙의 식별자**입니다.

이 차이는 서머타임(DST)을 사용하는 지역에서 특히 중요합니다.

![DST 전환의 gap과 overlap](/learning/java/dst-gap-overlap.svg)

### 고정 offset과 지역 규칙을 구분한다

```java
ZoneOffset offset = ZoneOffset.of("+01:00");
ZoneId paris = ZoneId.of("Europe/Paris");
```

고정 offset은 항상 같은 UTC 차이를 나타냅니다. 반면 `Europe/Paris`는 날짜에 따라 UTC+1 또는 UTC+2처럼 다른 offset이 적용될 수 있습니다.

따라서 현재 offset 하나만 저장했다고 해서 그 지역의 미래 시간대 규칙까지 보존한 것은 아닙니다. 장기 예약이나 반복 일정에서 "그 지역의 현지 시각"이 중요하다면 `ZoneId` 자체가 의미 있는 정보입니다.

### DST 시작에는 존재하지 않는 local 시간이 생길 수 있다

시계를 앞으로 이동하는 전환에서는 어떤 local 시간이 실제 timeline에 존재하지 않을 수 있습니다.

```text
01:58
01:59
03:00  <- 시계가 앞으로 이동
03:01
```

이때 `02:30`은 local 날짜·시각으로 적을 수 있지만 대응하는 실제 순간이 없습니다. 이런 구간을 **gap**이라고 합니다.

Java API는 local date-time과 zone을 결합할 때 gap을 처리하는 규칙을 갖고 있지만, API가 값을 만들어 준다는 사실과 그 보정이 예약 정책상 올바르다는 것은 별개입니다. 업무상 허용하지 않아야 한다면 전환 구간을 별도로 검증해야 합니다.

### DST 종료에는 같은 local 시간이 두 번 나타날 수 있다

시계를 뒤로 돌리는 전환에서는 같은 local 시각이 서로 다른 두 offset으로 반복될 수 있습니다.

```text
02:30 + offset A
02:30 + offset B
```

이런 **overlap**에서는 `02:30`이라는 `LocalDateTime`만으로 하나의 `Instant`를 정할 수 없습니다. 어떤 offset을 사용할지 정책이 필요합니다.

`ZonedDateTime`은 overlap에서 사용할 offset을 선택하는 API를 제공하지만, 어떤 후보가 사용자의 의도에 맞는지는 애플리케이션 요구사항이 결정합니다.

### 달력상의 하루와 정확한 24시간은 다를 수 있다

사용자가 "매일 현지 오전 9시"를 원한다면 보통 달력상의 다음 날 오전 9시를 의미합니다. DST 전환이 있는 지역에서는 정확히 24시간을 더한 결과가 다음 날 현지 오전 9시가 아닐 수 있습니다.

```text
달력 기준 +1 day
→ 다음 날 같은 local time을 목표

정확히 +24 hours
→ timeline에서 24시간 이동
```

그래서 반복 일정은 경과 시간과 지역 달력 규칙 중 무엇이 요구사항인지 먼저 정해야 합니다.

시간대 문제를 풀 때는 `ZoneOffset`과 `ZoneId`를 먼저 구분하고, local 시간이 DST gap 또는 overlap에 놓일 수 있는지 확인하세요. **Java API의 기본 해석 규칙과 실제 업무 정책을 같은 것으로 보지 않는 것**이 가장 중요합니다.
