---
kind: concept
contentKey: backend.core.time-money.money-rounding
topicContentKey: backend.core.time-money
slug: money-rounding
title: "금액 표현과 반올림 정책"
summary: "금액을 단순 숫자가 아니라 통화 단위와 scale·rounding 규칙을 가진 값으로 모델링하고 계산·저장·API 경계에서 같은 정책을 유지한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html"
    title: "Java SE 25 API: BigDecimal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "정확한 10진수 연산과 scale/rounding 계약 확인"
---
# 금액 표현과 반올림 정책

백엔드에서 금액을 다룰 때 `double` 대신 `BigDecimal`을 쓰는 것만으로 설계가 끝나지 않습니다. **어떤 통화인지, 몇 자리까지 허용하는지, 어느 단계에서 어떤 방식으로 반올림하는지**가 함께 정해져야 같은 주문을 여러 경로에서 계산해도 결과가 일치합니다.

예를 들어 할인 후 금액을 계산하는 두 서비스가 서로 다른 시점에 반올림하면 최종 합계가 달라질 수 있습니다.

```text
원가
  │
  ├─ item별 할인 후 즉시 반올림
  │
  └─ 전체 합산 후 마지막에 반올림

같은 할인율이어도 결과가 달라질 수 있음
```

따라서 `scale=2`, `HALF_UP` 같은 값은 Java 편의 옵션이 아니라 업무 정책입니다. 통화와 상품 가격 정책에 따라 0자리, 2자리 또는 다른 단위가 필요할 수 있습니다.

### 금액에는 단위가 함께 있어야 한다

`1000`이라는 숫자만으로는 1,000원인지 10.00달러의 minor unit인지 알 수 없습니다. 내부 모델과 API는 amount와 currency의 관계를 분명히 해야 합니다.

```text
Money
- amount: 10000
- currency: KRW
```

실제 구현은 `BigDecimal` 기반 value object나 정수 minor unit 등 여러 선택지가 있을 수 있습니다. 중요한 것은 한 시스템 안에서 단위와 변환 규칙을 일관되게 유지하는 것입니다.

### 입력값 생성과 계산값 반올림을 구분한다

```java
new BigDecimal("0.1")
```

처럼 정확한 10진 입력을 사용하는 것은 표현 정확성의 문제입니다. 반면 나눗셈 결과를 몇 자리에서 어떤 방식으로 반올림할지는 별도의 업무 결정입니다. 두 문제를 섞으면 `BigDecimal`을 썼는데도 금액 오차가 발생할 수 있습니다.

### 분배에서는 합계 보존이 정책의 일부다

10,000원을 3개 항목에 나누면 모든 항목에 같은 값을 주는 것만으로 원래 합계를 보존할 수 없습니다.

```text
10,000
 ├─ 3,334
 ├─ 3,333
 └─ 3,333
 = 10,000
```

어느 항목이 remainder를 가져가는지까지 계약해야 재계산과 환불에서도 같은 결과를 만들 수 있습니다.

### 저장소와 API에서도 같은 의미를 유지한다

DB scale, JSON 표현, 외부 결제사 단위가 서로 다르면 경계마다 변환이 필요합니다. 예를 들어 내부는 `BigDecimal` 원 단위인데 외부 PG는 정수 원 단위를 요구한다면 adapter에서 명시적으로 변환하고 검증해야 합니다.

금액 모델링의 핵심은 특정 자료형이 아니라 **통화·정밀도·반올림·분배 규칙을 시스템 전체에서 하나의 계약으로 유지하는 것**입니다.
