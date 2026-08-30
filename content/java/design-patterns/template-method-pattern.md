---
kind: concept
contentKey: java.core.design-patterns.template-method-pattern
topicContentKey: java.core.design-patterns
slug: template-method-pattern
title: "Template Method 패턴과 고정된 처리 골격"
summary: "공통 처리 순서를 고정하고 일부 단계만 하위 타입에 맡긴다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4"
    title: "Java Language Specification 8.4장: Methods"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: abstract/concrete method와 overriding 규칙 확인
  - url: "https://refactoring.guru/design-patterns/template-method"
    title: "Template Method Design Pattern"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: 알고리즘 골격과 primitive operation 관계 참고
---
# Template Method 패턴과 고정된 처리 골격

## 쉬운 진입

CSV와 JSON 파일을 처리할 때 “열기 → 검증 → 변환 → 저장” 순서는 같지만 변환만 다를 수
있다. 공통 골격을 한 곳에 두면 각 구현이 순서를 실수로 바꾸지 않는다.

## 정확한 메커니즘

추상 클래스가 템플릿 메서드를 제공하고, 단계 메서드 중 일부를 abstract 또는 protected
hook으로 둔다. 템플릿 메서드를 `final`로 제한하면 하위 클래스가 전체 순서를 덮어쓰지 못한다.

```java
abstract class ImportJob {
    public final void run(String text) {
        validate(text);
        save(parse(text));
    }
    protected abstract Record parse(String text);
    protected void validate(String text) { if (text.isBlank()) throw new IllegalArgumentException(); }
    private void save(Record record) { /* 공통 저장 */ }
}
```

## 실전·면접 연결

변형점이 소수이고 순서가 강한 경우 유용하지만, 하위 클래스가 부모의 protected 상태를
과도하게 알아야 하면 결합도가 높아진다. 그때는 단계별 collaborator를 합성하는 Strategy나
pipeline이 더 낫다.

## 흔한 오해

- Template Method는 단순히 abstract class를 쓰는 것과 같지 않다. 고정된 알고리즘 골격이 핵심이다.
- 하위 클래스가 템플릿 메서드를 자유롭게 override하면 순서 보장이 사라진다.
- hook이 많아질수록 유연해지는 것이 아니라 부모-자식 계약이 복잡해진다.
