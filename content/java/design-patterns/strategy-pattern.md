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
  - url: "https://tecoble.techcourse.co.kr/post/2021-10-04-strategy-command-pattern/"
    title: "전략패턴과 커맨드패턴"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: Strategy가 변하는 로직을 공통 계약 뒤로 분리하는 구조와 Command와의 차이를 한국어 예제로 복습
---
# Strategy 패턴과 정책 교체

할인 방식이나 수수료 계산처럼 **전체 흐름은 같지만 특정 정책만 여러 형태로 바뀌는 경우**가 있습니다. 정책 종류가 적고 안정적이면 `if`나 `switch`가 가장 직접적일 수 있습니다. 하지만 같은 책임의 구현이 늘고 각 정책이 독립적으로 바뀐다면 한 메서드가 모든 정책을 알게 됩니다.

```java
long discount(MemberGrade grade, long price) {
    return switch (grade) {
        case BASIC -> 0;
        case VIP -> price * 10 / 100;
        case VVIP -> price * 20 / 100;
    };
}
```

Strategy 패턴은 이런 **변하는 행동을 공통 계약 뒤의 객체로 분리**합니다.

![Strategy 패턴의 정책 교체 구조](/learning/java/strategy-pattern.svg)

```java
interface DiscountPolicy {
    long discount(long price);
}

final class RateDiscountPolicy implements DiscountPolicy {
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

사용하는 객체는 구체 계산식을 알 필요 없이 계약만 사용합니다.

```java
final class PriceCalculator {
    private final DiscountPolicy policy;

    PriceCalculator(DiscountPolicy policy) {
        this.policy = policy;
    }

    long calculate(long price) {
        return price - policy.discount(price);
    }
}
```

```text
정책 선택
   │
   ▼
PriceCalculator
   │ DiscountPolicy만 사용
   ▼
구체 Strategy
```

### Strategy를 적용해도 선택 분기는 남을 수 있다

```java
DiscountPolicy policy = switch (grade) {
    case BASIC -> price -> 0;
    case VIP -> new RateDiscountPolicy(10);
    case VVIP -> new RateDiscountPolicy(20);
};
```

분기가 사라진 것이 아니라 **정책을 선택하는 책임과 정책을 실행하는 책임이 분리**되었습니다. 선택 규칙까지 복잡해질 때는 별도 Factory나 resolver를 검토할 수 있지만, 처음부터 구조를 더 늘릴 필요는 없습니다.

Strategy가 반드시 setter로 런타임 교체되어야 하는 것도 아닙니다. 객체 수명 동안 정책 하나를 사용한다면 생성자에서 받아 `final` 필드로 보관할 수 있고, 호출마다 정책이 달라져야 한다면 메서드 인자로 전달할 수도 있습니다.

### 작은 정책은 lambda로도 표현할 수 있다

계약이 함수 하나이고 별도 상태나 이름이 필요하지 않다면 functional interface와 lambda로 같은 경계를 만들 수 있습니다.

```java
DiscountPolicy vip = price -> price * 10 / 100;
```

반대로 정책이 자체 상태와 검증을 가지거나 의미 있는 이름이 중요하다면 명시적인 클래스가 더 읽기 좋을 수 있습니다. 핵심은 클래스 파일 수가 아니라 **변하는 행동의 책임이 분리되어 있는가**입니다.

### Strategy가 필요한지 먼저 확인한다

다음과 같은 경우에 가치가 커집니다.

- 같은 책임의 구현이 실제로 둘 이상 존재한다.
- 새 정책을 추가할 때 핵심 흐름의 분기를 계속 수정한다.
- 정책마다 상태나 의존성이 다르다.
- 호출자는 구체 구현보다 공통 책임만 알면 된다.

반대로 짧고 안정적인 분기 하나라면 Strategy가 오히려 간접 구조만 늘릴 수 있습니다.

Strategy와 State는 구조가 비슷하지만 의도가 다릅니다. Strategy는 **어떤 정책을 사용할지 선택하는 문제**이고, State는 **현재 상태가 행동과 전이를 결정하는 문제**입니다. 패턴 이름보다 어떤 변화 축을 분리하려는지 먼저 보는 것이 중요합니다.
