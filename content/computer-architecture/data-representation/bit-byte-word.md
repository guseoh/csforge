---
kind: concept
contentKey: computer-architecture.core.data-representation.bit-byte-word
topicContentKey: computer-architecture.core.data-representation
slug: bit-byte-word
title: "Bit, Byte와 Word"
summary: "bit·byte·word가 각각 무엇을 나타내며 주소 공간과 register 폭에서 어떤 역할을 하는지 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html"
    title: "Computer Architecture: Number Systems"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "고정 폭 정수와 수 표현의 기초를 확인한다."
    displayOrder: 1
---
# Bit, Byte와 Word

컴퓨터는 결국 0과 1의 조합으로 정보를 표현합니다. **Bit**는 0 또는 1 하나를 저장하는 가장 작은 논리 단위이고, **byte**는 일반적으로 8개의 bit를 묶은 단위입니다. 현대의 일반적인 byte-addressable machine에서는 memory address 하나가 byte 하나를 가리킵니다.

```text
address 1000 → 1 byte
address 1001 → 1 byte
address 1002 → 1 byte
...
```

**Word**는 byte처럼 고정된 보편 단위가 아니라 processor architecture가 자연스럽게 다루는 데이터 폭과 관련된 개념입니다. 예를 들어 64-bit architecture에서는 general-purpose register나 pointer 폭이 64 bit인 경우가 많지만, 그렇다고 모든 instruction이 항상 8 byte만 읽고 쓰는 것은 아닙니다. Byte, 16-bit, 32-bit 연산처럼 더 작은 폭도 사용할 수 있습니다.

따라서 `64-bit CPU`라는 표현을 다음처럼 이해하면 안전합니다.

- address와 register가 다루는 대표 폭이 64 bit인 architecture라는 뜻에 가깝습니다.
- memory가 64 bit 단위로만 주소 지정된다는 뜻은 아닙니다.
- 모든 데이터 타입의 크기가 64 bit라는 뜻도 아닙니다.

여러 byte로 하나의 값을 저장하면 추가 질문이 생깁니다. 예를 들어 32-bit 값은 4개의 연속된 byte를 차지하며, 그 4 byte를 낮은 주소부터 어떤 순서로 놓을지는 endianness가 결정합니다.

핵심은 **bit는 표현의 최소 단위, byte는 주소 지정과 저장에서 자주 사용하는 묶음, word는 architecture의 자연스러운 처리 폭과 관련된 단위**라는 점입니다. 이 셋을 같은 의미로 사용하지 않아야 뒤에서 register, memory, instruction width를 정확히 구분할 수 있습니다.
