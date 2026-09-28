---
kind: concept
contentKey: operating-systems.core.threads.thread-private-state
topicContentKey: operating-systems.core.threads
slug: thread-private-state
title: "스레드별 상태(스레드-Private 상태)"
summary: "스레드별 레지스터·프로그램 counter·스택이 독립 실행 흐름을 만드는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# 스레드별 상태(스레드-Private 상태)

같은 프로세스의 스레드가 메모리와 자원를 공유하더라도 **현재 어디까지 실행했는지 나타내는 문맥는 스레드마다 따로 있어야 한다.** 대표적으로 프로그램 counter, CPU 레지스터 상태와 스택이 스레드별 실행 상태다.

두 스레드가 같은 함수를 실행하고 있어도 호출 단계와 parameter, local variable, return address는 서로 다를 수 있다.

```text
shared code: handle()

Thread A stack        Thread B stack
handle(1)             handle(2)
  └─ parse()            └─ validate()

각 thread는 별도 PC/register로 자신의 위치를 기억한다.
```

스케줄러가 스레드를 멈췄다가 다시 실행할 때도 이 독립 문맥를 저장·복원해야 한다.

### 스택에 있는 변수와 객체의 공유 여부는 다른 문제다

Local 참조 자체는 한 스레드의 스택에 있을 수 있지만 그 참조가 가리키는 객체는 공유 힙에 있을 수 있다. 따라서 `지역 변수이므로 object까지 thread-private하다`고 일반화하면 안 된다.

스레드-local 저장소처럼 스레드마다 별도 값을 유지하는 메커니즘도 있지만, 이는 프로세스의 힙이 스레드별로 분리된다는 뜻이 아니다. 스레드-private 상태의 핵심은 **여러 스레드가 같은 프로세스 자원를 공유하면서도 서로 다른 제어 흐름을 유지하기 위해 각자의 실행 문맥가 필요하다는 것**이다.