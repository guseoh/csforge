---
kind: concept
contentKey: java.core.time-numeric.zoneid-dst
topicContentKey: java.core.time-numeric
slug: zoneid-dst
title: "ZoneId and daylight saving time"
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
# ZoneId and daylight saving time

`+09:00`과 `Asia/Seoul`은 비슷해 보이지만 표현하는 정보의 범위가 다릅니다. `+09:00`은 UTC와 몇 시간 차이 나는지를 나타내는 **offset**이고, `Europe/Paris` 같은 `ZoneId`는 날짜에 따라 offset이 어떻게 달라지는지를 포함하는 **지역 시간대 규칙의 식별자**입니다.

이 차이는 서머타임(DST)을 사용하는 지역에서 특히 중요합니다. 어떤 날에는 시계가 한 시간을 건너뛰고, 어떤 날에는 한 시간 구간이 두 번 나타날 수 있기 때문입니다.

### 고정 offset은 한 숫자이고 ZoneId는 날짜별 규칙이다

```java
ZoneOffset offset = ZoneOffset.of("+01:00");
ZoneId paris = ZoneId.of("Europe/Paris");
```

고정 offset은 언제 보더라도 UTC와의 차이가 같습니다. 반면 `Europe/Paris`는 날짜에 따라 UTC+1이 될 수도 있고 UTC+2가 될 수도 있습니다.

따라서 "현재는 +01:00이니까 앞으로도 이 지역은 +01:00"이라고 판단하면 안 됩니다. 장기간 유지되는 예약이나 반복 일정에서는 지역의 `ZoneId`가 업무 의미일 수 있습니다.

### DST가 시작될 때는 존재하지 않는 local 시간이 생길 수 있다

시계를 앞으로 한 시간 이동하는 날을 생각해 보겠습니다.

```text
01:58
01:59
03:00  <- 시계가 앞으로 이동
03:01
```

이 지역에서 `02:30`은 달력에는 적을 수 있어도 실제 timeline에 대응하는 순간이 존재하지 않습니다. 이런 구간을 **gap**이라고 합니다.

사용자가 예약 시간을 `02:30`으로 입력했다면 애플리케이션은 정책을 정해야 합니다. 다음 유효한 시각으로 보정할지, 입력을 거부할지, 사용자에게 확인할지는 Java API가 대신 결정할 수 없는 비즈니스 문제입니다.

### DST가 끝날 때는 같은 local 시간이 두 번 나타날 수 있다

반대로 시계를 뒤로 돌리는 날에는 다음처럼 같은 시간이 반복될 수 있습니다.

```text
01:58
01:59
02:00  <- 첫 번째 02시 구간
...
02:59
02:00  <- offset이 바뀌며 다시 02시 구간
```

이 경우 `02:30`이라는 local 값이 서로 다른 두 `Instant` 후보를 가질 수 있습니다. 이를 **overlap**이라고 합니다.

`ZonedDateTime` API에는 overlap에서 앞쪽 offset 또는 뒤쪽 offset을 선택하는 기능이 있습니다. 중요한 것은 API 기본 동작을 외우는 것보다, 예약·배치처럼 중복 시간이 실제 업무에 영향을 줄 때 **어느 쪽을 선택해야 하는지를 명시적으로 정하는 것**입니다.

### 예약과 배치에서는 "하루"의 의미도 확인해야 한다

사용자가 "매일 오전 9시"라고 말하면 보통 지역 달력의 오전 9시를 뜻합니다. 이를 매번 24시간씩 더하는 방식으로 구현하면 DST가 바뀌는 지역에서는 어느 순간 local 시간이 달라질 수 있습니다.

```text
사용자 의도: 매일 현지 09:00

calendar 기준 +1 day
    -> 다음 날 현지 09:00

항상 +24 hours
    -> DST 전환 시 현지 시각이 08:00/10:00처럼 달라질 수 있음
```

따라서 반복 일정은 "정확한 경과 시간"과 "달력상의 날짜·시각" 중 무엇이 요구사항인지 먼저 결정해야 합니다.

### 백엔드에서 숨은 기본 timezone을 피한다

서버의 default timezone에 의존하면 개발 PC, Docker container, 운영 서버의 설정 차이 때문에 같은 코드가 다른 결과를 만들 수 있습니다. 사용자 시간대가 중요한 기능이라면 `ZoneId`를 명시적으로 다루는 편이 안전합니다.

또 timezone 규칙은 현실 세계의 법·정책 변화에 따라 갱신될 수 있습니다. Java API를 사용한다고 해서 미래의 지역 규칙이 영원히 고정되는 것은 아닙니다. 장기 예약 시스템이라면 어떤 zone 정보를 보관하고 언제 다시 계산할지까지 운영 정책으로 볼 수 있습니다.

### 문제를 풀 때 확인할 것

1. 값이 `ZoneOffset`인지 `ZoneId`인지 구분합니다.
2. 해당 지역이 날짜별로 offset이 바뀔 수 있는지 봅니다.
3. local 시간이 gap에 들어가는지 overlap에 들어가는지 확인합니다.
4. 반복 일정이 24시간 간격인지 달력상의 같은 시각인지 구분합니다.
5. 기본 API 동작과 실제 비즈니스 정책을 같은 것으로 보지 않습니다.

### 자주 헷갈리는 부분

- 고정 offset만으로 지역의 미래 DST 규칙을 표현할 수 없습니다.
- 모든 `LocalDateTime`이 정확히 하나의 `Instant`로 변환되는 것은 아닙니다.
- API가 gap을 자동 조정해 준다고 그 결과가 업무적으로 옳다는 뜻은 아닙니다.
- 서버의 기본 timezone은 사용자 시간대 정책의 대체물이 아닙니다.

### 면접에서 설명한다면

`ZoneOffset`은 특정 시점의 UTC 차이를 나타내고 `ZoneId`는 지역의 날짜별 시간대 규칙을 나타낸다고 설명하면 됩니다. DST 전환에서는 존재하지 않는 local time인 gap과 두 번 나타나는 overlap이 생길 수 있으므로 예약이나 반복 일정에서는 Java API의 기본 보정에만 의존하지 말고 업무 정책을 명시해야 합니다.
