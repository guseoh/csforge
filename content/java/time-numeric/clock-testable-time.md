---
kind: concept
contentKey: java.core.time-numeric.clock-testable-time
topicContentKey: java.core.time-numeric
slug: clock-testable-time
title: "Clock and testable time"
summary: "현재 시간이 policy에 영향을 줄 때 Clock을 주입한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Clock.html"
    title: "Java SE 25 API: Clock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 현재 시각 source와 fixed clock 확인
---
# Clock and testable time

## 쉬운 진입

“오늘이면 만료 처리” 같은 코드를 `Instant.now()`로 직접 쓰면 자정이나 특정 시점의 테스트가
흔들린다. `Clock`을 policy에 주입하면 운영에서는 실제 시계를, 테스트에서는 고정 시계를
사용할 수 있다.

## 정확한 메커니즘

```java
final class ExpiryPolicy {
    private final Clock clock;
    ExpiryPolicy(Clock clock) { this.clock = clock; }

    boolean expired(Instant deadline) {
        return !Instant.now(clock).isBefore(deadline);
    }
}
```

`Clock.systemUTC()`와 `Clock.fixed(...)`는 같은 `Instant.now(clock)` 호출 경계를 공유한다.
Clock은 시간 source를 추상화하지만 업무 timezone, 반올림, 만료 inclusive 여부까지 자동으로
정해 주지는 않는다.

## 실전·면접 연결

현재 시각을 여러 번 읽으면 한 요청 안에서도 경계가 바뀔 수 있으므로 policy가 기준 시각을
한 번 캡처하는 방식을 고려한다. 응답 mapper가 임의로 now를 읽기보다 application/domain
시간 정책이 clock을 소유해야 테스트와 책임이 맞는다.

## 흔한 오해

- Clock을 주입하면 시스템 시간이 실제로 멈추는 것이 아니다.
- `Clock`은 timezone business rule 전체의 대체물이 아니다.
- 고정 시계 테스트가 실제 운영 clock의 timezone 설정까지 검증해 주지는 않는다.
