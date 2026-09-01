---
kind: concept
contentKey: operating-systems.core.process.program-vs-process
topicContentKey: operating-systems.core.process
slug: program-vs-process
title: "Program versus Process"
summary: "저장된 executable과 실행 중인 process state를 구분한다."
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
# Program versus Process

Disk에 저장된 executable file과 지금 CPU에서 실행될 수 있는 process는 같은 것이 아니다. **Program**은 instruction과 static data를 담은 실행 가능한 대상이고, **process**는 그 program을 실행하기 위해 운영체제가 관리하는 살아 있는 execution state다.

같은 executable을 두 번 실행하면 program file은 하나여도 process는 두 개가 될 수 있다. 두 process는 각각 다른 PID, virtual address space, register state, open file descriptor, scheduling state를 가진다. 그래서 한 process의 heap 값이나 stack frame을 바꾼다고 다른 process의 같은 virtual address가 자동으로 바뀌지 않는다.

### Process에는 실행 순간의 state가 붙는다

Process를 단순히 “실행 중인 코드”라고만 부르면 중요한 부분이 빠진다. 실행을 멈췄다가 다시 이어가려면 현재 instruction 위치와 register, memory mapping, open resource, scheduling 정보 등이 필요하다.

```text
Executable program
code + static data
        │
        │ load / exec
        ▼
Process
├─ PID / credentials
├─ virtual address space
├─ CPU execution state
├─ open files / sockets
└─ scheduling / signal state ...
```

Arguments와 environment, current working directory 같은 실행 환경도 process behavior에 영향을 준다. 같은 Spring Boot JAR를 실행해도 profile, environment variable, working directory, file descriptor 상태가 다르면 서로 다른 실행 결과를 가질 수 있다.

### `exec`는 새 process를 하나 더 만드는 동작과 다르다

Unix-like 시스템에서 process creation과 program image 실행을 이해할 때 `fork`와 `exec`를 구분해야 한다. `fork` 계열은 새 process를 만들 수 있고, `execve`는 성공하면 **호출한 현재 process의 program image를 새 program image로 대체**한다. 따라서 `exec`를 “항상 새로운 PID를 하나 만드는 함수”로 설명하면 틀리다.

이 구분은 shell을 생각하면 이해하기 쉽다. Shell process가 child를 만든 뒤 child가 `exec`를 통해 다른 executable을 실행할 수 있다. Child는 다른 program을 실행하지만 process lifecycle과 PID 관계는 creation과 exec 단계의 규칙을 따른다.

### Application lifecycle과 process lifecycle은 같은 범위가 아니다

Spring의 `ApplicationContext` lifecycle, JVM lifecycle, OS process lifecycle은 서로 관련되지만 같은 abstraction이 아니다. Spring context가 종료 callback을 실행하는 것은 application/runtime 수준의 graceful shutdown이고, OS는 결국 process execution과 resource를 회수한다.

Process가 강제로 종료되면 application cleanup code가 기대한 방식으로 모두 실행된다고 보장할 수 없다. 그래서 durable job state나 idempotency key처럼 process crash 이후에도 필요한 정보는 process memory 밖에 저장해야 한다.

Program과 Process를 구분하는 핵심은 **정적인 실행 파일과 OS가 관리하는 동적인 실행 상태를 분리하는 것**이다. 이 구분이 있어야 이후 address space, scheduling, fork/exec, termination을 올바르게 이해할 수 있다.
