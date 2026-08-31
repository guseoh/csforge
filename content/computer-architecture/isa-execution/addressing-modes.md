---
kind: concept
contentKey: computer-architecture.core.isa-execution.addressing-modes
topicContentKey: computer-architecture.core.isa-execution
slug: addressing-modes
title: "Addressing Modes"
summary: "immediate·register·base plus offset·indirect 주소 계산을 비교한다."
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
# Addressing Modes

### operand를 찾는 여러 경로

immediate는 instruction 안의 상수를 바로 쓰고 register mode는 register 값을 operand로 사용한다. base plus offset은 배열·struct field처럼 base register와 작은 displacement를 더해 주소를 만들며, indirect는 한 번 읽은 값이 다시 주소가 되는 식으로 pointer를 따른다. 각 mode는 encoding 폭과 memory access 수가 다르다.

같은 source 표현도 compiler는 target ISA에 맞춰 다른 mode 조합으로 바꾼다. offset 범위를 넘으면 추가 instruction이 필요하고, 잘못된 alignment나 권한 없는 주소 계산은 execute가 아니라 fault를 만든다.

### Backend 연결

binary parser나 FFI에서 pointer arithmetic을 직접 다룰 때 field alignment와 integer width를 고정한다. 주소를 계산했다는 사실은 해당 memory가 mapped·readable하다는 보장이 아니므로 검증과 fault 처리를 분리한다.
