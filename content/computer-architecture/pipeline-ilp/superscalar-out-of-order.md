---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.superscalar-out-of-order
topicContentKey: computer-architecture.core.pipeline-ilp
slug: superscalar-out-of-order
title: "Superscalar and Out-of-Order"
summary: "여러 instruction을 동시에 issue하고 준비된 instruction을 먼저 실행하면서도 dependency와 precise architectural state를 보존하는 원리를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Superscalar and Out-of-Order

### Pipeline 하나만으로는 독립적인 instruction을 충분히 활용하지 못할 수 있다

기본 pipeline은 여러 instruction의 stage를 겹치지만 단순한 single-issue 구조라면 한 cycle에 새 instruction 하나만 issue한다. superscalar CPU는 여러 execution unit과 더 넓은 front-end를 이용해 한 cycle에 둘 이상의 instruction을 issue·execute할 수 있도록 설계한다. 다만 instruction 사이에 true dependency가 있다면 execution unit 수가 많아도 dependent instruction을 동시에 실행할 수 없다. 성능의 핵심은 hardware가 instruction-level parallelism, 즉 서로 독립적으로 진행할 수 있는 work를 얼마나 찾아 활용하느냐에 있다.

### Out-of-order execution은 program order를 버리는 것이 아니다

program에 `A → B → C` 순서로 instruction이 있고 B가 cache miss 때문에 오래 기다리지만 C가 B와 독립적이라고 하자. in-order execution은 B가 막혀 있으면 뒤의 C도 진행하지 못할 수 있다. out-of-order engine은 operand와 execution resource가 준비된 C를 먼저 실행해 B의 대기 시간을 일부 숨긴다. 이때 `먼저 실행한다`와 `program이 관찰하는 결과 순서를 마음대로 바꾼다`는 전혀 다른 말이다.

CPU는 dependency tracking을 통해 RAW true dependency를 지켜야 한다. WAR와 WAW처럼 register 이름을 재사용해서 생기는 false dependency는 physical register를 새로 할당하는 register renaming으로 제거할 수 있다. 덕분에 서로 실제 data dependency가 없는 instruction을 이름 충돌 때문에 불필요하게 기다리지 않아도 된다.

### 실행 순서와 retirement 순서를 분리한다

modern out-of-order CPU는 instruction을 speculative하게 서로 다른 순서로 실행할 수 있지만, architectural register와 exception 같은 program-visible state는 정의된 순서와 semantics를 보존해야 한다. reorder buffer 같은 구조는 완료된 instruction의 결과를 추적하고, 앞선 instruction이 정상적으로 완료되었는지 확인하면서 program order에 맞춰 retire/commit하게 한다. 앞선 instruction에서 exception이 발생하면 뒤에서 speculative하게 계산된 결과가 architectural state에 먼저 남지 않도록 해야 precise exception을 제공할 수 있다.

memory access는 register dependency보다 더 복잡하다. 서로 다른 load/store가 같은 address를 가리키는지 일찍 알기 어렵고, cache miss도 긴 지연을 만든다. 실제 CPU는 load/store queue와 memory dependency prediction 같은 mechanism을 사용하지만, alias가 확인되거나 ordering 제약이 있으면 기다려야 한다. out-of-order execution이 모든 memory latency를 없애 주는 것은 아니다.

### 넓고 큰 CPU에는 비용도 따른다

동시에 추적하는 instruction이 많아질수록 rename table, scheduler, issue queue, reorder buffer와 wakeup/select logic이 커진다. 더 많은 execution unit도 area와 전력을 사용한다. branch misprediction이 발생하면 넓은 speculative window에서 이미 수행한 work를 버릴 수 있다. 따라서 superscalar width나 out-of-order window를 키우면 항상 비례해서 빨라지는 것이 아니라 workload의 ILP, memory behavior, branch predictability와 hardware 비용 사이의 trade-off가 있다.

### Backend 성능과 Java의 ordering을 혼동하지 않는다

backend hot loop에 독립적인 계산이 많다면 compiler/JIT와 CPU가 ILP를 활용할 여지가 있다. 반대로 pointer chasing처럼 다음 load address가 앞 load 결과에 의존하거나 cache miss chain이 길면 execution unit이 남아도 병렬로 진행할 work가 부족할 수 있다. 이런 경우에는 source code 줄 수보다 dependency chain과 memory behavior가 중요하다.

또한 CPU가 instruction을 out-of-order로 실행한다는 사실은 Java thread가 아무 synchronization 없이 값을 공유해도 된다는 뜻이 아니다. Java Memory Model은 programmer가 관찰할 수 있는 inter-thread ordering과 visibility contract를 별도로 정의한다. hardware의 speculative/OoO mechanism은 그 contract를 깨지 않는 범위 안에서 사용된다.
