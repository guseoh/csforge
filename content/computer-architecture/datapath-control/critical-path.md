---
kind: concept
contentKey: computer-architecture.core.datapath-control.critical-path
topicContentKey: computer-architecture.core.datapath-control
slug: critical-path
title: "Critical Path"
summary: "한 cycle의 최소 길이를 제한하는 조합 경로를 설명한다."
level: 2
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
# Critical Path

### 다음 register까지 가장 느린 경로

동기식 datapath에서 한 cycle 안에 조합 논리와 wire가 결과를 만들고 다음 register가 이를 잡는다. 여러 경로 중 가장 긴 지연이 clock period의 하한이 되며, 이것이 critical path다. 짧은 경로가 많아도 긴 한 경로가 남아 있으면 frequency를 더 올릴 수 없다.

pipeline register를 넣으면 긴 경로를 여러 stage로 나눌 수 있지만 latency와 branch recovery 비용, register overhead가 늘어난다. logic 최적화도 memory access나 wire delay가 지배하면 기대만큼 cycle을 줄이지 못한다.

### Backend 연결

CPU 세대 비교에서 clock 숫자만 보지 말고 pipeline depth, CPI와 memory stall을 분리한다. 특정 service의 느린 요청을 critical path 하나로 환원하지 말고 hardware counter와 I/O trace를 함께 본다.
