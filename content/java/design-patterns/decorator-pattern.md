---
kind: concept
contentKey: java.core.design-patterns.decorator-pattern
topicContentKey: java.core.design-patterns
slug: decorator-pattern
title: "Decorator 패턴과 조합 가능한 부가 기능"
summary: "같은 인터페이스를 감싸며 기능을 조합하고 상속 폭발을 피한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/FilterInputStream.html"
    title: "FilterInputStream API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java IO의 wrapping 기반 decorator 사례 확인
  - url: "https://refactoring.guru/design-patterns/decorator"
    title: "Decorator Design Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: 동일 인터페이스 wrapper 조합 구조 참고
---
# Decorator 패턴과 조합 가능한 부가 기능

## 쉬운 진입

파일 입력에 버퍼링, 압축, 암호화를 선택적으로 붙이고 싶을 때 기능별 하위 클래스를 모두
만들면 조합 수가 폭발한다. 같은 인터페이스를 구현하는 wrapper가 다음 wrapper를 감싸면
필요한 기능만 쌓을 수 있다.

## 정확한 메커니즘

```text
Client -> MetricsDecorator -> RetryDecorator -> FileStore
          (Store interface를 모두 구현하고 내부 Store에 위임)
```

Decorator는 핵심 객체와 같은 계약을 제공하며 호출 전후에 부가 행동을 넣는다. Java IO의
stream wrapper가 대표적인 예다. wrapper 순서가 의미를 가지므로 예외, 측정, 재시도 범위를
명확히 정해야 한다.

## 실전·면접 연결

합성은 런타임 조합과 단일 책임에 유리하지만, 너무 많은 wrapper는 디버깅과 순서 추론을
어렵게 한다. 단순한 필드 하나를 보강하는 경우에는 일반 위임 클래스가 더 읽기 쉬울 수 있다.

## 흔한 오해

- Decorator는 Adapter처럼 인터페이스를 바꾸는 것이 아니라 같은 인터페이스를 유지한다.
- wrapper가 내부 호출을 생략하면 Decorator가 아니라 대체 구현이 된다.
- 순서를 바꿔도 항상 같은 결과라는 보장은 없다.
