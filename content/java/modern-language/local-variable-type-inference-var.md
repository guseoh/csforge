---
kind: concept
contentKey: java.core.modern-language.local-variable-type-inference-var
topicContentKey: java.core.modern-language
slug: local-variable-type-inference-var
title: "Local variable type inference with var"
summary: "var가 dynamic typing이 아니라 compile-time static inference임을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html"
    title: "Java Language Specification 14장: Blocks, Statements, and Patterns"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: local variable type inference 규칙 확인
---
# Local variable type inference with var

## 쉬운 진입

`var`는 “실행 중 타입이 바뀌는 변수”가 아니다. initializer를 compiler가 읽어 local 변수의
정적 타입을 정하고, 이후 메서드 호출과 대입 검사는 명시적 타입을 쓴 것처럼 진행한다.

## 정확한 메커니즘

```java
var names = new ArrayList<String>(); // static type은 ArrayList<String>
names.add("Java");
// names = List.of("JVM"); // ArrayList<String>에 대입할 수 없어 컴파일 오류
```

`var`에는 initializer가 필요하고 field, method parameter, return type을 선언하는 데 쓰지
않는다. diamond operator와 함께 쓰면 실제 추론된 타입이 지나치게 구체적이 될 수 있으므로
오른쪽 표현과 주변 API가 독자에게 드러나는지를 판단한다.

## 실전·면접 연결

긴 generic 타입이나 명확한 constructor에서는 `var`가 noise를 줄인다. `var result =
factory.create()`처럼 반환 타입을 읽어야만 의미를 알 수 있거나 null/익명 타입 추론이
혼동되는 곳에서는 명시적 타입이 계약을 더 잘 보여 준다.

## 흔한 오해

- `var`는 Java의 dynamic typing이나 runtime reflection 변수 선언이 아니다.
- `var x = null`은 추론할 타입이 없어 허용되지 않는다.
- `var`가 generic 정보를 지워 버리거나 raw type으로 바꾸지는 않는다.
