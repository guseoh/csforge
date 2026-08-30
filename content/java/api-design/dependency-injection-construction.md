---
kind: concept
contentKey: java.core.api-design.dependency-injection-construction
topicContentKey: java.core.api-design
slug: dependency-injection-construction
title: "Dependency injection and construction"
summary: "필요한 협력 객체를 명시적으로 전달해 결합도와 테스트 가능성을 개선한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: class field와 constructor 선언의 Java 의미 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 협력자 계약을 interface로 표현하는 언어 기반 확인
---
# Dependency injection and construction

## 쉬운 진입

`InvoiceService`가 내부에서 매번 `new TaxClient()`를 하면 테스트가 실제 외부 client에
묶이고, 설정을 바꾸기도 어렵다. 서비스가 필요한 collaborator를 생성 시 받아 두면 어떤
협력자를 사용하는지 호출 지점에서 보인다.

## 정확한 메커니즘

plain Java의 constructor injection은 특별한 container 없이 constructor parameter로
dependency를 전달하는 방식이다.

```java
interface TaxPolicy {
    long taxFor(long amount);
}

final class InvoiceService {
    private final TaxPolicy taxPolicy;

    InvoiceService(TaxPolicy taxPolicy) {
        this.taxPolicy = java.util.Objects.requireNonNull(taxPolicy);
    }
}
```

필수 dependency는 constructor로 받고, 선택 dependency는 기본 정책이 정말 명확할 때만
별도 factory로 감싼다. `static` global lookup은 의존성을 숨기고 공유 상태·초기화 순서·테스트
격리 문제를 만든다.

## 실전·면접 연결

여기서 말하는 injection은 Spring container가 bean을 발견하고 lifecycle을 관리한다는 뜻이
아니다. Java code 자체의 construction boundary다. interface가 필요하지 않은 단일 immutable
value collaborator까지 모두 interface로 만들면 abstraction 비용이 생기므로, 교체·격리·계약
검증이라는 실제 이유가 있을 때만 경계를 만든다.

## 흔한 오해

- constructor parameter를 받는다고 dependency가 자동으로 mockable해지는 것은 아니다.
- interface를 사용한다고 구현 선택과 retry 같은 운영 정책이 자동으로 생기지 않는다.
- static global을 쓰지 않는다는 규칙이 모든 공유 cache를 금지하는 것은 아니다. 소유권과 동시성 계약을 명시해야 한다.
