---
kind: concept
contentKey: java.core.modern-language.switch-expressions
topicContentKey: java.core.modern-language
slug: switch-expressions
title: "Switch expressions"
summary: "expression switch, arrow label, exhaustiveness와 yield를 구분한다"
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html"
    title: "Java Language Specification 14장: Blocks, Statements, and Patterns"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: switch expression·yield·exhaustiveness 확인
---
# Switch expressions

## 쉬운 진입

기존 switch statement가 변수에 값을 대입하는 여러 줄을 필요로 했다면 switch expression은
선택 자체가 값을 만든다고 표현한다. 화살표 label은 fall-through를 기본으로 만들지 않아
각 case의 결과 경계가 읽기 쉽다.

## 정확한 메커니즘

```java
int days = switch (month) {
    case 1, 3, 5 -> 31;
    case 2 -> 28;
    default -> 30;
};
```

block case에서 여러 문장을 실행한 뒤 값을 내보내려면 `yield`를 사용한다. expression은
모든 가능한 입력에 값을 제공해야 하므로 enum·sealed hierarchy에서는 exhaustiveness를
검토한다. 전통적인 colon case의 fall-through와 arrow rule은 서로 다른 동작이다.

## 실전·면접 연결

branch별로 서로 다른 값을 계산할 때 임시 mutable 변수와 누락 가능한 default를 줄인다.
부작용이 있는 긴 case block은 별도 메서드로 추출해 expression이 값 계산인지 workflow인지
명확하게 유지한다.

## 흔한 오해

- arrow case는 다음 case로 자동 fall-through하지 않는다.
- `yield`는 메서드 전체에서 return하는 문법이 아니다.
- switch expression의 모든 case가 반드시 한 줄이어야 하는 것은 아니다.
