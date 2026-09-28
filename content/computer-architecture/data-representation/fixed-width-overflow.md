---
kind: concept
contentKey: computer-architecture.core.data-representation.fixed-width-overflow
topicContentKey: computer-architecture.core.data-representation
slug: fixed-width-overflow
title: "고정 폭 산술과 오버플로(Fixed-Width Arithmetic and Overflow)"
summary: "n-bit 레지스터에 저장할 수 있는 범위를 넘어선 산술 결과가 어떤 비트 패턴으로 남는지와 부호 유무에 따른 오버플로를 구분한다."
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
# 고정 폭 산술과 오버플로(Fixed-Width Arithmetic and Overflow)

수학의 정수는 필요하면 계속 큰 값을 표현할 수 있지만 레지스터에는 정해진 비트 수만 저장할 수 있다. 그래서 n-bit 연산의 결과가 표현 가능한 범위를 넘으면 수학적 결과 전체를 그대로 보존할 수 없다.

8-bit 부호 없는 정수는 `0 ~ 255`를 표현한다. 따라서 다음 덧셈의 수학적 결과는 256이지만 8비트에 남길 수 있는 낮은 8개의 비트는 모두 0이다.

```text
  1111 1111   (255)
+ 0000 0001   (1)
------------
1 0000 0000   (256)

8-bit result → 0000 0000
```

이처럼 고정 폭의 부호 없는 산술은 낮은 n비트만 보면 modulo 2^n 연산처럼 동작한다. 흔히 wraparound라고 부르는 현상이다.

부호 있는 2의 보수에서는 오버플로를 판단하는 기준이 다르다. 8-bit 부호 있는 정수의 범위는 `-128 ~ 127`이므로 `127 + 1`의 비트 결과 `1000 0000`은 부호 있는 해석에서 -128이 된다. 수학적 결과 128을 표현할 수 없기 때문에 부호 있는 범위를 벗어난 것이다.

```text
0111 1111  = 127
0000 0001  =   1
-----------
1000 0000  = -128 로 해석
```

CPU ISA에 따라 carry나 overflow 상태를 플래그로 제공할 수 있지만, **오버플로가 일어났다고 하드웨어가 항상 자동 예외를 발생시키는 것은 아니다.** 명령어 계약과 그 결과를 사용하는 소프트웨어의 규칙을 별도로 봐야 한다.

따라서 고정 폭 산술에서는 계산 전에 필요한 범위를 확인하거나 더 넓은 표현으로 계산해야 할 수 있다. 핵심은 **수학적 결과와 레지스터에 실제로 남는 n-bit 결과를 분리해서 보는 것**이다.
