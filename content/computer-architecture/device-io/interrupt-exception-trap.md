---
kind: concept
contentKey: computer-architecture.core.device-io.interrupt-exception-trap
topicContentKey: computer-architecture.core.device-io
slug: interrupt-exception-trap
title: "Interrupt, Exception and Trap"
summary: "interrupt·exception의 발생 원인과 이들이 trap handler로 control을 넘기는 관계를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.riscv.org/reference/isa/v20240411/unpriv/intro.html"
    title: "RISC-V Unprivileged ISA: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "exception·interrupt의 원인과 trap handler로의 transfer 관계를 확인한다."
    displayOrder: 1
---
# Interrupt, Exception and Trap

interrupt는 timer·device completion처럼 현재 instruction과 무관하게 발생하는 외부 비동기 event다. exception은 현재 instruction과 관련된 비정상 조건이며, illegal instruction이나 page fault가 예다. trap은 이 둘 가운데 하나 때문에 CPU가 trap handler로 control을 넘기는 사건을 가리키므로 exception·interrupt와 나란히 놓인 세 번째 원인이 아니다. ECALL은 software가 요청한 trap이면서 현재 instruction과 관련된 exception으로 분류할 수 있다.

handler는 저장된 PC와 status를 보고 원인을 처리한 뒤 resume 또는 terminate를 선택한다. event를 단순 function call로 보면 user/kernel mode, register save, nested interrupt와 재진입 조건을 놓친다. 재개 가능한 exception인지, 외부 interrupt를 다음 instruction 경계에서 처리할지는 ISA와 privilege architecture의 규칙에 따라 확인해야 한다.

signal·system call·device completion을 분석할 때 event source와 handler latency를 분리한다. application retry가 hardware fault를 고치는 것이 아니며, kernel이 어떤 상태를 보존했는지 확인한다.
