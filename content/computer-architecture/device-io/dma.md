---
kind: concept
contentKey: computer-architecture.core.device-io.dma
topicContentKey: computer-architecture.core.device-io
slug: dma
title: "DMA"
summary: "DMA controller가 CPU 대신 memory 전송을 수행하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# DMA

CPU가 buffer 주소·길이·방향을 controller에 설정하면 DMA가 device와 memory 사이에서 block을 옮기고 완료나 오류 interrupt를 보낸다. CPU는 byte마다 개입하지 않아 bulk transfer를 다른 계산과 겹칠 수 있지만, cache coherence·IOMMU·buffer ownership을 맞춰야 한다.

CPU가 buffer를 바꾼 직후 DMA가 읽거나 DMA가 쓴 buffer를 CPU cache가 읽으면 stale copy가 될 수 있다. flush/invalidate 또는 coherent mapping은 platform 계약이며 전송 완료 interrupt 전에는 buffer를 재사용하면 안 된다.

### Backend 연결

네트워크·storage throughput을 평가할 때 CPU 사용률이 낮다고 전송이 free인 것은 아니다. buffer lifetime, completion queue, backpressure와 error recovery를 함께 설계한다.
