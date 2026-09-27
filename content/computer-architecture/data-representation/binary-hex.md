---
kind: concept
contentKey: computer-architecture.core.data-representation.binary-hex
topicContentKey: computer-architecture.core.data-representation
slug: binary-hex
title: "2진수와 16진수(Binary and Hexadecimal)"
summary: "같은 비트 패턴을 2진수와 16진수로 읽는 방법과 고정된 폭을 함께 보는 이유를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/number-systems/index.html"
    title: "Computer Architecture: Number Systems"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "고정 폭 정수와 수 표현의 기초를 확인한다."
    displayOrder: 1
---
# 2진수와 16진수(Binary and Hexadecimal)

하드웨어의 레지스터와 메모리에 저장되는 값은 결국 비트 패턴이다. 2진수는 각 비트를 그대로 보여 주기 때문에 구조를 이해하기에는 좋지만, 비트 수가 많아지면 사람이 읽고 비교하기 어렵다. 그래서 낮은 수준의 주소, 기계어, 마스크를 볼 때는 같은 값을 16진수로 표현하는 경우가 많다.

16진수 한 자리는 정확히 4개의 비트와 대응한다.

```text
binary       1010 0111
hex             A    7
             → 0xA7
```

이 변환은 값 자체를 바꾸는 연산이 아니다. 같은 비트 패턴을 사람이 읽기 쉬운 표기로 바꾸는 것이다. 그래서 `0xFF`와 `1111 1111`은 8-bit 패턴을 서로 다른 방식으로 적은 것이다.

다만 **표기와 해석은 구분**해야 한다. `1111 1111`이라는 8개의 비트를 부호 없는 정수로 해석하면 255이고, 2의 보수 부호 있는 정수로 해석하면 -1이다. 16진수 표기만 보고 부호 있는 값인지 부호 없는 값인지 알 수는 없다.

폭도 중요하다. 값만 보면 `0x03`과 `0x0003`은 같은 정수 3을 나타낼 수 있지만, 8-bit 필드와 16-bit 필드는 메모리나 전송 형식에서 차지하는 크기가 다르다.

```text
8-bit   : 0000 0011            → 0x03
16-bit  : 0000 0000 0000 0011 → 0x0003
```

따라서 낮은 수준의 데이터를 읽을 때는 **비트 패턴의 값뿐 아니라 몇 비트 폭인지, 부호를 어떤 규칙으로 해석하는지**를 함께 확인해야 한다. 16진수는 이 비트 패턴을 짧고 명확하게 읽기 위한 표현 도구다.
