---
kind: concept
contentKey: java.core.time-numeric.clock-testable-time
topicContentKey: java.core.time-numeric
slug: clock-testable-time
title: "Clock으로 테스트 가능한 시간 만들기"
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
# Clock으로 테스트 가능한 시간 만들기

만료·예약처럼 현재 시각에 따라 결과가 달라지는 코드는 `Instant.now()`를 직접 호출하면 테스트도 실제 시간에 묶입니다. 마감 직전, 정확한 마감 시각, 직후 같은 경계를 재현하기 어려워지는 이유는 **현재 시각을 읽는 행위가 구현 안에 고정되어 있기 때문**입니다.

`Clock`은 시간의 출처를 객체로 분리합니다.

### 현재 시각을 외부 입력처럼 다룬다

```java
boolean expired(Instant deadline) {
    return !Instant.now().isBefore(deadline);
}
```

이 메서드는 호출 인자 외에 실제 시스템 시각에도 의존합니다. 이를 명시적인 협력자로 바꿀 수 있습니다.

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

운영에서는 실제 시계를 사용합니다.

```java
Clock clock = Clock.systemUTC();
```

테스트에서는 원하는 순간으로 고정할 수 있습니다.

```java
Clock fixed = Clock.fixed(
        Instant.parse("2026-08-31T15:00:00Z"),
        ZoneOffset.UTC
);
```

```text
ExpiryPolicy
    │
    └─ Clock
       ├─ production -> system clock
       └─ test       -> fixed clock
```

이제 테스트 실행 시각과 무관하게 같은 "현재"를 재현할 수 있습니다.

### Clock은 시간의 출처를 바꾸지 정책을 정하지 않는다

`Clock`을 주입했다고 만료 규칙 자체가 정해지는 것은 아닙니다.

```java
return !now.isBefore(deadline);
```

이 표현은 `now == deadline`일 때 이미 만료된 것으로 판단합니다. 정확히 같은 시각을 포함할지, 어느 zone의 날짜 경계를 사용할지는 여전히 업무 정책입니다.

즉 `Clock`이 담당하는 것은 **현재 시각을 어디서 얻는가**이고, 얻은 시간을 어떤 규칙으로 해석하는가는 별도 책임입니다.

### 한 유스케이스에서 같은 "현재"가 필요하면 한 번만 읽을 수 있다

```java
Instant now = Instant.now(clock);
boolean started = !now.isBefore(start);
boolean ended = !now.isBefore(end);
```

여러 판단이 하나의 기준 시점을 공유해야 한다면 `now()`를 반복 호출하는 대신 한 번 읽은 값을 전달하는 편이 결과를 설명하기 쉽습니다. 반대로 각 판단이 실제 호출 시각을 따로 봐야 한다면 매번 읽는 것이 맞을 수 있습니다.

Clock을 사용하는 이유는 테스트 프레임워크 기법에 있지 않습니다. **현재 시간도 코드 밖에서 들어오는 입력으로 보고, 그 source를 교체 가능하게 만든다**는 설계가 핵심입니다. 이 경계가 있으면 실제 시스템 시각과 테스트의 고정 시각을 같은 정책 코드에 적용할 수 있습니다.
