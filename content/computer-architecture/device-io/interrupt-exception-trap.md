---
kind: concept
contentKey: computer-architecture.core.device-io.interrupt-exception-trap
topicContentKey: computer-architecture.core.device-io
slug: interrupt-exception-trap
title: "Interrupt, Exception and Trap"
summary: "비동기 interrupt와 동기 exception/trap의 진입 원인을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Interrupt, Exception and Trap

interrupt는 device timer처럼 현재 instruction과 무관하게 들어오는 비동기 event다. exception은 잘못된 instruction·page fault처럼 현재 instruction 실행에서 동기적으로 생기며, trap은 의도적인 system call 같은 software 요청을 가리키는 문맥으로 쓰인다. CPU는 모두 privilege entry와 return state를 저장하지만 원인과 재개 PC가 다르다.

handler는 저장된 PC와 status를 보고 원인을 처리한 뒤 resume 또는 terminate를 선택한다. event를 단순 function call로 보면 user/kernel mode, register save, nested interrupt와 재진입 조건을 놓친다.

### Backend 연결

signal·system call·device completion을 분석할 때 event source와 handler latency를 분리한다. application retry가 hardware fault를 고치는 것이 아니며, kernel이 어떤 상태를 보존했는지 확인한다.
