---
kind: concept
contentKey: java.core.modern-language.default-static-interface-methods
topicContentKey: java.core.modern-language
slug: default-static-interface-methods
title: "Default and static interface methods"
summary: "interface evolution과 다중 default method conflict 해결 규칙을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: default·static method와 interface inheritance 확인
---
# Default and static interface methods

## 쉬운 진입

이미 여러 구현체가 있는 interface에 새 helper 동작을 추가하면 모든 구현체를 즉시 수정해야
할 수 있다. default method는 기본 구현을 제공해 interface를 진화시키는 선택지다. 반면
static interface method는 interface 이름으로 호출하는 utility이며 구현체의 instance method가
자동 상속하는 동작이 아니다.

## 정확한 메커니즘

```java
interface Auditable {
    default String label() { return "audit"; }
    static boolean valid(String value) { return value != null && !value.isBlank(); }
}
```

두 부모 interface가 같은 signature의 default를 제공하면 구현 class가 override해 충돌을
해결해야 한다. class의 concrete method가 interface default보다 우선하고, 명시적 부모
default는 `Parent.super.method()`로 선택할 수 있다. static interface method는 상속으로
호출하지 않고 `Auditable.valid(...)`처럼 선언 interface로 호출한다.

## 실전·면접 연결

default method가 상태나 숨은 side effect를 요구하면 interface 계약이 무거워진다. 독립적인
helper는 static이나 별도 utility가 낫고, 여러 capability의 default가 충돌할 때는 명시적인
override로 도메인 의미를 결정한다.

## 흔한 오해

- interface static method가 구현 class instance로 다형적으로 dispatch되는 것은 아니다.
- default method가 모든 충돌을 자동으로 우선순위 정리하지 않는다.
- default 구현을 추가해도 기존 구현체의 business invariant가 자동으로 맞춰지지 않는다.
