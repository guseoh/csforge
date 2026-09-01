---
kind: concept
contentKey: computer-architecture.core.isa-execution.isa-vs-microarchitecture
topicContentKey: computer-architecture.core.isa-execution
slug: isa-vs-microarchitecture
title: "ISA versus Microarchitecture"
summary: "software-visible ISA 계약과 이를 실행하는 microarchitecture를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/intro.html"
    title: "RISC-V Unprivileged ISA: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "ISA가 정의하는 software-visible architecture와 구현 선택의 경계를 확인한다."
    displayOrder: 1
---
# ISA versus Microarchitecture

### 프로그램이 의존할 수 있는 계약

ISA(Instruction Set Architecture)는 software와 processor 사이의 경계다. 어떤 instruction이 존재하는지, architectural register가 무엇인지, instruction이 어떤 결과와 exception을 만들어야 하는지처럼 프로그램이 관찰할 수 있는 동작을 정의한다. compiler는 source code를 특정 ISA의 instruction으로 변환하고, operating system도 privilege·exception·memory 관련 architectural contract를 기준으로 CPU를 제어한다.

이 계약이 중요한 이유는 같은 binary가 같은 ISA를 구현하는 서로 다른 processor에서도 의미를 유지해야 하기 때문이다. 예를 들어 `ADD`가 두 register 값을 더해 destination register에 결과를 기록한다는 것은 ISA 수준의 의미다. 반면 그 덧셈이 내부에서 몇 개의 pipeline stage를 지나고 어떤 execution unit에서 실행되는지는 software가 일반적으로 의존할 수 없는 구현 세부사항이다.

### 같은 ISA를 서로 다르게 실행할 수 있다

Microarchitecture는 ISA의 동작을 실제 hardware로 구현하는 방법이다. pipeline 깊이, issue width, out-of-order window, cache hierarchy, branch predictor, execution unit 수처럼 CPU 내부 구조가 여기에 속한다. 두 CPU가 같은 RISC-V ISA나 x86-64 ISA를 구현하더라도 이러한 구조는 크게 다를 수 있다.

따라서 같은 instruction sequence라도 실행 시간은 달라질 수 있다. 한 CPU에서는 cache hit와 높은 branch prediction accuracy 덕분에 빠르게 끝나지만 다른 CPU에서는 더 많은 stall과 miss를 겪을 수 있다. `instruction count가 같다 = 실행 시간이 같다`가 아닌 이유다.

반대로 한 CPU에서 관찰한 timing, cache 크기, speculative execution 방식 등을 ISA의 보장처럼 사용하면 이식성이 깨진다. ISA가 정의하는 것은 architectural result이지 특정 implementation의 cycle-by-cycle execution이 아니다.

### 성능과 correctness를 다른 층에서 판단한다

Correctness를 판단할 때는 ISA 또는 그 위의 language/runtime contract를 본다. 성능을 판단할 때는 동일한 ISA 위에서도 실제 microarchitecture와 workload를 측정해야 한다. 예를 들어 어떤 native instruction extension을 사용할 수 있는지는 ISA feature 문제지만, 그 instruction이 기존 sequence보다 실제로 빠른지는 해당 processor implementation의 문제다.

Backend에서 native library나 JIT 결과를 볼 때도 이 구분이 필요하다. deployment CPU가 필요한 ISA extension을 지원하는지 먼저 확인하고, 성능은 실제 target machine의 cache·pipeline·memory behavior까지 포함해 benchmark한다. 특정 CPU에서 빠르게 측정됐다는 사실을 다른 CPU에서도 성립하는 correctness 계약으로 기록하지 않는다.
