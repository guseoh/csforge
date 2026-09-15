---
kind: concept
contentKey: operating-systems.core.threads.thread-pool
topicContentKey: operating-systems.core.threads
slug: thread-pool
title: "Thread Pool"
summary: "worker 재사용·queue·rejection·shutdown을 하나의 bounded execution system으로 설명한다."
level: 1
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html"
    title: "Java SE 25 API: ThreadPoolExecutor"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Thread Pool

Thread pool은 작업마다 새 platform thread를 만들지 않고 **미리 준비한 worker를 재사용**하는 실행 구조다. 생성·종료 비용을 줄이는 효과도 있지만, 더 중요한 역할은 동시에 실행할 work의 수를 제한하는 데 있다.

```text
producer → task queue → worker 1
                    → worker 2
                    → worker 3
```

Worker가 모두 바쁘면 새 task는 즉시 실행되지 않고 queue에서 기다리거나 admission/rejection 정책의 영향을 받는다.

### Pool에는 worker와 queue라는 두 개의 경계가 있다

Worker 수는 동시에 실행할 수 있는 task 수를 제한한다. Queue는 당장 실행하지 못하는 task를 저장한다.

처리 가능한 속도보다 task가 더 빠르게 들어오면 queue가 계속 길어진다. Queue를 무한히 키우면 overload가 사라지는 것이 아니라 waiting time과 memory 사용량으로 이동한다.

```text
arrival rate > service rate
        ↓
queue 증가
        ↓
waiting time 증가
```

그래서 bounded queue와 rejection/backpressure는 실패가 아니라 **시스템이 감당할 수 있는 실행량의 경계를 드러내는 정책**으로 볼 수 있다.

### Pool 내부에서 서로를 기다리면 progress가 막힐 수 있다

모든 worker가 parent task에 점유된 상태에서 각 parent가 같은 pool에 제출한 child task의 완료를 동기적으로 기다린다면 child가 실행될 worker가 없을 수 있다. Lock cycle이 없어도 bounded execution resource가 모두 점유되어 progress가 멈출 수 있다.

Thread Pool의 핵심은 단순한 thread 재사용이 아니라 **worker 수와 queue를 통해 concurrency를 제한하고, overload와 waiting을 어디에서 받아들일지 결정하는 bounded execution system**이라는 점이다.