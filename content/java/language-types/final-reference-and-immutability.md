---
kind: concept
contentKey: java.core.language-types.final-reference-and-immutability
topicContentKey: java.core.language-types
slug: final-reference-and-immutability
title: "final, 재대입과 immutability"
summary: "final 변수 제한과 객체 자체의 불변성을 분리해서 이해한다"
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: final 변수와 값의 언어 의미 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: final field, method, class의 선언 규칙 확인
---
# final, 재대입과 immutability

## 쉬운 진입

`final`은 변수의 이름표를 한 번 붙이면 다른 값을 다시 연결하지 못하게 한다. 이름표가 붙은
상자 안의 물건까지 굳어지는 것은 아니다. 참조 변수에 `final`을 붙여도 그 참조가 가리키는
가변 객체는 여전히 변경될 수 있다.

## 정확한 메커니즘

```java
final StringBuilder builder = new StringBuilder("A");
builder.append("B");       // 객체 내부 변경은 가능
// builder = new StringBuilder("C"); // 컴파일 오류: 참조 재대입 금지
```

`final` 변수는 한 번만 대입할 수 있고, `final` 메서드는 override를 막으며, `final` 클래스는
상속을 막는다. 이는 서로 다른 규칙이다. 객체가 불변이 되려면 상태를 외부에서 바꿀 수 없고,
생성 후 값이 변하지 않으며, 내부의 가변 참조를 그대로 노출하지 않는 등 객체 설계가 필요하다.
`String`은 불변 객체의 예지만 `final StringBuilder`는 그렇지 않다.

## 실전·면접 연결

의존성 참조를 `final`로 두면 생성 후 재대입 오류를 줄일 수 있지만, 협력 객체의 내부 상태까지
불변으로 만들지는 않는다. DTO나 값 객체는 불변 생성과 방어적 복사를 함께 검토하고, `final`을
붙였다는 이유만으로 thread-safe라고 주장하지 않는다.

## 흔한 오해

- `final` 참조는 참조 재대입만 막고 객체 mutation까지 막지 않는다.
- `final` 메서드와 `final` 클래스는 변수의 final과 다른 상속 규칙이다.
- 불변 객체는 단순히 모든 필드에 final을 붙이는 것보다 강한 설계 조건을 가진다.
