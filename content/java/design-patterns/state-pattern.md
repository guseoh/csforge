---
kind: concept
contentKey: java.core.design-patterns.state-pattern
topicContentKey: java.core.design-patterns
slug: state-pattern
title: "State 패턴과 상태별 행동"
summary: "상태에 따라 달라지는 행동을 상태 객체로 분리해 조건문 폭증을 막는다"
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9"
    title: "Java Language Specification 8.9장: Enum Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 작은 상태 집합을 enum으로 모델링하는 언어 규칙 확인
  - url: "https://refactoring.guru/design-patterns/state"
    title: "State Design Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: 상태 객체로 전이를 위임하는 구조 참고
---
# State 패턴과 상태별 행동

## 쉬운 진입

문서가 DRAFT일 때는 수정할 수 있지만 PUBLISHED에서는 수정할 수 없고 ARCHIVED에서는
복구만 가능하다. 서비스의 모든 메서드에 상태 `if`를 반복하면 전이 규칙이 흩어진다.

## 정확한 메커니즘

```text
DocumentContext -> DocumentState
                    ├─ DraftState: publish 가능
                    ├─ PublishedState: archive 가능
                    └─ ArchivedState: restore 가능
```

Context는 현재 상태에 행동을 위임하고 상태 객체는 허용된 행동과 다음 상태를 결정한다.
상태가 몇 개이고 전이가 단순하면 enum의 intention-revealing 메서드가 더 작고 명확하다.
상태별 데이터와 행동이 커질 때만 객체 State 구조를 선택한다.

## 실전·면접 연결

전이 표를 먼저 작성하면 허용되지 않은 전이를 테스트하기 쉽다. 상태 객체가 Context를
무제한으로 호출하면 순환 결합이 생기므로 전이에 필요한 좁은 협력만 제공한다.

## 흔한 오해

- 상태 필드가 있다고 모두 State 패턴이 필요한 것은 아니다.
- 상태 객체로 분리해도 영속화할 현재 상태와 전이의 원자성은 별도 문제다.
- 조건문 수를 줄이는 것보다 금지된 전이를 막고 규칙의 소유자를 선명하게 하는 것이 목적이다.
