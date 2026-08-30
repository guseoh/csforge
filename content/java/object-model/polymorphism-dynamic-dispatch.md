---
kind: concept
contentKey: java.core.object-model.polymorphism-dynamic-dispatch
topicContentKey: java.core.object-model
slug: polymorphism-dynamic-dispatch
title: "Polymorphism과 dynamic dispatch"
summary: "선언 타입과 실제 객체 타입을 구분해 override 호출 결과를 예측한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: method invocation과 receiver 평가 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: overriding과 상속된 method 규칙 확인
---
# Polymorphism과 dynamic dispatch

## 쉬운 진입

리모컨은 “재생한다”는 버튼만 알지만 실제 기기가 TV인지 오디오인지에 따라 반응이 달라질 수
있다. Java에서도 변수의 선언 타입은 사용할 수 있는 계약을 정하고, override된 instance method의
실행 구현은 런타임 object 타입에 따라 선택된다.

## 정확한 메커니즘

```java
class Bird {
    String sound() { return "?"; }
}
final class Duck extends Bird {
    @Override String sound() { return "quack"; }
}

Bird bird = new Duck();
System.out.println(bird.sound()); // quack
```

`bird`의 정적 타입은 `Bird`라서 Bird 계약으로 컴파일되지만 실제 receiver는 `Duck`이다.
따라서 virtual instance method 호출은 Duck override로 dispatch된다. 이 규칙은 field나 static
method에 그대로 적용되지 않는다. `bird`가 직접 접근할 수 있는 멤버와 실제 호출 구현을 나누어
생각해야 한다.

```text
정적 타입 Bird ── compile-time 계약/접근 가능 멤버
      │
      └── 실제 객체 Duck ── runtime override dispatch → Duck.sound()
```

## 실전·면접 연결

interface나 부모 타입으로 컬렉션·서비스를 받으면 구현 교체와 확장이 쉬워진다. 다만 어떤
override가 선택되는지, constructor 중 초기화 중 virtual call은 안전한지까지 확인한다. JIT가
호출을 최적화할 수 있어도 관찰 가능한 Java 의미를 바꾸지는 않는다.

## 흔한 오해

- 선언 타입이 부모라고 부모 구현이 항상 실행되는 것은 아니다.
- field hiding과 static method hiding은 instance override의 dynamic dispatch와 다르다.
- polymorphism은 cast를 많이 하는 설계가 아니라 공통 계약으로 구현을 대체하는 방식이다.
