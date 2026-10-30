---
kind: concept
contentKey: operating-systems.core.threads.process-vs-thread
topicContentKey: operating-systems.core.threads
slug: process-vs-thread
title: "프로세스와 스레드(Process and Thread)"
summary: "프로세스의 자원·보호 경계와 스레드의 실행 흐름 경계를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# 프로세스와 스레드(Process and Thread)

프로세스와 스레드는 모두 실행과 관련된 개념이지만 책임의 경계가 다르다. **프로세스는 주소 공간과 운영체제 자원을 묶는 자원·보호 경계**이고, **스레드는 그 프로세스 안에서 명령어를 수행해 나가는 실행 흐름**이다.

같은 프로세스의 여러 스레드는 보통 코드, 힙과 열린 자원을 공유하지만 각자 다른 프로그램 카운터(PC), 레지스터 상태와 스택을 가진다.

```text
프로세스
├─ 공유: 코드 / 힙 / 열린 자원
├─ 스레드 A: PC / 레지스터 / 스택
└─ 스레드 B: PC / 레지스터 / 스택
```

이 차이를 단순히 `프로세스는 무겁고 스레드는 가볍다`로만 외우면 핵심을 놓친다. 같은 힙 객체를 여러 스레드가 직접 접근할 수 있는 이유는 주소 공간을 공유하기 때문이고, 각 스레드가 서로 다른 함수 호출을 진행할 수 있는 이유는 실행 문맥이 분리되어 있기 때문이다.

### 공유와 격리의 절충

같은 프로세스의 스레드는 별도의 프로세스 간 통신(IPC) 없이 메모리를 공유할 수 있어 데이터 교환이 쉽다. 그 대신 여러 스레드가 같은 가변 상태를 수정하면 경쟁 상태와 동기화 문제가 생길 수 있다.

프로세스는 기본적으로 서로 다른 가상 주소 공간을 사용하므로 메모리 경계가 더 강하다. 그러나 데이터를 주고받으려면 파이프, 소켓, 공유 메모리 같은 IPC 수단이 필요하다.

프로세스와 스레드의 핵심은 **무엇을 공유하고 무엇을 각 실행 흐름이 독립적으로 보존하는지**를 구분하는 것이다. 이후 스레드의 공유 상태·개별 상태와 스케줄링 비용도 이 경계에서 출발한다.