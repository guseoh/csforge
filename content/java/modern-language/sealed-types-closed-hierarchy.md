---
kind: concept
contentKey: java.core.modern-language.sealed-types-closed-hierarchy
topicContentKey: java.core.modern-language
slug: sealed-types-closed-hierarchy
title: "Sealed types and closed hierarchies"
summary: "허용된 subtype 집합을 sealed type으로 닫고 exhaustive 처리를 만든다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
    title: "Java Language Specification 8장: Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: sealed class·permits와 상속 제약 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html"
    title: "Java Language Specification 9장: Interfaces"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: sealed interface와 허용 subtype 확인
---
# Sealed types and closed hierarchies

## 쉬운 진입

결제 결과가 성공·실패·보류 세 종류뿐이라면 아무 class나 새 결과를 추가하게 두는 것보다
허용된 집합을 선언하는 편이 안전하다. sealed type은 “이 hierarchy는 이 subtype들로만
확장된다”는 Java 언어 계약을 표현한다.

## 정확한 메커니즘

```java
sealed interface Result permits Success, Failure { }
record Success(String id) implements Result { }
record Failure(String reason) implements Result { }
```

직접 subtype은 `final`, `sealed`, 또는 `non-sealed` 중 하나로 hierarchy의 확장 정책을
정해야 한다. compiler는 permitted subtype 정보를 이용해 pattern switch의 exhaustive
여부를 판단할 수 있다. 이것은 특정 framework의 registry나 runtime reflection 목록과는
다른 언어 수준의 닫힘이다.

## 실전·면접 연결

닫힌 도메인 결과는 누락된 case를 compile-time에 발견하기 좋아진다. 반대로 외부 plugin처럼
새 구현을 독립적으로 추가해야 하는 extension point에는 sealed가 맞지 않을 수 있다.
hierarchy를 닫아도 각 subtype의 내부 mutable 상태나 business validation까지 자동으로 해결되지는 않는다.

## 흔한 오해

- `sealed`는 class를 인스턴스화할 수 없게 하는 modifier가 아니다.
- `permits`에 적은 타입은 아무 코드에서나 상속할 수 있다는 뜻이 아니다.
- exhaustive switch의 default가 필요 없는지는 실제 type/pattern hierarchy와 compiler 규칙에 따른다.
