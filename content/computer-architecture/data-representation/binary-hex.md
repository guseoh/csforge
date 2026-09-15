---
kind: concept
contentKey: computer-architecture.core.data-representation.binary-hex
topicContentKey: computer-architecture.core.data-representation
slug: binary-hex
title: "2진수와 16진수"
summary: "같은 bit pattern을 binary와 hexadecimal로 읽는 방법과 고정된 폭을 함께 보는 이유를 이해한다."
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
# 2진수와 16진수

Hardware의 register와 memory에 저장되는 값은 결국 bit pattern입니다. 2진수는 각 bit를 그대로 보여 주기 때문에 구조를 이해하기에는 좋지만, bit 수가 많아지면 사람이 읽고 비교하기 어렵습니다. 그래서 낮은 수준의 주소, machine code, mask를 볼 때는 같은 값을 16진수로 표현하는 경우가 많습니다.

16진수 한 자리는 정확히 4개의 bit와 대응합니다.

```text
binary       1010 0111
hex             A    7
             → 0xA7
```

이 변환은 값 자체를 바꾸는 연산이 아닙니다. 같은 bit pattern을 사람이 읽기 쉬운 표기로 바꾸는 것입니다. 그래서 `0xFF`와 `1111 1111`은 8-bit pattern을 서로 다른 방식으로 적은 것입니다.

다만 **표기와 해석은 구분**해야 합니다. `1111 1111`이라는 8개의 bit를 unsigned 정수로 해석하면 255이고, two's complement signed 정수로 해석하면 -1입니다. 16진수 표기만 보고 signed인지 unsigned인지 알 수는 없습니다.

폭도 중요합니다. 값만 보면 `0x03`과 `0x0003`은 같은 정수 3을 나타낼 수 있지만, 8-bit field와 16-bit field는 memory나 wire format에서 차지하는 크기가 다릅니다.

```text
8-bit   : 0000 0011        → 0x03
16-bit  : 0000 0000 0000 0011 → 0x0003
```

따라서 낮은 수준의 데이터를 읽을 때는 **bit pattern의 값뿐 아니라 몇 bit 폭인지, 어떤 signedness로 해석하는지**를 함께 확인해야 합니다. 16진수는 이 bit pattern을 짧고 명확하게 읽기 위한 표현 도구입니다.
