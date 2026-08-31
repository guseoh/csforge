---
kind: concept
contentKey: backend.core.time-money.clock-expiry
topicContentKey: backend.core.time-money
slug: clock-expiry
title: "Clock과 만료 정책"
summary: "현재 시각을 숨은 전역 입력으로 두지 않고 Clock을 통해 정책 입력으로 드러내 테스트 가능한 만료 로직을 만든다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Clock.html"
    title: "Java SE 25 API: Clock"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "현재 시각 소스를 주입할 수 있는 Clock API를 확인한다."
---
# Clock과 만료 정책

쿠폰 만료, 인증 토큰 TTL, 예약 취소 가능 시간처럼 "지금"이 결과에 영향을 주는 정책은 시간도 입력값이다. 코드 안에서 `Instant.now()`를 직접 호출하면 테스트가 실행되는 순간에 따라 결과가 달라지고 경계 시각을 재현하기 어렵다.

### 시간 의존성을 밖으로 꺼낸다

```java
final class Coupon {
    private final Instant expiresAt;

    boolean isExpired(Clock clock) {
        return !clock.instant().isBefore(expiresAt);
    }
}
```

테스트에서는 고정된 시각을 넣을 수 있다.

```java
Clock clock = Clock.fixed(
        Instant.parse("2026-09-01T00:00:00Z"),
        ZoneOffset.UTC
);
```

이렇게 하면 `expiresAt` 바로 전, 정확히 같은 순간, 바로 후를 모두 결정적으로 검증할 수 있다.

### `<`와 `<=`는 업무 정책이다

"9월 1일 00:00부터 사용 불가"라면 `now == expiresAt`인 순간을 만료로 볼지 명확히 정해야 한다. 구현이 아니라 계약의 문제다.

```text
now < expiresAt   → valid
now == expiresAt  → ?  ← 정책으로 결정
now > expiresAt   → expired
```

### wall clock과 경과 시간도 구분한다

업무 만료 시각은 달력상의 실제 시점을 사용하지만 timeout 측정은 시스템 시각 조정의 영향을 덜 받는 monotonic clock이 적합할 수 있다. 하나의 `Clock` 추상화가 모든 시간 측정 문제를 같은 방식으로 해결한다고 일반화하지 않는다.

핵심은 시간을 숨은 환경값이 아니라 **정책에 영향을 주는 명시적 입력**으로 취급하는 것이다.
