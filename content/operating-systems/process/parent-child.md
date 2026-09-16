---
kind: concept
contentKey: operating-systems.core.process.parent-child
topicContentKey: operating-systems.core.process
slug: parent-child
title: "Parent와 Child Process"
summary: "process creation으로 생긴 parent-child 관계와 memory·descriptor·lifecycle state의 상속 경계를 설명한다."
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
  - url: "https://man7.org/linux/man-pages/man2/PR_SET_CHILD_SUBREAPER.2const.html"
    title: "PR_SET_CHILD_SUBREAPER(2const) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux에서 orphan descendant가 가장 가까운 살아 있는 child subreaper로 reparent되는 동작을 확인한다."
    displayOrder: 2
---
# Parent와 Child Process

Unix-like system에서 `fork()`를 호출한 process가 parent이고 새로 생성된 process가 child다. 이 관계는 단순한 tree 표시가 아니라 child의 종료 상태를 누가 회수하는지와 inherited resource를 어떻게 이해할지에 영향을 준다.

### Parent와 child의 memory는 독립적으로 변한다

Fork 직후 두 process가 비슷한 address-space 내용을 갖더라도 이후 일반 private writable memory는 각각 독립적으로 변화한다. Copy-on-write가 physical page를 일시적으로 공유할 수 있지만 process abstraction의 memory state가 하나로 합쳐지는 것은 아니다.

### Resource마다 상속 semantics가 다르다

File descriptor는 parent와 child에 각각 entry가 생기면서도 같은 underlying open file description을 참조할 수 있다.

```text
Parent fd ──┐
            ├──> open file description ──> file
Child fd ───┘
```

그래서 parent-child 관계를 `모든 상태를 복사한다`거나 `모든 상태를 공유한다`는 한 문장으로 설명할 수 없다. Resource별 contract를 봐야 한다.

### 실행 순서도 관계만으로 정해지지 않는다

Fork 이후 parent와 child는 scheduler가 다루는 별도의 runnable execution이다. 별도 synchronization이 없다면 누가 먼저 실행될지 가정할 수 없다.

Parent가 먼저 종료해도 child가 반드시 동시에 종료되는 것은 아니다. 남은 child는 OS의 reparenting 규칙에 따라 다른 process가 lifecycle 관리 책임을 이어받을 수 있다. Linux에서는 subreaper와 PID namespace 같은 구체적인 규칙이 영향을 줄 수 있다.

반대로 child가 먼저 종료하면 parent가 `wait` 계열 interface로 종료 상태를 회수할 수 있다. 이 관계가 다음 Wait·Reap Concept으로 이어진다.
