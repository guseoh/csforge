---
kind: concept
contentKey: java.core.api-design.static-factory-method
topicContentKey: java.core.api-design
slug: static-factory-method
title: "Static factory method"
summary: "이름 있는 생성, 재사용과 subtype 반환이 필요한 생성 경계를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: constructor와 class 생성 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html"
    title: "Java SE 25 Integer API"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: valueOf 같은 static factory API의 실제 예시 확인
---
# Static factory method

## 쉬운 진입

`new User(...)`만으로는 이 object가 왜 만들어지는지, 이미 같은 값의 object를 재사용해도
되는지 표현하기 어렵다. `User.guest()`나 `Money.krw(10_000)`처럼 이름을 붙이면 호출자가
생성 목적과 입력 단위를 읽을 수 있다.

## 정확한 메커니즘

static factory method는 constructor 대신 class의 static method가 유효한 object를 반환하는
형태다. private constructor와 함께 사용하면 생성 경계를 한 곳에서 통제할 수 있다.

```java
public final class User {
    private final String name;

    private User(String name) {
        this.name = name;
    }

    public static User guest() {
        return new User("guest");
    }
}
```

factory는 `of`, `from`, `valueOf`, `create`처럼 입력과 결과 관계를 이름으로 드러낼 수 있고,
호출 시점에 구체 subtype을 반환하거나 같은 값 기반 instance를 재사용할 수도 있다. 다만
재사용 여부는 factory의 구현 계약이지 static factory라는 문법 자체의 보장은 아니다.

## 실전·면접 연결

constructor는 항상 새 instance를 만든다는 의도가 강하고, factory는 캐시·검증·구현 선택을
추가할 여지가 있다. 반대로 public constructor가 더 단순하고 호출자가 생성 과정을 명확히
제어해야 한다면 factory를 억지로 만들지 않는다. `Integer.valueOf`처럼 JDK API도 이러한
이름 있는 생성 경계를 사용하지만, 반환 instance identity에 의존하면 안 된다.

## 흔한 오해

- static factory가 factory pattern 전체를 의미하거나 반드시 singleton을 반환하는 것은 아니다.
- `valueOf`가 항상 새 object를 만들거나 항상 같은 object를 반환한다고 가정하지 않는다.
- factory가 private constructor를 숨겨도 반환 값의 불변성까지 자동으로 보장하지는 않는다.
