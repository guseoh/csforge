---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.pipeline-stages
topicContentKey: computer-architecture.core.pipeline-ilp
slug: pipeline-stages
title: "파이프라인 단계"
summary: "instruction 실행을 여러 단계로 나누어 겹쳐 처리할 때 처리량과 지연 시간이 어떻게 달라지는지 설명한다."
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
# 파이프라인 단계

CPU가 instruction 하나를 완전히 끝낸 뒤 다음 instruction을 시작한다면, 한 instruction이 ALU를 사용하는 동안 fetch 회로처럼 다른 부분은 놀 수 있다. 파이프라인은 instruction 실행 경로를 여러 단계(stage)로 나누고 **서로 다른 instruction이 서로 다른 단계를 동시에 사용하도록 겹쳐 실행**한다.

고전적인 RISC 설명에서는 다음 다섯 단계를 자주 사용한다.

```text
IF  →  ID  →  EX  →  MEM  →  WB
fetch decode execute memory write-back
```

이 다섯 단계는 이해를 위한 대표 모델이다. 실제 CPU가 반드시 같은 단계 수와 경계를 사용한다는 뜻은 아니다.

### 여러 instruction이 겹쳐 진행된다

파이프라인이 채워지는 모습을 단순화하면 다음과 같다.

```text
cycle     1    2    3    4    5    6    7
I1       IF   ID   EX  MEM   WB
I2            IF   ID   EX  MEM   WB
I3                 IF   ID   EX  MEM   WB
```

I1이 EX 단계에 있을 때 I2는 ID, I3는 IF 단계에 있을 수 있다. 따라서 첫 instruction의 결과가 나오는 시간 자체가 크게 줄어드는 것이 아니라, pipeline이 채워진 뒤 **instruction이 완료되는 간격**을 줄여 처리량을 높이는 것이 핵심이다.

### 지연 시간과 처리량을 구분한다

5-stage pipeline에서 instruction 하나는 여전히 여러 stage를 모두 지나야 한다. 그래서 `pipeline을 쓰면 instruction 하나가 5배 빨라진다`고 이해하면 안 된다.

파이프라인의 목표는 독립적인 작업을 겹쳐서 단위 시간당 더 많은 instruction을 완료하는 것이다. 이상적인 경우 pipeline이 채워진 뒤 매 cycle마다 instruction 하나가 완료될 수 있지만, 실제로는 dependency, hardware 충돌, branch, cache miss 때문에 빈 cycle이 생길 수 있다.

### 단계를 더 많이 나누는 것도 비용이 있다

긴 조합 논리를 더 짧은 stage로 나누면 clock period를 줄일 수 있다. 하지만 stage 사이의 pipeline register에도 비용이 있고, stage 간 작업량이 고르지 않으면 가장 느린 stage가 여전히 clock을 제한한다.

또한 여러 instruction이 동시에 진행되기 시작하면 앞 instruction의 결과를 뒤 instruction이 필요하거나 다음 PC가 아직 정해지지 않은 문제가 생긴다. 이런 제약을 **pipeline hazard**라고 하며 다음 Concept에서 구분한다.
