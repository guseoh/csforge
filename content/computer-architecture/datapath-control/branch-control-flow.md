---
kind: concept
contentKey: computer-architecture.core.datapath-control.branch-control-flow
topicContentKey: computer-architecture.core.datapath-control
slug: branch-control-flow
title: "Branch and Control Flow"
summary: "branch가 PC와 instruction flow를 바꾸는 시점을 설명한다."
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
# Branch and Control Flow

### 다음 instruction을 바꾸는 결과

conditional branch는 compare 결과와 target offset으로 next PC를 선택하고, indirect jump나 call은 register 값에서 target을 얻는다. branch가 resolve되기 전 fetch가 순차 경로를 읽었다면 틀린 instruction을 버리고 target에서 다시 시작해야 한다.

branch 자체의 correctness는 target과 condition 계산에 있지만 성능은 prediction과 pipeline flush에 좌우된다. data-dependent branch를 무조건 제거하는 것이 항상 좋지 않고, branchless code가 추가 연산과 memory access를 만들 수도 있다.

### Backend 연결

hot loop에서 branch miss를 의심할 때 실제 input distribution과 misprediction counter를 함께 확인한다. 기능 변경과 micro-optimization을 섞지 말고, branch가 보호하는 bounds check나 권한 검사를 성능 때문에 제거하지 않는다.
