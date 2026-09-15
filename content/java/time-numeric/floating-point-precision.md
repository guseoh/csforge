---
kind: concept
contentKey: java.core.time-numeric.floating-point-precision
topicContentKey: java.core.time-numeric
slug: floating-point-precision
title: "부동소수점 정밀도와 오차"
summary: "binary floating-point가 일부 10진수를 근사해 저장하는 이유와 비교·금액 계산에서의 영향을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html"
    title: "Java Language Specification 4장: Types, Values, and Variables"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Java floating-point type과 값 집합 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Double.html"
    title: "Java SE 25 API: Double"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: Double 비교와 NaN·infinity 같은 특수 값 확인
---
# 부동소수점 정밀도와 오차

`double`에 `0.1`을 넣었다고 해서 사람이 쓰는 십진수 `0.1`이 내부에 그대로 저장된다고 생각하면 계산 결과가 낯설게 보일 수 있습니다. Java의 `float`와 `double`은 **2진수 기반의 부동소수점 표현**을 사용하고, 일부 10진수는 제한된 비트로 정확히 표현할 수 없습니다.

### 일부 십진수는 가장 가까운 표현 가능한 값으로 저장된다

10진수에서 `1 / 3`을 유한한 자리로 정확히 표현할 수 없는 것처럼, 2진수에서도 어떤 십진 소수는 끝없이 이어집니다. 저장 공간은 유한하므로 가까운 부동소수점 값으로 표현됩니다.

```java
double value = 0.1 + 0.2;

System.out.println(value);        // 0.30000000000000004처럼 보일 수 있음
System.out.println(value == 0.3); // false가 될 수 있음
```

이 결과는 무작위 오차가 아니라 **표현 가능한 값의 집합 안에서 정해진 부동소수점 연산을 수행한 결과**입니다.

```text
10진 입력
   │
   ▼
binary floating-point로 표현 가능한 근사값
   │
   ▼
산술 연산
   │
   ▼
다시 표현 가능한 값으로 반올림
```

### 출력 문자열과 내부 값은 같은 층위가 아니다

`System.out.println(0.1)`이 `0.1`로 보인다고 내부 표현이 정확한 십진수 0.1이라는 뜻은 아닙니다. 출력 과정에서는 사람이 읽을 십진 문자열로 다시 변환됩니다.

같은 이유로 화면에서 소수 둘째 자리까지 반올림해 보여 준다고 내부 계산 정밀도가 바뀌는 것도 아닙니다.

### 근사 계산을 비교할 때는 값의 의미를 본다

측정값이나 계산 결과처럼 작은 오차가 허용되는 값은 정확한 `==`보다 허용 오차를 둔 비교가 자연스러울 수 있습니다.

```java
double a = 0.1 + 0.2;
double b = 0.3;
double epsilon = 1e-9;

boolean closeEnough = Math.abs(a - b) < epsilon;
```

하지만 `epsilon`을 아무 숫자로 고르면 안 됩니다. 값의 단위와 크기, 업무상 허용되는 오차에 맞춰야 합니다. 반대로 정확히 같은 부동소수점 값인지 확인하는 것이 실제 요구라면 `==` 자체가 잘못된 연산은 아닙니다.

### NaN과 Infinity는 일반적인 숫자 비교와 다른 규칙을 가진다

```java
double value = Double.NaN;
System.out.println(value == value); // false
```

부동소수점에는 `NaN`, 양·음의 infinity 같은 특수 값도 있습니다. 외부 계산 결과를 검증해야 한다면 `Double.isNaN`, `Double.isFinite` 같은 API가 필요한지 확인해야 합니다.

### 정확한 십진 의미가 계약이면 타입 자체를 다시 선택한다

금액처럼 `100.10`이라는 십진 의미와 반올림 규칙이 업무 계약이라면 binary floating-point의 근사를 억지로 tolerance로 다루는 것보다 **정확한 십진 모델을 선택**하는 편이 낫습니다.

대표적으로 최소 화폐 단위를 정수로 표현하거나 `BigDecimal`을 사용할 수 있습니다. 어떤 방법이 맞는지는 통화 단위와 범위, 반올림 정책에 따라 달라집니다.

부동소수점을 이해할 때 중요한 것은 "double은 부정확하다"라는 한 문장이 아닙니다. **어떤 값은 정확히 표현되고 어떤 값은 근사되며, 현재 도메인이 그 근사를 허용하는지**를 구분하는 것이 핵심입니다.
