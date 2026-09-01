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
    title: "ThreadPoolExecutor (Java SE 25 API)"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "worker 수·queue·rejection·shutdown이 하나의 bounded executor 정책을 이루는 방식을 확인한다."
    displayOrder: 1
---
# Thread Pool

### worker를 재사용하는 것보다 중요한 것은 동시 실행을 제한하는 것이다

thread pool은 매 task마다 platform thread를 새로 만들지 않고 worker를 재사용해 creation cost를 나눈다. 동시에 pool size를 통해 한 시점에 실행되는 task 수를 제한하는 admission boundary 역할도 한다.

```
producer → task queue → worker 1
                    → worker 2
                    → worker 3
```

worker가 모두 바쁘면 새 task는 즉시 실행되지 않고 queue 또는 rejection policy로 넘어간다. 따라서 pool의 성능은 worker 수만이 아니라 **queue capacity와 task arrival rate**에 크게 좌우된다.

### unbounded queue는 overload를 없애지 않고 숨긴다

초당 100개를 처리하는 pool에 초당 150개 task가 지속적으로 들어오면 worker 수가 그대로인 한 queue는 초당 50개씩 증가한다. unbounded queue를 쓰면 잠깐은 요청을 모두 받아들이는 것처럼 보이지만 waiting latency와 memory 사용량은 계속 커진다.

bounded queue와 rejection/backpressure는 overload를 외부에 드러내는 정책이다. 거부가 나쁘다고 queue를 무한히 키우는 것이 아니라 시스템이 감당할 수 없는 부하를 어디에서 제한할지 정해야 한다.

### pool 내부 의존도 deadlock-like starvation을 만들 수 있다

worker가 2개뿐인 pool에서 task A와 B가 각각 같은 pool에 child task를 제출한 뒤 그 결과를 동기적으로 기다린다고 하자. 두 worker가 부모 task에 점유된 상태라 child가 queue에서 실행되지 못할 수 있다. lock cycle은 없어도 executor capacity 고갈로 progress가 멈추는 **thread starvation deadlock** 형태가 가능하다.

### shutdown도 execution contract다

graceful shutdown에서는 새 task를 더 받을지, queue에 남은 task를 처리할지, running task를 interrupt/cancel할지 정책이 필요하다. request pool, background import pool처럼 workload 성격이 다르면 queue와 shutdown 정책도 분리하는 편이 안전하다.
