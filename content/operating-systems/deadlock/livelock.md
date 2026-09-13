---
kind: concept
contentKey: operating-systems.core.deadlock.livelock
topicContentKey: operating-systems.core.deadlock
slug: livelock
title: "Livelock"
summary: "execution은 계속 움직이지만 서로의 반응 때문에 유효한 work가 완료되지 않는 livelock을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common Concurrency Problems"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "deadlock의 dependency cycle, Coffman conditions와 prevention 전략을 확인한다."
    displayOrder: 1
  - url: "https://docs.oracle.com/javase/tutorial/essential/concurrency/starvelive.html"
    title: "Starvation and Livelock (The Java Tutorials)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Java concurrency 예시를 통해 starvation과 livelock의 liveness 차이를 확인한다."
    displayOrder: 2
---
# Livelock

### Thread가 멈추지 않았다는 사실만으로 progress하는 것은 아니다

Livelock에서는 execution이 blocked state로 고정되지 않는다. Thread나 process가 계속 retry, rollback, 양보 같은 action을 수행하지만 서로의 action에 반응하면서 실제 목표 work는 완료하지 못한다.

두 worker가 충돌할 때마다 둘 다 즉시 rollback하고 같은 delay로 다시 시도한다고 하자.

```text
time →
W1: conflict → rollback → retry → conflict → rollback → retry → ...
W2: conflict → rollback → retry → conflict → rollback → retry → ...
                     성공한 work: 0
```

상태와 CPU activity는 계속 변하지만 useful progress가 없다는 것이 핵심이다.

### Retry policy가 symmetry를 유지하면 같은 충돌을 재생할 수 있다

`실패하면 즉시 retry`는 한 번의 실패를 복구하는 간단한 전략처럼 보인다. 하지만 여러 execution이 같은 조건과 timing으로 똑같이 반응하면 서로를 계속 방해해 같은 conflict가 반복될 수 있다.

Randomized/exponential backoff와 jitter는 retry timing의 symmetry를 깨 한쪽이 먼저 progress할 기회를 만들 수 있다. Priority 변화나 retry budget도 사용할 수 있다. 다만 backoff는 liveness를 개선하는 도구이지 operation correctness나 idempotency를 자동으로 보장하지 않는다.

### Deadlock과는 관측되는 activity가 다르다

Deadlock에서는 참여 execution이 서로 resource를 기다려 activity가 줄 수 있다. Livelock에서는 lock attempt, rollback, network 요청, CPU 사용량은 높은데 성공 처리량이 낮게 나타날 수 있다.

| 상태 | 내부 activity | useful progress |
| --- | --- | --- |
| Deadlock | 대기 중심, 줄어들 수 있음 | 없음 |
| Livelock | retry·상태 변경이 계속됨 | 없음 또는 매우 낮음 |
| 정상 retry | 일시적으로 retry | 결국 성공/실패로 종료 |

Backend에서 retry rate만 올라가고 성공 처리량이 회복되지 않는다면 단순히 retry 횟수를 늘리기보다 **같은 충돌을 재생하고 있는지** 확인해야 한다.
