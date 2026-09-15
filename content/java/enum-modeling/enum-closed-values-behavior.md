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
  - url: "https://techblog.woowahan.com/2527/"
    title: "Java Enum 활용기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 2
    relationNote: 문자열 코드와 관련 행동을 enum으로 응집한 실제 Java 활용 사례를 한국어로 복습
---
# enum으로 닫힌 값 집합 모델링하기

주문 상태가 `READY`, `PAID`, `CANCELLED`처럼 **가능한 값이 미리 정해져 있다면** 문자열보다 enum이 더 분명한 모델이 될 수 있습니다.

```java
String status = "PAYED"; // 문자열 자체는 오타도 허용
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

이제 변수에는 `OrderStatus`가 정의한 상수만 들어갈 수 있습니다. 의미가 다른 다른 enum 타입의 값과도 컴파일 시점에 구분됩니다. 즉 **값의 문맥을 타입으로 표현**할 수 있습니다.

### enum은 값과 그 값에 가까운 행동을 함께 가질 수 있다

Java enum의 각 상수는 해당 enum 타입의 인스턴스입니다. 따라서 필드, 생성자, 메서드를 가질 수 있습니다.

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

`PAID`라는 값과 “결제가 완료된 상태인가?”라는 지식이 함께 바뀌는 성질이라면 enum 안에 두어 의미를 응집할 수 있습니다.

다만 모든 분기를 enum 메서드로 옮겨야 한다는 뜻은 아닙니다. 특정 화면의 라벨이나 외부 표현처럼 사용처에 따라 달라지는 정책은 별도 위치가 더 적합할 수 있습니다. **값 자체의 의미인지, 특정 사용처의 표현 정책인지**를 구분해야 합니다.

### enum 상수의 가변 상태는 모든 사용자가 공유한다

```java
enum Mode {
    STANDARD;

    int uses;
}
```

`Mode.STANDARD`를 가져올 때마다 새로운 상수 객체가 생기는 것이 아닙니다. 같은 상수 인스턴스를 공유하므로 그 안의 가변 필드도 공유됩니다.

```text
Mode.STANDARD
└─ uses
   ▲   ▲
   │   │
   a   b
```

그래서 enum에는 상수별로 변하지 않는 메타데이터나 공통 정책을 두는 것이 자연스럽습니다. 주문별·사용자별·요청별로 독립적으로 변해야 하는 상태를 enum에 넣으면 의도치 않은 전역 공유 상태가 될 수 있습니다.

### 닫힌 값 집합이라는 성질이 중요하다

```java
String label = switch (status) {
    case READY -> "대기";
    case PAID -> "결제 완료";
    case CANCELLED -> "취소";
};
```

enum 상수 집합은 소스에 정해져 있으므로 `switch`에서도 가능한 값 집합을 타입 수준에서 다루기 쉽습니다.

반대로 운영자가 실행 중에 값을 계속 추가해야 하는 분류라면 enum은 맞지 않을 수 있습니다. 새 상수를 추가하려면 코드를 변경하고 배포해야 하기 때문입니다.

```text
코드와 함께 바뀌는 닫힌 값 집합   → enum 후보
운영 중 데이터로 계속 추가되는 값 → 데이터/설정 모델 후보
```

따라서 “값이 몇 개 안 된다”보다 **가능한 값의 집합이 실제로 닫혀 있는가, 누가 언제 새 값을 추가해야 하는가**가 더 좋은 판단 기준입니다.

API나 DB에 저장되는 외부 값도 enum 상수 이름과 반드시 같을 필요는 없습니다. 외부 계약이 더 오래 유지되어야 한다면 별도의 안정적인 code를 둘 수 있으며, `name()`과 `ordinal()`을 그대로 외부 식별자로 사용할 때의 차이는 다음 Concept에서 다룹니다.
