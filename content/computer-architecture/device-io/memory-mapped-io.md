---
kind: concept
contentKey: computer-architecture.core.device-io.memory-mapped-io
topicContentKey: computer-architecture.core.device-io
slug: memory-mapped-io
title: "Memory-Mapped I/O"
summary: "device register를 주소 공간에 매핑하는 접근 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Memory-Mapped I/O

MMIO는 device control/status register에 memory address처럼 load/store하는 방식이다. 같은 명령어 모양이어도 이 주소는 cacheable RAM이 아니라 side effect를 가진 장치일 수 있어 read가 값을 소비하거나 write가 동작을 시작한다. 접근 폭과 ordering은 device specification이 정한다.

cache가 MMIO를 보통 memory처럼 보관하면 stale status나 반복 side effect가 생기므로 mapping attribute와 barrier가 필요하다. 주소가 process에 노출되려면 privilege와 mapping permission도 맞아야 한다.

### Backend 연결

native driver wrapper에서는 register access를 일반 field read/write로 추상화하지 말고 side effect와 error를 명시한다. user space mmap은 lifetime과 권한이 kernel mapping과 다르다는 점을 확인한다.
