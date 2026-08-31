---
kind: concept
contentKey: backend.core.time-money.money-rounding
topicContentKey: backend.core.time-money
slug: money-rounding
title: "금액과 BigDecimal rounding"
summary: "금액 계산에서 이진 부동소수점 오차와 scale·rounding 정책을 분리하고 통화 계약을 명시한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html"
    title: "Java SE 25 API: BigDecimal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "임의 정밀도 10진수 연산과 scale/rounding 계약을 확인한다."
---
# 금액과 BigDecimal rounding

금액을 `double`로 계산하면 사람이 쓰는 10진 소수를 이진 부동소수점으로 근사하는 과정에서 오차가 생길 수 있다. 더 중요한 문제는 `BigDecimal`을 쓴다고 해서 금액 정책이 자동으로 정해지는 것도 아니라는 점이다. 통화의 소수 자릿수, 세금 계산 순서, 할인 분배, 반올림 방법을 별도 계약으로 정해야 한다.

### 생성부터 주의한다

```java
new BigDecimal(0.1)      // binary double 근사값을 받아 예상 밖 값 가능
new BigDecimal("0.1")   // 정확한 10진수 0.1
BigDecimal.valueOf(0.1)  // Double.toString 기반
```

금액 literal은 문자열이나 정수 minor unit을 사용하는 방식이 의도를 더 명확히 만들 수 있다.

### 나눗셈에는 rounding 정책이 필요할 수 있다

```java
BigDecimal perItem = total.divide(
        BigDecimal.valueOf(count),
        2,
        RoundingMode.HALF_UP
);
```

하지만 이 코드에서 `2`와 `HALF_UP`은 Java 문법이 아니라 **업무 정책**이다. KRW, USD, 포인트, 세금 규칙에 따라 달라질 수 있다.

### 합계 보존도 확인한다

10,000원을 3개 item에 나누면 단순히 3,333.33으로 만들 수 없다. 어느 item에 remainder를 줄지 정해야 최종 합계가 원래 금액과 같아진다.

```text
10,000
 ├─ 3,334
 ├─ 3,333
 └─ 3,333
 = 10,000
```

### equality도 의도를 선택한다

`BigDecimal.equals()`는 값뿐 아니라 scale도 비교한다. `1.0`과 `1.00`을 금액상 같은 값으로 볼지에 따라 `compareTo()` 기반 비교나 domain value object의 equality 정책을 선택할 수 있다.

금액 계산은 자료형 선택보다 **통화 단위와 rounding rule을 한곳에 고정하는 것**이 핵심이다.
