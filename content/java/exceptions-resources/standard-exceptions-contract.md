---
kind: concept
contentKey: java.core.exceptions-resources.standard-exceptions-contract
topicContentKey: java.core.exceptions-resources
slug: standard-exceptions-contract
title: "표준 예외로 메서드 계약 표현하기"
summary: "잘못된 인자·잘못된 현재 상태·찾을 수 없는 원소처럼 의미에 맞는 표준 예외를 선택하고 불필요한 custom exception을 피한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/IllegalArgumentException.html"
    title: "Java SE 25 API: IllegalArgumentException"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 잘못된 인자를 나타내는 표준 예외 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/IllegalStateException.html"
    title: "Java SE 25 API: IllegalStateException"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 현재 객체 상태에서 호출이 부적절한 경우의 계약 확인
---
# 표준 예외로 메서드 계약 표현하기

예외 타입은 실패 원인을 호출자에게 전달하는 **이름 있는 계약**입니다. 모든 실패마다 새 custom exception을 만들기 전에 Java가 이미 제공하는 표준 예외가 의미를 정확히 표현하는지 확인할 수 있습니다.

### 인자 자체가 계약을 어기면 IllegalArgumentException

```java
void reserve(int quantity) {
    if (quantity <= 0) {
        throw new IllegalArgumentException("quantity는 양수여야 합니다.");
    }
}
```

호출자가 넘긴 값 자체가 허용 범위를 벗어난 경우입니다.

### 현재 객체 상태 때문에 수행할 수 없으면 IllegalStateException

```java
void cancel() {
    if (status == COMPLETED) {
        throw new IllegalStateException("완료된 주문은 취소할 수 없습니다.");
    }
}
```

같은 `cancel()` 호출이라도 인자가 잘못된 것이 아니라 현재 객체 상태 때문에 작업할 수 없습니다.

### null에는 Objects.requireNonNull도 사용할 수 있다

```java
this.repository = Objects.requireNonNull(repository, "repository");
```

`requireNonNull`은 null을 허용하지 않는 계약을 간단히 표현하고 실패하면 `NullPointerException`을 던집니다.

### custom exception이 필요한 경우도 있다

```java
throw new InsufficientStockException(productId, requested, available);
```

상위 계층이 재고 부족을 별도로 처리해야 하거나 도메인 의미가 중요하다면 사용자 정의 예외가 더 적합할 수 있습니다.

반대로 `InvalidQuantityIllegalArgumentException`처럼 표준 예외보다 의미가 거의 늘어나지 않는 타입을 계속 만들면 예외 계층만 복잡해질 수 있습니다.

### 예외 타입만으로 HTTP status를 결정하지 않는다

Java의 `IllegalArgumentException`은 HTTP 400을 의미하는 타입이 아닙니다. API 계층에서 해당 애플리케이션 실패를 어떤 HTTP 응답으로 변환할지 별도로 정해야 합니다. Java 예외 계약과 HTTP 계약을 섞지 않는 것이 중요합니다.

### 선택 기준

실패 상황에서 **누가 무엇을 잘못했는가**를 먼저 설명해 보세요. 인자 계약 위반인지, 객체 상태 문제인지, 도메인에서 별도 처리가 필요한 사건인지 구분하면 예외 선택이 자연스러워집니다.
