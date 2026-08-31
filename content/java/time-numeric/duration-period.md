---
kind: concept
contentKey: java.core.time-numeric.duration-period
topicContentKey: java.core.time-numeric
slug: duration-period
title: "Duration and Period"
summary: "정확한 경과 시간과 달력상의 날짜 차이를 구분해 Duration과 Period를 선택한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Duration.html"
    title: "Java SE 25 API: Duration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: seconds·nanoseconds 기반 시간량의 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Period.html"
    title: "Java SE 25 API: Period"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: years·months·days 기반 날짜량의 계약 확인
---
# Duration and Period

"하루 뒤"라는 말은 상황에 따라 두 가지 뜻이 될 수 있습니다. 정확히 24시간이 지난 뒤를 뜻할 수도 있고, 달력에서 다음 날짜의 같은 시각을 뜻할 수도 있습니다. 평소에는 결과가 같아 보이지만 DST나 월 길이 차이가 끼어들면 서로 다른 결과가 됩니다.

Java는 이런 차이를 `Duration`과 `Period`로 나누어 표현합니다.

### Duration은 경과한 시간의 양을 표현한다

```java
Duration timeout = Duration.ofSeconds(30);
Duration oneHour = Duration.ofHours(1);
```

`Duration`은 초와 나노초를 기반으로 한 시간량입니다. HTTP timeout, 작업 경과 시간, "지금부터 정확히 10분 뒤" 같은 의미에 잘 맞습니다.

```java
Instant start = Instant.parse("2026-08-31T00:00:00Z");
Instant end = start.plus(Duration.ofHours(24));
```

여기서 의미는 timeline에서 정확히 24시간만큼 이동하는 것입니다.

### Period는 달력의 년·월·일 단위를 표현한다

```java
Period billingCycle = Period.ofMonths(1);
LocalDate next = LocalDate.of(2026, 1, 31)
        .plus(billingCycle);
```

`Period`는 년, 월, 일이라는 달력 단위를 표현합니다. 그런데 한 달은 언제나 같은 초 수가 아닙니다. 2월과 3월의 길이가 다르고 윤년도 있기 때문입니다.

따라서 `Period.ofMonths(1)`을 "30일" 또는 "고정된 초 수"로 바꾸어 생각하면 안 됩니다. 달력 규칙을 적용한 결과를 봐야 합니다.

### `24시간`과 `다음 날`은 DST에서 달라질 수 있다

Zone이 있는 시간을 생각하면 차이가 더 선명합니다.

```text
현지 시각 03-29 09:00
        │
        ├─ + Duration.ofHours(24)
        │      -> 정확히 24시간 뒤
        │
        └─ + Period.ofDays(1)
               -> 달력상 다음 날
```

DST 전환으로 하루가 23시간 또는 25시간 길이가 되는 지역에서는 결과의 local time이 달라질 수 있습니다.

그래서 "하루"라는 요구사항을 코드로 옮길 때는 **24시간의 경과인지, 달력 날짜 한 칸 이동인지** 먼저 확인해야 합니다.

### 사용하는 시간 타입에 맞는 연산인지도 확인한다

`Instant`는 timeline 지점을 나타내므로 `Duration`과 자연스럽게 연결됩니다. `LocalDate`는 시간-of-day가 없고 달력 날짜를 표현하므로 `Period`와 자연스럽게 연결됩니다.

모든 temporal type에 모든 시간량을 아무렇게나 적용할 수 있는 것은 아닙니다. API가 지원하는 단위와 현재 타입이 가진 정보를 함께 봐야 합니다.

### 백엔드에서 자주 만나는 선택 기준

| 요구사항 | 보통 먼저 검토할 타입 |
|---|---|
| HTTP 요청 timeout 3초 | `Duration` |
| 캐시 TTL 10분 | `Duration` |
| 작업 실행에 걸린 시간 | `Duration` |
| 가입일로부터 1개월 뒤 | `Period` |
| 매달 1회 청구 | `Period` + 날짜/zone 정책 |
| 생일 기준 나이 계산 | 날짜/`Period` 관점 |

표는 절대 규칙이 아니라 요구사항의 의미를 잡는 출발점입니다. 예를 들어 "캐시 만료는 매일 자정"이라면 단순한 Duration보다 달력·zone 정책이 중요할 수 있습니다.

### 문제를 풀 때 확인할 것

1. 요구사항이 경과 시간인지 달력 단위인지 구분합니다.
2. `Duration`은 초 기반, `Period`는 년·월·일 기반이라는 차이를 확인합니다.
3. 계산 대상이 `Instant`, `LocalDate`, `ZonedDateTime` 중 무엇인지 봅니다.
4. DST나 월 길이 차이가 결과에 영향을 줄 수 있는지 확인합니다.
5. "하루=24시간", "한 달=30일" 같은 고정 가정을 먼저 의심합니다.

### 자주 헷갈리는 부분

- `Period.ofDays(1)`과 `Duration.ofHours(24)`는 항상 같은 의미가 아닙니다.
- 한 달을 고정된 초 수로 일반화할 수 없습니다.
- `Duration`이 timezone을 스스로 선택하는 것은 아닙니다.
- `Period`는 단순히 더 큰 단위의 `Duration`이 아닙니다.

### 면접에서 설명한다면

`Duration`은 초·나노초 기반의 경과 시간을, `Period`는 년·월·일 기반의 달력 차이를 표현한다고 설명하면 됩니다. 특히 DST가 있는 zone에서는 24시간 뒤와 달력상 다음 날이 다를 수 있으므로 timeout과 반복 일정처럼 요구사항의 시간 의미에 따라 타입을 선택해야 합니다.
