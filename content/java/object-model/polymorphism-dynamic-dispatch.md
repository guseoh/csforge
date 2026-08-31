---
kind: concept
contentKey: java.core.object-model.polymorphism-dynamic-dispatch
topicContentKey: java.core.object-model
slug: polymorphism-dynamic-dispatch
title: "다형성과 런타임 메서드 선택"
summary: "변수의 선언 타입과 실제 객체 타입을 구분하고 override된 인스턴스 메서드가 실행 시점에 선택되는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12"
    title: "JLS 15.12 Method Invocation Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 메서드 호출과 런타임 메서드 선택 규칙 확인
---
# 다형성과 런타임 메서드 선택

다형성을 이해하려면 **변수의 선언 타입과 실제 객체 타입을 따로 봐야 합니다.** 상위 타입 변수로 하위 타입 객체를 가리킬 수 있고, override된 인스턴스 메서드는 실제 객체에 맞는 구현이 실행됩니다.

```java
class Animal {
    void sound() {
        System.out.println("animal");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("dog");
    }
}

Animal animal = new Dog();
animal.sound(); // dog
```

`animal` 변수의 선언 타입은 `Animal`이지만 실제 객체는 `Dog`입니다. 호출 가능한 메서드를 컴파일러가 판단할 때는 선언 타입이 중요하고, override된 인스턴스 메서드의 실제 구현을 선택할 때는 런타임 객체 타입이 중요합니다.

### 두 단계로 나누면 헷갈리지 않는다

메서드 호출을 볼 때 다음처럼 생각할 수 있습니다.

```text
1. 컴파일 시점
Animal 변수에서 sound() 호출이 허용되는가?
        │
        ▼
2. 실행 시점
실제 객체는 Dog인가?
        │
        ▼
Dog.sound() 실행
```

이런 실행 시점 선택을 **동적 디스패치(dynamic dispatch)** 라고 부릅니다.

### 상위 타입에 없는 메서드는 바로 호출할 수 없다

```java
class Dog extends Animal {
    void fetch() {}
}

Animal animal = new Dog();
// animal.fetch(); // 컴파일 오류
```

실제 객체가 `Dog`라는 사실만으로 모든 `Dog` 메서드를 호출할 수 있는 것은 아닙니다. 변수의 선언 타입이 `Animal`이므로 컴파일러는 `Animal`이 제공하는 계약을 기준으로 호출 가능 여부를 판단합니다.

이 특성이 오히려 장점입니다. 호출자는 구체적인 `Dog` 구현 대신 `Animal`이 제공하는 동작만 의존할 수 있습니다.

### 필드와 static 메서드는 같은 방식으로 생각하지 않는다

다형적 override 규칙은 인스턴스 메서드에 대한 설명입니다. 필드는 override되는 것이 아니고, static 메서드도 인스턴스 메서드와 같은 동적 디스패치를 사용하지 않습니다.

```java
class Parent {
    String name = "parent";
}

class Child extends Parent {
    String name = "child";
}

Parent value = new Child();
System.out.println(value.name); // 선언 타입의 필드 규칙을 봐야 함
```

따라서 “실제 객체가 Child니까 모든 접근이 Child 기준”이라고 외우면 문제를 틀릴 수 있습니다.

### 실무에서 다형성이 주는 가치

```java
interface PaymentProcessor {
    void pay(Order order);
}
```

호출 코드가 `PaymentProcessor` 계약만 알면 카드 결제, 계좌 결제 등 구체 구현을 교체하거나 추가할 수 있습니다. 이때 중요한 것은 구현 클래스 이름보다 **공통 계약이 실제로 같은 의미를 가지는가**입니다.

Spring DI는 이런 구현 객체를 연결하는 일을 도와주지만, 다형성 자체는 Java의 타입과 메서드 호출 규칙입니다.

### 문제를 풀 때 확인할 것

1. 변수의 선언 타입은 무엇인가?
2. 그 타입에서 호출 자체가 허용되는가?
3. 실제 객체 타입은 무엇인가?
4. 호출 대상이 override 가능한 인스턴스 메서드인가?

이 순서를 지키면 overload, field hiding, static method와 섞인 문제도 구분하기 쉬워집니다.
