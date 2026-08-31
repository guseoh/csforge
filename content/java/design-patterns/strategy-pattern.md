---
kind: concept
contentKey: java.core.design-patterns.strategy-pattern
topicContentKey: java.core.design-patterns
slug: strategy-pattern
title: "Strategy 패턴과 정책 교체"
summary: "조건문으로 늘어나는 정책 차이를 공통 계약 뒤의 교체 가능한 객체로 분리하고 언제 패턴이 필요한지 판단한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 인터페이스 기반 다형성의 언어 기반 확인
---
# Strategy 패턴과 정책 교체

할인 방식이나 정렬 기준처럼 **전체 흐름은 비슷한데 특정 계산 규칙만 자주 바뀌는 경우**가 있습니다. 처음에는 `if`나 `switch` 몇 개로 충분하지만 정책 종류가 늘고 각 규칙이 독립적으로 변경되면 한 메서드가 여러 변화 이유를 떠안게 됩니다.

```java
if (grade == VIP) {
    return price * 90 / 100;
}
if (grade == VVIP) {
    return price * 80 / 100;
}
return price;
```

Strategy 패턴은 이런 **변하는 행동을 공통 계약 뒤의 객체로 분리**합니다.

### 안정된 흐름과 바뀌는 정책을 나눈다

```java
interface DiscountPolicy {
    long discount(long price);
}

class RateDiscountPolicy implements DiscountPolicy {
    private final int percent;

    RateDiscountPolicy(int percent) {
        this.percent = percent;
    }

    @Override
    public long discount(long price) {
        return price * percent / 100;
    }
}
```

사용하는 쪽은 구체 계산식보다 `DiscountPolicy` 계약에 의존합니다.

```java
class PriceCalculator {
    private final DiscountPolicy policy;

    PriceCalculator(DiscountPolicy policy) {
        this.policy = policy;
    }

    long calculate(long price) {
        return policy.discount(price);
    }
}
```

```text
PriceCalculator
      │
      ▼
DiscountPolicy
   ├─ RateDiscountPolicy
   └─ FixedDiscountPolicy
```

정책을 생성자에서 전달하면 실행 중 변경할 필요가 없는 경우에도 충분합니다. “Strategy는 반드시 setter로 전략을 바꿔야 한다”는 식으로 외울 필요는 없습니다.

### 단순 조건문보다 항상 좋은 것은 아니다

정책이 두 개뿐이고 앞으로 바뀔 이유도 없는데 인터페이스와 구현 클래스를 여러 개 만들면 흐름을 찾기 더 어려워질 수 있습니다. 패턴의 이름보다 **변화가 독립적인가, 새 정책 추가 때 기존 분기 코드가 계속 커지는가**를 먼저 봐야 합니다.

### lambda로 더 작게 표현할 수도 있다

계약이 함수 하나라면 functional interface와 lambda로 전략을 표현할 수 있습니다.

```java
UnaryOperator<Long> discount = price -> price * 90 / 100;
```

객체가 별도 상태나 여러 메서드를 가져야 한다면 명시적인 전략 클래스가 더 읽기 좋을 수 있습니다.

### 실무에서 판단할 기준

Strategy는 결제 수수료 계산, 가격 정책, 알림 채널별 전송, 파일 변환 정책 등에서 사용할 수 있습니다. 하지만 외부 시스템별 예외 처리와 복잡한 workflow까지 무조건 Strategy 하나로 해결하려고 하지 않습니다.

면접에서는 “알고리즘을 캡슐화한다”는 정의만 말하기보다 **같은 책임의 여러 정책이 독립적으로 바뀌고, 호출자는 공통 계약만 알고 싶을 때 사용한다**고 설명하면 좋습니다.
