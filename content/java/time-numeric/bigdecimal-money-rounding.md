---
kind: concept
contentKey: java.core.time-numeric.bigdecimal-money-rounding
topicContentKey: java.core.time-numeric
slug: bigdecimal-money-rounding
title: "BigDecimal, money, and rounding"
summary: "BigDecimal 생성·scale·rounding·equals/compareTo를 금액 의미에 맞게 사용한다"
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/BigDecimal.html"
    title: "Java SE 25 API: BigDecimal"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: scale·rounding·equals·compareTo 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/math/RoundingMode.html"
    title: "Java SE 25 API: RoundingMode"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: 반올림 정책 enum 확인
---
# BigDecimal, money, and rounding

## 쉬운 진입

금액 `1.10`과 `1.1`은 수치로는 같아도 표시 scale과 반올림 정책은 다를 수 있다.
`BigDecimal`은 decimal 값을 명시적으로 다루지만 생성 방식과 비교 method를 잘못 고르면
의도와 다른 결과가 나온다.

## 정확한 메커니즘

```java
BigDecimal a = new BigDecimal("1.10");
BigDecimal b = BigDecimal.valueOf(1.10);
a.compareTo(b); // 0: numerical equality
a.equals(b);    // scale까지 달라질 수 있어 false
```

`new BigDecimal(double)`은 binary double의 근사값을 그대로 가져올 수 있어 문자열 또는
`valueOf`가 보통 안전한 시작점이다. 나눗셈처럼 exact representation이 안 되는 연산은
scale과 `RoundingMode`를 명시해야 한다. `equals`는 값과 scale을, `compareTo`는 수치 크기를
비교하므로 Set/Map key 계약과 업무 비교를 구분한다.

## 실전·면접 연결

돈의 통화·minor unit·반올림 시점은 Java type 하나가 결정하지 않는다. value object로
통화와 scale을 함께 보장하고, 계산 중간에는 불필요한 rounding을 반복하지 않으며 최종
정책을 테스트로 고정한다.

## 흔한 오해

- BigDecimal이 자동으로 모든 나눗셈을 무한 정밀도로 끝내 주지 않는다.
- `equals`와 `compareTo`는 같은 의미의 비교 method가 아니다.
- `setScale`은 단순 표시 포맷이 아니라 필요하면 실제 반올림 정책을 적용한다.
