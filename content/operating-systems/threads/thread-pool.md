---
kind: concept
contentKey: operating-systems.core.threads.thread-pool
topicContentKey: operating-systems.core.threads
slug: thread-pool
title: "스레드 풀(스레드 풀)"
summary: "워커 재사용·큐·rejection·shutdown을 하나의 bounded 실행 시스템으로 설명한다."
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
# 스레드 풀(스레드 풀)

스레드 풀은 작업마다 새 platform 스레드를 만들지 않고 **미리 준비한 워커를 재사용**하는 실행 구조다. 생성·종료 비용을 줄이는 효과도 있지만, 더 중요한 역할은 동시에 실행할 work의 수를 제한하는 데 있다.

```text
producer → task queue → worker 1
                    → worker 2
                    → worker 3
```

워커가 모두 바쁘면 새 작업는 즉시 실행되지 않고 큐에서 기다리거나 admission/rejection 정책의 영향을 받는다.

### 풀에는 워커와 큐라는 두 개의 경계가 있다

워커 수는 동시에 실행할 수 있는 작업 수를 제한한다. 큐는 당장 실행하지 못하는 작업를 저장한다.

처리 가능한 속도보다 작업가 더 빠르게 들어오면 큐가 계속 길어진다. 큐를 무한히 키우면 overload가 사라지는 것이 아니라 대기 time과 메모리 사용량으로 이동한다.

```text
arrival rate > service rate
        ↓
queue 증가
        ↓
waiting time 증가
```

그래서 bounded 큐와 rejection/backpressure는 실패가 아니라 **시스템이 감당할 수 있는 실행량의 경계를 드러내는 정책**으로 볼 수 있다.

### 풀 내부에서 서로를 기다리면 진행가 막힐 수 있다

모든 워커가 부모 작업에 점유된 상태에서 각 부모가 같은 풀에 제출한 자식 작업의 완료를 동기적으로 기다린다면 자식가 실행될 워커가 없을 수 있다. Lock 순환이 없어도 bounded 실행 자원가 모두 점유되어 진행가 멈출 수 있다.

스레드 풀의 핵심은 단순한 스레드 재사용이 아니라 **워커 수와 큐를 통해 동시성를 제한하고, overload와 대기을 어디에서 받아들일지 결정하는 bounded 실행 시스템**이라는 점이다.