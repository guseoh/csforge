---
kind: concept
contentKey: computer-architecture.core.data-representation.endianness
topicContentKey: computer-architecture.core.data-representation
slug: endianness
title: "Endianness와 Byte 순서"
summary: "여러 byte로 이루어진 값을 memory나 binary format에 배치할 때 big-endian과 little-endian이 byte 순서를 어떻게 다르게 정하는지 이해한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293.html"
    title: "RFC 9293: Transmission Control Protocol (TCP)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "현재 TCP 표준에서 multi-byte network fields가 network byte order로 표현되는 사례를 확인한다."
    displayOrder: 1
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/ByteOrder.html"
    title: "ByteOrder (Java SE 25 API)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "BIG_ENDIAN과 LITTLE_ENDIAN의 byte ordering 정의를 확인한다."
    displayOrder: 2
---
# Endianness와 Byte 순서

한 byte 안에 들어가는 값은 순서를 고민할 필요가 없지만, 16-bit·32-bit처럼 여러 byte로 이루어진 값을 memory에 저장하면 **어느 byte를 낮은 주소에 놓을 것인지**를 정해야 합니다. 이 규칙이 endianness입니다.

32-bit 값 `0x12345678`을 주소 1000부터 저장한다고 해 보겠습니다.

```text
Big-endian
address 1000  1001  1002  1003
value     12    34    56    78

Little-endian
address 1000  1001  1002  1003
value     78    56    34    12
```

두 경우가 표현하는 numeric value는 같습니다. 차이는 그 값을 여러 byte로 분해해 memory에 놓는 순서입니다. CPU가 register 안의 정수를 연산할 때 숫자가 매번 앞뒤로 뒤집히는 것이 아닙니다.

이 구분은 binary protocol이나 file format에서 중요합니다. Host machine의 native byte order와 외부 format이 요구하는 byte order가 다를 수 있으므로, encode/decode 경계에서는 format의 규칙을 따라야 합니다. Internet protocol에서 흔히 말하는 network byte order는 multi-byte integer를 big-endian 순서로 표현하는 관례입니다.

Endianness와 다른 개념도 구분해야 합니다. Endianness는 보통 **multi-byte value 안에서 byte의 순서**를 말합니다. 한 byte 내부의 bit numbering이나 UTF-8 같은 문자 encoding까지 같은 문제로 보면 안 됩니다. UTF-16처럼 encoding 자체가 byte-order variant를 가질 수는 있지만, 그것은 character encoding 계약 안에서 다뤄야 합니다.

Java의 `ByteBuffer`처럼 byte order를 선택할 수 있는 API를 사용할 때도 host native order를 그대로 추측하기보다 protocol이나 file schema가 요구하는 order를 명시하는 편이 안전합니다. 핵심은 **memory의 native representation과 외부 binary representation 사이에 명확한 serialization 경계가 있다는 것**입니다.
