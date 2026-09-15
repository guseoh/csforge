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
  - url: "https://tecoble.techcourse.co.kr/post/2021-04-26-instanceof/"
    title: "Tecoble: instanceof의 사용을 지양하자"
    referenceType: KOREAN_BLOG
    language: ko
    displayOrder: 3
    relationNote: 구체 타입 분기가 반복될 때 다형성으로 책임을 이동할 수 있는 설계 사례 참고
---
# 참조 타입 변환과 instanceof

상속이나 인터페이스를 사용하면 하나의 객체를 여러 참조 타입으로 바라볼 수 있습니다. 중요한 점은 **참조 변수의 타입을 바꾸는 것과 실제 객체의 타입을 바꾸는 것은 다르다**는 것입니다.

```java
Dog dog = new Dog();
Animal animal = dog;
```

여기서 `Dog` 객체가 `Animal` 객체로 변한 것이 아닙니다. 같은 `Dog` 객체를 `Animal` 타입 참조로 바라보는 것입니다.

### 상위 타입으로의 변환

`Dog`가 `Animal`의 하위 타입이라면 모든 `Dog`는 `Animal`로 다룰 수 있습니다.

```java
Dog dog = new Dog();
Animal animal = dog;
```

이 방향을 흔히 **업캐스팅(upcasting)** 또는 widening reference conversion이라고 부르며 일반적으로 명시적인 cast가 필요하지 않습니다.

### 하위 타입으로 좁힐 때는 실제 객체가 중요하다

```java
Animal animal = new Dog();
Dog dog = (Dog) animal; // 실제 객체가 Dog이므로 성공
```

반면 다음 코드는 컴파일은 가능하지만 실행 중 실패합니다.

```java
Animal animal = new Cat();
Dog dog = (Dog) animal; // ClassCastException
```

```text
Animal 참조
   │
   ├─ 실제 Dog 객체 → (Dog) 성공
   └─ 실제 Cat 객체 → (Dog) 실패
                      → ClassCastException
```

cast가 성공해도 객체가 새로 만들어지거나 다른 종류의 객체로 변하는 것은 아닙니다. **같은 객체를 더 구체적인 참조 타입으로 사용할 수 있는지 확인**하는 것입니다.

### instanceof 패턴으로 검사와 사용을 함께 표현할 수 있다

```java
if (animal instanceof Dog dog) {
    dog.fetch();
}
```

이 코드는 `animal`이 `Dog`와 호환되는 실제 객체인지 검사하고, 성공한 범위에서 `Dog` 타입 변수 `dog`를 제공합니다. 예전처럼 검사 뒤 다시 cast하는 코드보다 의도가 직접적입니다.

```java
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
}
```

`null instanceof Dog`의 결과는 `false`입니다. 따라서 패턴이 성공한 블록 안에서는 적합한 타입의 실제 객체를 얻었다고 볼 수 있습니다.

### 반복적인 하위 타입 검사는 설계 신호가 될 수 있다

```java
if (payment instanceof CardPayment card) {
    card.pay();
} else if (payment instanceof AccountPayment account) {
    account.pay();
}
```

두 타입이 모두 같은 `pay()` 책임을 제공할 수 있다면 공통 타입에서 `payment.pay()`로 호출하는 편이 더 자연스러울 수 있습니다. 이런 경우 반복적인 타입 검사는 다형성으로 책임을 이동할 수 있는지 검토할 신호입니다.

그렇다고 모든 `instanceof`가 나쁜 것은 아닙니다. 외부 입력의 종류를 분류하거나 sealed hierarchy의 variant를 명시적으로 처리하는 것처럼 **타입 자체가 분기의 중요한 정보인 경우**에는 타입 검사가 자연스럽습니다.

참조 타입 변환 문제를 볼 때는 **변수의 선언 타입 → 실제 객체 타입 → 좁히려는 타입과의 호환성**을 순서대로 확인하면 됩니다. cast는 객체를 바꾸는 연산이 아니라 같은 객체를 어떤 참조 타입으로 안전하게 다룰 수 있는지 확인하는 과정입니다.
