---
kind: concept
contentKey: operating-systems.core.process.process-terminate
topicContentKey: operating-systems.core.process
slug: process-terminate
title: "프로세스 종료(Process Termination)"
summary: "프로세스 실행 종료, 자원 회수, 부모에게 남기는 종료 상태를 구분해 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man2/_exit.2.html"
    title: "_exit(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process termination 시 descriptor close와 parent에 전달되는 termination status를 확인한다."
    displayOrder: 1
---
# 프로세스 종료(Process Termination)

프로세스는 정상적인 종료 경로로 끝날 수도 있고 시그널(signal)이나 치명적인 폴트 때문에 끝날 수도 있다. 어느 경우든 더 이상 애플리케이션 명령어를 실행하지 않게 되면 운영체제는 그 프로세스가 사용하던 주소 공간과 대부분의 열린 자원을 회수할 수 있다.

```text
실행 중
  ├─ 정상 종료
  ├─ 시그널
  └─ 치명적 폴트
        ↓
실행 종료
        ↓
자원 회수
        ↓
종료 상태 유지 가능
```

### 실행 종료와 메타데이터 제거는 같은 시점이 아닐 수 있다

Unix 계열 프로세스 모델에서는 부모가 자식의 종료 결과를 확인할 수 있도록 종료 상태(exit status)와 최소한의 프로세스 메타데이터를 잠시 남길 수 있다.

따라서 프로세스가 더 이상 CPU에서 실행되지 않는다고 해서 그 프로세스에 대한 모든 커널 상태가 즉시 사라지는 것은 아니다.

### 종료 원인은 부모에게 의미가 있다

부모는 자식이 정상 종료 코드로 끝났는지, 시그널 때문에 종료됐는지 등을 구분할 수 있다. 이 정보는 자식 프로세스의 생명주기를 관리하는 데 사용된다.

### 좀비는 실행 중인 프로세스가 아니다

자식이 이미 종료되어 주요 실행 자원이 정리됐지만 부모가 아직 종료 상태를 수집하지 않았다면 좀비(zombie) 상태로 남을 수 있다.

좀비는 애플리케이션 명령어를 계속 실행하는 프로세스가 아니다. 문제는 부모가 회수(reap)할 때까지 최소한의 프로세스 메타데이터가 남는다는 점이다.

프로세스 종료의 핵심은 **실행 종료 → 대부분의 자원 회수 → 종료 메타데이터 전달·회수**가 서로 구분되는 생명주기 단계라는 것이다.
