---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.pipeline-stages
topicContentKey: computer-architecture.core.pipeline-ilp
slug: pipeline-stages
title: "Pipeline Stages"
summary: "instruction 실행을 여러 stage로 나누어 겹쳐 처리할 때 throughput과 latency가 어떻게 달라지는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Pipeline Stages

### 한 instruction을 끝낸 뒤 다음 instruction을 시작하면 생기는 한계

CPU가 instruction 하나의 fetch, decode, execute, memory access, register write-back을 모두 끝낸 뒤에야 다음 instruction을 시작한다면 각 instruction이 서로 다른 hardware를 사용하는 시간에도 다른 instruction은 기다리게 된다. pipeline은 이 긴 실행 경로를 여러 stage로 나누고 stage 사이에 pipeline register를 두어, 서로 다른 instruction이 서로 다른 stage를 동시에 사용하게 만든다. 흔히 설명에 사용하는 `IF → ID → EX → MEM → WB`의 5단계는 고전적인 RISC pipeline을 이해하기 위한 모델이지 모든 CPU가 반드시 이 다섯 단계로 구현된다는 뜻은 아니다.

### Pipeline이 줄이는 것은 주로 처리 간격이다

pipeline이 채워진 뒤에는 이상적인 경우 매 cycle마다 instruction 하나가 완료될 수 있으므로 throughput이 높아진다. 그렇다고 instruction 하나의 latency가 반드시 짧아지는 것은 아니다. 한 instruction은 여전히 여러 stage를 통과해야 하고, stage 사이 register의 setup time과 clock skew 같은 추가 비용도 생긴다. 따라서 `pipeline을 적용하면 모든 instruction이 빨라진다`보다 `여러 instruction의 실행을 겹쳐 단위 시간당 완료 수를 늘린다`고 이해하는 편이 정확하다.

예를 들어 5-stage pipeline이 hazard 없이 동작하고 각 stage가 한 cycle을 사용한다면 첫 instruction은 결과가 나오기까지 여러 cycle이 필요하지만, pipeline이 충분히 채워진 뒤에는 다음 instruction들이 cycle마다 차례로 완료될 수 있다. 실제 CPI는 structural/data/control hazard, cache miss, branch recovery 같은 이유로 이 이상적인 값보다 커진다.

### Stage를 더 잘게 나누면 항상 좋은 것은 아니다

clock period는 대체로 가장 느린 stage와 pipeline register overhead의 영향을 받는다. 긴 조합 논리를 더 작은 stage로 나누면 더 높은 clock frequency를 노릴 수 있지만 stage가 깊어질수록 register 비용이 늘고, dependency forwarding 경로와 hazard 제어가 복잡해지며, branch prediction이 틀렸을 때 버려야 하는 speculative work도 많아질 수 있다. stage 간 작업량이 불균형하면 짧은 stage가 있어도 가장 느린 stage가 clock을 제한한다.

### Backend 성능과 연결해서 볼 때

CPU pipeline을 backend request 처리 단계와 그대로 같은 개념으로 보면 안 된다. CPU pipeline은 ISA semantics를 보존하도록 hardware가 dependency와 hazard를 처리하는 구조다. backend 성능을 해석할 때는 pipeline 덕분에 instruction throughput이 높아질 수 있다는 점과, 한 request의 end-to-end latency가 lock, queueing, DB I/O, network I/O에 지배될 수 있다는 점을 분리해야 한다. CPU 최적화가 필요한지는 IPC/CPI, branch miss, cache miss 같은 지표와 실제 request latency를 함께 보고 판단한다.
