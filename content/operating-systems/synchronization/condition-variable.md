---
kind: concept
contentKey: operating-systems.core.synchronization.condition-variable
topicContentKey: operating-systems.core.synchronization
slug: condition-variable
title: "Condition Variable"
summary: "shared predicate가 참이 될 때까지 lock을 놓고 기다린 뒤 다시 검사하는 condition-variable protocol을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-cv.pdf"
    title: "Operating Systems: Three Easy Pieces — Condition Variables"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "condition variable이 mutex와 함께 predicate wait/signal protocol을 구성하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man3/pthread_cond_wait.3p.html"
    title: "pthread_cond_wait(3p) — POSIX manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "condition wait가 mutex release·대기·재획득을 연결하는 POSIX semantics를 확인한다."
    displayOrder: 2
---
# Condition Variable

Mutex는 critical section의 동시 진입을 막지만, `queue가 비어 있지 않다`처럼 **shared state가 특정 조건을 만족할 때까지 기다리는 문제**를 직접 표현하지는 않는다. Condition variable은 이런 predicate가 바뀔 때까지 실행 흐름을 재우고, state가 변했을 때 다시 검사할 기회를 주는 primitive다.

### 기다리려면 mutex를 놓아야 한다

Consumer가 빈 queue를 확인한 뒤 mutex를 계속 잡고 기다리면 producer도 같은 mutex를 얻지 못해 item을 넣을 수 없다. 그래서 condition wait는 일반적으로 mutex release와 waiting 진입을 경쟁에 안전하게 연결한다.

```text
Consumer                         Producer
lock
while queue empty:
    wait(cond, lock)
      ├─ lock release + sleep ─┐
      │                        │ lock
      │                        │ item 추가
      │                        │ signal(cond)
      │                        │ unlock
      └─ wake + lock reacquire ◀
queue 다시 확인
```

![Condition variable의 wait, signal, mutex 재획득 흐름](/learning/operating-systems/condition-variable-wait-signal.svg)

### Wakeup은 조건이 참이라는 보장이 아니다

Waiter가 깨어났더라도 다른 thread가 먼저 state를 바꿨을 수 있고, API가 spurious wakeup을 허용할 수도 있다. 그래서 condition variable은 보통 다음 형태로 사용한다.

```text
lock
while predicate is false:
    wait(cond, lock)
// predicate가 참인 상태에서 진행
unlock
```

`signal`은 resource 자체를 예약해 주는 것이 아니라 **state가 바뀌었을 수 있으니 다시 확인하라는 notification**에 가깝다.

Condition Variable의 핵심은 **predicate를 보호하는 mutex와 wait/signal을 하나의 protocol로 사용해, 조건이 거짓일 때 CPU를 낭비하지 않고 기다렸다가 다시 확인하는 것**이다.