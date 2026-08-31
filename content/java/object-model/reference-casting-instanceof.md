---
kind: concept
contentKey: java.core.object-model.reference-casting-instanceof
topicContentKey: java.core.object-model
slug: reference-casting-instanceof
title: "참조 타입 변환과 instanceof"
summary: "상위 타입으로의 안전한 변환과 하위 타입으로의 검사가 필요한 변환을 구분하고 pattern matching을 활용한다"
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html"
    title: "JLS 5 Conversions and Contexts"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: reference widening·narrowing conversion 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.20.2"
    title: "JLS 15.20.2 The instanceof Operator"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: instanceof와 pattern matching 규칙 확인
---
# 참조 타입 변환과 instanceof

상속이나 인터페이스를 사용하면 하나의 객체를 여러 타입의 참조로 바라볼 수 있습니다. 중요한 것은 **참조 변수의 타입을 바꾸는 것과 실제 객체의 타입을 바꾸는 것은 다르다**는 점입니다.

```java
Dog dog = new Dog();
Animal animal = dog;
```

`Dog` 객체가 `Animal` 객체로 변한 것이 아닙니다. 같은 `Dog` 객체를 `Animal` 타입 참조로 바라보는 것입니다.

### 상위 타입으로의 변환은 자연스럽다

`Dog`가 `Animal`의 하위 타입이라면 모든 `Dog`는 `Animal`로 다룰 수 있으므로 다음 변환은 안전합니다.

```java
Dog dog = new Dog();
Animal animal = dog;
```

이런 방향을 흔히 **업캐스팅(upcasting)** 또는 widening reference conversion이라고 부릅니다. 보통 명시적 cast가 필요하지 않습니다.

### 하위 타입으로 내려갈 때는 실제 객체를 확인해야 한다

```java
Animal animal = new Dog();
Dog dog = (Dog) animal; // 실제 객체가 Dog이므로 성공
```

하지만 다음은 다릅니다.

```java
Animal animal = new Cat();
Dog dog = (Dog) animal; // ClassCastException
```

컴파일러가 타입 관계상 cast 문법을 허용해도 실제 객체가 `Dog`가 아니라면 실행 중 `ClassCastException`이 발생합니다.

```text
Animal 변수
   │
   ├─ 실제 Dog 객체 → (Dog) 성공
   └─ 실제 Cat 객체 → (Dog) 실패 → ClassCastException
```

### instanceof로 검사와 사용을 함께 표현할 수 있다

```java
if (animal instanceof Dog dog) {
    dog.fetch();
}
```

패턴 매칭을 사용하면 `animal`이 실제로 `Dog`인지 검사하고, 성공한 범위에서 `Dog` 타입 변수도 얻을 수 있습니다. 예전처럼 검사 후 다시 cast하는 코드보다 의도가 분명합니다.

```java
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
}
```

### downcast가 많으면 설계를 다시 볼 수도 있다

다형성의 장점은 호출자가 구체 타입을 몰라도 공통 계약을 사용할 수 있다는 데 있습니다. 코드 곳곳에서 `instanceof`로 구체 타입을 나눠 처리한다면 상위 타입의 책임이 부족하거나 동작을 각 객체로 옮길 수 없는지 검토할 가치가 있습니다.

다만 모든 `instanceof`가 나쁜 것은 아닙니다. 외부 입력을 타입별로 분기하거나 sealed hierarchy를 처리하는 등 타입 검사가 자연스러운 경우도 있습니다.

### 문제를 풀 때 확인할 것

1. 변수의 선언 타입은 무엇인가?
2. 실제 객체는 어떤 타입으로 생성되었는가?
3. cast하려는 타입과 실제 객체 사이에 호환 관계가 있는가?
4. 단순히 메서드를 호출하기 위해 불필요한 downcast를 하고 있지는 않은가?

cast는 객체를 변환하는 마법이 아니라 **같은 객체를 더 구체적인 참조 타입으로 사용해도 되는지 확인하는 과정**이라고 이해하면 됩니다.
