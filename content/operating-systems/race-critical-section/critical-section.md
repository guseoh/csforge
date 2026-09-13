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

### critical section은 단순히 `lock 안쪽 코드`라는 이름이 아니다

critical section은 shared state의 invariant를 깨지 않도록 concurrent execution을 제한해야 하는 코드 구간이다. 어떤 lock primitive를 사용할지는 구현 선택이고, 먼저 `어느 operation들이 동시에 실행되면 안 되는가`를 찾아야 한다.

개념적으로는 보호 protocol을 통해 진입하고, invariant에 영향을 주는 state를 읽고 변경한 뒤, 보호를 해제하고 나오는 흐름으로 볼 수 있다.

```text
entry / protection protocol
            │
            ▼
┌──────────────────────────┐
│     critical section     │
│ shared invariant 확인·변경 │
└──────────────────────────┘
            │
            ▼
 exit / release protocol
            │
            ▼
 remainder / unrelated work
```

이 그림의 중요한 점은 critical section의 경계가 lock API의 줄 수로 결정되지 않는다는 것이다. 예를 들어 bounded queue에서 `tail index 확인 → element 저장 → tail 갱신`이 하나의 enqueue invariant를 이룬다면 필요한 read/check/update 전체가 일관된 보호 protocol 안에 있어야 한다. 일부만 보호하면 중간 state가 다른 실행 흐름에 노출될 수 있다.

### 세 가지 고전적 요구를 구분한다

**Mutual exclusion**은 한 thread가 critical section에 있을 때 다른 competing thread가 동시에 그 구간을 실행하지 못하게 한다. **Progress**는 critical section이 비어 있고 진입하려는 thread가 있을 때 다음 진입자를 정하는 과정이 무기한 미뤄지지 않아야 한다는 요구다. **Bounded waiting**은 어떤 thread/process가 진입을 요청한 뒤 그 요청이 허용되기 전까지 다른 경쟁자가 먼저 critical section에 진입할 수 있는 횟수에 유한한 bound가 있어야 한다는 요구다.

Bounded waiting은 OS scheduler까지 포함한 실제 wall-clock 대기시간 상한이나 지연 시간 SLA를 뜻하지 않는다. 또한 mutex 하나를 사용한다고 세 요구가 모든 상황에서 자동으로 완벽히 보장되는 것도 아니다. 실제 fairness와 scheduling 정책은 primitive 구현에 따라 달라질 수 있다.

### critical section은 필요한 만큼만 유지한다

lock 안에서 CPU 계산, logging, DB/network I/O까지 모두 수행하면 correctness는 단순해 보일 수 있지만 contention이 급격히 커진다. 특히 lock을 잡고 blocking I/O를 기다리면 다른 thread가 shared state를 사용할 수 없어 작은 지연이 전체 queue 지연 시간으로 전파될 수 있다.

가능하면 lock 밖에서 준비할 수 있는 계산은 먼저 수행하고, lock 안에서는 shared invariant를 확인·변경하는 최소 state transition만 수행한다. 다만 "짧게 만들기"가 correctness보다 우선하는 규칙은 아니다. lock 밖으로 옮긴 계산이 오래된 snapshot을 사용하거나 check와 update 사이의 경쟁 창을 다시 만들면 critical section을 줄인 대가로 race를 재도입할 수 있다.

### 핵심을 다시 연결하면

좋은 critical section은 단순히 짧은 코드가 아니라 **보호해야 할 invariant의 경계를 정확히 포함하면서 불필요한 작업은 밖으로 분리한 구간**이다. 먼저 무엇을 함께 보호해야 하는지 정의하고, 그다음 mutual exclusion 방식과 contention 비용을 선택해야 한다.
