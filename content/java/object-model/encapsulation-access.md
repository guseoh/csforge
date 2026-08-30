---
kind: concept
contentKey: java.core.object-model.encapsulation-access
topicContentKey: java.core.object-model
slug: encapsulation-access
title: 캡슐화와 접근 제어
summary: 객체의 상태를 보호하고 변경 규칙을 한 곳에 모으는 설계 원칙
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html"
    title: "Java Language Specification 6장: Names, Scopes, and Declarations"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 접근 제어자와 선언 범위 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 필드와 메서드 선언 구조 확인
---
# 캡슐화와 접근 제어

캡슐화는 데이터를 숨기는 것만이 아니라, 상태가 바뀌는 규칙과 불변식을 객체의 경계 안에 두는 것입니다. `private` 필드와 의도를 드러내는 메서드를 사용하면 호출자가 상태를 임의로 깨뜨리지 못하게 할 수 있습니다.

```java
final class Account {
    private long balance;

    void deposit(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount");
        balance += amount;
    }
}
```

공개 setter는 “어떤 값이든 대입”하게 만들기 때문에 불변식이 여러 호출자에게 흩어질 수 있습니다. `activate()`, `changePassword()`, `addLineItem()`처럼 의도 중심 메서드는 허용된 상태 전이를 표현하고 검증 책임을 객체에 둡니다.

## 접근 수준의 선택

`private`는 선언한 클래스 안에서만, package-private은 같은 패키지에서, `protected`는 상속과 패키지 관계에서, `public`은 어디서나 접근할 수 있게 합니다. 가장 넓은 접근 수준을 기본값으로 고르기보다 실제 협력 경계에 필요한 최소 수준을 선택하면 변경 영향이 줄어듭니다.
