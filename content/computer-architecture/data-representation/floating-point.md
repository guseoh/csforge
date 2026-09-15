---
kind: concept
contentKey: computer-architecture.core.data-representation.floating-point
topicContentKey: computer-architecture.core.data-representation
slug: floating-point
title: "부동소수점 표현과 반올림"
summary: "IEEE 754 binary floating-point가 sign·exponent·significand로 넓은 범위의 값을 근사하고 연산마다 반올림 오차가 생길 수 있는 이유를 이해한다."
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
# 부동소수점 표현과 반올림

정수와 달리 실수는 제한된 bit 안에 모든 값을 정확히 담을 수 없습니다. IEEE 754의 binary floating-point는 값을 **sign, exponent, significand**로 나누어 매우 작은 수부터 매우 큰 수까지 넓은 범위를 표현하는 대신, 많은 값을 가장 가까운 표현 가능한 값으로 근사합니다.

개념적으로는 다음과 같은 형태로 볼 수 있습니다.

```text
value ≈ sign × significand × 2^exponent
```

문제는 10진수에서 간단한 값이 2진수에서는 유한하게 끝나지 않을 수 있다는 점입니다. 대표적으로 0.1은 binary fraction으로 정확히 끝나지 않으므로 finite floating-point에 저장할 때 반올림됩니다. 그래서 다음 연산들이 수학의 실수 계산과 완전히 같은 결과를 보장하지 않습니다.

또한 표현 가능한 값의 간격은 일정하지 않습니다. 값의 크기가 커질수록 인접한 floating-point 값 사이의 간격도 커질 수 있어, 매우 큰 수에 아주 작은 값을 더했을 때 변화가 표현되지 않을 수도 있습니다.

연산 결과도 다시 유한한 bit에 맞춰 반올림됩니다. 따라서 floating-point 덧셈은 일반적인 실수 덧셈과 달리 결합 법칙이 그대로 성립하지 않을 수 있습니다.

```text
(a + b) + c  !=  a + (b + c)  가능
```

IEEE 754에는 일반적인 유한수 외에도 `+∞`, `-∞`, `NaN`, subnormal처럼 특수한 표현이 있습니다. 특히 `NaN`은 잘못된 수치 연산의 결과를 표현하며 일반 숫자와 다른 비교 규칙을 가집니다.

이 특성은 floating-point가 잘못된 표현이라는 뜻이 아닙니다. 범위와 성능을 얻는 대신 정밀도가 유한하다는 계약입니다. 따라서 계산에서는 **어느 정도의 오차를 허용할지, 반올림이 누적될 수 있는지, 정확한 decimal 값이 필요한 문제인지**를 구분해야 합니다. 금액처럼 decimal 정확성이 중요한 경우에는 binary floating-point와 다른 표현을 선택하는 이유가 여기에 있습니다.
