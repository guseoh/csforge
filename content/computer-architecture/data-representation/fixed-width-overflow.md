---
kind: concept
contentKey: computer-architecture.core.data-representation.fixed-width-overflow
topicContentKey: computer-architecture.core.data-representation
slug: fixed-width-overflow
title: "고정 폭 연산과 Overflow"
summary: "n-bit register에 저장할 수 있는 범위를 넘어선 산술 결과가 어떤 bit pattern으로 남는지와 signed·unsigned overflow를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html"
    title: "Computer Architecture: Number Systems"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "고정 폭 정수와 수 표현의 기초를 확인한다."
    displayOrder: 1
---
# 고정 폭 연산과 Overflow

수학의 정수는 필요하면 계속 큰 값을 표현할 수 있지만 register에는 정해진 bit 수만 저장할 수 있습니다. 그래서 n-bit 연산의 결과가 표현 가능한 범위를 넘으면 수학적 결과 전체를 그대로 보존할 수 없습니다.

8-bit unsigned 정수는 `0 ~ 255`를 표현합니다. 따라서 다음 덧셈의 수학적 결과는 256이지만 8 bit에 남길 수 있는 낮은 8개의 bit는 모두 0입니다.

```text
  1111 1111   (255)
+ 0000 0001   (1)
------------
1 0000 0000   (256)

8-bit result → 0000 0000
```

이처럼 고정 폭 unsigned arithmetic은 낮은 n bit만 보면 modulo 2^n 연산처럼 동작합니다. 흔히 wraparound라고 부르는 현상입니다.

Signed two's complement에서는 overflow를 판단하는 기준이 다릅니다. 8-bit signed의 범위는 `-128 ~ 127`이므로 `127 + 1`의 bit 결과 `1000 0000`은 signed 해석으로 -128이 됩니다. 수학적 결과 128을 표현할 수 없기 때문에 signed 범위를 벗어난 것입니다.

```text
0111 1111  = 127
0000 0001  =   1
-----------
1000 0000  = -128 로 해석
```

CPU ISA에 따라 carry나 overflow 상태를 flag로 제공할 수 있지만, **overflow가 일어났다고 hardware가 항상 자동 예외를 발생시키는 것은 아닙니다.** Instruction의 계약과 그 결과를 사용하는 software의 규칙을 별도로 봐야 합니다.

따라서 고정 폭 산술에서는 계산 전에 필요한 범위를 확인하거나 더 넓은 표현으로 계산해야 할 수 있습니다. 핵심은 **수학적 결과와 register에 실제로 남는 n-bit 결과를 분리해서 보는 것**입니다.
