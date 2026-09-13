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

할인 방식, 수수료 계산, 파일 변환처럼 **전체 유스케이스 흐름은 비슷한데 특정 계산 규칙만 여러 형태로 바뀌는 경우**가 있습니다. 처음에는 `if`나 `switch` 몇 개로 충분할 수 있지만 정책 종류가 늘고 각 규칙이 독립적으로 변경되면 한 메서드가 모든 정책을 알아야 합니다.

```java
long discount(MemberGrade grade, long price) {
    if (grade == MemberGrade.VIP) {
        return price * 10 / 100;
    }
    if (grade == MemberGrade.VVIP) {
        return price * 20 / 100;
    }
    return 0;
}
```

여기에 기간 할인, 쿠폰 정책, 테스트용 정책이 계속 추가되면 호출 흐름보다 분기표가 더 커질 수 있습니다. Strategy 패턴은 이런 상황에서 **같은 책임의 여러 행동을 하나의 계약 뒤로 분리하고, 사용할 구현을 조립 시점이나 실행 시점에 선택**하게 합니다.

![Strategy 패턴의 정책 교체 구조](/learning/java/strategy-pattern.svg)

### 안정된 흐름과 변하는 정책을 나눈다

먼저 호출자가 실제로 필요로 하는 책임을 계약으로 표현합니다.

```java
interface DiscountPolicy {
    long discount(long price);
}
```

정책별 차이는 구현 객체가 소유합니다.

```java
final class RateDiscountPolicy implements DiscountPolicy {
    private final int percent;

    RateDiscountPolicy(int percent) {
        if (percent < 0 || percent > 100) {
            throw new IllegalArgumentException();
        }
        this.percent = percent;
    }

    @Override
    public long discount(long price) {
        return price * percent / 100;
    }
}
```

```java
final class FixedDiscountPolicy implements DiscountPolicy {
    private final long amount;

    FixedDiscountPolicy(long amount) {
        this.amount = amount;
    }

    @Override
    public long discount(long price) {
        return Math.min(price, amount);
    }
}
```

사용하는 쪽은 정책별 계산식을 알지 않고 `DiscountPolicy`가 제공하는 책임만 사용합니다.

```java
final class PriceCalculator {
    private final DiscountPolicy policy;

    PriceCalculator(DiscountPolicy policy) {
        this.policy = policy;
    }

    long calculate(long price) {
        long discount = policy.discount(price);
        return price - discount;
    }
}
```

이제 할인 계산식이 바뀌어도 `PriceCalculator`의 “정책에게 할인액을 요청하고 최종 가격을 계산한다”는 흐름은 유지될 수 있습니다. 중요한 것은 클래스를 여러 개 만들었다는 사실이 아니라 **변경 이유가 다른 행동을 서로 다른 경계로 분리했다는 점**입니다.

### Strategy 선택 책임도 따로 봐야 한다

Strategy를 적용했다고 분기가 세상에서 사라지는 것은 아닙니다. 어떤 정책을 사용할지 결정하는 선택은 어딘가에 남습니다.

```java
DiscountPolicy policy = switch (grade) {
    case BASIC -> new FixedDiscountPolicy(0);
    case VIP -> new RateDiscountPolicy(10);
    case VVIP -> new RateDiscountPolicy(20);
};

PriceCalculator calculator = new PriceCalculator(policy);
```

이 분기가 나쁜 것은 아닙니다. 이전에는 **정책 선택과 정책 실행 로직이 한 메서드에 섞여 있었고**, 이제는 조립하는 경계가 구현을 선택하고 각 Strategy가 자신의 계산 책임을 소유합니다.

```text
선택하는 곳
- 어떤 Strategy를 사용할지 결정
        │
        ▼
Context
- Strategy 계약만 사용
        │
        ▼
Strategy 구현
- 실제 정책 수행
```

선택 규칙 자체도 복잡하고 자주 바뀐다면 Factory나 별도 resolver가 필요할 수 있습니다. 하지만 Strategy를 썼다는 이유만으로 처음부터 Factory까지 추가할 필요는 없습니다. **실제로 독립적인 변경 축이 생겼을 때 다음 경계를 분리**합니다.

### “런타임 교체”는 setter가 아니라 선택 시점의 문제다

