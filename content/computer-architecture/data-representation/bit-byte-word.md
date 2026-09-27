---
kind: concept
contentKey: computer-architecture.core.data-representation.bit-byte-word
topicContentKey: computer-architecture.core.data-representation
slug: bit-byte-word
title: "비트·바이트·워드(Bit, Byte and Word)"
summary: "비트·바이트·워드가 각각 무엇을 나타내며 주소 공간과 레지스터 폭에서 어떤 역할을 하는지 구분한다."
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
# 비트·바이트·워드(Bit, Byte and Word)

컴퓨터는 결국 0과 1의 조합으로 정보를 표현한다. **비트(bit)** 는 0 또는 1 하나를 저장하는 가장 작은 논리 단위이고, **바이트(byte)** 는 일반적으로 8개의 비트를 묶은 단위다. 현대의 일반적인 바이트 주소 지정(byte-addressable) 컴퓨터에서는 메모리 주소 하나가 바이트 하나를 가리킨다.

```text
address 1000 → 1 byte
address 1001 → 1 byte
address 1002 → 1 byte
...
```

**워드(word)** 는 바이트처럼 고정된 보편 단위가 아니라 프로세서 아키텍처가 자연스럽게 다루는 데이터 폭과 관련된 개념이다. 예를 들어 64-bit 아키텍처에서는 범용 레지스터나 포인터 폭이 64비트인 경우가 많지만, 그렇다고 모든 명령어가 항상 8바이트만 읽고 쓰는 것은 아니다. 바이트, 16-bit, 32-bit 연산처럼 더 작은 폭도 사용할 수 있다.

따라서 `64-bit CPU`라는 표현을 다음처럼 이해하면 안전하다.

- 주소와 레지스터가 다루는 대표 폭이 64비트인 아키텍처라는 뜻에 가깝다.
- 메모리가 64비트 단위로만 주소 지정된다는 뜻은 아니다.
- 모든 데이터 타입의 크기가 64비트라는 뜻도 아니다.

여러 바이트로 하나의 값을 저장하면 추가 질문이 생긴다. 예를 들어 32-bit 값은 4개의 연속된 바이트를 차지하며, 그 4바이트를 낮은 주소부터 어떤 순서로 놓을지는 바이트 순서(endianness)가 결정한다.

핵심은 **비트는 표현의 최소 단위, 바이트는 주소 지정과 저장에서 자주 사용하는 묶음, 워드는 아키텍처의 자연스러운 처리 폭과 관련된 단위**라는 점이다. 이 셋을 같은 의미로 사용하지 않아야 뒤에서 레지스터, 메모리, 명령어 폭을 정확히 구분할 수 있다.
