---
kind: concept
contentKey: operating-systems.core.threads.thread-private-state
topicContentKey: operating-systems.core.threads
slug: thread-private-state
title: "Thread-Private State"
summary: "thread별 register·program counter·stack이 독립 실행 흐름을 만드는 이유를 설명한다."
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
# Thread-Private State

### 같은 heap을 보면서도 다른 코드를 실행할 수 있는 이유

thread마다 현재 실행 instruction을 가리키는 program counter와 CPU register set, 호출 frame을 담는 stack이 따로 필요하다. 두 thread가 같은 함수 코드를 실행하더라도 각자의 parameter, return address, local variable과 중간 계산 값은 서로 다른 stack/context에 놓일 수 있다.

예를 들어 T1이 `handle(1)`에서 세 번째 호출 frame까지 내려가 있고 T2가 `handle(2)`의 첫 번째 frame에 있다면, scheduler는 각각의 register와 stack 위치를 저장해 두었다가 독립적으로 재개해야 한다. thread-private execution context가 없다면 한 thread의 함수 호출이 다른 thread의 return path를 덮어쓸 수 있다.

### private stack과 shared object를 혼동하지 않는다

local variable이라는 이름만으로 object 자체가 thread-private이라고 단정할 수는 없다. stack에 있는 local reference가 heap의 shared object를 가리킨다면 reference 변수의 저장 위치는 thread별이어도 가리키는 object는 여러 thread가 공유할 수 있다.

반대로 thread-local storage는 논리적으로 thread마다 별도 값을 유지해 공유 동기화를 줄일 수 있다. 하지만 thread가 오래 살거나 pool에서 재사용되면 값의 lifecycle도 thread lifecycle을 따라갈 수 있으므로 cleanup이 필요하다.

### Backend에서 자주 만나는 context 문제

logging MDC, request context, transaction 관련 context를 thread-local 방식으로 보관하는 구현이 있다. 작업이 같은 platform thread에서 계속 실행될 때는 편리하지만 async task나 다른 executor로 실행 흐름이 이동하면 값이 자동으로 따라간다고 가정하면 안 된다. 무엇이 thread-private이고 무엇을 명시적으로 전달해야 하는지 구분해야 한다.
