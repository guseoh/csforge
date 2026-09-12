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

모든 enum 상수에는 `name()`과 `ordinal()`이 있습니다. 둘 다 쉽게 얻을 수 있지만 **DB나 API에 장기간 저장할 식별자로 그대로 써도 된다는 뜻은 아닙니다.** Java enum 내부의 정보와 외부 데이터 계약은 수명이 다를 수 있기 때문입니다.

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

예전에 DB에 `1`을 `PAID`로 저장했다면 새 코드에서는 `1`이 `PENDING_PAYMENT`가 되어 데이터 의미가 뒤집힐 수 있습니다. 프로그램은 숫자 `1` 자체가 과거에 무엇을 뜻했는지 알 수 없습니다.

그래서 `ordinal`은 enum 선언 순서를 다루는 API에 필요한 정보이지 **변하지 않는 비즈니스 식별자**로 간주하면 위험합니다.

### name은 재정렬에는 강하지만 이름 변경에 묶인다

```java
Status.PAID.name(); // "PAID"
```

문자열 이름을 저장하면 숫자보다 의미를 읽기 쉽고 상수 순서를 바꿔도 값이 유지됩니다. 하지만 Java 상수 이름 자체를 바꾸면 기존 데이터와 달라집니다.

```java
enum Status {
    PAYMENT_COMPLETED // 예전 이름 PAID
}
```

과거 데이터가 `"PAID"`라면 `Enum.valueOf(Status.class, "PAID")`는 새 상수를 자동으로 찾아 주거나 옛 이름을 alias로 기억하지 않습니다. 이름 변경을 허용하면서 과거 값을 계속 읽어야 한다면 migration이나 별도 parsing 정책이 필요합니다.

### `toString()`을 바꿔도 `name()`과 `valueOf()` 계약은 바뀌지 않는다

사용자에게 보여 줄 label 때문에 `toString()`을 재정의할 수 있습니다.

```java
@Override
public String toString() {
    return "결제 완료";
}
```

하지만 이것이 `name()`을 바꾸는 것은 아닙니다. `name()`은 선언된 식별자를 반환하고 `Enum.valueOf`는 그 이름을 기준으로 상수를 찾습니다. 표시 문자열, Java 식별자, 외부 wire code를 같은 개념으로 섞으면 저장과 파싱 계약이 쉽게 깨집니다.

```text
name()       : Java enum 선언 식별자
ordinal()    : 선언 순서
label        : 사용자에게 보여 줄 표현
externalCode : 저장/API에서 오래 유지할 별도 계약이 될 수 있음
```

### 외부 계약이 독립적으로 오래가야 한다면 명시적 code를 둘 수 있다

```java
enum Status {
    READY("R"),
    PAID("P"),
    CANCELLED("C");

    private final String code;

    Status(String code) {
        this.code = code;
    }
}
```

이제 Java 상수 이름과 외부 code의 수명을 분리할 수 있습니다. 예를 들어 내부 이름 `PAID`를 `PAYMENT_COMPLETED`로 리팩터링해도 외부 code `"P"`를 유지하는 전략을 선택할 수 있습니다.

다만 code field를 추가했다고 자동으로 안정적인 계약이 되는 것은 아닙니다. **code 중복 금지, 알 수 없는 code의 처리, 과거 code migration, 삭제된 값의 호환 정책**은 애플리케이션이 별도로 설계해야 합니다.

```java
static Status fromCode(String code) {
    return Arrays.stream(values())
            .filter(status -> status.code.equals(code))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("unknown status: " + code));
}
```

이 예시에서는 알 수 없는 code를 즉시 거부하지만, 실제 API가 forward compatibility를 요구한다면 `UNKNOWN` 같은 정책이나 versioned migration이 더 적절할 수도 있습니다. 그 선택은 Java enum 자체가 정하지 않습니다.

### DB 매핑은 Java enum만의 문제가 아니다

JPA의 `@Enumerated` 같은 실제 persistence 설정은 Jakarta Persistence/Hibernate의 계약입니다. Java 언어가 `ordinal`이나 `name` 중 하나를 DB에 저장하도록 결정하지 않습니다.

여기서 가져가야 할 경계는 간단합니다.

```text
Java enum 계약
- name
- ordinal
- enum 상수 집합

Persistence / API 계약
- 무엇을 실제 저장·전송할지
- 기존 값과 어떻게 호환할지
- migration을 어떻게 할지
```

따라서 “enum이면 DB에는 문자열로 저장된다”거나 “ordinal이 더 작아서 항상 더 좋은 저장 방식이다”처럼 Java 언어 규칙과 persistence 선택을 섞어 설명하면 안 됩니다.

### 문제를 풀 때 확인할 것

- 값이 선언 순서 변경에 영향을 받아도 되는가?
- Java 코드 이름을 바꿔도 외부 계약은 유지되어야 하는가?
- 이미 저장된 데이터와 새 코드의 값 매핑이 계속 같아야 하는가?
- 모르는 과거·미래 code를 읽었을 때 어떤 실패 또는 호환 정책이 필요한가?

외부 데이터가 오래 살아남는다면 enum 내부 표현보다 **그 데이터의 수명에 맞는 identity 계약**을 먼저 정해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. enum을 DB에 ordinal로 저장하면 왜 위험한가요?

`ordinal()`은 상수의 비즈니스 ID가 아니라 **enum 선언에서의 위치**입니다. 중간에 새 상수를 넣거나 순서를 바꾸면 같은 숫자가 다른 의미를 가리킬 수 있어 이미 저장된 데이터가 잘못 해석될 수 있습니다.

실제 JPA 매핑 방식은 persistence 계약이지만, Java의 ordinal 자체를 장기 외부 identity로 믿어서는 안 된다는 판단은 그보다 앞선 모델링 문제입니다.

#### Q. `name()`을 저장하면 안전한가요?

ordinal보다 선언 순서 변경에는 강하지만 Java 상수 이름 변경과 외부 데이터가 결합됩니다. `PAID`를 `PAYMENT_COMPLETED`로 바꾸면 과거 `"PAID"`가 자동으로 새 상수에 매핑되지 않습니다.

상수 이름을 자유롭게 리팩터링하면서 외부 값은 오래 유지해야 한다면 별도의 stable code와 명시적인 parsing/migration 정책을 둘 수 있습니다.
