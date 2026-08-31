---
kind: concept
contentKey: java.core.api-design.method-contract-parameter-validation
topicContentKey: java.core.api-design
slug: method-contract-parameter-validation
title: "Method contracts and parameter validation"
summary: "입력 전제, nullability, 범위와 실패 방식을 method 계약으로 명확히 한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 타입과 null/reference 값의 언어 규칙 확인
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html"
    title: "Java Language Specification 11장: Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 실패를 exception으로 표현하는 Java 규칙 확인
---
# Method contracts and parameter validation

## 쉬운 진입

`resize(-1)`이 조용히 이상한 상태를 만들고 나중에 다른 곳에서 실패하면 원인을 찾기
어렵다. method가 어떤 입력을 받고 무엇을 반환하며 잘못된 입력에서 어떻게 실패하는지
호출 시점에 분명해야 한다.

## 정확한 메커니즘

method contract는 precondition(호출 전제), 결과와 side effect, 실패 방식을 함께 말한다.
범위·null·형식처럼 object invariant에 직접 연결된 조건은 method나 domain value가 입구에서
검증한다.

```java
public void reserve(int quantity) {
    if (quantity <= 0) {
        throw new IllegalArgumentException("quantity must be positive");
    }
    if (quantity > available) {
        throw new IllegalStateException("not enough stock");
    }
    available -= quantity;
}
```

`IllegalArgumentException`은 입력 자체가 계약 밖일 때, `IllegalStateException`은 입력은
형식상 가능해도 현재 상태에서 연산할 수 없을 때 자주 어울린다. 이 선택은 Java가 강제하는
단일 정답이 아니라 API가 정하는 의미 있는 계약이어야 한다.

## 실전·면접 연결

호출자가 미리 검사하더라도 객체의 공개 메서드는 자신의 상태와 입력 조합을 보호해야 한다.
예외는 이미 수행한 필드 변경을 자동으로 되돌리지 않으므로, 위 reserve는 검사를 모두 마친
성공 경로에서만 available을 줄인다. 문서·명명·반환 타입을 함께 설계하면 caller가 실패 후의
상태나 null의 의미를 추측하는 상황을 줄일 수 있다.

## 흔한 오해

- 모든 null을 무조건 빈 문자열이나 0으로 바꾸는 것이 친절한 계약은 아니다.
- validation을 한 번 했다는 이유로 이후 mutable 상태가 계속 유효하다고 가정하지 않는다.
- 예외 type 선택은 성능 최적화나 JVM이 자동으로 정하는 분류가 아니다.
