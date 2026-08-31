---
kind: concept
contentKey: java.core.time-numeric.clock-testable-time
topicContentKey: java.core.time-numeric
slug: clock-testable-time
title: "Clock and testable time"
summary: "현재 시간이 업무 판단에 영향을 줄 때 Clock으로 시간의 출처를 분리해 테스트 가능하게 만든다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Clock.html"
    title: "Java SE 25 API: Clock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 시스템 시계와 fixed·offset Clock 등 시간 source 계약 확인
---
# Clock and testable time

회원 쿠폰이 "8월 31일 23시 59분까지 유효"하다는 정책을 테스트한다고 생각해 보겠습니다. 코드 안에서 매번 `Instant.now()`를 직접 호출하면 테스트를 실행하는 실제 시각에 따라 결과가 달라집니다. 경계 시각 바로 전과 직후를 재현하려면 컴퓨터의 시간을 바꾸는 식의 불편한 방법이 필요해집니다.

이 문제의 본질은 **현재 시각을 읽는 행위가 코드 안에 고정되어 있다는 것**입니다. `Clock`은 시간의 출처를 객체로 분리해 운영에서는 실제 시계를, 테스트에서는 원하는 시각을 제공할 수 있게 합니다.

### 현재 시각을 직접 읽는 코드의 문제

```java
boolean expired(Instant deadline) {
    return !Instant.now().isBefore(deadline);
}
```

코드는 간단하지만 테스트가 실제 시간에 묶입니다. 다음 테스트를 안정적으로 작성하기 어렵습니다.

- 마감 1초 전에는 유효하다.
- 마감 시각과 정확히 같으면 만료된다.
- 마감 1초 뒤에는 만료된다.

특히 자정, 월말, DST 전환 같은 경계는 실제 시간을 기다려 테스트할 수 없습니다.

### Clock을 주입하면 같은 코드에 다른 시간 source를 넣을 수 있다

```java
final class ExpiryPolicy {
    private final Clock clock;

    ExpiryPolicy(Clock clock) {
        this.clock = clock;
    }

    boolean expired(Instant deadline) {
        Instant now = Instant.now(clock);
        return !now.isBefore(deadline);
    }
}
```

운영에서는 실제 시간을 읽는 Clock을 사용합니다.

```java
Clock clock = Clock.systemUTC();
```

테스트에서는 특정 순간으로 고정할 수 있습니다.

```java
Clock fixed = Clock.fixed(
        Instant.parse("2026-08-31T15:00:00Z"),
        ZoneOffset.UTC
);
```

이제 테스트를 언제 실행해도 `Instant.now(fixed)`는 같은 값을 반환합니다.

```text
ExpiryPolicy
    │
    └─ Clock
       ├─ production -> system clock
       └─ test       -> fixed clock
```

### 시간 source와 시간 정책은 같은 것이 아니다

`Clock`을 주입했다고 다음 문제가 자동으로 결정되는 것은 아닙니다.

- 만료 시각과 정확히 같을 때 만료인가?
- 사용자의 시간대는 무엇인가?
- 하루의 시작은 어느 ZoneId 기준인가?
- 소수 초를 버리거나 반올림해야 하는가?

`Clock`은 **현재 시각을 어디서 얻을지**를 분리합니다. 그 시각을 어떤 규칙으로 해석할지는 domain/application 정책이 결정해야 합니다.

### 한 유스케이스 안에서 현재 시각을 여러 번 읽는 것도 생각해야 한다

```java
if (Instant.now(clock).isBefore(start)) { ... }
// 시간이 흐름
if (Instant.now(clock).isAfter(end)) { ... }
```

두 번의 `now()` 사이에서 경계 시각이 지나면 한 요청 안에서도 서로 다른 기준 시각으로 판단할 수 있습니다. 여러 판단이 **같은 현재 시각을 기준으로 해야 한다면 한 번 읽어 변수로 전달하는 방법**을 고려할 수 있습니다.

```java
Instant now = Instant.now(clock);
boolean started = !now.isBefore(start);
boolean ended = !now.isBefore(end);
```

이것은 Clock API의 필수 규칙이 아니라 일관된 업무 판단을 만들기 위한 설계 선택입니다.

### Spring 코드에서는 필요한 책임에 Clock을 둔다

현재 시간이 실제 비즈니스 판단에 영향을 준다면 그 판단을 수행하는 application/domain policy가 Clock을 사용하도록 하는 것이 자연스럽습니다. Response mapper가 임의로 `now()`를 읽어 "만료 여부" 같은 업무 상태를 계산하면 책임과 테스트 경계가 흐려질 수 있습니다.

Spring Bean으로 `Clock`을 제공하면 운영 설정과 테스트 대체도 명확하게 할 수 있습니다. 다만 이 Concept의 핵심은 Spring 설정법이 아니라 **시간이라는 외부 입력을 코드에서 분리한다**는 Java 설계 원리입니다.

### 문제를 풀 때 확인할 것

1. 현재 시간이 결과를 바꾸는 정책인지 확인합니다.
2. 코드가 `now()`를 직접 호출하는지 Clock을 통해 읽는지 봅니다.
3. 테스트에서 fixed Clock을 넣었을 때 어떤 시각이 관찰되는지 추적합니다.
4. 여러 번 현재 시각을 읽어 경계가 달라질 가능성이 있는지 확인합니다.
5. Clock이 zone·만료 포함 여부 같은 업무 규칙까지 해결한다고 착각하지 않습니다.

### 면접에서 설명한다면

현재 시각도 파일·네트워크처럼 코드 외부에서 들어오는 입력으로 볼 수 있습니다. `Clock`을 주입하면 운영에서는 시스템 시각을 사용하고 테스트에서는 특정 시각을 고정해 만료·예약 같은 시간 의존 정책을 결정적으로 테스트할 수 있습니다. Clock은 시간의 출처를 분리할 뿐 timezone이나 만료 기준 같은 비즈니스 규칙 자체를 대신하지는 않습니다.
