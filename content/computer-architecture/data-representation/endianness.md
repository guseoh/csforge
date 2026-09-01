---
kind: concept
contentKey: computer-architecture.core.data-representation.endianness
topicContentKey: computer-architecture.core.data-representation
slug: endianness
title: "Endianness"
summary: "다중 byte 값의 메모리 순서와 직렬화 경계를 설명한다."
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
# Endianness

### 값과 byte 배열의 순서

0x12345678을 네 byte에 저장할 때 little-endian은 낮은 주소부터 `78 56 34 12`, big-endian은 `12 34 56 78` 순서로 둔다. 두 방식은 같은 32-bit numeric value를 서로 다른 byte 배열로 표현한다. CPU register에서 정수 연산을 수행할 때 매번 숫자 자체가 뒤집히는 것이 아니라, 그 값을 여러 byte로 memory에 저장하거나 다시 조립할 때 byte ordering이 중요해진다.

protocol이나 file format이 byte order를 정했다면 host의 native order와 다르더라도 encode/decode 경계에서 그 format을 따라야 한다. Internet protocol 문서에서 흔히 말하는 network byte order는 multi-byte integer field를 big-endian 순서로 표현하는 관례다. host가 little-endian인지와 wire contract가 big-endian인지 여부는 별도다.

### Byte order와 bit order, 문자 encoding은 다른 문제다

endianness는 일반적으로 multi-byte value 안에서 byte들의 순서를 다룬다. 한 byte 내부 bit numbering, bit-field layout, UTF-8/UTF-16 같은 character encoding 문제를 모두 endianness라고 부르면 안 된다. UTF-16처럼 encoding 자체가 byte-order variant를 정의하는 경우도 있지만 그때도 character encoding contract와 machine integer layout을 구분해야 한다.

### Backend 연결

binary request나 file header를 처리할 때 field width와 byte order를 schema에 명시한다. Java `ByteBuffer`는 새 buffer의 초기 order가 BIG_ENDIAN이지만 protocol code에서는 의도를 드러내기 위해 필요한 order를 명시하고 golden byte fixture로 encode/decode 결과를 확인하는 편이 안전하다.

서로 다른 architecture 간 통신을 테스트할 때 native memory dump를 그대로 wire format이라고 가정하지 않는다. integer value를 protocol-defined byte sequence로 변환하는 serialization 경계를 명확히 둔다.
