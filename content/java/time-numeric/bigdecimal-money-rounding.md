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

이미 `double` 값을 받아 BigDecimal로 바꾸어야 한다면 `BigDecimal.valueOf(double)`도 검토할 수 있습니다. 이 메서드는 `Double.toString(double)`의 문자열 표현을 사용해 BigDecimal을 만들지만, **이미 double로 바뀌는 과정에서 잃은 원래 입력 정밀도를 되살리는 기능은 아닙니다.** 가능하다면 금액 경계 자체에서 decimal 문자열이나 정확한 minor unit을 받는 편이 의미가 분명합니다.

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

`compareTo`는 수치적인 크기를 비교하고, `equals`는 값과 scale을 함께 고려합니다. 따라서 금액의 "같다"가 무엇을 뜻하는지에 따라 API를 선택해야 합니다.

특히 `BigDecimal`을 `HashSet`이나 `HashMap` key로 사용할 때 `equals/hashCode` 의미가 적용된다는 점도 기억해야 합니다. 수치상 같은 `1.0`과 `1.00`을 같은 key로 취급해야 한다면 입력을 일정한 scale로 정규화할지, Money 같은 value object가 원하는 동등성 계약을 가질지 설계해야 합니다.

카카오페이의 레거시 전환 사례에서도 기존·신규 응답을 비교할 때 `100.0`과 `100.000`처럼 scale이 다른 BigDecimal을 그대로 객체 equality로 비교하면 차이로 잡히는 문제가 있어 별도 정규화를 다뤘습니다. 이런 사례는 `equals`와 수치 동등성의 차이가 단순 면접 문제가 아니라 실제 검증 도구와 데이터 계약에도 영향을 준다는 점을 보여 줍니다.

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

여러 항목을 합산하는 정산에서도 항목별 반올림 후 합계와 전체를 계산한 뒤 마지막에 반올림하는 결과가 달라질 수 있습니다. 어느 결과가 맞는지는 Java가 정하는 것이 아니라 결제·세금·정산 계약이 정해야 하며, 테스트에도 그 시점이 드러나야 합니다.

### 금액 타입은 BigDecimal 하나보다 더 많은 의미를 가질 수 있다

`100.00`이라는 숫자만으로는 KRW인지 USD인지 알 수 없습니다. 또한 통화마다 허용하는 소수 단위가 다를 수 있습니다.

실제 도메인에서는 다음을 함께 모델링할 수 있습니다.

```text
Money
├─ amount: BigDecimal
├─ currency
└─ scale / rounding invariant
```

이때 BigDecimal은 금액 value object를 구현하는 재료이지 돈의 모든 규칙을 대신하는 도메인 타입은 아닙니다. 서로 다른 통화끼리 연산할 수 있는지, 허용 scale을 넘어선 입력을 거부할지, 어느 경계에서 반올림할지 같은 규칙은 Money의 계약으로 둘 수 있습니다.

### 문제를 풀 때 확인할 것

1. BigDecimal을 어떤 값에서 생성했는지 봅니다.
2. 두 값의 scale이 같은지 확인합니다.
3. 비교가 `equals`인지 `compareTo`인지 구분합니다.
4. 나눗셈에서 scale과 `RoundingMode`가 명시되어 있는지 봅니다.
5. 반올림이 중간에 이루어지는지 마지막에 이루어지는지 추적합니다.

### 자주 헷갈리는 부분

- `new BigDecimal(double)`은 사람이 입력한 십진 표현을 그대로 복원하는 기능이 아닙니다.
- `BigDecimal.valueOf(double)`도 double이 되기 전의 원래 입력을 복원하지는 않습니다.
- `equals`와 `compareTo`는 같은 의미의 비교가 아닙니다.
- `setScale`은 단순 출력 포맷만 바꾸는 메서드가 아니며 값에 따라 반올림이 필요할 수 있습니다.
- BigDecimal을 쓴다고 통화·반올림 시점·금액 불변식이 자동으로 정해지지 않습니다.

### 학습 후 스스로 설명해 보기

`BigDecimal`은 정확한 십진 계산이 필요한 금액 등에 적합하지만 생성과 비교 규칙을 알아야 합니다. `new BigDecimal(double)`은 이미 근사된 binary floating-point 값을 가져올 수 있으므로 decimal 문자열이나 `valueOf`를 입력 경계에 맞게 선택하고, `equals`는 scale까지 보지만 `compareTo`는 수치 크기를 비교합니다. 나눗셈과 금액 계산에서는 반올림 방식과 시점을 비즈니스 규칙으로 명확히 해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. `new BigDecimal(0.1)`과 `new BigDecimal("0.1")`은 왜 결과가 다를 수 있나요?

첫 번째는 `0.1`이 먼저 `double`의 binary floating-point 근사값이 된 뒤 그 값을 BigDecimal로 옮깁니다. 두 번째는 십진 문자열 `0.1` 자체를 해석하므로, 원래 입력 계약이 decimal text라면 문자열 생성이 그 의미를 더 직접 보존합니다.

#### Q. `new BigDecimal("1.0")`과 `new BigDecimal("1.00")`은 같은 값인가요?

수치 비교인 `compareTo`에서는 같지만 `equals`는 scale까지 고려하므로 다릅니다. 따라서 HashSet/HashMap key나 응답 비교처럼 객체 equality가 사용되는 경계에서는 domain이 원하는 동등성에 맞게 scale 정규화나 value object 계약을 설계해야 합니다.
