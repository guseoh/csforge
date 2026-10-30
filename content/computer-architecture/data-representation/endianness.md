---
kind: concept
contentKey: computer-architecture.core.data-representation.endianness
topicContentKey: computer-architecture.core.data-representation
slug: endianness
title: "바이트 순서(Endianness)"
summary: "여러 바이트로 이루어진 값을 메모리나 이진 형식에 배치할 때 big-endian과 little-endian이 바이트 순서를 어떻게 다르게 정하는지 이해한다."
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
# 바이트 순서(Endianness)

한 바이트 안에 들어가는 값은 순서를 고민할 필요가 없지만, 16-bit·32-bit처럼 여러 바이트로 이루어진 값을 메모리에 저장하면 **어느 바이트를 낮은 주소에 놓을 것인지**를 정해야 한다. 이 규칙이 엔디언(endianness)이다.

32-bit 값 `0x12345678`을 주소 1000부터 저장한다고 해 보자.

```text
Big-endian
address 1000  1001  1002  1003
value     12    34    56    78

Little-endian
address 1000  1001  1002  1003
value     78    56    34    12
```

두 경우가 표현하는 수치 값은 같다. 차이는 그 값을 여러 바이트로 분해해 메모리에 놓는 순서다. CPU가 레지스터 안의 정수를 연산할 때 숫자가 매번 앞뒤로 뒤집히는 것이 아니다.

이 구분은 이진 프로토콜이나 파일 형식에서 중요하다. 호스트의 기본 바이트 순서와 외부 형식이 요구하는 바이트 순서가 다를 수 있으므로, 인코딩·디코딩 경계에서는 형식의 규칙을 따라야 한다. 인터넷 프로토콜에서 흔히 말하는 네트워크 바이트 순서는 여러 바이트 정수를 big-endian 순서로 표현하는 관례다.

엔디언과 다른 개념도 구분해야 한다. 엔디언은 보통 **여러 바이트 값 안에서 바이트의 순서**를 말한다. 한 바이트 내부의 비트 번호나 UTF-8 같은 문자 인코딩까지 같은 문제로 보면 안 된다. UTF-16처럼 인코딩 자체가 바이트 순서 변형을 가질 수는 있지만, 그것은 문자 인코딩 계약 안에서 다뤄야 한다.

Java의 `ByteBuffer`처럼 바이트 순서를 선택할 수 있는 API를 사용할 때도 호스트의 기본 순서를 그대로 추측하기보다 프로토콜이나 파일 스키마가 요구하는 순서를 명시하는 편이 안전하다. 핵심은 **메모리의 기본 표현과 외부 이진 표현 사이에 명확한 직렬화 경계가 있다는 것**이다.
