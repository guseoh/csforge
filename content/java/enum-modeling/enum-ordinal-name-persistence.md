---
kind: concept
contentKey: java.core.enum-modeling.enum-ordinal-name-persistence
topicContentKey: java.core.enum-modeling
slug: enum-ordinal-name-persistence
title: "enum ordinal과 외부 저장값"
summary: "enum의 선언 순서를 나타내는 ordinal을 안정적인 외부 식별자로 사용하기 위험한 이유와 name 기반 저장의 trade-off를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Enum.html"
    title: "Java SE 25 API: Enum"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: name과 ordinal의 공식 의미 확인
---
# enum ordinal과 외부 저장값

모든 enum 상수에는 `name()`과 `ordinal()`이 있습니다. 둘 다 쉽게 얻을 수 있지만 **DB나 API에 장기간 저장할 식별자로 그대로 써도 된다는 뜻은 아닙니다.**

### ordinal은 선언 위치다

```java
enum Status {
    READY,    // ordinal 0
    PAID,     // ordinal 1
    CANCELLED // ordinal 2
}
```

`ordinal()`은 enum 선언에서 몇 번째 상수인지 나타냅니다. 중간에 새 상수를 끼워 넣으면 뒤 상수의 ordinal이 달라집니다.

```java
enum Status {
    READY,
    PENDING_PAYMENT,
    PAID,
    CANCELLED
}
```

예전에 DB에 `1`을 `PAID`로 저장했다면 새 코드에서는 `1`이 `PENDING_PAYMENT`가 되어 데이터 의미가 뒤집힐 수 있습니다.

그래서 `ordinal`은 enum 내부 순서가 필요한 일부 API에서 사용할 정보이지 **변하지 않는 비즈니스 식별자**로 간주하면 위험합니다.

### name은 ordinal보다 읽기 쉽지만 이름 변경에 묶인다

```java
Status.PAID.name(); // "PAID"
```

문자열 이름을 저장하면 숫자보다 의미를 읽기 쉽고 상수 순서를 바꿔도 값이 유지됩니다. 하지만 Java 상수 이름 자체를 바꾸면 기존 데이터와 달라집니다.

따라서 외부 계약을 장기간 안정적으로 유지해야 한다면 별도 code를 둘 수 있습니다.

```java
enum Status {
    READY("R"),
    PAID("P"),
    CANCELLED("C");

    private final String code;
}
```

### DB 매핑은 Java enum만의 문제가 아니다

JPA의 `@Enumerated` 같은 실제 persistence 설정은 프레임워크의 계약입니다. 여기서 기억할 것은 Java enum의 `ordinal`과 `name`이 무엇을 뜻하는지, 그리고 외부 데이터의 안정성 요구와 분리해야 한다는 점입니다.

### 문제를 풀 때 확인할 것

- 값이 선언 순서 변경에 영향을 받아도 되는가?
- Java 코드 이름을 바꿔도 외부 계약은 유지되어야 하는가?
- 이미 저장된 데이터와 새 코드의 값 매핑이 계속 같아야 하는가?

이 질문에 안정성이 필요하다면 `ordinal`을 외부 identity로 사용하는 것은 피하는 편이 좋습니다.
