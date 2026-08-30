---
kind: concept
contentKey: java.core.design-patterns.factory-pattern
topicContentKey: java.core.design-patterns
slug: factory-pattern
title: "Factory 패턴과 생성 책임"
summary: "구체 객체 선택과 생성 규칙을 사용하는 코드에서 분리한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9"
    title: "Java Language Specification 15.9장: Class Instance Creation Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: new와 생성자 호출의 언어 의미 확인
  - url: "https://refactoring.guru/design-patterns/factory-method"
    title: "Factory Method Design Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: 생성자 선택과 제품 추상화 구조 참고
---
# Factory 패턴과 생성 책임

## 쉬운 진입

호출자가 `new PdfExporter(...)`까지 알아야 하면 포맷을 바꿀 때 모든 호출부를 수정해야 한다.
생성 정책을 factory에 모으면 호출자는 `Exporter`라는 역할만 받는다.

## 정확한 메커니즘

Factory는 제품의 구체 타입 선택, 필수 인자 검증, 생성 순서를 한 곳에서 책임진다. 단순히
생성자를 감싸는 메서드가 아니라 “어떤 구현을 선택할지”가 변하는 경계에서 가치가 생긴다.

```java
interface Exporter { byte[] export(Report report); }
final class Exporters {
    static Exporter forFormat(Format format) {
        return switch (format) { case PDF -> new PdfExporter(); case CSV -> new CsvExporter(); };
    }
}
```

## 실전·면접 연결

생성 로직이 한 번만 쓰이고 분기나 검증이 없다면 직접 생성이 더 간단하다. factory가 서비스
locator처럼 모든 의존성을 숨기면 테스트와 변경이 어려워지므로, 선택 책임과 객체 협력을
분리한다.

## 흔한 오해

- factory라는 이름을 붙였다고 객체 생성 문제가 해결되는 것은 아니다.
- factory 내부에 거대한 switch와 전역 상태를 넣으면 결합도가 오히려 커진다.
- Factory Method와 Abstract Factory는 제품 수와 변형 축이 다른 별도 설계다.
