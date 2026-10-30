---
kind: concept
contentKey: operating-systems.core.process.wait-reap
topicContentKey: operating-systems.core.process
slug: wait-reap
title: "자식 프로세스 대기와 회수(Wait and Reap)"
summary: "부모가 자식의 상태 변화를 기다리고 종료 상태를 수집해 남은 프로세스 메타데이터를 회수하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man2/wait.2.html"
    title: "wait(2), waitpid(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "wait 계열 호출이 child state change를 기다리고 terminated child를 reap하는 semantics를 확인한다."
    displayOrder: 1
---
# 자식 프로세스 대기와 회수(Wait and Reap)

자식 프로세스가 종료되면 부모가 그 결과를 확인할 수 있도록 종료 상태와 최소한의 메타데이터가 남을 수 있다. 부모는 `wait` 계열 인터페이스를 사용해 자식의 상태 변화를 확인하고 종료 정보를 수집한다. 이 메타데이터 회수를 보통 **reap(회수)**이라고 한다.

### 자식이 아직 실행 중이면 부모가 기다릴 수 있다

블로킹 방식의 `wait`에서 대상 자식이 아직 종료되지 않았다면 부모는 대기 상태가 될 수 있다.

```text
부모가 wait() 호출
       ↓
자식이 아직 실행 중
       ↓
부모 대기
       │
자식 종료
       ↓
부모가 다시 실행 가능 상태
       ↓
종료 상태 수집 + reap
```

즉 `wait`는 단순한 수면이 아니라 **자식 프로세스의 생명주기 사건과 동기화하고 결과를 회수하는 인터페이스**다.

### 좀비는 회수 전의 종료 상태다

자식이 종료되면 주소 공간과 대부분의 실행 자원은 정리된다. 하지만 부모가 아직 종료 상태를 읽지 않았다면 최소한의 메타데이터가 좀비(zombie) 상태로 남을 수 있다.

좀비가 CPU를 계속 사용하는 것은 아니다. 오랫동안 실행되는 부모 프로세스가 자식을 반복 생성하면서 회수하지 않으면 프로세스 테이블에 이런 엔트리가 누적되는 것이 문제다.

### 여러 자식은 생성 순서대로 끝난다고 가정할 수 없다

부모가 A, B, C를 차례로 만들었더라도 스케줄링과 I/O 상태에 따라 종료 순서는 달라질 수 있다. 따라서 여러 자식을 관리할 때는 어떤 PID의 어떤 종료 결과를 회수했는지 명확히 연결해야 한다.

대기와 회수의 핵심은 **자식 프로세스의 실행 종료와 자식 메타데이터 회수를 분리하는 것**이다. 프로세스가 끝났다는 사실과 부모가 그 결과를 소비해 생명주기를 완전히 닫았다는 사실은 서로 다른 단계다.
