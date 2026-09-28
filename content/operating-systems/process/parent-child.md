---
kind: concept
contentKey: operating-systems.core.process.parent-child
topicContentKey: operating-systems.core.process
slug: parent-child
title: "부모와 자식 프로세스(부모 and 자식 프로세스)"
summary: "프로세스 creation으로 생긴 부모-자식 관계와 메모리·디스크립터·생명주기 상태의 상속 경계를 설명한다."
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
# 부모와 자식 프로세스(부모 and 자식 프로세스)

Unix-like 시스템에서 `fork()`를 호출한 프로세스가 부모이고 새로 생성된 프로세스가 자식다. 이 관계는 단순한 tree 표시가 아니라 자식의 종료 상태를 누가 회수하는지와 inherited 자원를 어떻게 이해할지에 영향을 준다.

### 부모와 자식의 메모리는 독립적으로 변한다

Fork 직후 두 프로세스가 비슷한 주소 공간 내용을 갖더라도 이후 일반 private writable 메모리는 각각 독립적으로 변화한다. 복사-on-write가 physical page를 일시적으로 공유할 수 있지만 프로세스 추상화의 메모리 상태가 하나로 합쳐지는 것은 아니다.

### 자원마다 상속 의미가 다르다

파일 디스크립터는 부모와 자식에 각각 entry가 생기면서도 같은 underlying open 파일 description을 참조할 수 있다.

```text
Parent fd ──┐
            ├──> open file description ──> file
Child fd ───┘
```

그래서 부모-자식 관계를 `모든 상태를 복사한다`거나 `모든 상태를 공유한다`는 한 문장으로 설명할 수 없다. 자원별 contract를 봐야 한다.

### 실행 순서도 관계만으로 정해지지 않는다

Fork 이후 부모와 자식는 스케줄러가 다루는 별도의 실행 가능 실행이다. 별도 동기화이 없다면 누가 먼저 실행될지 가정할 수 없다.

부모가 먼저 종료해도 자식가 반드시 동시에 종료되는 것은 아니다. 남은 자식는 OS의 reparenting 규칙에 따라 다른 프로세스가 생명주기 관리 책임을 이어받을 수 있다. Linux에서는 subreaper와 PID 네임스페이스 같은 구체적인 규칙이 영향을 줄 수 있다.

반대로 자식가 먼저 종료하면 부모가 `wait` 계열 interface로 종료 상태를 회수할 수 있다. 이 관계가 다음 Wait·Reap Concept으로 이어진다.
