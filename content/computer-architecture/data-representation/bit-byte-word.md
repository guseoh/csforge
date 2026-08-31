---
kind: concept
contentKey: computer-architecture.core.data-representation.bit-byte-word
topicContentKey: computer-architecture.core.data-representation
slug: bit-byte-word
title: "Bit, Byte and Word"
summary: "bit·byte·word의 폭과 주소·레지스터 관계를 설명한다."
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
# Bit, Byte and Word

### 기계가 다루는 최소 단위

bit는 0 또는 1 하나이고 byte는 보통 8 bit를 묶은 주소 지정 단위다. word는 ISA가 한 번에 다루기 편하도록 정한 폭이며, 64-bit word라고 해서 모든 memory access가 항상 8 byte라는 뜻은 아니다. CPU register 폭·pointer 표현·정수 연산의 기본 폭과 관계가 있지만 서로 같은 개념은 아니다.

주소가 byte 단위라면 주소 `p`와 `p+1`은 인접한 byte를 가리킨다. 32-bit 값을 네 byte에 나눠 저장할 때 어느 byte가 먼저 오는지는 endianness가 결정한다. 따라서 word 폭만 보고 memory layout을 추측하면 안 되고 ISA와 ABI의 계약을 함께 봐야 한다.

### Backend 연결

binary protocol을 읽거나 buffer offset을 계산할 때 field 폭을 명시해야 한다. Java의 `ByteBuffer`나 직렬화 코드는 논리 타입의 크기와 wire format의 byte 수를 분리하고, overflow와 alignment를 테스트해야 한다.

