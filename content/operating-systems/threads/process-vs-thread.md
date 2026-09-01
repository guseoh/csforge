---
kind: concept
contentKey: operating-systems.core.threads.process-vs-thread
topicContentKey: operating-systems.core.threads
slug: process-vs-thread
title: "Process versus Thread"
summary: "process의 자원·보호 경계와 thread의 실행 흐름 경계를 구분한다."
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
# Process versus Thread

### 자원의 경계와 실행 흐름의 경계는 다르다

process는 실행 중인 program의 주소 공간과 open resource, 권한, OS가 추적하는 실행 상태를 묶는 보호·자원 관리 경계다. thread는 그 process 안에서 instruction을 실제로 진행하는 실행 흐름이다. 따라서 같은 process의 여러 thread는 같은 code와 heap, 전역 데이터, 보통 같은 open file table을 보지만 각자 다른 program counter, register와 stack을 가진다.

이 차이를 `process는 무겁고 thread는 가볍다`로만 외우면 중요한 부분을 놓친다. 두 thread가 동시에 같은 heap object를 수정할 수 있는 이유는 address space를 공유하기 때문이고, 두 thread가 서로 다른 함수 호출을 동시에 진행할 수 있는 이유는 각자 stack과 CPU context를 가지기 때문이다.

### 공유가 빠른 대신 실패와 동기화가 전파된다

process끼리는 기본적으로 서로 다른 virtual address space를 사용하므로 한 process의 일반적인 pointer로 다른 process의 heap을 직접 읽을 수 없다. 반면 같은 process의 thread는 pointer를 그대로 공유할 수 있어 communication이 싸지만 race condition, visibility, lock contention 같은 문제도 바로 공유한다.

또한 thread 하나의 잘못된 native memory 접근으로 process 자체가 비정상 종료되면 같은 process의 다른 thread도 함께 영향을 받을 수 있다. 그래서 `많이 동시에 처리하고 싶다`는 요구와 `실패를 강하게 격리하고 싶다`는 요구는 별도로 판단해야 한다.

### JVM 서버에서 보는 경계

Spring Boot application 하나를 실행하면 JVM process 하나 안에서 GC, request 처리, scheduler 등 여러 thread가 동작한다. singleton bean의 mutable field가 여러 request thread에 노출되는 것은 process 사이 공유 문제가 아니라 **같은 process 내부 thread 공유 문제**다. 반대로 별도 worker process를 띄우면 IPC 비용이 생기지만 address-space와 lifecycle failure를 더 강하게 분리할 수 있다.
