---
kind: concept
contentKey: java.core.api-design.static-factory-method
topicContentKey: java.core.api-design
slug: static-factory-method
title: "정적 팩터리 메서드"
summary: "정적 팩터리가 생성 의미·구현 선택·인스턴스 수명·invariant를 어떤 경계에 모으는지 이해하고 constructor·Builder·별도 Factory와 구분한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class method와 constructor의 언어 규칙 확인
---
# 정적 팩터리 메서드

객체를 만드는 가장 직접적인 문법은 constructor 호출입니다.

```java
Money money = new Money(10_000);
```

하지만 constructor 이름은 항상 class 이름이므로 숫자 `10_000`이 원 단위인지, 이미 검증된 금액인지, 어떤 생성 정책을 거치는지 호출부에 표현하기 어렵습니다. class가 이름 있는 `static` method를 생성 진입점으로 제공하면 이 의미를 API에 드러낼 수 있습니다.

```java
Money money = Money.won(10_000);
```

이런 method를 흔히 **static factory method**라고 부릅니다. 여기서 중요한 것은 “`new`를 숨긴다”가 아니라 **호출자가 알아야 할 생성 의미와 class가 소유해야 할 생성 정책을 한 경계에 둔다**는 점입니다.

### 이름은 같은 타입의 서로 다른 생성 의미를 분리한다

```java
final class Temperature {
    private final double celsius;

    private Temperature(double celsius) {
        this.celsius = celsius;
    }

    static Temperature celsius(double value) {
        return new Temperature(value);
    }

    static Temperature fahrenheit(double value) {
        return new Temperature((value - 32) * 5 / 9);
    }
}
```

constructor overload만으로 `double` 하나를 받는 두 생성 의미를 구분할 수는 없습니다. static factory는 `celsius`, `fahrenheit`처럼 의도 자체를 이름에 넣을 수 있습니다.

`of`, `from`, `valueOf`, `parse`, `getInstance` 같은 이름도 널리 사용되지만 이것들은 Java 언어가 의미를 강제하는 keyword가 아닙니다. 실제 변환·복사·캐시 여부는 **각 API의 문서와 구현 계약**이 결정합니다.

### factory는 반드시 새 객체를 만들 필요가 없다

constructor 호출은 새 instance를 만드는 class instance creation 과정에 참여합니다. 반면 static factory는 일반 static method이므로 기존 instance를 반환할 수 있습니다.

```java
Boolean a = Boolean.valueOf(true);
Boolean b = Boolean.valueOf(true);
```

`Boolean.valueOf`는 `Boolean.TRUE` 또는 `Boolean.FALSE`를 반환할 수 있습니다. 호출자는 “새 객체를 만들어 달라”보다 “이 값에 해당하는 Boolean을 달라”는 계약을 사용합니다.

이 차이는 object identity를 설계할 때 중요합니다.

```text
new X(...)      : 새 instance 생성 의미가 분명함
X.of(...)       : 새 instance인지 재사용인지 API 계약을 확인해야 함
```

그래서 static factory 결과에 `==` identity를 기대해서는 안 되는 API가 많습니다. 값 객체라면 보통 `equals` 계약을 사용하는 편이 안전합니다.

### 캐시와 재사용은 immutable object에서 특히 자연스럽다

값이 같으면 instance를 공유해도 의미가 바뀌지 않는 immutable object는 캐시와 잘 맞을 수 있습니다. 반대로 mutable object를 무심코 공유하면 서로 독립적이어야 할 호출자의 상태가 연결됩니다.

```java
class Account {
    String displayName;
}

private static final Account GUEST = new Account();

static Account guest() {
    return GUEST;
}
```

두 호출자가 `guest()`로 같은 mutable `Account`를 받고 한쪽이 `displayName`을 바꾸면 다른 쪽에서도 같은 변경을 봅니다. `synchronized`를 붙여도 두 호출자가 **같은 identity를 공유한다는 의미**는 바뀌지 않습니다.

따라서 factory가 instance를 재사용할 때는 thread-safety보다 앞서 **공유 identity가 도메인 의미에 맞는가**를 봐야 합니다. mutable account처럼 독립 수명이 필요하다면 매번 새 객체를 만들고, 공유 가능한 immutable policy나 metadata만 따로 재사용하는 편이 자연스러울 수 있습니다.

### 반환 타입으로 구현 선택을 숨길 수 있다

static factory는 method의 선언 반환 타입과 실제 반환 class를 다르게 할 수 있습니다.

```java
interface IdGenerator {
    String next();

    static IdGenerator secure() {
        return new SecureRandomIdGenerator();
    }
}
```

