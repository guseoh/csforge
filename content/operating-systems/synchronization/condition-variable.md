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

Mutex만으로는 “지금 critical section에 들어가도 되는가”는 제어할 수 있어도, `queue가 비어 있지 않다`처럼 **shared state가 특정 조건이 될 때까지 기다리는 문제**를 효율적으로 해결하기 어렵습니다. Condition variable은 이런 predicate가 바뀔 때까지 waiter를 재우고, state가 변한 뒤 다시 확인할 기회를 주는 synchronization primitive입니다.

![Condition variable의 wait, signal, mutex 재획득 흐름](/learning/operating-systems/condition-variable-wait-signal.svg)

### 조건을 확인한 채로 계속 lock을 쥐고 있으면 안 된다

Consumer가 빈 queue를 발견했는데 mutex를 계속 쥔 채 기다리면 producer도 같은 mutex를 얻지 못해 item을 넣을 수 없습니다. 그래서 condition wait는 mutex와 함께 다음 protocol을 구성합니다.

```text
Consumer                              Producer
--------                              --------
lock(mutex)
queue empty 확인
wait(cond, mutex)
  ├─ mutex release + wait 진입 ──┐
  │                              │  lock(mutex)
  │                              │  item 추가
  │                              │  signal(cond)
  │                              │  unlock(mutex)
  └─ wake → mutex 재획득 ◀───────┘
predicate 다시 확인
item 제거
unlock(mutex)
```

POSIX의 `pthread_cond_wait()` 같은 API에서 중요한 점은 caller가 mutex를 놓는 것과 condition wait에 들어가는 동작이 경쟁에 안전하도록 연결된다는 것입니다. 만약 `조건 확인 → mutex unlock → 나중에 sleep`을 application이 따로 수행하면 그 틈에 producer의 signal이 지나가 consumer가 이미 만족된 조건을 모르고 잠드는 lost wakeup이 생길 수 있습니다.

### wakeup 이후에는 mutex를 다시 얻고 predicate를 재검사한다

`wait`에서 깨어났다는 사실은 resource를 예약받았다는 뜻이 아닙니다. 일반적인 condition-variable protocol에서는 waiter가 돌아오기 전에 mutex를 다시 획득하고, 보호된 state를 다시 읽어 predicate가 여전히 참인지 확인합니다.

```text
lock(mutex)
while queue.isEmpty():
    wait(cond, mutex)
item = queue.remove()
unlock(mutex)
```

`if` 대신 `while`을 쓰는 이유가 여기에 있습니다. 여러 waiter가 함께 깨어났다면 다른 thread가 먼저 item을 소비할 수 있고, API가 spurious wakeup을 허용할 수도 있습니다. 따라서 **signal은 predicate의 진실을 보장하는 값이 아니라 다시 검사할 기회**라고 이해하는 편이 안전합니다.

### signal과 state transition은 하나의 protocol로 본다

Producer가 item을 넣고 notification을 보낼 때는 predicate를 만드는 state transition과 condition signaling의 관계가 분명해야 합니다. Waiter와 signaler가 shared state를 서로 다른 synchronization 규칙으로 읽고 쓴다면 notification 자체가 있어도 correctness를 보장하기 어렵습니다.

Backend에서 bounded queue나 worker coordination을 직접 구현해야 할 때 condition-style waiting은 busy polling보다 CPU를 낭비하지 않습니다. 다만 Java의 `BlockingQueue`처럼 이미 검증된 higher-level primitive가 요구사항을 만족한다면 low-level lock과 condition을 직접 조합하는 것보다 그 계약을 사용하는 편이 보통 더 안전합니다.

### 면접에서 이렇게 나옵니다

#### Q. Condition wait를 왜 `if`가 아니라 `while` 안에서 사용하나요?

Wakeup이 predicate를 예약해 주지 않기 때문입니다. Waiter는 mutex를 다시 얻은 뒤 shared state를 재검사해야 합니다.

다른 waiter가 먼저 resource를 소비했을 수도 있고 spurious wakeup도 가능하므로, `while (조건이 거짓) wait` 형태가 condition-variable protocol의 핵심입니다.
