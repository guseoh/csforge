---
kind: concept
contentKey: operating-systems.core.process.program-vs-process
topicContentKey: operating-systems.core.process
slug: program-vs-process
title: "Program과 Process"
summary: "저장된 executable program과 OS가 실행 상태·resource를 관리하는 process를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man2/execve.2.html"
    title: "execve(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "새 program image가 현재 process image를 대체하는 Linux execve semantics를 확인한다."
    displayOrder: 1
---
# Program과 Process

Program은 disk 등에 저장된 instruction과 static data의 집합이고, process는 그 program을 실제로 실행하기 위해 운영체제가 관리하는 **동적인 실행 상태**다.

같은 executable을 두 번 실행하면 program file은 하나여도 서로 다른 process 두 개가 생길 수 있다. 각 process는 자신만의 PID, virtual address space, CPU execution state, open resource와 scheduling state를 가진다.

```text
Program
code + static data
      │ execute
      ▼
Process
├─ identity
├─ virtual address space
├─ CPU execution state
├─ open resources
└─ scheduling/lifecycle state
```

### Process는 중단했다가 다시 이어갈 수 있어야 한다

Process가 단순히 `현재 실행 중인 code`라면 CPU에서 잠시 내려온 뒤 어디서 다시 시작해야 하는지 알 수 없다. OS는 현재 execution 위치, 필요한 register/context, memory mapping과 resource relation을 추적한다.

그래서 ready나 waiting 상태의 process도 여전히 process다. 그 순간 CPU instruction을 실행하지 않더라도 OS가 재개 가능한 실행 주체로 관리하고 있기 때문이다.

### Process 생성과 program 교체를 구분한다

Unix-like model에서 `fork`는 새로운 process를 만드는 동작이고, `execve`는 성공하면 **현재 process의 program image를 다른 program으로 교체**한다.

```text
parent process
   │ fork
   ├────────> child process
   │              │ exec
   │              ▼
   │        new program image
```

따라서 `새 program을 실행한다`와 `새 process를 생성한다`는 항상 같은 사건이 아니다.

Program과 process를 구분하면 이후 address space, process state, creation과 termination을 `파일의 성질`이 아니라 **운영체제가 관리하는 실행 lifecycle**로 이해할 수 있다.
