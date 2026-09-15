---
kind: concept
contentKey: java.core.time-numeric.bigdecimal-money-rounding
topicContentKey: java.core.time-numeric
slug: bigdecimal-money-rounding
title: "BigDecimal로 금액과 반올림 다루기"
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
  - url: "https://tech.kakaopay.com/post/kakaopayins-legacy-improvement-with-aop/"
    title: "카카오페이 기술 블로그: 안전하게 레거시 코드 옮겨 보기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: BigDecimal의 scale 차이가 실제 응답 비교·정규화에서 문제가 된 사례를 함께 확인
---
# BigDecimal로 금액과 반올림 다루기

금액과 세율처럼 십진수 자체가 업무 의미인 값을 `double`로 다루면 binary floating-point의 근사 오차가 불필요하게 개입할 수 있습니다. `BigDecimal`은 **십진 값을 명시적으로 표현하고 scale과 반올림 정책을 제어**할 수 있게 합니다.

다만 타입만 `BigDecimal`로 바꾼다고 금액 규칙이 자동으로 결정되는 것은 아닙니다. 생성 방법, 비교 의미, 나눗셈과 반올림 정책을 함께 봐야 합니다.

### `double`에서 만드는 것과 십진 문자열에서 만드는 것은 다르다

```java
BigDecimal fromString = new BigDecimal("0.1");
BigDecimal fromDouble = new BigDecimal(0.1);
```

`0.1`이라는 `double` 값은 이미 binary floating-point 근사값입니다. `new BigDecimal(0.1)`은 그 근사값을 정확하게 BigDecimal로 옮기므로 사람이 기대한 십진 `0.1`과 다른 긴 값이 될 수 있습니다.

원래 입력 계약이 십진 문자열이라면 문자열 생성이 그 의미를 직접 보존합니다.

```java
BigDecimal price = new BigDecimal("19900.50");
```

`BigDecimal.valueOf(double)`은 `Double.toString(double)`을 이용해 사람이 기대하는 십진 표현에 가까운 결과를 제공할 수 있지만, **double로 변환되기 전에 이미 잃어버린 원래 정밀도를 복원하는 기능은 아닙니다.**

### 수치적으로 같은 값과 `equals`가 같은 값은 다를 수 있다

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("1.00");

System.out.println(a.compareTo(b) == 0); // true
System.out.println(a.equals(b));         // false
```

`compareTo`는 수치적인 크기를 비교하고, `equals`는 값과 scale을 함께 고려합니다.

따라서 "금액이 같다"라는 업무 의미가 무엇인지에 따라 비교 방식을 선택해야 합니다. 특히 `HashSet`이나 `HashMap` key처럼 객체의 `equals/hashCode` 계약을 사용하는 곳에서는 scale 차이가 실제 동등성 결과에 영향을 줍니다.

필요하다면 입력 scale을 정규화하거나, 금액 value object가 도메인에 맞는 동등성 계약을 제공하는 방법을 검토할 수 있습니다.

### 나눗셈에는 명시적인 반올림 정책이 필요할 수 있다

1을 3으로 나누면 십진 표현이 끝나지 않습니다.

```java
BigDecimal result = BigDecimal.ONE.divide(
        new BigDecimal("3"),
        2,
        RoundingMode.HALF_UP
);
```

여기서 scale `2`와 `HALF_UP`은 단순 출력 설정이 아니라 계산 결과를 바꾸는 정책입니다. 정확히 표현할 수 없는 나눗셈에서 적절한 반올림 규칙을 주지 않으면 연산이 실패할 수 있습니다.

### 반올림 방식뿐 아니라 반올림 시점도 결과를 바꾼다

```text
방법 A
항목별 계산 → 각 항목 반올림 → 합계

방법 B
항목별 정확한 계산 → 합계 → 마지막 반올림
```

두 방식은 같은 입력을 사용해도 다른 결과를 만들 수 있습니다. 세금·할인·정산에서는 **어떤 RoundingMode를 쓰는가뿐 아니라 어느 단계에서 반올림하는가**도 비즈니스 계약이 될 수 있습니다.

### BigDecimal은 돈 자체의 모든 의미를 표현하지 않는다

`100.00`만으로는 KRW인지 USD인지 알 수 없고, 통화마다 허용하는 소수 단위와 반올림 규칙도 다를 수 있습니다.

```text
Money
├─ amount: BigDecimal
├─ currency
└─ 필요한 scale / rounding rule
```

BigDecimal은 정확한 십진 계산을 위한 값 타입이지 통화 규칙까지 자동으로 제공하는 도메인 모델은 아닙니다.

BigDecimal 코드를 읽을 때는 **어떤 값에서 생성됐는지, `equals`와 `compareTo` 중 무엇으로 비교하는지, 나눗셈과 scale 변경에서 어떤 반올림 정책을 사용하는지**를 확인하세요. 이 세 가지가 금액 계산에서 가장 자주 의미 차이를 만드는 지점입니다.
