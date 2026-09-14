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

모든 enum 상수에는 `name()`과 `ordinal()`이 있습니다. 둘 다 쉽게 얻을 수 있지만 **DB나 API처럼 오래 살아남는 외부 식별자로 그대로 써도 된다는 뜻은 아닙니다.** Java enum 내부 표현과 외부 데이터 계약은 수명이 다를 수 있습니다.

## ordinal은 비즈니스 ID가 아니라 선언 위치다

```java
enum Status {
    READY,    // 0
    PAID,     // 1
    CANCELLED // 2
}
```

`ordinal()`은 enum 선언에서 상수가 몇 번째에 있는지를 반환합니다. 중간에 새 값을 추가하면 뒤 상수의 ordinal이 바뀝니다.

```java
enum Status {
    READY,
    PENDING_PAYMENT,
    PAID,
    CANCELLED
}
```

예전에 숫자 `1`을 `PAID` 의미로 저장했다면 새 코드에서는 같은 값이 `PENDING_PAYMENT`를 뜻하게 됩니다. 따라서 ordinal을 **변하지 않는 외부 식별자**처럼 사용하는 것은 위험합니다.

## name은 순서 변경에는 강하지만 코드 이름과 결합된다

```java
Status.PAID.name(); // "PAID"
```

`name()`을 저장하면 상수 순서를 바꿔도 문자열 값은 유지됩니다. 하지만 상수 이름을 `PAYMENT_COMPLETED`로 바꾸면 과거의 `"PAID"`와 더 이상 자동으로 연결되지 않습니다.

또 `toString()`을 사용자 표시용으로 재정의해도 `name()` 자체는 바뀌지 않습니다.

```text
name()       : Java enum 선언 이름
ordinal()    : 선언 순서
label        : 사용자에게 보여 줄 표현
externalCode : 저장·API에서 유지할 별도 계약이 될 수 있음
```

이 네 가지는 서로 다른 의미입니다.

## 외부 계약이 더 오래가야 한다면 별도 code를 둘 수 있다

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

이렇게 하면 Java 상수 이름을 리팩터링하더라도 외부 code를 그대로 유지하는 전략을 선택할 수 있습니다. 다만 code 필드를 추가했다고 호환성 문제가 자동으로 사라지는 것은 아닙니다. 중복 code를 막고, 알 수 없는 값이나 삭제된 값, 과거 데이터의 migration을 어떻게 처리할지는 별도 계약입니다.

```java
static Status fromCode(String code) {
    return Arrays.stream(values())
            .filter(status -> status.code.equals(code))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("unknown status: " + code));
}
```

## 저장 방식은 Java enum 계약과 분리해서 본다

Java 언어가 enum을 DB에 `ordinal`이나 `name` 중 어떤 방식으로 저장하라고 정하지는 않습니다. JPA 같은 영속성 기술은 별도의 매핑 계약을 제공합니다.

```text
Java enum
- 상수 집합
- name
- ordinal

외부 저장·전송 계약
- 실제 어떤 값을 저장할지
- 기존 값과 어떻게 호환할지
- 변경 시 migration을 어떻게 할지
```

외부 데이터가 코드보다 오래 살아남는다면 편리하게 얻을 수 있는 enum 내부 값보다 **그 데이터의 수명에 맞는 안정적인 식별 계약**을 먼저 설계해야 합니다.
