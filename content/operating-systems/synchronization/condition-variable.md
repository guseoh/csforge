---
kind: concept
contentKey: operating-systems.core.synchronization.condition-variable
topicContentKey: operating-systems.core.synchronization
slug: condition-variable
title: "조건 변수(Condition Variable)"
summary: "공유 조건이 참이 될 때까지 뮤텍스를 놓고 기다린 뒤 다시 획득해 조건을 재검사하는 조건 변수의 동작을 설명한다."
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
# 조건 변수(Condition Variable)

뮤텍스는 임계 구역의 동시 진입을 막지만, `큐가 비어 있지 않다`처럼 **공유 상태가 특정 조건을 만족할 때까지 기다리는 문제**를 직접 표현하지는 않는다. 조건 변수는 이런 조건(predicate)이 바뀔 때까지 실행 흐름을 재우고, 상태가 변했을 때 다시 검사할 기회를 주는 동기화 도구다.

### 기다리려면 뮤텍스를 놓아야 한다

소비자가 빈 큐를 확인한 뒤 뮤텍스를 계속 잡고 기다리면 생산자도 같은 뮤텍스를 얻지 못해 항목을 넣을 수 없다. 그래서 조건 변수의 `wait`는 뮤텍스 해제와 대기 진입을 경쟁에 안전하게 연결하고, 깨어나 복귀하기 전에 같은 뮤텍스를 다시 획득한다.

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

### 깨어났다고 조건이 참인 것은 아니다

대기 중인 스레드가 깨어났더라도 다른 스레드가 먼저 상태를 바꿨을 수 있고, API가 가짜 깨움(spurious wakeup)을 허용할 수도 있다. 따라서 조건 변수는 보통 다음 형태로 사용한다.

```text
lock
while predicate is false:
    wait(cond, lock)
// predicate가 참인 상태에서 진행
unlock
```

`signal`은 자원 자체를 예약해 주는 것이 아니라 **상태가 바뀌었을 수 있으니 보호된 조건을 다시 확인하라는 통지**에 가깝다.

조건 변수의 핵심은 **조건을 보호하는 뮤텍스와 wait/signal을 하나의 규칙으로 사용해, 조건이 거짓일 때 CPU를 낭비하지 않고 기다렸다가 뮤텍스를 다시 획득한 뒤 조건을 재검사하는 것**이다.
