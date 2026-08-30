---
kind: concept
contentKey: java.core.object-model.class-constructor
topicContentKey: java.core.object-model
slug: class-constructor
title: 클래스, 객체, 생성자
summary: 클래스의 설계와 객체 생성 과정, 생성자의 역할을 구분한다
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 클래스 선언과 생성자 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html"
    title: "Java Language Specification 12장: Execution"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 클래스와 객체 초기화 순서 확인
---
# 클래스, 객체, 생성자

클래스는 상태와 동작을 정의하는 타입이고, 객체는 그 클래스 정의를 바탕으로 만들어진 실행 시 인스턴스입니다. `new` 표현식은 객체 생성과 생성자 호출을 결합해 새 인스턴스를 초기화합니다.

```java
final class Port {
    private final int number;

    Port(int number) {
        if (number <= 0) throw new IllegalArgumentException("port");
        this.number = number;
    }
}
```

생성자는 반환 타입이 없는 특별한 선언이며, 객체가 외부에 사용되기 전에 필수 상태를 설정하는 좋은 경계입니다. 생성자 내부에서 검증에 실패하면 유효하지 않은 객체를 공개하지 않는 것이 중요합니다. 기본 생성자는 생성자를 하나도 선언하지 않았을 때만 컴파일러가 제공하며, 다른 생성자를 직접 선언하면 자동 제공되지 않습니다.

`this`는 현재 객체를 가리키며, 필드와 매개변수 이름이 같을 때 구분하는 데 사용합니다. 생성자에서 외부로 `this`를 탈출시키거나 오버라이드 가능한 메서드를 호출하면 아직 초기화되지 않은 상태가 관찰될 수 있으므로 피하는 편이 안전합니다.
