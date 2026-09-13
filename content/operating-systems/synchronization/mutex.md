---
kind: concept
contentKey: operating-systems.core.synchronization.mutex
topicContentKey: operating-systems.core.synchronization
slug: mutex
title: "Mutex"
summary: "하나의 owner가 critical section을 배타적으로 소유하는 mutex semantics를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man3/pthread_mutex_lock.3p.html"
    title: "pthread_mutex_lock(3p) — POSIX manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "POSIX mutex의 획득·소유·대기와 mutex type별 동작 경계를 확인한다."
    displayOrder: 2
---
# Mutex

여러 thread가 같은 상태를 바꿀 때 필요한 것은 단순히 `lock()` 호출 한 줄이 아니라, **누가 어떤 상태를 언제까지 독점해서 바꿀 수 있는지**에 대한 공통 규칙입니다. Mutex는 이 규칙을 한 시점에 하나의 owner만 critical section에 들어가도록 표현하는 mutual-exclusion primitive입니다.

### 같은 mutex를 두고 경쟁할 때 어떤 일이 일어나는가

T1이 mutex를 획득한 상태에서 T2가 같은 mutex를 요청하면 T2는 즉시 같은 critical section을 실행할 수 없습니다. 실제 구현은 잠깐 spin하거나 sleep/block할 수 있지만, 핵심 계약은 보호 구간의 실행이 겹치지 않도록 하는 것입니다.

```text
시간 ─────────────────────────────────────────▶

T1  lock ├──── shared invariant 변경 ────┤ unlock
T2       └──── wait / retry ─────────────┘ lock ├── ...
```

여기서 mutex 객체가 상태를 자동으로 찾아 보호하는 것은 아닙니다. `balance`를 갱신하는 한 경로는 mutex A를 쓰고 다른 경로는 mutex B를 쓴다면 두 경로는 동시에 실행될 수 있습니다. **같은 invariant에 영향을 주는 모든 competing path가 같은 protection protocol을 따라야** mutual exclusion이 실제 correctness로 이어집니다.

### ownership이 semaphore와 다른 이유

전형적인 mutex는 획득에 성공한 실행 흐름이 owner가 되고, 그 owner가 보호 구간을 끝내며 unlock한다는 의미를 가집니다. 이 ownership 덕분에 “지금 누가 이 invariant를 변경할 권한을 갖는가”를 비교적 직접적으로 추론할 수 있습니다.

반면 counting semaphore의 중심 의미는 N개의 permit입니다. binary semaphore를 mutual exclusion처럼 사용할 수는 있어도, 다른 실행 흐름이 signal/post하는 protocol을 표현할 수 있으므로 `count = 1`이라는 사실만으로 mutex와 동일하다고 일반화하면 안 됩니다.

mutex가 recursive한지, waiter 선택이 공정한지, timeout이나 interruption을 지원하는지는 구현과 API 계약에 따라 달라집니다. `mutex`라는 이름만으로 이러한 정책까지 가정하지 않습니다.

### lock hold time은 다른 thread의 대기시간이 된다

critical section 안에서 공유 상태를 짧게 확인하고 변경하면 다른 waiter가 빠르게 다음 차례를 얻을 수 있습니다. 반대로 mutex를 잡은 채 DB나 network I/O를 기다리면 외부 시스템의 지연이 그대로 lock hold time에 들어갑니다.

```text
T1  lock ├── 상태 확인 ── 외부 API 300ms ── 상태 변경 ┤ unlock
T2       └──────────────── wait ───────────────────────┘
T3       └──────────────── wait ───────────────────────┘
```

그렇다고 무조건 I/O를 lock 밖으로 옮기면 되는 것도 아닙니다. lock 밖에서 읽은 값이 다시 lock을 잡을 때 stale해져 invariant가 깨질 수 있으므로, **보호해야 하는 상태 전이의 범위와 실제 hold time을 함께** 봐야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. Mutex 하나를 사용하면 race condition이 자동으로 사라지나요?

아닙니다. 같은 shared invariant에 접근하는 모든 경쟁 경로가 동일한 mutex와 동일한 보호 규칙을 지켜야 합니다.

서로 다른 mutex를 사용하거나 일부 read/write가 lock 밖에 남아 있으면 mutex가 존재해도 critical section이 실제 invariant 전체를 보호하지 못할 수 있습니다.
