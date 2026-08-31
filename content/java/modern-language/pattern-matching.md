---
kind: concept
contentKey: java.core.modern-language.pattern-matching
topicContentKey: java.core.modern-language
slug: pattern-matching
title: "Pattern matching"
summary: "type test와 cast를 줄이면서 pattern variable scope와 exhaustiveness를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html"
    title: "Java Language Specification 14장: Blocks, Statements, and Patterns"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: instanceof·switch pattern scope와 dominance 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html"
    title: "Java Language Specification 15장: Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: pattern expression의 조건 평가 확인
---
# Pattern matching

## 쉬운 진입

예전에는 `instanceof`로 검사한 뒤 다시 cast해야 했다. pattern matching은 검사 성공 시
해당 타입으로 사용할 수 있는 pattern variable을 함께 만든다.

## 정확한 메커니즘

```java
if (value instanceof String text && !text.isBlank()) {
    return text.length();
}
```

`&&`의 오른쪽은 왼쪽 pattern이 true인 경로에서만 실행되므로 `text`를 사용할 수 있다.
`||` 뒤처럼 pattern 성공을 보장하지 않는 경로에서는 scope 밖이다. switch pattern은
exhaustiveness와 dominance를 함께 검사하므로 넓은 `Object` pattern을 먼저 쓰면 뒤의
구체적인 pattern이 도달 불가능해질 수 있다.

## 실전·면접 연결

타입별 behavior를 자연스럽게 분기하지만, 많은 case가 생기면 sealed hierarchy와 함께
전체 subtype 누락을 검토한다. pattern variable의 scope를 억지로 넓히려는 복잡한 boolean
식보다 guard를 작은 메서드로 나누는 편이 안전하다.

## 흔한 오해

- pattern variable은 조건이 false인 경로에서 사용할 수 없다.
- `instanceof`가 object를 다른 타입으로 변환하는 것은 아니다.
- case 순서를 바꿔도 모든 pattern이 독립적으로 평가되는 것은 아니다.
