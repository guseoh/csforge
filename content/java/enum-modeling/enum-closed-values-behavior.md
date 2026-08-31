---
kind: concept
contentKey: java.core.enum-modeling.enum-closed-values-behavior
topicContentKey: java.core.enum-modeling
slug: enum-closed-values-behavior
title: "enum으로 닫힌 값 집합 모델링하기"
summary: "가능한 값이 정해진 상태를 문자열 상수 대신 enum 타입으로 표현하고 값과 관련 행동을 함께 둘 수 있는 이유를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9"
    title: "JLS 8.9 Enum Classes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: enum class의 언어 규칙 확인
---
# enum으로 닫힌 값 집합 모델링하기

주문 상태가 `READY`, `PAID`, `CANCELLED`처럼 **가능한 값이 미리 정해져 있다면** 단순 문자열보다 enum이 더 분명한 모델이 될 수 있습니다.

```java
String status = "PAYED"; // 오타도 문자열 자체는 허용됨
```

문자열은 어떤 값이 가능한지 타입만 보고 알기 어렵고 오타도 컴파일러가 막지 못합니다.

```java
enum OrderStatus {
    READY,
    PAID,
    CANCELLED
}

OrderStatus status = OrderStatus.PAID;
```

이제 변수에는 `OrderStatus`가 정의한 값만 들어갈 수 있습니다.

### enum은 단순 상수 묶음보다 강하다

Java enum의 각 상수는 해당 enum 타입의 인스턴스입니다. 그래서 필드, 생성자, 메서드를 가질 수 있습니다.

```java
enum OrderStatus {
    READY(false),
    PAID(true),
    CANCELLED(false);

    private final boolean completedPayment;

    OrderStatus(boolean completedPayment) {
        this.completedPayment = completedPayment;
    }

    boolean completedPayment() {
        return completedPayment;
    }
}
```

상태와 직접 관련된 판단을 enum에 둘 수 있어 호출 코드 곳곳의 `if`를 줄일 수 있습니다.

```java
if (status.completedPayment()) {
    // ...
}
```

다만 모든 비즈니스 정책을 enum에 넣는 것이 목적은 아닙니다. 여러 도메인 객체나 외부 시스템 정보가 필요한 규칙까지 enum이 책임지면 오히려 과도하게 커질 수 있습니다.

### `switch`와 함께 닫힌 집합의 장점을 얻는다

```java
String label = switch (status) {
    case READY -> "대기";
    case PAID -> "결제 완료";
    case CANCELLED -> "취소";
};
```

가능한 enum 상수가 정해져 있으므로 컴파일러가 빠진 경우를 검사하는 데 도움을 줄 수 있습니다. 상태가 문자열이었다면 임의의 다른 문자열 가능성까지 생각해야 합니다.

### 실무에서는 외부 표현과 enum 자체를 구분한다

API나 DB에 저장되는 값이 enum 상수 이름과 영원히 같아야 하는 것은 아닙니다. 외부 계약이 오래 유지되어야 한다면 별도의 안정된 code를 둘 수도 있습니다.

```java
enum OrderStatus {
    READY("ready"),
    PAID("paid");

    private final String code;
    // ...
}
```

이렇게 하면 Java 상수 이름을 리팩터링하는 문제와 외부 데이터 계약을 분리할 수 있습니다.

### 선택 기준

`enum`이 특히 자연스러운 경우는 **값의 후보가 닫혀 있고, 그 값들이 하나의 타입으로 같은 의미 체계에 속할 때**입니다. 계속 외부에서 새로운 값이 추가되는 개방형 데이터라면 enum이 맞지 않을 수도 있습니다.

면접에서 “enum의 장점은 상수 관리”라고만 말하기보다 타입 안전성, 가능한 값의 제한, 관련 행동을 함께 둘 수 있다는 점까지 설명하면 좋습니다.
