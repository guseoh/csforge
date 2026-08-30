---
kind: concept
contentKey: java.core.enum-modeling.enum-closed-values-behavior
topicContentKey: java.core.enum-modeling
slug: enum-closed-values-behavior
title: "enum의 닫힌 값 집합과 동작"
summary: "enum을 문자열 상수 모음이 아니라 타입 안전한 값과 행위의 집합으로 모델링한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html"
    title: "Enum API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: enum 인스턴스와 name/valueOf 계약 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9"
    title: "Java Language Specification 8.9장: Enum Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: enum 선언과 상수 인스턴스의 언어 규칙 확인
---
# enum의 닫힌 값 집합과 동작

## 쉬운 진입

배송 상태처럼 가능한 값이 애초에 정해진 경우 `"READY"`, `"SHIPPED"` 문자열을 곳곳에서
비교하면 오탈자와 허용되지 않은 상태가 섞인다. `enum`은 컴파일러가 값의 집합을 함께 추적하게
하는 작은 타입이다.

## 정확한 메커니즘

enum 상수는 해당 enum 타입의 고유한 인스턴스다. 상수에 필드와 메서드를 둘 수 있고, 공통
행동은 enum 메서드로 묶어 상태에 맞는 정책을 값 가까이에 둘 수 있다.

```java
enum DeliveryStatus {
    READY(false), SHIPPED(true), DELIVERED(true);

    private final boolean terminal;
    DeliveryStatus(boolean terminal) { this.terminal = terminal; }
    boolean isTerminal() { return terminal; }
}
```

`name()`은 선언된 식별자를 반환하고 `valueOf`는 정확히 일치하는 식별자를 찾는다. 외부 입력을
곧바로 `valueOf`에 넣으면 `IllegalArgumentException`이 날 수 있으므로 입력 경계에서 별도
파싱 정책을 둔다.

## 실전·면접 연결

닫힌 상태와 상태별 행위에는 enum이 적합하지만, 상태가 사용자 설정이나 데이터베이스에서
동적으로 늘어나는 도메인이라면 엔티티나 설정 모델이 맞다. enum 안에 모든 서비스 호출을
넣으면 작은 모델이 거대한 의존성 집합으로 변하므로 계산 가능한 규칙만 둔다.

## 흔한 오해

- enum은 단순한 문자열 상수라서 아무 문자열이나 대입할 수 있다는 생각은 틀리다.
- `ordinal()`은 비즈니스 식별자가 아니다. 선언 순서를 바꾸면 값이 달라진다.
- enum이 타입 안전하다고 해서 외부 문자열 입력 검증이 자동으로 되는 것은 아니다.
