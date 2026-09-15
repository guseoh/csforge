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
  - url: "https://tecoble.techcourse.co.kr/post/2020-10-27-polymorphism/"
    title: "Tecoble: 다형성(Polymorphism)이란?"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 2
    relationNote: 상위 타입 계약으로 여러 구현 객체를 다루는 예시를 한국어로 복습
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

`animal`의 선언 타입은 `Animal`이고 실제 객체는 `Dog`입니다. 호출 가능한 메서드를 컴파일러가 판단할 때는 선언 타입이 중요하고, override된 인스턴스 메서드의 실제 구현을 선택할 때는 런타임 객체 타입이 중요합니다.

```text
1. 컴파일 시점
Animal 타입에서 sound() 호출이 가능한가?
        │
        ▼
2. 실행 시점
실제 객체가 어떤 구현을 가지고 있는가?
        │
        ▼
Dog.sound() 실행
```

이처럼 실행 시점의 실제 객체를 기준으로 override된 메서드 구현을 고르는 것을 **동적 디스패치(dynamic dispatch)** 라고 합니다.

### 상위 타입에 없는 메서드는 바로 호출할 수 없다

```java
class Dog extends Animal {
    void fetch() {}
}

Animal animal = new Dog();
// animal.fetch(); // 컴파일 오류
```

실제 객체가 `Dog`라고 해서 `Dog`의 모든 메서드를 바로 호출할 수 있는 것은 아닙니다. 컴파일러는 `animal`의 선언 타입인 `Animal`이 제공하는 계약을 기준으로 호출 가능 여부를 판단합니다.

이 제약 덕분에 호출자는 구체 구현보다 상위 타입이 제공하는 공통 계약에 의존할 수 있습니다.

### 필드와 static 메서드는 같은 규칙으로 보면 안 된다

동적 디스패치는 override된 **인스턴스 메서드**에 대한 설명입니다. 필드는 override되지 않고, static 메서드도 인스턴스 메서드와 같은 방식으로 런타임 객체에 따라 선택되지 않습니다.

```java
class Parent {
    String name = "parent";
}

class Child extends Parent {
    String name = "child";
}

Parent value = new Child();
System.out.println(value.name); // 선언 타입 기준의 필드 접근
```

따라서 “실제 객체가 `Child`니까 모든 접근이 `Child` 기준이다”라고 일반화하면 안 됩니다.

### 다형성의 가치는 같은 계약으로 다른 구현을 다루는 데 있다

```java
interface PaymentProcessor {
    void pay(Order order);
}
```

카드 결제와 계좌 결제가 같은 `PaymentProcessor` 계약을 지킬 수 있다면 호출 코드는 구체 구현 이름을 몰라도 `pay()`를 요청할 수 있습니다. 새 구현이 추가되어도 호출자가 같은 계약만 사용한다면 변경 범위를 줄이기 쉽습니다.

다만 다형성이 모든 조건문을 없애는 기술은 아닙니다. 입력 종류를 분류하거나 결과 형식 자체가 다른 경우처럼 분기가 자연스러운 상황도 있습니다. 핵심은 **여러 구체 타입에 대해 같은 종류의 행동을 반복해서 분기하고 있다면 공통 계약으로 표현할 수 있는지** 검토하는 것입니다.

메서드 호출 결과를 추적할 때는 **선언 타입에서 호출 가능한가 → 실제 객체가 어떤 타입인가 → override된 인스턴스 메서드인가** 순서로 보면 overload나 필드 숨김과 섞여도 정리하기 쉽습니다.
