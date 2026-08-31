---
kind: concept
contentKey: java.core.exceptions-resources.failure-atomicity
topicContentKey: java.core.exceptions-resources
slug: failure-atomicity
title: "Failure atomicity"
summary: "실패한 연산이 객체를 놀라운 부분 변경 상태로 남기지 않게 한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collection.html"
    title: "Java SE 25 API: Collection"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: collection 연산의 예외와 변경 계약 확인
---
# Failure atomicity

## 쉬운 진입

주문에 상품 세 개를 추가하는 중 두 번째 상품에서 실패했는데 첫 번째만 남아 있다면 호출자는
재시도 방법을 알기 어렵다. 실패 원자성은 연산이 실패할 때 가능한 한 시작 전 상태를 유지해
호출자가 예측할 수 있게 하는 설계 원칙이다.

## 정확한 메커니즘

검증을 먼저 끝내고 임시 결과를 만든 뒤 한 번에 내부 상태를 교체하면 부분 변경을 줄일 수
있다. 직접 수정해야 한다면 실패 시 rollback 가능한 순서를 설계한다.

```java
List<Item> validated = input.stream().map(this::validateAndCopy).toList();
items = List.copyOf(validated); // 모든 검증 뒤 snapshot 교체
```

단일 객체의 메모리 상태와 파일·외부 시스템의 여러 변경은 같은 원자성을 자동으로 갖지
않는다. database transaction은 Database 영역의 의미이며 Java 코드는 자신이 가진 경계에서
실패 상태를 명확히 해야 한다.

## 실전·면접 연결

불변 값, 방어적 복사, precondition 검사, 임시 파일 후 atomic move는 서로 다른 층의
실패 원자성 기법이다. 부분 변경을 허용할 수밖에 없다면 문서와 반환 결과에 진행 상태를
명시한다. “예외를 던졌다”만으로 이미 수행된 side effect가 되돌아가지는 않는다.

## 흔한 오해

- `catch`에서 예외를 삼키면 부분 변경이 사라지지 않는다.
- `final` reference는 가리키는 collection의 mutation을 rollback하지 않는다.
- 모든 외부 API가 atomic update를 제공한다고 가정하면 안 된다.
