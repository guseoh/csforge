---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.superscalar-out-of-order
topicContentKey: computer-architecture.core.pipeline-ilp
slug: superscalar-out-of-order
title: "Superscalar와 Out-of-Order 실행"
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
# Superscalar와 Out-of-Order 실행

기본적인 single-issue pipeline은 여러 instruction의 단계를 겹치더라도 한 cycle에 새 instruction 하나만 issue한다. Superscalar CPU는 여러 execution unit과 더 넓은 front-end를 사용해 **한 cycle에 둘 이상의 instruction을 진행시킬 수 있도록** 설계한다.

하지만 execution unit 수가 많다고 모든 instruction을 동시에 실행할 수 있는 것은 아니다. 앞 instruction의 결과가 뒤 instruction에 필요한 true dependency가 있으면 그 값이 준비될 때까지 기다려야 한다. 실제 성능은 hardware가 독립적인 instruction-level parallelism을 얼마나 찾아 활용할 수 있는지에 달려 있다.

### Out-of-order는 준비된 instruction을 먼저 실행한다

다음 sequence를 생각해 보자.

```text
A: 오래 걸리는 load
B: A 결과가 필요함
C: A와 독립적인 계산
```

In-order 실행에서는 A가 막히면 뒤의 B와 C도 함께 기다릴 수 있다. Out-of-order CPU는 C의 operand와 execution unit이 준비되어 있다면 C를 먼저 실행해 A의 대기 시간을 일부 숨길 수 있다.

여기서 중요한 점은 **실행 순서를 바꾸는 것과 program이 관찰하는 결과를 마음대로 바꾸는 것은 다르다**는 것이다.

### True dependency와 이름 dependency를 구분한다

RAW(Read After Write)는 실제 값의 생산과 소비 관계이므로 보존해야 한다. 반면 WAR와 WAW는 architectural register 이름을 재사용하면서 생기는 name dependency다.

Register renaming은 새 physical register를 할당해 WAR/WAW 같은 false dependency를 제거한다. 그러면 실제 data dependency가 없는 instruction은 같은 register 이름 때문에 불필요하게 기다리지 않아도 된다.

### 실행과 retirement를 분리한다

Out-of-order CPU는 instruction을 서로 다른 순서로 실행할 수 있지만, architectural state와 exception은 ISA가 요구하는 의미를 유지해야 한다. 그래서 완료된 결과를 추적하다가 앞선 instruction의 상태가 안전하게 확정되면 program order에 맞춰 retire/commit하는 구조를 사용한다.

```text
issue/execute:   A(wait)   C(done)   B(wait)
                         ↓
architectural state: A → B → C 순서의 의미를 보존
```

앞선 instruction에서 exception이나 branch misprediction이 발견되면 뒤에서 speculative하게 실행한 결과는 architectural state에 남지 않아야 한다. 이것이 precise state를 유지하는 핵심이다.

### Out-of-order도 dependency와 memory latency를 없애지는 못한다

Pointer chasing처럼 다음 memory address가 앞 load 결과에 달려 있으면 독립적으로 실행할 instruction이 부족할 수 있다. Cache miss가 오래 걸리더라도 뒤에 준비된 독립 작업이 없다면 넓은 execution window도 지연을 숨길 수 없다.

따라서 superscalar width와 out-of-order window를 크게 만드는 것만으로 성능이 비례해서 증가하지는 않는다. 더 많은 instruction을 추적하는 hardware 비용과 전력도 커지고, workload가 실제로 제공하는 ILP가 충분해야 이 구조의 이점을 얻을 수 있다.

CPU가 instruction을 out-of-order로 실행한다는 사실은 Java 같은 언어의 thread synchronization 규칙을 대체하지 않는다. Hardware는 ISA와 language/runtime가 요구하는 program-visible contract를 보존하는 범위에서 내부 실행 순서를 조정한다.
