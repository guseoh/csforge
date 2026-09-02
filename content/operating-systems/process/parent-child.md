---
kind: concept
contentKey: operating-systems.core.process.parent-child
topicContentKey: operating-systems.core.process
slug: parent-child
title: "Parent and Child Process"
summary: "process creation으로 생긴 parent-child 관계와 상속·공유·lifecycle 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux fork가 분리된 address space를 copy-on-write page로 구현하는 경계를 확인한다."
    displayOrder: 1
---
# Parent and Child Process

Process creation에는 종종 **누가 누구를 만들었는가**라는 관계가 남는다. Unix-like 모델에서 `fork()`를 호출한 process가 parent이고 새로 생성된 process가 child다. 이 관계는 단순한 이름표가 아니라 exit status 수집, signal 전달, inherited resource 이해 같은 lifecycle 관리에 사용된다.

하지만 parent-child라고 해서 두 process가 application memory를 하나의 shared object처럼 계속 공유한다는 뜻은 아니다. Fork 직후 두 address space는 논리적으로 같은 내용을 가진 상태에서 시작할 수 있지만 일반적인 process-private writable memory는 이후 독립적으로 변화한다. Copy-on-write가 physical page를 일시적으로 공유할 수 있어도 process abstraction의 memory state를 하나로 합치는 것은 아니다.

### 무엇이 복제되고 무엇이 연결되는가

Fork semantics에서는 여러 종류의 state가 서로 다른 방식으로 이어진다.

```text
Parent
├─ private address-space state ── fork ──▶ Child의 논리적 복사본
├─ fd table entry ────────────────▶ Child fd entry
│                                      │
└──────────────────────────────────────┴──▶ 같은 open file description을 참조할 수 있음
```

그래서 “fork는 모든 resource를 완전 독립 복사한다”는 설명도, “parent와 child는 모든 state를 공유한다”는 설명도 둘 다 부정확하다. Resource별 semantics를 확인해야 한다.

예를 들어 inherited pipe descriptor가 parent/child 여러 곳에 열려 있으면 한쪽 reader는 자신이 예상한 writer가 종료됐더라도 다른 process가 write end를 계속 열고 있는 동안 EOF를 받지 못할 수 있다. 이 문제는 process 관계와 descriptor lifecycle을 함께 봐야 이해된다.

### 실행 순서는 parent-child 관계로 결정되지 않는다

Fork 이후 parent와 child는 scheduler가 다루는 별도의 runnable execution이 된다. 특별한 synchronization이 없다면 누가 먼저 다음 instruction을 실행할지 application이 가정해서는 안 된다.

따라서 parent가 child가 준비한 결과를 읽으려면 pipe, shared-memory synchronization, wait 등 명시적인 coordination mechanism이 필요하다. “부모이므로 child보다 항상 먼저 실행된다”거나 그 반대로 생각하면 race가 생긴다.

### Parent가 먼저 종료할 수도 있다

Parent가 child보다 먼저 종료되는 상황도 가능하다. Unix-like OS는 이런 orphan child를 정해진 system process/subreaper 관계로 다시 연결해 lifecycle을 관리할 수 있다. 구체적인 reparenting 정책은 OS에 따라 확인해야 한다.

반대로 child가 먼저 종료하면 parent는 `wait` 계열 interface로 termination status를 수집할 책임이 생길 수 있다. 이때 child가 아직 reap되지 않은 상태가 zombie와 연결된다.

### Backend subprocess에서 보는 parent-child 관계

Server process가 external command를 실행했다면 “child를 시작했다”로 lifecycle 관리가 끝나지 않는다.

- Parent shutdown 시 child를 어떻게 처리할 것인가
- stdout/stderr pipe의 어떤 endpoint를 누가 닫는가
- timeout이면 signal/termination 후 wait까지 수행하는가
- child exit status를 application job status와 어떻게 연결하는가

를 명시해야 한다.

Parent and Child Process의 핵심은 tree 그림을 외우는 것이 아니다. **Process creation 뒤 memory, descriptor, scheduling, termination state가 각각 어떤 방식으로 독립되거나 관계를 유지하는지 resource별로 구분하는 것**이다.
