---
kind: concept
contentKey: operating-systems.core.process.parent-child
topicContentKey: operating-systems.core.process
slug: parent-child
title: "부모와 자식 프로세스(Parent and Child Process)"
summary: "프로세스 생성으로 생긴 부모-자식 관계와 메모리·디스크립터·생명주기 상태의 상속 경계를 설명한다."
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
# 부모와 자식 프로세스(Parent and Child Process)

Unix 계열 시스템에서 `fork()`를 호출한 프로세스가 부모(parent)이고 새로 생성된 프로세스가 자식(child)이다. 이 관계는 단순한 트리 표시가 아니라 **자식의 종료 상태를 누가 회수하는지**, 그리고 **상속된 자원을 어떻게 이해해야 하는지**에 영향을 준다.

### 부모와 자식의 메모리는 독립적으로 변한다

`fork` 직후 두 프로세스가 비슷한 주소 공간 내용을 갖더라도 이후 일반적인 전용 쓰기 가능 메모리는 각각 독립적으로 변화한다. 쓰기 시 복사(copy-on-write)가 물리 페이지를 일시적으로 공유할 수 있지만 프로세스 추상화의 메모리 상태가 하나로 합쳐지는 것은 아니다.

### 자원마다 상속 규칙이 다르다

파일 디스크립터는 부모와 자식에 각각 엔트리가 생기면서도 같은 기반 열린 파일 상태(open file description)를 참조할 수 있다.

```text
부모 fd ──┐
          ├──> 열린 파일 상태 ──> 파일
자식 fd ──┘
```

그래서 부모-자식 관계를 `모든 상태를 복사한다`거나 `모든 상태를 공유한다`는 한 문장으로 설명할 수 없다. 자원별 계약을 확인해야 한다.

### 실행 순서도 부모-자식 관계만으로 정해지지 않는다

`fork` 이후 부모와 자식은 스케줄러가 다루는 별도의 실행 가능한 작업이다. 별도 동기화가 없다면 누가 먼저 실행될지 가정할 수 없다.

부모가 먼저 종료해도 자식이 반드시 동시에 종료되는 것은 아니다. 남은 자식은 운영체제의 재부모화(reparenting) 규칙에 따라 다른 프로세스가 생명주기 관리 책임을 이어받을 수 있다. Linux에서는 subreaper와 PID namespace 같은 구체적인 규칙이 영향을 줄 수 있다.

반대로 자식이 먼저 종료하면 부모가 `wait` 계열 인터페이스로 종료 상태를 회수할 수 있다. 이 관계가 다음 자식 프로세스 대기와 회수(Wait and Reap) Concept으로 이어진다.