Strategy와 Template Method를 비교할 때 Strategy를 “런타임에 교체 가능한 패턴”이라고 자주 설명합니다. 여기서 runtime은 **실행할 전략 객체를 조립하거나 호출하는 시점에 선택할 수 있다는 의미**로 이해하면 됩니다.

```java
DiscountPolicy selected = request.isVip()
        ? new RateDiscountPolicy(10)
        : new FixedDiscountPolicy(0);

PriceCalculator calculator = new PriceCalculator(selected);
```

이 코드는 `PriceCalculator`가 만들어진 뒤 setter로 policy를 바꾸지 않아도 실행 시점의 조건에 따라 다른 Strategy를 선택합니다. 따라서 “Strategy는 반드시 mutable setter가 있어야 한다”는 설명은 틀립니다.

객체 lifetime 동안 하나의 정책만 사용할 거라면 생성자에서 받아 `final` field로 보관하는 편이 더 단순합니다. 호출마다 전략이 달라져야 한다면 method parameter로 받을 수도 있습니다.

```java
long calculate(long price, DiscountPolicy policy) {
    return price - policy.discount(price);
}
```

Strategy의 전달 방식은 객체 수명과 선택 시점에 따라 달라질 수 있습니다.

### lambda가 Strategy가 될 수 있지만 모든 Strategy를 lambda로 만들 필요는 없다

계약이 함수 하나이고 별도 이름이나 상태가 필요하지 않다면 functional interface와 lambda로 정책을 더 작게 표현할 수 있습니다.

```java
@FunctionalInterface
interface DiscountPolicy {
    long discount(long price);
}

DiscountPolicy vip = price -> price * 10 / 100;
```

호출자 입장에서는 여전히 `DiscountPolicy`라는 행동 계약을 전달받습니다. Strategy 패턴이 반드시 `RateDiscountPolicy.java`, `FixedDiscountPolicy.java` 같은 class 파일 수를 늘려야 하는 것은 아닙니다.

반대로 정책이 여러 parameter를 검증하거나, 의미 있는 이름과 상태를 가지고, 여러 메서드가 같은 invariant를 공유한다면 명시적인 class가 더 읽기 좋습니다. **lambda냐 class냐보다 행동의 경계가 명확한가**가 중요합니다.

### Strategy와 단순 함수 분리를 구분한다

다음처럼 메서드를 분리하는 것만으로도 충분한 상황이 있습니다.

```java
private long vipDiscount(long price) {
    return price * 10 / 100;
}
```

정책이 한 클래스 안에서만 쓰이고 대체·조합·독립 테스트할 요구가 없다면 굳이 Strategy abstraction을 만들지 않아도 됩니다. Strategy의 가치가 커지는 것은 다음과 같은 신호가 있을 때입니다.

- 같은 책임을 가진 구현이 둘 이상 실제로 존재한다.
- 새 정책을 추가할 때 기존 핵심 흐름의 분기를 계속 수정한다.
- 정책마다 필요한 상태나 dependency가 다르다.
- 호출자는 구체 구현보다 “이 계산을 수행한다”는 계약만 알면 된다.
- production/test 또는 실행 환경에 따라 같은 책임의 구현을 바꿀 필요가 있다.

패턴은 미래의 가능성만으로 미리 만드는 추상화가 아니라 **현재 드러난 variation을 어디에 격리할지 정하는 도구**입니다.

### Strategy와 State는 모양이 비슷해도 의도가 다르다

둘 다 공통 interface와 여러 구현 객체를 가질 수 있어 코드 모양이 비슷해 보입니다. 하지만 Strategy는 보통 **호출자나 조립자가 어떤 정책을 쓸지 선택**하고, Context는 선택된 정책에게 일을 위임합니다.

State 패턴은 객체의 **현재 상태가 행동을 결정하고 상태 전이가 모델의 핵심**인 경우에 사용합니다.

```text
Strategy
- “어떤 계산 정책을 쓸까?”
- 외부 선택/조립이 중심

State
- “현재 상태에서 어떤 행동이 가능한가?”
- 상태 전이와 lifecycle이 중심
```

할인율 선택을 `PAID`, `CANCELLED` 같은 lifecycle state와 같은 문제로 보면 설계 의도가 흐려질 수 있습니다. 반대로 상태 전이가 핵심인 주문 lifecycle을 단순 Strategy 선택 문제로 처리하면 현재 상태의 invariant가 여러 곳으로 흩어질 수 있습니다.

