---
kind: concept
contentKey: java.core.exceptions-resources.exception-as-control-flow
topicContentKey: java.core.exceptions-resources
slug: exception-as-control-flow
title: "Exceptions versus ordinary control flow"
summary: "예외 상황과 정상 분기를 구분해 예외 남용을 피한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "Java Language Specification 11장: Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 예외 처리의 언어 의미 확인
---
# Exceptions versus ordinary control flow

## 쉬운 진입

빈 큐에서 꺼낼 수 있는지, 값이 있는지처럼 반복해서 예상되는 조건은 `if`나 `Optional` 같은
정상 결과로 표현하는 편이 읽기 쉽다. 외부 파일이 사라졌거나 불변식이 깨진 것처럼 현재
작업을 진행할 수 없는 상황은 예외가 적합하다.

## 정확한 메커니즘

예외는 현재 흐름을 중단하고 handler를 찾으며, stack unwind와 stack trace라는 비용과
의미를 가진다. `Iterator.hasNext()` 후 `next()`처럼 정상적인 프로토콜이 있는 경우에는
계약을 사용하고, 매번 예외를 던져 종료 조건을 찾는 식의 API 사용은 피한다.

```java
while (iterator.hasNext()) {
    consume(iterator.next());
}
```

## 실전·면접 연결

예외를 숨은 반환 값처럼 쓰면 호출자가 어떤 실패를 예상할 수 있는지 알기 어렵고 로그도
오염된다. 다만 경쟁 조건 때문에 사전 검사와 실제 연산 사이가 원자적이지 않다면, 검사 후에도
실패할 수 있는 외부 작업은 예외로 처리해야 한다. 선택은 성능보다 계약과 실패의 의미가
먼저다.

## 흔한 오해

- 예외를 전혀 사용하지 않는 것이 항상 좋은 설계는 아니다.
- `try/catch`가 있다고 정상 분기와 같은 의미가 되지는 않는다.
- 예외가 드물어야 한다는 말은 모든 입력 경계 검증을 생략하라는 뜻이 아니다.