호출자는 `IdGenerator` 계약만 알고 실제 구현 class 이름을 알 필요가 없습니다. 이후 구현을 바꾸더라도 공개 계약이 유지되면 호출부 변경을 줄일 수 있습니다.

다만 하위 타입을 반환할 수 있다는 사실이 곧 좋은 abstraction을 보장하는 것은 아닙니다. 반환 타입이 너무 넓어 호출자가 필요한 동작을 표현하지 못하거나, factory가 unrelated 구현 선택을 한곳에 계속 쌓으면 오히려 책임이 흐려질 수 있습니다.

### invariant는 생성 진입점에서 보호할 수 있다

```java
final class Percentage {
    private final int value;

    private Percentage(int value) {
        this.value = value;
    }

    static Percentage of(int value) {
        if (value < 0 || value > 100) {
            throw new IllegalArgumentException();
        }
        return new Percentage(value);
    }
}
```

constructor를 private으로 두고 공개 생성 경로를 `of()`로 제한하면 외부 코드가 검증을 우회하기 어렵습니다. 이때 factory는 단순 변환 helper가 아니라 **유효한 Percentage가 만들어지는 경계**가 됩니다.

물론 public constructor에서도 똑같이 검증할 수 있습니다. invariant 보호에 static factory가 반드시 필요한 것은 아닙니다. factory를 선택할 이유는 검증 외에도 생성 의미의 이름, 구현 선택, instance 재사용 같은 정책이 함께 있을 때 더 분명해집니다.

### static factory와 별도 Factory object는 생성 책임의 위치가 다르다

```java
Money.of(1000)
```

이 형태는 보통 `Money` 자신이 자신의 생성 API를 제공합니다.

```java
PaymentProcessorFactory factory = new PaymentProcessorFactory(config);
PaymentProcessor processor = factory.create(type);
```

별도 Factory object는 여러 제품 구현을 선택하거나 외부 설정·여러 dependency 조합처럼 **class 하나의 내부 생성 규칙을 넘어선 조립 정책**을 별도 책임으로 둘 때 자연스럽습니다.

둘의 이름이 비슷하다고 같은 구조는 아닙니다. “생성 책임을 어디에 두면 가장 응집되는가”를 보면 됩니다.

### Builder와도 해결하는 문제가 다르다

Builder는 선택 인자가 많고 구성 단계가 필요한 문제를 다룹니다.

```java
SearchOption.builder("java")
        .page(1)
        .size(50)
        .build();
```

static factory는 생성 의미나 반환 정책을 이름 있는 한 호출로 표현하는 데 강합니다.

```java
SearchOption.defaultFor("java");
```

복잡한 Builder를 만들고 마지막에 static factory를 또 거치는 식으로 모든 생성 기법을 겹치는 것이 목표는 아닙니다. 필수 인자 몇 개와 명확한 생성 규칙뿐이라면 constructor나 static factory가 더 단순할 수 있습니다.

### domain creation에서는 method 이름이 lifecycle 의미를 전달할 수 있다

`of`, `create`처럼 일반적인 이름보다 domain 상태 전이를 드러내는 이름이 더 유용한 경우가 있습니다.

```java
Order.place(customerId, items);
WrongNote.open(questionId);
QuizSession.start(questionIds);
```

이런 method는 “field를 채워 객체를 만든다”보다 **어떤 유효한 lifecycle 상태로 시작하는가**를 표현합니다. 생성 후 caller가 `setStatus(DRAFT)` 같은 setter를 추가로 호출해야 한다면 생성 책임이 완성되지 않은 것입니다.

### 단점은 발견 가능성과 상속·프레임워크 제약이다

constructor는 `new Type(...)`라는 표준 문법으로 쉽게 찾을 수 있지만 static factory는 사용자가 어떤 이름의 method를 호출해야 하는지 문서나 IDE completion에서 찾아야 합니다. factory가 너무 많고 이름이 불분명하면 생성 API가 오히려 복잡해집니다.

또한 모든 constructor를 private으로 막으면 subclass가 constructor를 호출할 수 없어 일반적인 class 상속이 제한됩니다. persistence나 serialization framework가 특정 constructor 접근성을 요구하는 경우에는 그 요구도 별도로 고려해야 합니다.

그래서 static factory를 판단할 때는 단순히 “Effective Java에서 좋다고 했다”는 식으로 선택하지 않습니다. **이름이 필요한 생성 의미가 있는가, instance 수명이나 구현 선택 정책이 있는가, invariant를 한 경계에 모을 가치가 있는가, 그리고 그 이득이 추가 간접성보다 큰가**를 확인해야 합니다.
