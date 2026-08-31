---
kind: concept
contentKey: java.core.api-design.method-contract-parameter-validation
topicContentKey: java.core.api-design
slug: method-contract-parameter-validation
title: "메서드 계약과 매개변수 검증"
summary: "메서드의 사전조건·상태조건·실패 후 상태를 구분하고, 검증과 side effect 순서를 설계해 잘못된 호출이 객체 invariant를 깨뜨리지 않게 한다"
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

메서드 signature는 호출 방법의 일부만 표현합니다.

```java
void withdraw(long amount)
```

`long`이라는 타입만으로는 `amount > 0`이어야 하는지, 잔액보다 작아야 하는지, 실패하면 잔액이 그대로 유지되는지 알 수 없습니다. 이런 **허용 입력, 필요한 객체 상태, 성공 결과, 실패 방식에 대한 약속**을 메서드 계약(contract)으로 생각할 수 있습니다.

계약을 읽을 때는 최소한 세 가지를 나누는 것이 좋습니다.

```text
사전조건(precondition)  : 호출자가 어떤 값을 전달해야 하는가
상태조건(state condition): 현재 객체가 이 동작을 수행할 수 있는가
실패 후 상태            : 거부됐을 때 기존 상태가 보존되는가
```

### 인자 자체의 조건과 현재 객체 상태는 다른 문제다

```java
void read(int length) {
    if (length < 0) {
        throw new IllegalArgumentException();
    }
    if (closed) {
        throw new IllegalStateException();
    }
    // read...
}
```

`length >= 0`은 인자 자체의 조건이고, `closed == false`는 수신 객체의 현재 상태 조건입니다. `length`가 정상이어도 이미 닫힌 객체에서는 `read`할 수 없습니다.

이 둘을 구분하면 예외의 의미도 더 선명해집니다.

```java
throw new IllegalArgumentException(); // 전달된 인자가 계약을 위반
throw new IllegalStateException();    // 인자는 가능하지만 현재 객체 상태에서 동작 불가
```

도메인에서는 더 의미 있는 예외 타입을 사용할 수도 있습니다. 중요한 것은 특정 예외 이름을 외우는 것이 아니라 **호출자가 무엇을 잘못했고 어떤 상태가 유지되는지 알 수 있는 일관된 실패 계약**입니다.

### 검증은 side effect보다 먼저 배치해야 실패 상태를 통제하기 쉽다

다음 `reserve`는 양수 수량만 받고, 재고가 부족하면 실패하며, 실패 시 기존 재고를 보존해야 한다고 가정합니다.

```java
void reserve(int n) {
    if (n <= 0) {
        throw new IllegalArgumentException();
    }

    available -= n;

    if (available < 0) {
        throw new IllegalStateException();
    }
}
```

`available == 5`일 때 `reserve(7)`을 호출하면 차감 후 값은 `-2`가 되고 그 다음 예외가 발생합니다. Java 예외는 앞에서 수행한 field 대입을 자동으로 되돌리지 않습니다. 따라서 이 메서드는 “실패하면 상태를 보존한다”는 계약을 깨뜨립니다.

```java
void reserve(int n) {
    if (n <= 0) {
        throw new IllegalArgumentException();
    }
    if (n > available) {
        throw new IllegalStateException("재고가 부족합니다.");
    }

    available -= n;
}
```

먼저 성공 가능성을 판단한 뒤 상태를 변경하면 실패 경로에서 기존 invariant를 유지하기 쉽습니다. 이런 성질을 **failure atomicity** 관점에서 볼 수 있습니다. 반드시 모든 메서드가 완벽한 트랜잭션처럼 동작해야 한다는 뜻은 아니지만, 실패했을 때 어떤 변경이 남는지는 계약의 일부입니다.

### 여러 field가 함께 invariant를 이룬다면 검증도 조합을 봐야 한다

```java
Period(int start, int end) {
    if (start > end) {
        throw new IllegalArgumentException();
    }
    this.start = start;
    this.end = end;
}
```

`start`와 `end` 각각이 정수라는 사실만으로는 기간이 유효하지 않습니다. 두 값의 관계가 invariant입니다. 따라서 `start >= 0`, `end >= 0` 같은 필드별 검사만 반복해서는 충분하지 않을 수 있습니다.

같은 타입을 constructor, static factory, Builder 등 여러 경로에서 만들 수 있다면 모든 정상 생성 경로가 이 invariant를 우회하지 않는지도 확인해야 합니다. 검증 로직을 한 메서드로 재사용할 수는 있지만, 더 중요한 것은 **유효하지 않은 인스턴스가 외부에 관찰되지 않는 생성 경계**를 만드는 것입니다.

