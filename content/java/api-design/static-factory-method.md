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
  - url: "https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/"
    title: "정적 팩토리 메서드(Static Factory Method)는 왜 사용할까?"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: 이름 있는 생성과 하위 타입 반환 등 정적 팩터리의 대표적인 사용 이유를 한국어 예제로 복습
---
# 정적 팩터리 메서드

객체를 만드는 가장 직접적인 방법은 생성자를 호출하는 것입니다.

```java
Money money = new Money(10_000);
```

하지만 생성자 이름은 항상 클래스 이름이므로, 같은 타입을 서로 다른 의미로 만들거나 생성 정책을 이름으로 드러내고 싶을 때 한계가 있습니다. 이때 클래스가 `static` 메서드를 생성 진입점으로 제공할 수 있습니다.

```java
Money money = Money.won(10_000);
```

이런 메서드를 **정적 팩터리 메서드(static factory method)** 라고 합니다. 핵심은 `new`를 숨기는 데 있지 않고 **생성 의미를 이름으로 표현하고 필요한 생성 정책을 한 경계에 모을 수 있다는 점**입니다.

## 생성 의미에 이름을 붙일 수 있다

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

두 생성 경로는 모두 `double` 하나를 받지만 의미가 다릅니다. 생성자 오버로딩만으로는 같은 매개변수 형태를 두 번 선언할 수 없지만 정적 팩터리는 `celsius`, `fahrenheit`라는 이름으로 의도를 구분합니다.

`of`, `from`, `valueOf`, `parse` 같은 이름이 자주 쓰이지만 Java 언어가 그 의미를 강제하지는 않습니다. 실제 계약은 각 API 문서가 결정합니다.

## 반드시 새 객체를 반환할 필요는 없다

생성자 호출은 새 인스턴스를 만드는 클래스 인스턴스 생성 과정에 참여합니다. 반면 정적 팩터리는 일반 `static` 메서드이므로 기존 인스턴스를 반환할 수도 있습니다.

```java
Boolean value = Boolean.valueOf(true);
```

따라서 `Type.of(...)` 같은 호출만 보고 항상 새 객체라고 가정하면 안 됩니다. 값 객체처럼 동일한 값을 공유해도 문제가 없는 경우에는 재사용이 자연스러울 수 있지만, 가변 객체를 공유하면 호출자들이 같은 상태를 예상치 못하게 함께 보게 될 수 있습니다.

```text
new X(...)  → 새 인스턴스 생성 의미가 분명함
X.of(...)   → 생성·재사용 여부는 그 API의 계약을 확인
```

## 반환 타입과 실제 구현을 분리할 수 있다

```java
interface IdGenerator {
    String next();

    static IdGenerator secure() {
        return new SecureRandomIdGenerator();
    }
}
```

호출자는 `IdGenerator`라는 계약을 받고 실제 구현 클래스는 알 필요가 없습니다. 구현 선택을 생성 API 뒤에 숨길 수 있다는 뜻입니다.

다만 하위 타입을 반환할 수 있다는 사실만으로 좋은 추상화가 되는 것은 아닙니다. 반환 타입이 호출자에게 필요한 책임을 제대로 표현해야 합니다.

## 유효한 생성 경로를 하나로 모을 수 있다

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

생성자를 외부에 열지 않고 `of()`만 공개하면 호출자가 검증을 우회하기 어렵습니다. 물론 public 생성자에서도 같은 검증을 할 수 있으므로 **불변 조건 보호만으로 정적 팩터리가 필수인 것은 아닙니다.** 이름 있는 생성 의미, 구현 선택, 인스턴스 재사용 같은 이유가 함께 있을 때 장점이 더 분명해집니다.

## 생성자·Builder와 해결하는 문제가 다르다

- 필수 인자가 적고 의미가 명확하면 생성자가 가장 직접적입니다.
- 같은 타입의 여러 생성 의미를 이름으로 구분하고 싶다면 정적 팩터리가 유용합니다.
- 선택 인자가 많고 단계적으로 구성해야 한다면 Builder가 더 적합할 수 있습니다.

모든 생성 기법을 한 타입에 겹치는 것이 목표는 아닙니다. **현재 생성 과정에서 실제로 복잡한 부분이 무엇인지**를 보고 가장 작은 API를 고르는 것이 좋습니다.

정적 팩터리는 좋은 도구지만 항상 생성자보다 우월하지는 않습니다. 호출자가 어떤 메서드 이름을 찾아야 하는지 알아야 하고, 팩터리가 너무 많아지면 오히려 생성 API가 복잡해질 수 있습니다. 생성 의미에 이름을 줄 가치가 있는지, 반환 정책을 숨길 필요가 있는지와 그 간접성의 비용을 함께 판단하면 됩니다.
