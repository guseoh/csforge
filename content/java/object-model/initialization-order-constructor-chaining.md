---
kind: concept
contentKey: java.core.object-model.initialization-order-constructor-chaining
topicContentKey: java.core.object-model
slug: initialization-order-constructor-chaining
title: "Initialization order와 constructor chaining"
summary: "class 초기화와 instance 생성, this/super constructor 호출 순서를 예측한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html"
    title: "Java Language Specification 12장: Execution"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class initialization과 instance creation 순서 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: constructor declaration와 constructor invocation 확인
  - url: "https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html"
    title: "Java SE 25 Flexible Constructor Bodies"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: Java 25 early construction context와 super 이전 field initialization 규칙 확인
---
# Initialization order와 constructor chaining

## 쉬운 진입

새 object를 만들 때 constructor 본문만 갑자기 실행되는 것이 아니다. class 차원의 준비가 먼저
필요할 수 있고, superclass 쪽 생성 과정을 거친 뒤 subclass의 field initializer와 constructor body가
이어진다. 순서를 모르면 아직 준비되지 않은 값이나 override 메서드를 생성 중에 사용하는 실수를 만든다.

## 정확한 메커니즘

```java
class Parent {
    static { System.out.println("P static"); }
    { System.out.println("P instance"); }
    Parent() { System.out.println("P ctor"); }
}

class Child extends Parent {
    static { System.out.println("C static"); }
    { System.out.println("C instance"); }
    Child() { System.out.println("C ctor"); }
}
```

처음 class initialization이 필요하다면 superclass가 먼저 초기화되고 그 뒤 subclass가 초기화된다.
instance 생성에서는 명시적 또는 암시적 `super()`가 superclass constructor chain을 시작한다. 가장 위의
superclass부터 돌아오면서 각 class의 instance field initializer와 instance initializer가 실행되고,
그 class의 constructor body가 이어진다. 이후 제어가 subclass constructor로 돌아오면 같은 순서가
subclass에 적용된다. `this(...)`는 같은 class의 다른 constructor로 위임한다.

Java SE 25의 flexible constructor bodies는 explicit constructor invocation 앞에 prologue를 둘 수 있게
한다. 이 early construction context에서는 현재 instance field를 읽거나 instance method를 호출하는 등의
접근은 제한되지만, assignment operator로 현재 instance field를 초기화하는 것은 허용된다. 한 constructor에서
`this(...)`와 `super(...)`를 동시에 호출할 수는 없다.

```text
class initialization (필요 시): superclass → subclass

new Child()
  → superclass constructor chain 진입
      → Parent field / instance initializer
      → Parent constructor body
  → Child field / instance initializer
  → Child constructor body
```

상속 단계가 더 많다면 superclass 부분이 같은 방식으로 반복된다.

## 실전·면접 연결

constructor에서 overridable instance method를 호출하면 아직 subclass 초기화가 끝나지 않은 상태를
관찰할 수 있다. Java 25에서는 필요한 field를 `super()` 전에 안전하게 assignment하는 선택지가 생겼지만,
초기화 순서를 이용해 복잡한 부작용을 만들기보다 필수 상태를 constructor 인자로 받고 생성 중 외부 협력을
최소화하는 것이 기본이다. 정확한 class loading 시점과 실제 JVM 최적화는 명세와 구현을 나눠서 설명한다.

## 흔한 오해

- subclass constructor body가 superclass constructor body보다 먼저 실행되는 것은 아니다.
- Java 25의 `super()` 이전 구간에서 현재 instance를 자유롭게 읽거나 instance method를 호출할 수 있는 것은 아니다.
- 반대로 Java 25에서 `super()` 앞의 모든 instance field assignment가 금지된 것도 아니다.
- static initializer는 object마다 한 번씩 실행되는 instance initializer가 아니다.
