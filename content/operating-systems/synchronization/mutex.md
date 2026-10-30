---
kind: concept
contentKey: operating-systems.core.synchronization.mutex
topicContentKey: operating-systems.core.synchronization
slug: mutex
title: "뮤텍스(Mutex)"
summary: "하나의 소유자가 임계 구역을 배타적으로 보호하는 뮤텍스의 의미를 설명한다."
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
# 뮤텍스(Mutex)

뮤텍스는 **한 시점에 하나의 실행 흐름만 임계 구역에 들어가도록 만드는 상호 배제(mutual exclusion) 도구**다. 스레드 T1이 뮤텍스를 획득한 상태라면 같은 뮤텍스가 필요한 T2는 T1이 해제할 때까지 보호 구간에 들어갈 수 없다.

```text
시간 ─────────────────────────────▶
T1  lock ├──── critical section ────┤ unlock
T2       └──────── wait ────────────┘ lock ├─ ...
```

### 같은 불변 조건은 같은 보호 규칙을 따라야 한다

뮤텍스가 있다는 사실만으로 공유 상태가 자동으로 보호되지는 않는다. 같은 불변 조건을 변경하는 경로 A는 뮤텍스 X를 사용하고 경로 B는 뮤텍스 Y를 사용한다면 두 경로는 동시에 실행될 수 있다.

따라서 먼저 어떤 상태 전이를 하나의 임계 구역으로 볼지 정하고, 그 불변 조건에 접근하는 모든 경쟁 경로가 같은 보호 규칙을 따르도록 해야 한다.

### 소유권이 중요한 이유

전형적인 뮤텍스는 획득한 실행 흐름이 소유자가 되고, 그 소유자가 임계 구역을 끝낸 뒤 해제한다는 의미를 가진다. 이 소유권은 `현재 누가 이 보호 구간에 들어갈 권한을 갖는가`를 명확하게 만든다.

대기 중인 스레드를 어떤 순서로 깨우는지, 재귀 잠금을 허용하는지, 시간 제한을 지원하는지는 별도 API 계약이다. `mutex`라는 이름만으로 공정성이나 재진입 정책까지 가정하면 안 된다.

뮤텍스의 핵심은 **하나의 공유 불변 조건을 변경하는 동안 하나의 소유자만 임계 구역에 들어가도록 배타적 실행 구간을 만드는 것**이다.
