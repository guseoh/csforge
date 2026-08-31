---
kind: concept
contentKey: java.core.modern-language.optional-return-boundary
topicContentKey: java.core.modern-language
slug: optional-return-boundary
title: "Optional at return boundaries"
summary: "값의 부재를 return boundary에서 명시적으로 표현한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html"
    title: "Java SE 25 API: Optional"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: empty·of·orElse·orElseGet 계약 확인
---
# Optional at return boundaries

## 쉬운 진입

조회 결과가 없을 수 있는데 `null`을 반환하면 호출자가 문서를 읽지 않고는 누락을 알기 어렵다.
`Optional<T>`는 “T가 있을 수도, 없을 수도 있다”는 return boundary를 타입으로 드러낸다.

## 정확한 메커니즘

```java
Optional<User> findById(String id) { ... }

String name = findById(id)
        .map(User::name)
        .orElse("unknown");
```

값이 확실히 있으면 `of`, nullable 결과를 감쌀 수 있으면 `ofNullable`을 사용한다.
`orElse(value)`의 인자는 값이 있어도 먼저 계산될 수 있지만 `orElseGet(supplier)`는 비어 있을
때 계산한다. Optional은 보통 반환 경계에서 사용하고, JPA entity field나 모든 parameter를
Optional로 감싸는 규칙으로 확대하지 않는다.

## 실전·면접 연결

부재가 정상적인 결과인지, 실패는 예외인지 먼저 분리한다. `Optional.get()`을 무검증으로
호출해 null 문제를 다른 이름으로 바꾸지 말고 `map`, `orElseThrow`, `ifPresent`로 의도를
표현한다. API 직렬화와 저장 layer는 별도의 null/부재 정책을 가질 수 있다.

## 흔한 오해

- Optional이 내부 값까지 immutable하게 만들지는 않는다.
- `orElse`와 `orElseGet`의 eager/lazy 평가 시점은 같다지 않다.
- empty가 예외 상황이라는 뜻은 아니다.
