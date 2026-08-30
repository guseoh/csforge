---
kind: concept
contentKey: java.core.language-types.pass-by-value
topicContentKey: java.core.language-types
slug: pass-by-value
title: "Pass-by-value"
summary: "Java 메서드 호출에서 원시 값과 참조 값이 어떻게 복사되는지 이해한다"
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 메서드 호출과 인자 평가 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 참조 값의 언어 의미 확인
---
# Pass-by-value

## 쉬운 진입

메서드에 서류를 건넨다고 해서 상대가 내 서류함의 칸 자체를 바꿀 수 있는 것은 아니다. Java는
호출자가 가진 **값을 복사**해서 매개변수 변수에 넣는다. 참조형이면 객체를 가리키는 참조 값이
복사되므로 같은 객체의 변경은 보일 수 있지만, 매개변수에 새 객체를 대입하는 것은 호출자 변수와 별개다.

## 정확한 메커니즘

```java
static void appendMark(StringBuilder text) {
    text.append("!");             // 복사된 참조 값으로 같은 객체 변경
}

static void replace(StringBuilder text) {
    text = new StringBuilder("new"); // 매개변수 변수만 재대입
}

StringBuilder original = new StringBuilder("cs");
appendMark(original); // cs!
replace(original);    // original은 여전히 cs!
```

```text
호출자 original ──┐
                  ├─ 참조 값 복사 ──> 같은 StringBuilder 객체
매개변수 text ────┘

text = 새 객체  ──> 매개변수 연결만 변경, original은 변경 없음
```

원시형은 숫자나 boolean 값 자체가 복사되고, 참조형은 객체가 아니라 참조 값이 복사된다. 따라서
“Java는 객체를 reference로 전달한다”는 표현보다 “항상 value를 전달하고 그 값이 reference일 수
있다”고 말해야 재대입과 내부 변경을 모두 설명할 수 있다.

## 실전·면접 연결

호출자 상태를 변경하는 API는 가변 객체를 명시적으로 받거나 새 값을 반환하도록 계약을 정한다.
여러 값을 동시에 바꿔야 한다면 명확한 결과 객체를 반환하는 방식이 매개변수 부작용을 줄일 수 있다.
이 개념은 JVM의 실제 포인터 표현이나 stack 배치를 설명하는 주장이 아니다.

## 흔한 오해

- 참조형 매개변수라고 호출자 변수를 재대입할 수 있는 것은 아니다.
- 내부 객체의 변경이 보인다고 객체 자체가 reference로 전달된다는 뜻은 아니다.
- Java에는 호출자 변수 alias를 직접 전달하는 pass-by-reference가 없다.
