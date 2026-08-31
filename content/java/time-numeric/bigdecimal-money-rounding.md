---
kind: concept
contentKey: java.core.time-numeric.bigdecimal-money-rounding
topicContentKey: java.core.time-numeric
slug: bigdecimal-money-rounding
title: "BigDecimal, money, and rounding"
summary: "정확한 십진 값을 다룰 때 BigDecimal의 생성·scale·비교·반올림 정책을 올바르게 선택한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html"
    title: "Java SE 25 API: BigDecimal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 값·scale·연산·equals·compareTo 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/RoundingMode.html"
    title: "Java SE 25 API: RoundingMode"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 명시적인 반올림 정책의 종류 확인
---
# BigDecimal, money, and rounding

금액과 세율처럼 십진수 자체가 업무 의미인 값을 `double`로 다루면 binary floating-point의 근사 오차가 불필요하게 끼어들 수 있습니다. `BigDecimal`은 **십진 값을 명시적으로 표현하고 계산 정밀도와 반올림 정책을 제어**할 수 있게 해 줍니다.

다만 `BigDecimal`을 사용한다고 자동으로 모든 금액 문제가 해결되는 것은 아닙니다. 생성 방법, scale, 비교 API, 나눗셈의 반올림 시점을 함께 이해해야 합니다.

### `double`에서 바로 만드는 것과 문자열로 만드는 것은 다르다

```java
BigDecimal fromString = new BigDecimal("0.1");
BigDecimal fromDouble = new BigDecimal(0.1);
```

`0.1`이라는 `double` 값 자체가 이미 binary floating-point의 근사값입니다. `new BigDecimal(0.1)`은 그 근사된 `double` 값을 정확하게 BigDecimal로 옮기기 때문에 사람이 기대한 `0.1`보다 긴 값이 될 수 있습니다.

십진 문자열이 원래 계약이라면 문자열 생성이 의미를 그대로 표현하기 쉽습니다.

```java
BigDecimal price = new BigDecimal("19900.50");
```

이미 `double` 값을 받아 BigDecimal로 바꾸어야 한다면 `BigDecimal.valueOf(double)`의 계약을 확인해 사용하는 방법도 있습니다.

### scale은 소수점 아래 자릿수와 연결된다

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("1.00");
```

두 값은 수치적으로는 같은 1이지만 scale은 다릅니다.

이 차이는 `equals`와 `compareTo`에서 중요합니다.

```java
System.out.println(a.compareTo(b) == 0); // true
System.out.println(a.equals(b));         // false
```

`compareTo`는 수치적인 크기를 비교하고, `equals`는 값 표현에서 scale까지 고려합니다. 따라서 금액의 "같다"가 무엇을 뜻하는지에 따라 API를 선택해야 합니다.

특히 `BigDecimal`을 `HashSet`이나 `HashMap` key로 사용할 때 `equals/hashCode` 의미가 적용된다는 점도 기억해야 합니다.

### 나눗셈은 반올림 정책이 필요할 수 있다

1을 3으로 나누면 십진수로 끝없이 이어집니다. 무한한 자릿수를 메모리에 담을 수 없으므로 어느 시점에 결과를 끊을지 정해야 합니다.

```java
BigDecimal one = BigDecimal.ONE;
BigDecimal three = new BigDecimal("3");

BigDecimal result = one.divide(three, 2, RoundingMode.HALF_UP);
// 0.33
```

여기서 `2`라는 scale과 `HALF_UP`이라는 반올림 방식은 단순 기술 설정이 아니라 **업무 규칙일 수 있습니다.** 세금, 할인, 환율 계산에서는 언제 어떤 방식으로 반올림하는지가 최종 금액을 바꿉니다.

반올림 정책이 필요한 연산에서 아무 정책도 정하지 않으면 연산이 실패할 수 있습니다. 따라서 "BigDecimal은 정확하니까 나눗셈도 무조건 정확히 끝난다"고 생각하면 안 됩니다.

### 중간 단계마다 반올림하면 결과가 달라질 수 있다

```text
방법 A
원가 -> 할인 계산 -> 반올림 -> 세금 계산 -> 반올림

방법 B
원가 -> 할인 계산 -> 세금 계산 -> 마지막에 반올림
```

두 방법은 같은 숫자를 사용해도 결과가 달라질 수 있습니다. 따라서 반올림은 Java API 선택 문제가 아니라 **비즈니스 계약에서 시점까지 정의해야 하는 규칙**입니다.

### 금액 타입은 BigDecimal 하나보다 더 많은 의미를 가질 수 있다

`100.00`이라는 숫자만으로는 KRW인지 USD인지 알 수 없습니다. 또한 통화마다 허용하는 소수 단위가 다를 수 있습니다.

실제 도메인에서는 다음을 함께 모델링할 수 있습니다.

```text
Money
├─ amount: BigDecimal
├─ currency
└─ rounding / scale invariant
```

이때 BigDecimal은 금액 value object를 구현하는 재료이지 돈의 모든 규칙을 대신하는 도메인 타입은 아닙니다.

### 문제를 풀 때 확인할 것

1. BigDecimal을 어떤 값에서 생성했는지 봅니다.
2. 두 값의 scale이 같은지 확인합니다.
3. 비교가 `equals`인지 `compareTo`인지 구분합니다.
4. 나눗셈에서 scale과 RoundingMode가 명시되어 있는지 봅니다.
5. 반올림이 중간에 이루어지는지 마지막에 이루어지는지 추적합니다.

### 자주 헷갈리는 부분

- `new BigDecimal(double)`은 사람이 입력한 십진 표현을 그대로 복원하는 기능이 아닙니다.
- `equals`와 `compareTo`는 같은 의미의 비교가 아닙니다.
- `setScale`은 단순 출력 포맷만 바꾸는 메서드가 아닐 수 있으며 반올림이 필요할 수 있습니다.
- BigDecimal을 쓴다고 통화·반올림 시점·금액 불변식이 자동으로 정해지지 않습니다.

### 면접에서 설명한다면

`BigDecimal`은 정확한 십진 계산이 필요한 금액 등에 적합하지만 생성과 비교 규칙을 알아야 합니다. `new BigDecimal(double)`은 이미 근사된 binary floating-point 값을 가져올 수 있으므로 문자열이나 `valueOf`를 검토하고, `equals`는 scale까지 보지만 `compareTo`는 수치 크기를 비교합니다. 나눗셈과 금액 계산에서는 반올림 방식과 시점을 비즈니스 규칙으로 명확히 해야 합니다.
