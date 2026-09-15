---
kind: concept
contentKey: operating-systems.core.threads.thread-shared-state
topicContentKey: operating-systems.core.threads
slug: thread-shared-state
title: "Thread-Shared State"
summary: "같은 process의 thread가 공유하는 memory·resource와 race 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Thread-Shared State

같은 process의 thread는 같은 virtual address space를 사용하므로 code, heap, 전역·static data에 함께 접근할 수 있다. File descriptor처럼 process가 보유한 OS resource도 여러 thread가 함께 사용할 수 있다.

이 공유는 별도 IPC 없이 데이터를 전달할 수 있게 하지만, 동시에 여러 실행 흐름이 같은 mutable state를 변경할 수 있다는 뜻이기도 하다.

```text
Process shared state
├─ heap object
├─ global/static data
└─ open resources
     ▲       ▲
   Thread A Thread B
```

### 공유된다는 사실과 안전하게 수정할 수 있다는 사실은 다르다

두 thread가 같은 counter를 동시에 증가시킨다고 하자. `counter = counter + 1`은 개념적으로 read → add → write 여러 단계로 나뉠 수 있다. 실행이 교차되면 둘 다 같은 이전 값을 읽고 update 하나가 사라질 수 있다.

즉 같은 memory를 볼 수 있다는 사실은 연산의 atomicity나 올바른 실행 순서를 보장하지 않는다. 구체적인 race, critical section과 synchronization 방법은 뒤 Topic에서 다룬다.

### 공유 자원은 memory만이 아니다

같은 file descriptor를 여러 thread가 사용하면 underlying file/socket state에도 함께 영향을 줄 수 있다. 어떤 상태가 thread별인지 process-wide인지 API와 OS contract를 확인해야 한다.

Thread-Shared State의 핵심은 **thread가 process resource를 쉽게 공유하기 때문에 communication 비용은 낮지만, 공유된 mutable state와 resource의 coordination 책임도 함께 생긴다**는 점이다.