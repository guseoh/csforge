---
kind: concept
contentKey: java.core.object-model.inheritance-is-a
topicContentKey: java.core.object-model
slug: inheritance-is-a
title: "Inheritance와 is-a 관계"
summary: "상속이 진짜 subtype 관계일 때와 결합도를 키우는 경우를 구분한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class inheritance와 overriding 선언 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 상속된 메서드 호출 표현식 확인
---
# Inheritance와 is-a 관계

## 쉬운 진입

“긴급 알림은 알림이다”처럼 자식이 부모의 계약을 진짜로 만족할 때 상속은 자연스럽다. 단순히
코드를 재사용하고 싶다는 이유로 상속하면 부모의 변경과 상태를 원하지 않아도 함께 떠안는다.
상속의 핵심 질문은 “이 구현을 물려받을까?”보다 “항상 이 부모 타입으로 대체 가능한가?”다.

## 정확한 메커니즘

```java
class Notification {
    void send() { /* 공통 계약 */ }
}

final class EmailNotification extends Notification {
    @Override void send() { /* email 전송 */ }
}
```

`EmailNotification`은 `Notification`이 기대되는 곳에 대입될 수 있고 overridden instance method는
실제 객체 타입에 따라 선택된다. 하지만 부모의 protected 상태, constructor 전제, override 규칙은
자식에게 결합된다. 상속은 public/protected 계약과 subtype 대체 가능성을 함께 검토하는 설계이며,
private 구현 재사용을 위한 기본 도구가 아니다.

```text
is-a: EmailNotification ──> Notification 계약을 만족
has-a: Checkout ──> NotificationSender 협력자를 사용
```

## 실전·면접 연결

변경되는 정책·외부 연동·테스트 대역은 composition과 interface 협력이 더 교체하기 쉽다. 상속을
선택했다면 부모 메서드의 invariant와 자식이 지켜야 할 대체 가능성을 문서화하고, 자식이 부모의
내부 상태를 우회하지 않도록 한다.

## 흔한 오해

- 상속은 재사용을 위한 만능 shortcut이 아니다.
- `extends` 관계가 있다고 모든 행동이 올바른 subtype 관계가 되는 것은 아니다.
- 부모의 private field가 자식에 직접 노출되는 것은 아니다.
