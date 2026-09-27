---
kind: concept
contentKey: computer-architecture.core.data-representation.floating-point
topicContentKey: computer-architecture.core.data-representation
slug: floating-point
title: "부동소수점 표현과 반올림(Floating-Point)"
summary: "IEEE 754 이진 부동소수점이 sign·exponent·significand로 넓은 범위의 값을 근사하고 연산마다 반올림 오차가 생길 수 있는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://ieeexplore.ieee.org/document/8766227"
    title: "IEEE Standard for Floating-Point Arithmetic"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "부동소수점의 표현 폭과 반올림 경계를 확인한다."
    displayOrder: 1
---
# 부동소수점 표현과 반올림(Floating-Point)

정수와 달리 실수는 제한된 비트 안에 모든 값을 정확히 담을 수 없다. IEEE 754의 이진 부동소수점은 값을 **sign, exponent, significand**로 나누어 매우 작은 수부터 매우 큰 수까지 넓은 범위를 표현하는 대신, 많은 값을 가장 가까운 표현 가능한 값으로 근사한다.

개념적으로는 다음과 같은 형태로 볼 수 있다.

```text
value ≈ sign × significand × 2^exponent
```

### IEEE 754 binary32의 필드 배치

```text
bit index     31      30             23 22                         0
              +--------+---------------+----------------------------+
field         | sign   | exponent      | fraction                   |
width         | 1 bit  | 8 bits        | 23 bits                    |
              +--------+---------------+----------------------------+
```

정규화된 유한수는 `(-1)^sign × 1.fraction × 2^(exponent - 127)`로 해석한다. `exponent`가 0이면 subnormal 또는 0으로 해석하며 숨은 선행 1을 쓰지 않고, 255이면 infinity 또는 NaN을 나타낸다.

문제는 10진수에서 간단한 값이 2진수에서는 유한하게 끝나지 않을 수 있다는 점이다. 대표적으로 0.1은 이진 소수로 정확히 끝나지 않으므로 유한한 부동소수점에 저장할 때 반올림된다. 그래서 연산 결과가 수학의 실수 계산과 완전히 같다고 보장할 수 없다.

또한 표현 가능한 값의 간격은 일정하지 않다. 값의 크기가 커질수록 인접한 부동소수점 값 사이의 간격도 커질 수 있어, 매우 큰 수에 아주 작은 값을 더했을 때 변화가 표현되지 않을 수도 있다.

연산 결과도 다시 유한한 비트에 맞춰 반올림된다. 따라서 부동소수점 덧셈은 일반적인 실수 덧셈과 달리 결합 법칙이 그대로 성립하지 않을 수 있다.

```text
(a + b) + c  !=  a + (b + c)  가능
```

IEEE 754에는 일반적인 유한수 외에도 `+∞`, `-∞`, `NaN`, subnormal처럼 특수한 표현이 있다. 특히 `NaN`은 유효한 실수 결과가 아닌 상태를 표현하며 일반 숫자와 다른 비교 규칙을 가진다.

이 특성은 부동소수점이 잘못된 표현이라는 뜻이 아니다. 넓은 범위와 효율을 얻는 대신 정밀도가 유한하다는 계약이다. 따라서 계산에서는 **어느 정도의 오차를 허용할지, 반올림이 누적될 수 있는지, 정확한 10진 값이 필요한 문제인지**를 구분해야 한다. 금액처럼 10진 정확성이 중요한 경우에는 이진 부동소수점과 다른 표현을 선택하는 이유가 여기에 있다.
