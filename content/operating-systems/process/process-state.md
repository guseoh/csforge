---
kind: concept
contentKey: operating-systems.core.process.process-state
topicContentKey: operating-systems.core.process
slug: process-state
title: "프로세스 상태(Process State)"
summary: "준비·실행·대기·종료 상태를 CPU 배정과 사건 대기라는 전이 원인으로 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man5/proc_pid_stat.5.html"
    title: "proc_pid_stat(5) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux가 observable process state를 어떻게 구분하는지 실제 state code를 확인한다."
    displayOrder: 1
---
# 프로세스 상태(Process State)

프로세스 상태는 현재 프로세스가 **CPU에서 실행 중인지, 실행할 수 있지만 차례를 기다리는지, 특정 사건을 기다리는지**를 나타낸다. 교과서에서는 다음과 같은 단순한 상태 모델을 자주 사용한다.

```text
           디스패치
준비 ─────────────> 실행
  ^                  │   │
  │                  │   └─ 블로킹 대기 ──> 대기
  │                  │                       │
  └──── 선점 ────────┘                       └─ 사건 발생 → 준비

실행 ── 종료 ──> 종료됨
```

### 준비 상태와 실행 상태는 다르다

준비(ready) 상태의 프로세스는 실행할 조건은 갖췄지만 아직 CPU를 배정받지 못했다. 실행(running) 상태는 실제 CPU 코어에서 명령어를 실행하고 있는 상태다.

CPU 코어 수보다 실행 가능한 프로세스가 많다면 일부 프로세스는 준비 큐에서 차례를 기다려야 한다.

### 대기 상태는 CPU 차례를 기다리는 상태와 다르다

프로세스가 I/O 완료, 락, 타이머 같은 사건을 기다리는 동안에는 지금 CPU를 받아도 진행할 수 없는 경우가 있다. 이런 프로세스는 대기(waiting) 또는 블록(blocked) 상태로 둘 수 있다.

기다리던 사건이 발생하면 프로세스가 곧바로 실행 상태가 되는 것은 아니다. 다시 실행 가능 상태가 된 뒤 스케줄러가 CPU를 배정해야 실제 실행을 재개한다.

```text
I/O 완료
    ↓
대기 → 준비 → 스케줄러가 CPU 배정 → 실행
```

### 같은 준비 상태로 전이되어도 원인이 다를 수 있다

실행 중인 프로세스가 타이머 인터럽트로 선점되면 `실행 → 준비`가 될 수 있고, I/O가 끝나면 `대기 → 준비`가 될 수 있다. 결과 상태는 같지만 전이 원인은 다르다.

실제 운영체제는 interruptible sleep, stopped, zombie처럼 더 많은 상태를 구분할 수 있다. 준비/실행/대기 모델은 특정 Linux 상태 코드를 그대로 복사한 것이 아니라 **프로세스가 왜 실행되거나 멈추는지 이해하기 위한 추상화**다.
