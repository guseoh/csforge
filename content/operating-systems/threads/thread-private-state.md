---
kind: concept
contentKey: operating-systems.core.threads.thread-private-state
topicContentKey: operating-systems.core.threads
slug: thread-private-state
title: "스레드별 상태(Thread-Private State)"
summary: "스레드별 레지스터·프로그램 카운터·스택이 독립적인 실행 흐름을 만드는 이유를 설명한다."
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
# 스레드별 상태(Thread-Private State)

같은 프로세스의 스레드가 메모리와 자원을 공유하더라도 **현재 어디까지 실행했는지를 나타내는 실행 문맥은 스레드마다 따로 있어야 한다.** 대표적으로 프로그램 카운터(PC), CPU 레지스터 상태와 스택이 스레드별 실행 상태에 해당한다.

두 스레드가 같은 함수를 실행하고 있어도 호출 단계와 매개변수, 지역 변수, 반환 주소는 서로 다를 수 있다.

```text
공유 코드: handle()

스레드 A 스택         스레드 B 스택
handle(1)             handle(2)
  └─ parse()             └─ validate()

각 스레드는 별도 PC/레지스터로 자신의 실행 위치를 기억한다.
```

스케줄러가 스레드 실행을 멈췄다가 나중에 다시 이어 갈 때도 이 독립적인 실행 문맥을 저장하고 복원해야 한다.

### 스택에 있는 변수와 객체의 공유 여부는 다른 문제다

지역 참조 변수 자체는 한 스레드의 스택 프레임에 있을 수 있지만, 그 참조가 가리키는 객체는 여러 스레드가 접근하는 힙에 있을 수 있다. 따라서 `지역 변수이므로 그 변수가 가리키는 객체까지 스레드 전용이다`라고 일반화하면 안 된다.

스레드 로컬 저장소(thread-local storage)처럼 스레드마다 별도 값을 유지하는 메커니즘도 있지만, 이는 프로세스의 힙 전체가 스레드별로 분리된다는 뜻이 아니다. 스레드별 상태의 핵심은 **여러 스레드가 같은 프로세스 자원을 공유하면서도 각자의 제어 흐름을 이어 가기 위해 독립적인 실행 문맥을 가져야 한다는 것**이다.