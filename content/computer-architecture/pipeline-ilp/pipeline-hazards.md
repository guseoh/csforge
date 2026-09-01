---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.pipeline-hazards
topicContentKey: computer-architecture.core.pipeline-ilp
slug: pipeline-hazards
title: "Pipeline Hazards"
summary: "pipeline에서 다음 instruction을 예정대로 진행할 수 없게 만드는 structural·data·control hazard와 dependency 종류를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Pipeline Hazards

### Pipeline이 겹쳐 실행된다고 해서 모든 instruction이 독립적인 것은 아니다

pipeline은 서로 다른 instruction의 stage를 겹치지만, 같은 hardware resource를 동시에 요구하거나 앞 instruction의 결과가 뒤 instruction에 필요하거나 다음 PC가 아직 결정되지 않은 상황에서는 예정된 cycle에 다음 stage로 진행할 수 없다. 이런 제약을 pipeline hazard라고 한다. 중요한 점은 hazard가 단순한 성능 문제가 아니라, 잘못 처리하면 program이 기대한 값을 보존하지 못하는 correctness 문제라는 것이다.

### Structural hazard: 같은 resource를 동시에 쓸 수 없을 때

structural hazard는 같은 cycle에 둘 이상의 stage가 하나뿐인 hardware resource를 동시에 요구할 때 발생한다. 예를 들어 instruction fetch와 data access가 같은 단일 memory port를 동시에 사용해야 한다면 둘 중 하나는 기다려야 한다. instruction/data cache를 분리하거나 port를 늘리는 식으로 resource를 추가할 수 있지만 area·전력·설계 복잡도가 증가한다. 따라서 hardware를 무조건 복제하는 대신 발생 빈도와 비용을 함께 본다.

### Data hazard: 값의 생산과 소비 순서가 맞지 않을 때

가장 기본적인 data hazard는 RAW(Read After Write)다. 앞 instruction이 register 값을 쓰기 전에 뒤 instruction이 그 값을 읽으려 하면 오래된 값을 사용할 수 있다. 고전적인 단일-issue in-order 5-stage pipeline에서는 register read/write 순서 때문에 주로 RAW가 문제가 된다.

WAR(Write After Read)와 WAW(Write After Write)는 이름 dependency다. program order대로 단순히 issue하고 완료하는 pipeline에서는 보통 나타나지 않지만, 여러 instruction을 동시에 issue하거나 out-of-order로 실행하면 뒤 instruction의 write가 앞 instruction의 read/write보다 먼저 visible해질 수 있다. modern out-of-order CPU는 register renaming 등으로 이런 false dependency를 제거하면서 실제 RAW dependency는 보존한다. RAW/WAR/WAW를 모두 같은 종류의 `앞 결과를 기다리는 문제`로 이해하면 out-of-order 실행을 설명할 때 경계가 흐려진다.

### Control hazard: 다음 PC를 아직 모를 때

branch나 jump를 만나면 CPU는 다음에 fetch해야 할 PC가 branch 결과에 따라 달라진다. 결과가 확정될 때까지 fetch를 멈추면 pipeline이 비므로, 실제 CPU는 branch prediction으로 방향과 target을 추측해 speculative execution을 이어갈 수 있다. 예측이 틀리면 잘못된 경로의 instruction을 squash하고 올바른 경로에서 pipeline을 다시 채워야 한다.

### Hazard를 해결하는 방법은 원인마다 다르다

structural hazard는 resource 구성이나 scheduling으로, RAW data hazard는 forwarding 또는 stall로, control hazard는 prediction과 flush로 대응한다. 해결책이 서로 다른 이유는 `무엇이 아직 준비되지 않았는가`가 다르기 때문이다. cache miss처럼 긴 memory latency가 data dependency와 겹치면 단순한 한-cycle stall보다 훨씬 큰 지연이 생길 수도 있다.

### Backend 성능과 연결해서 볼 때

source code의 dependency만 보고 실제 pipeline 비용을 단정할 수는 없다. compiler가 instruction을 재배치할 수 있고 target CPU의 execution width, forwarding path, branch predictor, cache hierarchy도 다르다. 성능 문제를 분석할 때는 `pipeline이 느리다`고 뭉뚱그리지 말고 branch miss, stalled cycles, cache miss, IPC 같은 hardware counter와 workload를 함께 봐야 한다. 반대로 Java Memory Model이나 thread 간 happens-before 규칙은 CPU pipeline hazard와 다른 층위의 contract이므로 서로 대체해서 설명하면 안 된다.
