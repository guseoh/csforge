---
kind: concept
contentKey: computer-architecture.core.multicore-memory.hardware-memory-reordering
topicContentKey: computer-architecture.core.multicore-memory
slug: hardware-memory-reordering
title: "하드웨어 메모리 순서(Hardware Memory Ordering)"
summary: "메모리 일관성 모델이 다른 코어에 관찰될 load/store 순서를 어떻게 제한하는지 설명하고 언어 메모리 모델과의 경계를 구분한다."
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "multicore cache sharing, coherence protocol, false sharing과 shared-memory ordering 경계를 확인한다."
    displayOrder: 1
  - url: "https://docs.riscv.org/reference/isa/unpriv/rvwmo.html"
    title: "RVWMO Memory Consistency Model"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "weak memory ordering에서 preserved program order와 explicit synchronization이 어떤 순서를 보존하는지 확인한다."
    displayOrder: 2
---
# 하드웨어 메모리 순서(Hardware Memory Ordering)

한 코어의 프로그램이 load와 store를 특정 순서로 작성했다고 해서 다른 코어가 모든 메모리 연산을 반드시 그 순서 그대로 관찰하는 것은 아니다. CPU는 store buffer, 비순차 실행과 캐시 계층을 이용해 성능을 높일 수 있고, 아키텍처는 어떤 순서를 반드시 보존해야 하는지를 **메모리 일관성 모델(memory consistency model)** 로 정의한다.

중요한 것은 파이프라인 내부의 실제 실행 순서를 그대로 외부에 노출하는 것이 아니라, 아키텍처가 허용한 범위 안에서 다른 관찰자가 어떤 결과를 볼 수 있는가다.

### 약한 메모리 모델은 프로그램 순서 일부만 강제한다

RISC-V RVWMO 같은 약한 메모리 모델에서는 모든 메모리 연산의 프로그램 순서를 전역 순서에 그대로 강제하지 않는다. 대신 같은 주소에 대한 의존성, 명시적 동기화, fence, acquire/release 같은 규칙으로 **반드시 보존해야 하는 순서**를 정의한다.

```text
program order:   store A → store B
observed order:  항상 동일하다고 가정할 수 없음
                 └─ 필요한 ordering rule/fence가 있어야 함
```

이 자유 덕분에 하드웨어는 메모리 연산을 더 유연하게 겹쳐 처리할 수 있지만, 여러 코어가 공유 상태를 주고받을 때 필요한 순서는 명시적으로 만들어야 한다.

### 캐시 일관성과 메모리 순서는 다른 문제다

캐시 일관성은 같은 메모리 위치의 여러 캐시 복사본이 서로 모순되지 않도록 관리한다. 그러나 `data`와 `ready`처럼 서로 다른 위치 사이의 순서를 캐시 일관성 하나만으로 보장할 수는 없다.

```text
producer:
  data  = 42
  ready = 1

consumer:
  if (ready == 1) read data
```

소비자가 `ready`를 본 뒤 반드시 최신 `data`를 보아야 한다면 해당 아키텍처나 언어에서 요구하는 동기화·순서 보장이 필요하다.

### Fence는 필요한 순서를 제한한다

Fence는 특정 메모리 연산들이 서로 어떤 순서로 관찰되어야 하는지 제약을 추가한다. 이를 단순히 `CPU 전체를 멈추는 instruction`이라고 이해하는 것보다 **메모리 모델 안에서 앞선 연산과 뒤따르는 연산의 관찰 순서를 강제하는 메커니즘**으로 보는 편이 정확하다.

Acquire/release 의미도 비슷하게 특정 동기화 경계 앞뒤의 메모리 순서를 구성한다.

### 언어 메모리 모델은 그 위의 계약이다

Java에서는 프로그래머가 하드웨어 명령어 순서를 직접 조립하는 것이 아니라 Java Memory Model의 happens-before, `volatile`, monitor lock, thread start/join 같은 언어 수준 동기화 계약을 따라야 한다. JVM은 대상 CPU의 메모리 모델에 맞춰 필요한 명령어와 fence를 사용해 그 계약을 구현한다.

따라서 `cache coherence가 있으니 synchronization이 필요 없다`거나 `특정 CPU의 ordering이 강하니 Java volatile을 생략해도 된다`고 결론내리면 층위를 혼동한 것이다. 하드웨어 메모리 순서는 언어 메모리 모델을 이해하는 아래 계층이지 그 계약을 대체하지 않는다.
