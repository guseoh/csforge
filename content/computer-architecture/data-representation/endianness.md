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
  - url: "https://www.rfc-editor.org/rfc/rfc1700"
    title: "RFC 1700: Assigned Numbers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "network byte order와 multi-byte field를 확인한다."
    displayOrder: 1
---
# Endianness

### 값과 byte 배열의 순서

0x12345678을 네 byte에 저장할 때 little-endian은 낮은 주소에 `78`을, big-endian은 `12`를 둔다. 두 방식 모두 register에서 읽은 수학적 값은 같을 수 있지만 raw memory와 wire bytes는 달라진다. network protocol이 network byte order를 정하면 host는 송수신 경계에서 변환해야 한다.

한 쪽의 정수 cast를 다른 쪽의 byte array로 오해하면 header length와 identifier가 전혀 다른 값이 된다. 문자열 byte order와 정수 byte order도 별개이므로 Unicode encoding 문제를 endianness 문제로 뭉뚱그리면 안 된다.

### Backend 연결

binary request를 만들 때 schema가 정한 byte order를 명시하고 golden byte fixture로 검증한다. `ByteBuffer.order` 같은 API의 기본값에 의존하지 말고 다른 CPU architecture나 외부 partner와 교환하는 테스트를 둔다.

