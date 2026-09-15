---
kind: concept
contentKey: operating-systems.core.race-critical-section.critical-section
topicContentKey: operating-systems.core.race-critical-section
slug: critical-section
title: "Critical Section"
summary: "shared invariant를 보호하는 critical section과 mutual exclusion·progress·bounded waiting 요구를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Critical Section

Critical section은 shared state의 invariant를 지키기 위해 **서로 경쟁하는 실행 흐름이 동시에 들어가면 안 되는 코드 구간**이다. 특정 lock API 안쪽을 기계적으로 critical section이라고 부르는 것이 아니라, 먼저 어떤 read/check/update가 하나의 일관된 state transition을 이루는지 찾아야 한다.

```text
entry protocol
     ↓
┌────────────────────┐
│  critical section  │
│ shared state 확인·변경 │
└────────────────────┘
     ↓
exit protocol
```

예를 들어 queue의 `tail 확인 → element 저장 → tail 갱신`이 하나의 enqueue invariant라면 그 중 일부만 보호해서는 중간 상태가 다른 thread에 노출될 수 있다.

### Mutual exclusion만이 전부는 아니다

고전적인 critical-section 문제에서는 다음 요구를 구분한다.

- **Mutual exclusion**: 한 실행 흐름이 critical section에 있으면 경쟁하는 다른 흐름이 동시에 들어오지 못한다.
- **Progress**: critical section이 비어 있고 진입하려는 실행 흐름이 있다면 다음 진입자 결정이 무기한 멈추지 않는다.
- **Bounded waiting**: 진입을 요청한 뒤 다른 경쟁자가 무한히 먼저 들어가 특정 실행 흐름이 영원히 밀리지 않도록 제한한다.

Bounded waiting은 실제 wall-clock latency의 고정 상한과 같은 의미는 아니다. Scheduler와 primitive 구현에 따라 현실적인 대기 시간은 달라질 수 있다.

### 범위는 correctness를 먼저 만족해야 한다

Critical section이 너무 넓으면 다른 thread가 기다리는 시간이 늘어나 contention이 커질 수 있다. 그러나 성능 때문에 check와 update를 분리해 invariant를 다시 깨뜨려서는 안 된다.

따라서 critical section은 **보호해야 할 invariant를 완전히 포함하되, 그 invariant와 무관한 작업은 가능한 한 밖으로 두는 구간**으로 설계한다. 어떤 lock이나 primitive를 쓸지는 그 다음 선택이다.