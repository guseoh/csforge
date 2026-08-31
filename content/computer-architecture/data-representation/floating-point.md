---
kind: concept
contentKey: computer-architecture.core.data-representation.floating-point
topicContentKey: computer-architecture.core.data-representation
slug: floating-point
title: "Floating-Point"
summary: "sign·exponent·significand와 반올림으로 부동소수점 정밀도 한계를 설명한다."
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
# Floating-Point

### 실수를 근사하는 세 field

IEEE 754 binary floating-point는 sign, biased exponent, significand로 값을 근사한다. 0.1처럼 2진 분수로 유한하게 끝나지 않는 값은 저장 시 반올림되고, 큰 값으로 이동할수록 인접한 표현 사이 간격이 커져 작은 변화가 사라질 수 있다. `NaN`, infinity, subnormal은 일반 유한수와 다른 비교·전파 규칙을 가진다.

연산마다 반올림되므로 `(a+b)+c`와 `a+(b+c)`가 다를 수 있다. 허용 오차 비교는 절대 오차만으로 충분하지 않고 값의 규모와 누적 연산 횟수를 함께 고려해야 한다. decimal 표현이 필요한 금액에 binary float을 그대로 쓰면 표현 오차가 business invariant를 깨뜨릴 수 있다.

### Backend 연결

집계·rate·좌표·금액은 허용 오차와 직렬화 형식을 먼저 정한다. 성능 때문에 float을 선택하더라도 결과를 equality로 비교하지 말고 rounding policy, overflow/NaN 처리, database representation을 계약으로 고정한다.

