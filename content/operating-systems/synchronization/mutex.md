---
kind: concept
contentKey: operating-systems.core.synchronization.mutex
topicContentKey: operating-systems.core.synchronization
slug: mutex
title: "뮤텍스(뮤텍스)"
summary: "하나의 소유자가 critical section을 배타적으로 소유하는 뮤텍스 의미를 설명한다."
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
# 뮤텍스(뮤텍스)

뮤텍스는 **한 시점에 하나의 실행 흐름만 critical section을 소유하도록 만드는 mutual-exclusion primitive**다. 스레드 T1이 뮤텍스를 획득한 상태라면 같은 뮤텍스를 필요로 하는 T2는 T1이 해제할 때까지 보호 구간에 들어갈 수 없다.

```text
시간 ─────────────────────────────▶
T1  lock ├──── critical section ────┤ unlock
T2       └──────── wait ────────────┘ lock ├─ ...
```

### 같은 불변 조건는 같은 보호 프로토콜을 따라야 한다

뮤텍스가 있다고 자동으로 공유 상태가 보호되는 것은 아니다. 같은 불변 조건를 변경하는 경로 A는 뮤텍스 X를 사용하고 경로 B는 뮤텍스 Y를 사용한다면 두 경로는 동시에 실행될 수 있다.

따라서 먼저 어떤 상태 transition을 하나의 critical section으로 볼지 정하고, 그 불변 조건에 접근하는 경쟁 경로가 동일한 보호 규칙을 따르도록 해야 한다.

### Ownership이 중요한 이유

전형적인 뮤텍스는 획득한 실행 흐름이 소유자가 되고, 그 소유자가 critical section을 끝낸 뒤 unlock한다는 의미를 가진다. 이 ownership은 `누가 현재 이 보호 구간을 수정할 권한을 갖는가`를 명확하게 만든다.

뮤텍스 implementation이 대기자를 어떤 순서로 깨우는지, recursive lock을 허용하는지, 타임아웃을 지원하는지는 별도 API 계약이다. `mutex`라는 이름만으로 공정성나 재진입 정책까지 가정하지 않는다.

뮤텍스의 핵심은 **공유 불변 조건를 변경하는 동안 하나의 소유자만 진입하도록 배타적 실행 구간을 만드는 것**이다.