---
kind: concept
contentKey: java.core.time-numeric.floating-point-precision
topicContentKey: java.core.time-numeric
slug: floating-point-precision
title: "Floating-point precision"
summary: "binary floating-point의 표현 한계와 equality·rounding 함정을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: floating-point type와 값 집합 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Double.html"
    title: "Java SE 25 API: Double"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: floating-point 비교와 특수 값 API 확인
---
# Floating-point precision

## 쉬운 진입

컴퓨터의 `double`은 10진수를 종이에 쓰듯 정확히 저장하는 칸이 아니라 binary floating-point
표현이다. 그래서 `0.1 + 0.2`가 사람이 기대하는 십진수 0.3과 bit 수준에서 정확히 같지
않을 수 있다.

## 정확한 메커니즘

```java
double total = 0.1 + 0.2;
System.out.println(total == 0.3); // false일 수 있는 대표 사례
```

근사 오차는 연산 횟수와 크기·순서에 따라 누적된다. tolerance 비교는 업무 단위와 허용 오차를
명시해야 하고, `NaN`은 자신과도 같지 않으며 infinity도 별도 규칙을 가진다. 단순히 마지막에
반올림했다고 중간 계산의 오차나 금액 보존 문제가 모두 해결되지는 않는다.

## 실전·면접 연결

물리량·그래픽처럼 근사값이 허용되는 영역은 double이 자연스럽지만, 금액·정산은 minor unit
정수나 `BigDecimal` 같은 decimal 모델을 검토한다. equality를 map key로 사용할 때는
근사값을 그대로 identity로 쓰지 않는 편이 안전하다.

## 흔한 오해

- `double`이 부정확하다는 말은 모든 계산 결과가 무작위라는 뜻이 아니다.
- `==`가 항상 금지되는 것은 아니지만 근사값 domain에서는 의미를 먼저 정의해야 한다.
- 출력 formatter의 자릿수 제한은 내부 값의 정확도를 복구하지 않는다.
