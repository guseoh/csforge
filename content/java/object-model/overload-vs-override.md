---
kind: concept
contentKey: java.core.object-model.overload-vs-override
topicContentKey: java.core.object-model
slug: overload-vs-override
title: "Overload와 override"
summary: "compile-time overload 선택과 runtime override dispatch를 분리한다"
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: method overload 선택과 invocation 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: method overriding와 signature 규칙 확인
---
# Overload와 override

## 쉬운 진입

같은 “주문 처리”라는 이름이라도 매개변수 종류가 다르면 overload이고, 부모가 정한 같은 행동을
자식이 다시 구현하면 override다. 하나는 컴파일할 때 어느 메서드 시그니처를 부를지 정하는
문제이고, 다른 하나는 실제 object가 어떤 구현을 실행할지 정하는 문제다.

## 정확한 메커니즘

```java
class Printer {
    void print(Object value) { System.out.println("object"); }
    void print(String value) { System.out.println("string"); }
}

class SpecialPrinter extends Printer {
    @Override void print(Object value) { System.out.println("special object"); }
}

Object value = "Java";
Printer printer = new SpecialPrinter();
printer.print(value); // special object: compile-time overload은 Object, runtime override는 SpecialPrinter
```

overload 선택은 변수의 정적 타입과 인자 형식을 바탕으로 compile time에 결정된다. 선택된
signature가 부모 method라면 그 signature에 대한 override가 runtime에 dispatch된다. 반환 타입만
바꾼 선언은 overload가 되지 않으며, override는 부모 계약을 깨지 않는 대체 구현이어야 한다.

## 실전·면접 연결

API overload를 늘리면 호출부의 compile-time 타입이 결과를 바꿀 수 있으므로 null과 상속 관계를
포함한 호출을 테스트한다. 다형성 확장이 목적이면 overload가 아니라 공통 interface와 override가
더 명확한지 살핀다.

## 흔한 오해

- overload가 runtime object 타입을 보고 다시 선택되는 것은 아니다.
- override는 method name만 같으면 되는 것이 아니라 signature·접근·상속 계약의 제약을 따른다.
- `static` method hiding은 override와 같은 dynamic dispatch가 아니다.
