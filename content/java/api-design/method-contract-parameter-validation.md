---
kind: concept
contentKey: java.core.api-design.method-contract-parameter-validation
topicContentKey: java.core.api-design
slug: method-contract-parameter-validation
title: "메서드 계약과 매개변수 검증"
summary: "메서드가 허용하는 입력과 실패 방식을 분명히 하고 잘못된 값을 적절한 경계에서 빠르게 거부한다"
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Objects.html"
    title: "Java SE 25 API: Objects"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: requireNonNull 등 기본 검증 API 확인
---
# 메서드 계약과 매개변수 검증

메서드를 호출하는 쪽은 이름과 매개변수 타입만 보고도 어느 정도 사용법을 알 수 있지만, 타입만으로 모든 규칙을 표현할 수는 없습니다.

```java
void withdraw(long amount)
```

`long`이라는 타입만으로는 `amount`가 0보다 커야 하는지, 잔액보다 작아야 하는지 알 수 없습니다. 이런 **허용 입력, 수행 결과, 실패 조건에 대한 약속**을 메서드 계약(contract)이라고 볼 수 있습니다.

### 잘못된 입력은 원인 가까이에서 막는다

```java
void withdraw(long amount) {
    if (amount <= 0) {
        throw new IllegalArgumentException("출금액은 양수여야 합니다.");
    }
    // ...
}
```

잘못된 값을 그대로 통과시키면 훨씬 뒤에서 이상한 상태나 다른 예외가 발생할 수 있습니다. 원인과 가까운 경계에서 실패하면 디버깅하기 쉽고 객체의 상태도 보호하기 쉽습니다.

### null 검증도 계약의 일부다

```java
OrderService(OrderRepository repository) {
    this.repository = Objects.requireNonNull(repository);
}
```

`null`을 허용하지 않는다면 생성 시점에 막는 편이 나중에 전혀 다른 위치에서 `NullPointerException`이 발생하는 것보다 원인이 분명합니다.

하지만 모든 매개변수에 무조건 `requireNonNull`을 붙이라는 뜻은 아닙니다. 타입·도메인 규칙상 `null`이 가능한 값도 있고, 이미 상위 경계에서 검증되어 내부 메서드가 같은 검증을 반복할 필요가 없을 수도 있습니다.

### API 검증과 도메인 규칙은 위치가 다를 수 있다

HTTP 요청의 문자열 형식이나 필수 필드 검증은 API 계층에서 처리할 수 있습니다. 반면 “주문 수량은 1 이상이어야 한다”, “완료된 주문은 취소할 수 없다” 같은 규칙은 도메인 객체가 지켜야 할 수 있습니다.

```text
HTTP/API 경계
- JSON 형식
- 필수 필드
- 문자열 길이
        │
        ▼
애플리케이션/도메인
- 실제 비즈니스 상태 규칙
- 상태 전이 가능 여부
```

Java 메서드 설계에서 중요한 것은 **검증을 한곳에 몰아넣는 것**이 아니라 그 규칙을 소유해야 할 경계에 두는 것입니다.

### 예외 타입도 호출 계약을 전달한다

잘못된 인자를 받은 경우와 현재 객체 상태 때문에 작업할 수 없는 경우는 의미가 다릅니다.

```java
throw new IllegalArgumentException(...); // 인자 자체가 계약 위반
throw new IllegalStateException(...);    // 현재 상태에서 동작 불가
```

실제 도메인에서는 의미 있는 사용자 정의 예외를 선택할 수도 있습니다. 중요한 것은 예외 이름 자체보다 **호출자가 실패 원인을 이해하고 일관되게 처리할 수 있는가**입니다.

### 문제와 실무에서 확인할 것

- 이 메서드가 허용하는 입력 범위가 무엇인가?
- 타입으로 표현되지 않는 규칙이 있는가?
- 잘못된 입력을 언제 발견할 수 있는가?
- 검증이 객체 자신의 invariant인지, 외부 요청 형식 검증인지?
- 실패했을 때 객체 상태가 일부만 변경된 채 남지는 않는가?

좋은 메서드 계약은 정상 동작뿐 아니라 **무엇이 잘못된 호출인지와 실패 시 어떤 상태를 남기는지**까지 생각하게 합니다.
