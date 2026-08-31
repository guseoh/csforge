---
kind: concept
contentKey: computer-architecture.core.isa-execution.fetch-decode-execute
topicContentKey: computer-architecture.core.isa-execution
slug: fetch-decode-execute
title: "Fetch-Decode-Execute"
summary: "PC를 따라 instruction이 fetch·decode·execute되는 순서를 설명한다."
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
# Fetch-Decode-Execute

### PC가 다음 일을 가리킨다

CPU는 PC가 가리키는 memory에서 instruction을 fetch하고, PC를 다음 instruction 위치로 갱신한 뒤 opcode와 operand를 decode한다. execute 단계에서 ALU 계산·memory 접근·branch가 일어나고 결과가 register나 memory에 writeback된다. branch나 exception은 기본 PC 증가를 취소하고 다른 target을 선택한다.

파이프라인이 없으면 이 순서가 한 instruction의 경계처럼 보이지만 실제 구현에서는 여러 instruction이 서로 다른 stage에 동시에 있을 수 있다. fetch 성공은 execute 성공을 뜻하지 않으며 page fault, protection fault, invalid opcode가 중간에 흐름을 바꾼다.

### Backend 연결

segmentation fault나 illegal instruction을 조사할 때 fault PC와 직전 register 상태를 함께 본다. application stack trace는 이 hardware state를 추상화한 결과이므로 최종 원인을 판단할 때 OS signal과 memory mapping도 함께 확인한다.
