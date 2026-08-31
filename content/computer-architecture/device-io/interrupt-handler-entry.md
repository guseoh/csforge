---
kind: concept
contentKey: computer-architecture.core.device-io.interrupt-handler-entry
topicContentKey: computer-architecture.core.device-io
slug: interrupt-handler-entry
title: "Interrupt Handler Entry"
summary: "vector와 저장된 context를 통해 handler로 진입하는 경로를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Interrupt Handler Entry

CPU는 event를 분류한 vector를 사용해 handler entry로 이동하고, 재개에 필요한 PC·status·일부 register를 privilege stack이나 정해진 저장 영역에 둔다. interrupt controller는 pending/enable/priority를 관리하고 CPU가 승인한 event를 전달한다. handler는 device status를 확인해 원인을 clear해야 같은 interrupt가 계속 반복되지 않는다.

저장 context가 부족하거나 handler가 오래 block하면 다른 event가 지연되고 nested interrupt의 순서가 복잡해진다. handler entry 성공은 device I/O 완료나 application notification까지 보장하지 않는다.

### Backend 연결

높은 interrupt rate를 polling이나 thread 문제로 단정하지 말고 controller pending과 handler work를 나눈다. driver가 acknowledgment를 빠뜨리면 CPU 사용률과 latency가 함께 치솟을 수 있다.
