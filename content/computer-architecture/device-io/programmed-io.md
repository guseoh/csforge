---
kind: concept
contentKey: computer-architecture.core.device-io.programmed-io
topicContentKey: computer-architecture.core.device-io
slug: programmed-io
title: "Programmed I/O"
summary: "CPU가 device register를 polling하며 직접 전송하는 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Programmed I/O

programmed I/O에서는 CPU가 device register를 읽어 ready 여부를 확인하고 data register를 load/store한다. polling은 작은 전송과 단순 device에 이해하기 쉽지만, device가 느릴 때 CPU cycle을 기다림에 소비하고 다른 작업을 진행하지 못한다.

interrupt-driven I/O는 ready event가 올 때까지 CPU를 놓아주지만 entry·context 저장 비용이 있다. 어느 방식이 나은지는 event 빈도, transfer size, power budget과 device latency에 따라 달라진다.

### Backend 연결

busy loop로 external device를 기다리는 backend는 CPU saturation과 timeout을 함께 본다. polling을 제거할 때도 memory-mapped register의 volatile/ordering과 acknowledgement 순서를 보존한다.