### 외부 시스템 Adapter와 Strategy도 책임이 다르다

여러 PG사를 `PaymentGateway` 구현으로 나누면 얼핏 Strategy처럼 보일 수 있습니다. 실제로 호출자가 여러 구현 중 하나를 선택한다는 관점은 겹칠 수 있지만, 외부 SDK·프로토콜을 application contract로 번역하는 것이 핵심이라면 **Adapter라는 경계 역할**이 더 중요합니다.

패턴 이름은 class diagram만 보고 붙이는 라벨이 아닙니다. 같은 인터페이스 구조라도 해결하려는 문제가 “정책 variation”인지 “외부 interface 변환”인지에 따라 설계 판단이 달라집니다.

### 실패 계약도 Strategy 공통 계약의 일부다

구현을 교체할 수 있으려면 성공 결과뿐 아니라 실패 의미도 호출자가 감당할 수 있는 공통 계약이어야 합니다.

```java
interface ShippingFeePolicy {
    Money calculate(Address address);
}
```

한 구현은 잘못된 주소에 `IllegalArgumentException`을 던지고 다른 구현은 `null`을 반환하고 또 다른 구현은 외부 SDK 예외를 그대로 노출한다면 호출자는 구현별 세부를 다시 알아야 합니다. 그러면 Strategy 계약 뒤에 variation을 숨겼다는 장점이 약해집니다.

모든 실패를 하나로 뭉개라는 뜻은 아닙니다. 호출자가 실제로 알아야 할 차이는 계약에 드러내되, **구현 세부 때문에 호출자가 Strategy 타입별로 다시 분기하지 않게** 하는 것이 중요합니다.

### 백엔드에서는 “패턴 적용”보다 변경 축을 먼저 본다

결제 수수료, 배송비, 가격 정책처럼 business rule이 여러 방식으로 존재할 때 Strategy가 유용할 수 있습니다. 테스트에서는 외부 randomness나 시간 계산 정책을 대체하는 경계로도 쓸 수 있습니다.

하지만 `if`가 있다는 이유만으로 Strategy로 바꾸지는 않습니다. enum 두 값에 대한 짧고 안정적인 분기라면 `switch`가 더 직접적일 수 있습니다. Strategy를 적용하면 interface, 구현 객체, 조립 위치라는 추가 구조가 생기므로 **독립 변경 가능성과 조합 이점이 그 비용보다 큰지** 봐야 합니다.

학습 후에는 “알고리즘을 캡슐화하는 패턴”이라는 한 문장보다 이렇게 설명할 수 있어야 합니다. **같은 책임의 여러 정책이 실제로 독립적으로 바뀌고, 호출자는 구체 정책이 아니라 공통 책임만 알고 싶을 때 행동을 Strategy 객체로 분리한다. 정책을 선택하는 책임은 별도 조립 경계에 남으며, variation이 작다면 단순 분기가 더 나을 수 있다.**

### 면접에서 이렇게 나옵니다

#### Q. Strategy 패턴은 조건문을 없애기 위한 패턴인가요?

조건문을 무조건 없애는 것이 목적은 아닙니다. Strategy는 **독립적으로 바뀌는 같은 책임의 행동을 공통 계약 뒤로 분리**하고 호출자가 구체 구현에 덜 의존하게 만드는 데 목적이 있습니다.

어떤 Strategy를 선택할지 결정하는 분기는 조립 경계에 남을 수 있습니다. 중요한 것은 선택 로직과 각 정책의 실행 로직이 뒤섞이지 않는 것입니다.

#### Q. Strategy를 쓰려면 실행 중 setter로 구현을 바꿔야 하나요?

아닙니다. Strategy의 핵심은 행동을 대체 가능한 객체로 분리하는 것이지 mutable setter가 아닙니다. 객체 lifetime 동안 정책이 고정된다면 생성자 주입이 더 자연스럽고, 호출마다 달라지면 method parameter로 전달할 수도 있습니다.

#### Q. lambda를 쓰면 Strategy 패턴이 아닌가요?

계약이 함수 하나라면 lambda도 해당 functional interface의 구현으로 전달될 수 있으므로 Strategy 역할을 할 수 있습니다. 다만 복잡한 상태·검증·여러 동작을 가진 정책까지 모두 lambda로 만들 필요는 없습니다. 표현 방식보다 **variation 경계와 책임이 명확한지**가 더 중요합니다.
