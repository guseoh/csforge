---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.forwarding-and-stall
topicContentKey: computer-architecture.core.pipeline-ilp
slug: forwarding-and-stall
title: "Forwarding and Stall"
summary: "RAW dependency에서 결과가 준비되는 시점에 따라 forwarding으로 우회할지 pipeline을 stall할지 판단한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Forwarding and Stall

### Register에 기록되기 전에도 값은 이미 만들어졌을 수 있다

고전적인 pipeline을 생각해 보자. 첫 instruction이 `add r1, r2, r3`으로 ALU 결과를 만들고 바로 다음 instruction이 `sub r4, r1, r5`처럼 `r1`을 사용한다면, 두 번째 instruction이 register file에서 operand를 읽는 시점에는 첫 instruction의 write-back이 아직 끝나지 않았을 수 있다. 그대로 읽으면 이전 `r1`을 사용하므로 RAW hazard가 된다.

하지만 첫 instruction의 ALU 결과 자체는 execute stage가 끝날 때 이미 존재한다. forwarding 또는 bypassing은 이 값을 register file에 기록했다가 다시 읽는 정상 경로를 기다리지 않고, pipeline register나 execution unit의 결과 경로에서 다음 instruction의 ALU 입력으로 직접 전달한다. 즉 dependency를 없애는 것이 아니라 `값이 실제로 준비된 위치`에서 consumer에게 더 일찍 전달하는 것이다.

### Forwarding도 미래의 값을 전달할 수는 없다

대표적인 예가 load-use hazard다. `load r1, 0(r2)` 다음 instruction이 곧바로 `r1`을 사용하면, load가 가져올 값은 address 계산이 끝난 execute stage가 아니라 memory access가 완료된 뒤에야 준비된다. classic 5-stage pipeline에서는 바로 다음 consumer의 execute 시점보다 값이 늦게 도착하므로 forwarding path가 있어도 시간을 거슬러 전달할 수 없다. 이때 hazard detection logic은 consumer의 진행을 잠시 멈추고 bubble을 삽입한 뒤, 값이 준비된 다음 forwarding하거나 register에서 읽게 한다.

정확히 몇 cycle을 stall하는지는 pipeline 구조, cache hit/miss, load latency에 따라 달라진다. `load 다음에는 항상 한 cycle stall`은 특정 단순 pipeline의 설명 모델이지 모든 CPU의 고정 규칙이 아니다. out-of-order CPU는 독립 instruction을 먼저 실행해 일부 지연을 숨길 수 있지만 load 결과에 실제로 의존하는 instruction은 결국 그 값이 준비될 때까지 기다려야 한다.

### Stall은 correctness를 지키지만 공짜가 아니다

stall 동안 dependency가 걸린 instruction은 다음 stage로 진행하지 못하고 pipeline 일부에 bubble이 생긴다. 그러면 완료되는 useful instruction 수가 줄어 CPI가 증가할 수 있다. 반대로 hazard를 무시하고 stall을 생략하면 오래된 operand로 계산할 수 있으므로 throughput을 위해 correctness를 희생할 수는 없다. CPU 설계는 forwarding path, scheduling, out-of-order execution 같은 방법으로 `기다려야 하는 실제 dependency`와 `우회할 수 있는 지연`을 구분한다.

### Backend 코드와 연결해서 볼 때

컴파일러나 JIT가 독립적인 계산을 배치하고 CPU가 out-of-order로 실행하면 source code 한 줄씩의 순서와 실제 execution timing은 다를 수 있다. 그렇다고 application programmer가 임의로 dependency를 무시해도 된다는 뜻은 아니다. single-thread program semantics는 compiler와 CPU가 보존해야 하고, 여러 thread 사이의 visibility와 ordering은 Java Memory Model 같은 별도 contract가 정한다. CPU forwarding은 thread 간 data race를 해결하는 mechanism이 아니다.

성능 분석에서는 dependent load chain, cache miss, stalled cycle이 실제 병목인지 profile과 hardware counter로 확인한다. 단순히 instruction 수를 줄였다는 사실만으로 forwarding이나 stall 비용이 줄었다고 단정하지 않는다.