### `Objects.requireNonNull`은 null 계약만 표현한다

```java
this.name = Objects.requireNonNull(name);
```

이 코드는 `name == null`이면 즉시 `NullPointerException`을 던지고, 아니면 같은 참조를 반환합니다. 빈 문자열을 거부하거나 trim하거나 email 형식을 검사하지는 않습니다.

즉 다음 규칙들은 서로 다른 계약입니다.

```text
name != null
name.isBlank() == false
name.length() <= 50
email format valid
```

검증 API 하나를 썼다고 도메인 invariant 전체가 해결되는 것은 아닙니다. 타입 자체로 더 잘 표현할 수 있는 값이라면 `Email`, `PositiveQuantity` 같은 value object를 고려할 수도 있고, 단순한 내부 값이면 명시적인 validation method가 더 직접적일 수 있습니다.

### 같은 검증을 모든 계층에 반복하는 것이 안전한 설계는 아니다

HTTP 요청의 JSON 형식, 필수 필드, 문자열 길이 같은 **입력 shape**는 API boundary에서 검증할 수 있습니다. 반면 “완료된 주문은 취소할 수 없다”처럼 객체 상태에 의존하는 규칙은 domain이 소유하는 편이 자연스럽습니다.

```text
HTTP/API boundary
  - 형식
  - 필수 필드
  - 요청 범위
        │
        ▼
Application / Domain
  - 현재 상태에서 동작 가능한가
  - aggregate invariant가 유지되는가
  - 상태 전이가 허용되는가
```

Controller가 `order.status()`를 읽고 취소 가능 여부를 판단한 뒤 Domain도 같은 조건을 검사한다면 정책이 여러 곳에 흩어집니다. 반대로 모든 요청 형식 검증을 Domain에 밀어 넣으면 HTTP 표현과 business rule이 섞일 수 있습니다.

검증의 목표는 “모든 곳에서 한 번씩 검사한다”가 아니라 **그 규칙을 가장 잘 아는 경계가 소유하고, 하위 코드가 합리적인 전제를 가질 수 있게 하는 것**입니다.

### 외부 side effect가 있으면 실행 순서가 더 중요해진다

```java
void complete(Order order) {
    emailSender.send(order); // 외부 side effect
    order.complete();        // 여기서 상태 검증 실패 가능
}
```

`order.complete()`가 현재 상태 때문에 실패해도 이메일은 이미 발송됐습니다. 객체 field 대입뿐 아니라 네트워크 호출, 파일 쓰기, 메시지 발행도 되돌리기 어려운 side effect입니다.

따라서 먼저 순수하게 검증 가능한 조건을 확인하고, 상태 전이와 외부 작업의 원자성이 실제로 필요한지 판단해야 합니다. 단일 Java 메서드만으로 모든 분산 side effect를 원자적으로 만들 수 있는 것은 아니므로, 백엔드에서는 transaction boundary, outbox, 보상 처리 같은 별도의 설계가 필요할 수 있습니다. 이 Concept의 핵심은 그 기술을 미리 적용하는 것이 아니라 **실패 가능한 지점과 이미 발생한 side effect를 순서대로 추적하는 습관**입니다.

### 예외를 던진다고 객체가 자동으로 원상 복구되지는 않는다

다음과 같은 오해가 자주 생깁니다.

```java
balance -= amount;
if (balance < 0) {
    throw new IllegalStateException();
}
```

예외는 제어 흐름을 중단할 뿐 `balance -= amount`를 취소하지 않습니다. DB transaction 안의 변경이라면 rollback 정책이 별도로 작동할 수 있지만 그것은 Java 예외 자체의 기능이 아닙니다. **언어 수준의 실행 결과와 프레임워크/트랜잭션 보장을 구분**해야 합니다.

메서드를 설계하거나 리뷰할 때는 정상 경로만 읽지 말고 다음 순서로 추적하면 좋습니다. 어떤 입력과 상태가 허용되는지 확인하고, 첫 mutation 또는 외부 side effect가 언제 발생하는지 찾은 뒤, 그 이후 예외가 발생하면 어떤 상태가 남는지 확인합니다. 좋은 계약은 “성공하면 무엇을 한다”뿐 아니라 **거부된 호출이 시스템을 어떤 상태에 남기는가**까지 설명할 수 있어야 합니다.
