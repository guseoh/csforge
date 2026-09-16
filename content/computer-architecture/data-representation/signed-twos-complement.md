---
kind: concept
contentKey: computer-architecture.core.data-representation.signed-twos-complement
topicContentKey: computer-architecture.core.data-representation
slug: signed-twos-complement
title: "부호 있는 정수와 2의 보수"
summary: "같은 고정 폭 bit pattern을 signed·unsigned로 다르게 해석할 수 있으며 two's complement가 음수를 표현하는 방식을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html"
    title: "Computer Architecture: Number Systems"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "고정 폭 정수와 수 표현의 기초를 확인한다."
    displayOrder: 1
---
# 부호 있는 정수와 2의 보수

Memory에 저장된 bit pattern 자체에는 `양수`, `음수`라는 꼬리표가 붙어 있지 않습니다. 같은 bit들을 어떤 규칙으로 해석하느냐에 따라 값이 달라집니다.

예를 들어 8-bit `1111 1111`은 unsigned 정수로 해석하면 255이고, two's complement signed 정수로 해석하면 -1입니다.

```text
bit pattern : 1111 1111
unsigned    : 255
signed      : -1
```

현대 컴퓨터에서 signed integer는 보통 **2의 보수(two's complement)** 표현을 사용합니다. n-bit signed 정수의 범위는 다음과 같습니다.

```text
-2^(n-1)  ~  2^(n-1) - 1
```

8 bit라면 `-128 ~ 127`입니다. 범위가 양수 쪽보다 음수 쪽에 하나 더 있는 이유는 0을 하나만 표현하면서 전체 2^8개의 pattern을 나누기 때문입니다.

음수를 이해하는 쉬운 방법은 해당 양수의 bit를 반전한 뒤 1을 더하는 것입니다.

```text
  5  = 0000 0101
반전 = 1111 1010
+ 1  = 1111 1011  → -5
```

이 표현 덕분에 같은 고정 폭 덧셈 회로로 양수와 음수 연산을 자연스럽게 다룰 수 있습니다. 다만 bit pattern을 더 넓은 폭으로 옮길 때는 signed 값을 보존하기 위해 상위 bit를 채우는 sign extension이 필요합니다.

```text
8-bit  -1 : 1111 1111
16-bit -1 : 1111 1111 1111 1111
```

중요한 점은 **최상위 bit 하나를 떼어 별도의 부호처럼 읽는 방식이 아니라 전체 bit pattern이 two's complement 규칙으로 함께 값을 표현한다는 것**입니다. 이 해석 규칙을 알아야 overflow, widening, binary protocol의 정수 field를 정확히 이해할 수 있습니다.
