---
kind: concept
contentKey: java.core.object-model.reference-casting-instanceof
topicContentKey: java.core.object-model
slug: reference-casting-instanceof
title: "Reference casting과 instanceof"
summary: "upcasting·downcasting과 runtime type 검사의 의미를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html"
    title: "Java Language Specification 5장: Conversions and Contexts"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: casting과 narrowing reference conversion 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: cast expression과 instanceof 평가 확인
---
# Reference casting과 instanceof

## 쉬운 진입

큰 상자 라벨을 `Animal`이라고 바꿔 붙였다고 안에 있는 object가 실제로 `Dog`가 되는 것은 아니다.
상위 타입으로 바라보는 upcast는 대체로 안전하지만, 하위 타입이라고 단정하는 downcast는 실제
object가 정말 그 타입인지 확인해야 한다.

## 정확한 메커니즘

```java
class Animal { }
final class Dog extends Animal {
    void bark() { }
}

Animal animal = new Dog();       // upcasting: Dog를 Animal 계약으로 봄
if (animal instanceof Dog dog) { // runtime type 검사 후 pattern variable
    dog.bark();
}

Animal other = new Animal();
Dog fail = (Dog) other;          // ClassCastException
```

cast는 reference의 정적 관점을 바꾸거나 narrowing을 요청할 뿐 object 자체의 runtime type을 바꾸지
않는다. `instanceof`는 null이면 false이고 실제 object가 검사 타입과 호환되는지 확인한다. Java 25의
pattern matching 문법은 검사와 안전한 변수 바인딩을 한 표현식에 묶지만, 설계적으로 cast가 반복된다면
공통 계약이나 polymorphism으로 분기 자체를 줄일 수 있는지 먼저 본다.

```text
Dog object를 Animal reference로 봄
  upcast   → 더 일반적인 Animal 계약으로 본다
             → Dog 전용 멤버는 Animal reference를 통해 직접 사용할 수 없음

Animal reference를 Dog로 downcast
  downcast → 더 구체적인 Dog 관점으로 보려는 요청
             → runtime object가 Dog와 호환되는지 검사 후 Dog 전용 멤버 접근 가능
```

## 실전·면접 연결

외부 입력을 곧바로 cast하지 말고 타입 경계에서 검증한다. `instanceof`가 모든 복잡한 타입
분기를 좋은 설계로 바꾸지는 않으며, 여러 구현의 행동 차이는 interface method로 위임하는 편이
변경에 강할 수 있다.

## 흔한 오해

- cast는 object 복사나 object 자체의 runtime type 변경이 아니다.
- reference의 정적 타입을 바꾼다고 실제 object가 새 subtype instance로 변환되는 것은 아니다.
- 잘못된 downcast는 컴파일될 수 있어도 runtime에 `ClassCastException`을 낼 수 있다.
- `null instanceof Dog`는 예외가 아니라 false다.
