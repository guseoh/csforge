---
kind: concept
contentKey: java.core.functional.method-reference-functional-composition
topicContentKey: java.core.functional
slug: method-reference-functional-composition
title: "Method references and functional composition"
summary: "method reference와 Predicate·Function 조합으로 의도를 드러낸다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: method reference와 lambda target 규칙 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/Function.html"
    title: "Java SE 25 API: Function"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: andThen·compose 조합 계약 확인
---
# Method references and functional composition

## 쉬운 진입

이미 이름이 있는 메서드를 단지 전달하려고 `x -> x.trim()`을 다시 쓰면 noise가 생긴다.
`String::trim` 같은 method reference는 필요한 target interface에 맞춰 기존 동작을 가리키는
간결한 표현이다.

## 정확한 메커니즘

```java
Function<String, String> normalize = String::trim;
Function<String, String> canonical = normalize.andThen(String::toUpperCase);
Predicate<String> usable = ((Predicate<String>) String::isBlank).negate();
```

`Function.compose`는 앞의 변환을 먼저 적용하고 `andThen`은 현재 function 뒤에 다음 변환을
적용한다. method reference도 lambda와 마찬가지로 target type이 필요하며, overloaded method는
문맥에 따라 모호할 수 있다.

## 실전·면접 연결

작은 순수 변환을 조합하면 parsing → normalization → validation 같은 흐름이 이름으로 읽힌다.
부작용이 있는 함수 조합은 실행 순서와 실패 semantics가 복잡해지므로 명시적인 메서드가 더
좋을 수 있다. 이 조합은 stream 자체의 실행 모델과는 별개로 일반 함수 API의 계약이다.

## 흔한 오해

- method reference는 무조건 더 짧다고 좋은 것이 아니다. target과 overload가 불명확하면 lambda가 낫다.
- `compose`와 `andThen`은 같은 순서가 아니다.
- function을 조합해도 예외나 side effect가 자동으로 처리되지 않는다.
